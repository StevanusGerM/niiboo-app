import { hasToneMarks, numberedToMarked, stripTones } from "@/lib/pinyin";
import { getScenario, type Line } from "./scenarios";

/**
 * Rule-based tutor simulation.
 *
 * To upgrade to a real LLM later, keep this response shape and replace the body of
 * `generateTutorReply` with a model call (e.g. the Claude Messages API) that receives
 * the scenario, step, and learner message, and returns JSON matching `TutorResponse`.
 */

export interface TutorRequest {
  scenarioId: string;
  step: number;
  message: string;
}

export interface ToneNote {
  written: string;
  correct: string;
  hanzi: string;
  meaning: string;
}

export interface TutorResponse {
  reply: Line;
  feedback: {
    kind: "praise" | "hint" | "tone" | "grammar";
    text: string;
    toned?: string; // learner's sentence with correct tone marks
    notes?: ToneNote[];
    suggestion?: Line;
  } | null;
  /** Indonesian explanation (AI mode). */
  note?: string;
  /** Quick replies the learner can tap (AI mode). */
  suggestions?: string[];
  nextStep: number;
  done: boolean;
  engine: "ai" | "simulated";
}

/** Mini lexicon for tone feedback: correct marked pinyin → hanzi + meaning. */
const LEXICON: [string, string, string][] = [
  ["nǐ hǎo", "你好", "halo"], ["xièxie", "谢谢", "terima kasih"], ["zàijiàn", "再见", "sampai jumpa"],
  ["wǒ", "我", "saya"], ["nǐ", "你", "kamu"], ["tā", "他/她", "dia"], ["wǒmen", "我们", "kami"],
  ["jiào", "叫", "bernama"], ["shì", "是", "adalah"], ["bù", "不", "tidak"], ["bú yào", "不要", "tidak mau"],
  ["xiǎng", "想", "ingin"], ["yào", "要", "mau"], ["chī", "吃", "makan"], ["hē", "喝", "minum"],
  ["mǐfàn", "米饭", "nasi"], ["jiǎozi", "饺子", "pangsit"], ["miàn", "面", "mi"], ["chá", "茶", "teh"],
  ["shuǐ", "水", "air"], ["kělè", "可乐", "cola"], ["guǒzhī", "果汁", "jus"], ["yì bēi", "一杯", "secangkir"],
  ["liǎng", "两", "dua"], ["wèi", "位", "orang (sopan)"], ["duōshao qián", "多少钱", "berapa harganya"],
  ["guì", "贵", "mahal"], ["piányi", "便宜", "murah"], ["yìdiǎnr", "一点儿", "sedikit"], ["tài", "太", "terlalu"],
  ["mǎi", "买", "membeli"], ["mài", "卖", "menjual"], ["hǎo", "好", "baik"], ["kěyǐ", "可以", "boleh"],
  ["qù", "去", "pergi"], ["Běijīng", "北京", "Beijing"], ["dàxué", "大学", "universitas"], ["jīchǎng", "机场", "bandara"],
  ["zháojí", "着急", "terburu-buru"], ["méi guānxi", "没关系", "tidak apa-apa"], ["gěi", "给", "memberi"],
  ["qián", "钱", "uang"], ["Wēixìn", "微信", "WeChat"], ["xǐhuan", "喜欢", "suka"], ["xuéxí", "学习", "belajar"],
  ["Zhōngwén", "中文", "bahasa Mandarin"], ["Hànyǔ", "汉语", "bahasa Mandarin"], ["Yìnní", "印尼", "Indonesia"],
  ["Yìndùníxīyà", "印度尼西亚", "Indonesia"], ["rén", "人", "orang"], ["yīnwèi", "因为", "karena"],
  ["gōngzuò", "工作", "bekerja"], ["wénhuà", "文化", "budaya"], ["míngzi", "名字", "nama"], ["lǎoshī", "老师", "guru"],
];

const LEX = LEXICON.map(([py, zh, id]) => ({ py, zh, id, key: stripTones(py).replace(/\s+/g, "") })).sort(
  (a, b) => b.key.length - a.key.length,
);

