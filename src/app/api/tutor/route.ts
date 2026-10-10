import { NextResponse } from "next/server";
import { generateAiReply, isAiEnabled, type ChatTurn } from "@/lib/tutor/ai";
import { generateTutorReply, type TutorResponse } from "@/lib/tutor/engine";

/** GET → tells the UI whether the open-ended AI tutor is available. */
export async function GET() {
  return NextResponse.json({ ai: isAiEnabled() });
}

/* Best-effort per-IP limiter (per server instance) to keep API costs in check. */
const WINDOW_MS = 5 * 60 * 1000;
const MAX_PER_WINDOW = 30;
const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

interface Body {
  scenarioId?: unknown;
  step?: unknown;
  message?: unknown;
  history?: unknown;
  level?: unknown;
}

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { scenarioId, step, message } = body;
  if (typeof scenarioId !== "string" || typeof step !== "number" || typeof message !== "string") {
    return NextResponse.json({ error: "scenarioId, step and message are required" }, { status: 400 });
  }
  if (!message.trim() || message.length > 500) {
    return NextResponse.json({ error: "message must be 1–500 characters" }, { status: 400 });
  }

  if (!isAiEnabled()) {
    await new Promise((r) => setTimeout(r, 400)); // feels conversational
    return NextResponse.json(generateTutorReply({ scenarioId, step, message }));
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  if (limited(ip)) {
    return NextResponse.json({ error: "Terlalu banyak pesan. Istirahat sebentar, ya!" }, { status: 429 });
  }

  const history: ChatTurn[] = Array.isArray(body.history)
    ? body.history
        .filter(
          (t): t is ChatTurn =>
            !!t &&
            typeof t === "object" &&
            ((t as ChatTurn).role === "user" || (t as ChatTurn).role === "tutor") &&
            typeof (t as ChatTurn).text === "string",
        )
        .map((t) => ({ role: t.role, text: t.text.slice(0, 500) }))
    : [];
  const level = typeof body.level === "number" && body.level >= 1 && body.level <= 6 ? Math.round(body.level) : 1;

  const result = await generateAiReply({ level, scenarioId, history, message: message.trim() });
  if (!result.ok) {
    const reply: TutorResponse = {
      reply:
        result.reason === "refusal"
          ? { zh: "我们聊点别的吧！", pinyin: "Wǒmen liáo diǎn biéde ba!", id: "Yuk, kita ngobrol tentang hal lain saja!" }
          : { zh: "哎呀，网络有点问题。", pinyin: "Āiyā, wǎngluò yǒudiǎn wèntí.", id: "Aduh, ada gangguan. Coba kirim lagi, ya!" },
      feedback: null,
      nextStep: step,
      done: false,
      engine: "ai",
    };
    return NextResponse.json(reply);
  }

  const { data } = result;
  const fb = data.feedback;
  const feedback: TutorResponse["feedback"] =
    fb.kind === "none"
      ? null
      : fb.kind === "tone"
        ? { kind: "tone", text: fb.text, toned: fb.corrected_pinyin || undefined, notes: fb.tone_notes }
        : fb.kind === "grammar"
          ? {
              kind: "grammar",
              text: fb.text,
              suggestion: fb.corrected_zh ? { zh: fb.corrected_zh, pinyin: fb.corrected_pinyin, id: "Kalimat yang benar" } : undefined,
            }
          : { kind: "praise", text: fb.text || "很好！Bagus!" };

  const response: TutorResponse = {
    reply: data.reply,
    feedback,
    note: data.note || undefined,
    suggestions: data.suggestions.slice(0, 3),
    nextStep: step + 1,
    done: false,
    engine: "ai",
  };
  return NextResponse.json(response);
}
