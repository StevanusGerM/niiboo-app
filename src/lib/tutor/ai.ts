import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { getScenario, type Line } from "./scenarios";

/**
 * Open-ended Mandarin tutor powered by Claude. Any topic is allowed; the model
 * answers at the learner's HSK level and returns a fixed JSON shape so the UI
 * can always render hanzi + pinyin + Indonesian + tone/grammar feedback.
 *
 * Enabled when ANTHROPIC_API_KEY is set (e.g. in Vercel → Settings → Environment Variables).
 */

export const MODEL = "claude-opus-5-5";
export const isAiEnabled = () => !!process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;
const getClient = () => (client ??= new Anthropic());

export interface ChatTurn {
  role: "user" | "tutor";
  text: string;
}

export interface ToneNote {
  written: string;
  correct: string;
  hanzi: string;
  meaning: string;
}

export interface AiTutorReply {
  reply: Line;
  /** Optional Indonesian explanation (grammar, culture, answers to questions). */
  note: string;
  feedback: {
    kind: "praise" | "tone" | "grammar" | "none";
    text: string;
    corrected_zh: string;
    corrected_pinyin: string;
    tone_notes: ToneNote[];
  };
  /** Two or three short replies the learner could send next (hanzi). */
  suggestions: string[];
}

const str = { type: "string" } as const;
const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["reply", "note", "feedback", "suggestions"],
  properties: {
    reply: {
      type: "object",
      additionalProperties: false,
      required: ["zh", "pinyin", "id"],
      properties: { zh: str, pinyin: str, id: str },
    },
    note: str,
    feedback: {
      type: "object",
      additionalProperties: false,
      required: ["kind", "text", "corrected_zh", "corrected_pinyin", "tone_notes"],
      properties: {
        kind: { type: "string", enum: ["praise", "tone", "grammar", "none"] },
        text: str,
        corrected_zh: str,
        corrected_pinyin: str,
        tone_notes: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["written", "correct", "hanzi", "meaning"],
            properties: { written: str, correct: str, hanzi: str, meaning: str },
          },
        },
      },
    },
    suggestions: { type: "array", items: str },
  },
} as const;

function systemPrompt(level: number, roleplay: string | null) {
  return `Kamu adalah "Boo Laoshi", panda ramah yang menjadi tutor bahasa Mandarin di aplikasi NiiBooo. Penggunanya pelajar Indonesia, termasuk anak-anak dan remaja. Level HSK pelajar saat ini: ${level}.

Cara ngobrol:
- Pelajar boleh membahas topik apa saja (hobi, sekolah, makanan, game, budaya, pertanyaan tata bahasa, terjemahan, dll.). Ikuti arah obrolan mereka dengan antusias; jangan membatasi ke materi tertentu.
- Balas dalam bahasa Mandarin sederhana yang sesuai HSK ${level} (kalimat pendek, kosakata level itu; boleh satu kata baru yang dijelaskan). Jika pelajar bertanya dalam bahasa Indonesia, tetap jawab ringkas dalam Mandarin di "reply" dan jelaskan detailnya dalam bahasa Indonesia di "note".
- Akhiri balasan dengan pertanyaan pendek agar obrolan berlanjut.
- Pelajar bisa menulis hanzi, pinyin tanpa nada, pinyin dengan angka nada (ni3 hao3), atau campur bahasa Indonesia.

Koreksi (isi "feedback"):
- Jika pelajar menulis pinyin yang salah/tidak bernada, kind = "tone": tulis versi bernada yang benar di corrected_pinyin, hanzinya di corrected_zh, dan rincian per kata di tone_notes. Ingatkan perubahan nada (mis. dua nada ke-3 berurutan, 不 dan 一) bila relevan.
- Jika ada kesalahan tata bahasa/pilihan kata Mandarin, kind = "grammar": tunjukkan kalimat yang benar dan jelaskan singkat dalam bahasa Indonesia.
- Jika kalimatnya bagus, kind = "praise" dengan pujian singkat. Jika pelajar hanya menulis bahasa Indonesia, kind = "none".
- Semua penjelasan untuk pelajar (feedback.text, note, reply.id) dalam bahasa Indonesia yang hangat dan mudah dipahami anak-anak. Biarkan string kosong ("") dan tone_notes kosong bila tidak relevan.
- "suggestions": 2–3 contoh balasan pendek dalam hanzi yang bisa dikirim pelajar berikutnya.

Keamanan: tetap ramah anak. Tolak dengan sopan topik dewasa, kekerasan, atau berbahaya, lalu ajak ke topik lain. Jangan meminta data pribadi (alamat, nomor telepon, sekolah, foto).${
    roleplay
      ? `\n\nKonteks roleplay saat ini: ${roleplay}. Perankan lawan bicara di situasi ini, tapi tetap ikuti jika pelajar ingin membahas hal lain.`
      : ""
  }`;
}

export type AiResult = { ok: true; data: AiTutorReply } | { ok: false; reason: "refusal" | "error" };

export async function generateAiReply(input: {
  level: number;
  scenarioId: string;
  history: ChatTurn[];
  message: string;
}): Promise<AiResult> {
  const scenario = getScenario(input.scenarioId);
  // Roleplay scenarios become optional context, not a script.
  const roleplay = scenario ? `${scenario.title} (${scenario.title_zh})` : null;

  const messages: Anthropic.Beta.BetaMessageParam[] = input.history
    .slice(-20)
    .map((turn) => ({ role: turn.role === "user" ? ("user" as const) : ("assistant" as const), content: turn.text }));
  // The API requires the first message to come from the user; keep Boo's opener
  // by giving it a short greeting to answer.
  if (messages.length && messages[0].role === "assistant") messages.unshift({ role: "user", content: "你好！" });
  messages.push({ role: "user", content: input.message });

  try {
    const response = await getClient().beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: systemPrompt(input.level, roleplay),
      output_config: { effort: "low", format: { type: "json_schema", schema: SCHEMA } },
      messages,
    });

    if (response.stop_reason === "refusal") return { ok: false, reason: "refusal" };
    const text = response.content.find((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")?.text;
    if (!text) return { ok: false, reason: "error" };
    return { ok: true, data: JSON.parse(text) as AiTutorReply };
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) console.warn("[tutor] rate limited");
    else if (error instanceof Anthropic.AuthenticationError) console.error("[tutor] invalid ANTHROPIC_API_KEY");
    else if (error instanceof Anthropic.APIError) console.error(`[tutor] API error ${error.status}:`, error.message);
    else console.error("[tutor] unexpected error", error);
    return { ok: false, reason: "error" };
  }
}

/** Assistant turns are stored as plain text (hanzi) for the conversation history. */
export const tutorTurnText = (r: AiTutorReply) => r.reply.zh;