const LATIN = /[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/;
const HANZI = /[一-鿿]/;

/** Greedy longest-match of the learner's pinyin words against the lexicon. */
function analysePinyin(input: string) {
  const words = numberedToMarked(input.trim())
    .split(/[\s,.!?，。！？]+/)
    .filter(Boolean);
  const notes: ToneNote[] = [];
  const toned: string[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    // try spans of up to 4 written words
    for (let span = Math.min(4, words.length - i); span >= 1 && !matched; span--) {
      const chunk = words.slice(i, i + span).join(" ");
      const key = stripTones(chunk).replace(/\s+/g, "");
      const hit = LEX.find((e) => e.key === key);
      if (hit) {
        toned.push(hit.py);
        const writtenHasTones = hasToneMarks(chunk);
        if (!writtenHasTones || chunk.toLowerCase().replace(/\s+/g, "") !== hit.py.toLowerCase().replace(/\s+/g, "")) {
          notes.push({ written: chunk, correct: hit.py, hanzi: hit.zh, meaning: hit.id });
        }
        i += span;
        matched = true;
      }
    }
    if (!matched) {
      toned.push(words[i]);
      i += 1;
    }
  }
  return { toned: toned.join(" "), notes };
}

function matchesExpectation(message: string, expect: string[]) {
  const hanzi = message.replace(/\s+/g, "");
  const flat = stripTones(numberedToMarked(message)).replace(/[^a-z]/g, "");
  return expect.some((e) => (HANZI.test(e) ? hanzi.includes(e) : flat.includes(e.replace(/\s+/g, ""))));
}

const PRAISE = ["很好！Bagus sekali!", "太棒了！Hebat!", "对！Benar!", "不错！Tidak buruk!"];

export function generateTutorReply(req: TutorRequest): TutorResponse {
  const scenario = getScenario(req.scenarioId);
  const message = req.message.trim();
  const isPinyin = LATIN.test(message) && !HANZI.test(message);

  // Tone feedback for pinyin input
  let toneFeedback: TutorResponse["feedback"] = null;
  if (isPinyin) {
    const { toned, notes } = analysePinyin(message);
    if (notes.length) {
      const hasDoubleThird = /ǐ|ǎ|ǒ|ǔ|ě/.test(toned) && /([ǐǎǒǔě]\S*)\s+\S*[ǐǎǒǔě]/.test(toned);
      toneFeedback = {
        kind: "tone",
        text:
          (hasToneMarks(message) || /\d/.test(message)
            ? "Ada nada yang perlu diperbaiki."
            : "Kamu menulis tanpa tanda nada — ini versi bernadanya.") +
          (hasDoubleThird ? " Ingat: dua nada ke-3 berurutan → yang pertama diucapkan nada ke-2." : ""),
        toned,
        notes,
      };
    }
  }

  if (!scenario) {
    // Free chat needs the AI engine; the simulation can still check tones.
    return {
      reply: {
        zh: "我还在学习自由聊天哦！",
        pinyin: "Wǒ hái zài xuéxí zìyóu liáotiān o!",
        id: "Ngobrol bebas butuh AI yang aktif (ANTHROPIC_API_KEY). Sementara itu, coba skenario roleplay, ya!",
      },
      feedback: toneFeedback,
      nextStep: req.step,
      done: false,
      engine: "simulated",
    };
  }

  const step = scenario.steps[req.step];
  if (!step) {
    return { reply: scenario.closing, feedback: toneFeedback, nextStep: req.step, done: true, engine: "simulated" };
  }

  if (matchesExpectation(message, step.expect)) {
    const next = req.step + 1;
    const done = next >= scenario.steps.length;
    return {
      reply: done ? scenario.closing : scenario.steps[next].ai,
      feedback: toneFeedback ?? { kind: "praise", text: PRAISE[req.step % PRAISE.length] },
      nextStep: next,
      done,
      engine: "simulated",
    };
  }

  return {
    reply: { zh: "嗯……你可以再说一次吗？", pinyin: "Ng… nǐ kěyǐ zài shuō yí cì ma?", id: "Hmm… bisa ulangi sekali lagi?" },
    feedback: toneFeedback ?? {
      kind: "hint",
      text: "Coba jawab pertanyaannya. Contoh jawaban:",
      suggestion: step.hint,
    },
    nextStep: req.step,
    done: false,
    engine: "simulated",
  };
}
