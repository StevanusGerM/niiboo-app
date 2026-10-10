"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, Compass, Sparkles, TrendingDown, TrendingUp, Volume2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, ProgressBar } from "@/components/ui";
import { speakZh } from "@/lib/speech";
import { HSK_LEVELS, cn } from "@/lib/utils";
import type { ExamQuestion } from "@/types/content";

export type PlacementItem = { level: number; q: Extract<ExamQuestion, { kind: "mcq" }> };
type Attempt = { level: number; correct: boolean; id: string };

const TOTAL = 12;
const START_LEVEL = 2;

const LEVEL_COPY: Record<number, string> = {
  1: "Kamu sedang membangun fondasi: sapaan, angka, dan kalimat sederhana.",
  2: "Kamu bisa berkomunikasi untuk kebutuhan sehari-hari yang sederhana.",
  3: "Kamu mampu bercerita tentang kehidupan sehari-hari, studi, dan perjalanan.",
  4: "Kamu dapat berdiskusi tentang berbagai topik dengan cukup lancar.",
  5: "Kamu bisa membaca koran dan menonton film berbahasa Mandarin.",
  6: "Kamu memahami informasi kompleks dan mengekspresikan diri dengan fasih.",
};

/** Highest level with ≥1 correct answer and ≥50% accuracy. */
export function estimateLevel(attempts: Attempt[]) {
  let best = 1;
  for (const level of HSK_LEVELS) {
    const at = attempts.filter((a) => a.level === level);
    const ok = at.filter((a) => a.correct).length;
    if (ok >= 1 && ok / at.length >= 0.5) best = level;
  }
  return best;
}

export function PlacementTest({ bank }: { bank: PlacementItem[] }) {
  const router = useRouter();
  const { setLevel, recordActivity } = useUser();
  const [started, setStarted] = useState(false);
  const [level, setLevelCursor] = useState(START_LEVEL);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [choice, setChoice] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const done = attempts.length >= TOTAL || attempts.length >= bank.length;

  // Pick an unused item at the current level, falling back to the nearest level.
  const current = useMemo(() => {
    if (done) return null;
    const used = new Set(attempts.map((a) => a.id));
    const byDistance = [...HSK_LEVELS].sort((a, b) => Math.abs(a - level) - Math.abs(b - level) || b - a);
    for (const l of byDistance) {
      const item = bank.find((b) => b.level === l && !used.has(b.q.id));
      if (item) return item;
    }
    return null;
  }, [attempts, bank, level, done]);

  const result = useMemo(() => estimateLevel(attempts), [attempts]);

  const submit = () => {
    if (!current || choice === null) return;
    const correct = choice === current.q.answer;
    setAttempts((a) => [...a, { level: current.level, correct, id: current.q.id }]);
    setLevelCursor(Math.max(1, Math.min(6, current.level + (correct ? 1 : -1))));
    setChoice(null);
  };

  const applyLevel = async () => {
    await setLevel(result);
    recordActivity(20);
    setSaved(true);
    router.push("/");
  };

  if (!started) {
    return (
      <div className="mx-auto max-w-2xl">
        <BentoCard tone="gradient" className="p-8 text-center">
          <div className="blob -left-10 -top-10 h-40 w-40 bg-white/40" />
          <Compass className="mx-auto h-12 w-12" />
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">Tes Penempatan Adaptif</h1>
          <p className="mx-auto mt-3 max-w-md text-white/90">
            {TOTAL} soal yang menyesuaikan kemampuanmu: jawaban benar menaikkan tingkat kesulitan, jawaban salah menurunkannya.
            Hasilnya memetakanmu ke HSK 1–6.
          </p>
          <Button variant="dark" className="mt-6 px-8 py-3 text-base" onClick={() => setStarted(true)}>
            Mulai tes <ArrowRight className="h-5 w-5" />
          </Button>
        </BentoCard>
      </div>
    );
  }

  if (done || !current) {
    return (
      <div className="mx-auto max-w-2xl">
        <BentoCard className="p-8 text-center">
          <Sparkles className="mx-auto h-10 w-10 text-blossom" />
          <p className="mt-3 text-sm font-bold uppercase tracking-wider text-plum-soft">Rekomendasi level</p>
          <p className="text-6xl font-extrabold text-blossom">HSK {result}</p>
          <p className="mx-auto mt-3 max-w-md text-plum-soft">{LEVEL_COPY[result]}</p>
          <div className="mx-auto mt-6 flex max-w-md items-end justify-center gap-2" aria-label="Jejak tingkat kesulitan">
            {attempts.map((a, i) => (
              <div
                key={i}
                title={`Soal ${i + 1}: HSK ${a.level} — ${a.correct ? "benar" : "salah"}`}
                className={cn("w-5 rounded-t-lg", a.correct ? "bg-blossom" : "bg-plum/20")}
                style={{ height: a.level * 14 }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-plum-soft">Tinggi batang = level soal · merah muda = benar</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button onClick={applyLevel} disabled={saved}>
              Tetapkan HSK {result} sebagai level saya
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setAttempts([]);
                setLevelCursor(START_LEVEL);
              }}
            >
              Ulangi tes
            </Button>
          </div>
        </BentoCard>
      </div>
    );
  }

  const last = attempts[attempts.length - 1];
  const q = current.q;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="text-sm font-extrabold">
          Soal {attempts.length + 1} / {TOTAL}
        </p>
        {last && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold",
              last.correct ? "bg-rose text-blossom-dark" : "bg-plum/10 text-plum-soft",
            )}
          >
            {last.correct ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {last.correct ? "Naik level" : "Turun level"}
          </span>
        )}
      </div>
      <ProgressBar value={(attempts.length / TOTAL) * 100} className="mb-4" />

      <BentoCard key={q.id} className="animate-pop-in p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-blossom">Tingkat HSK {current.level}</p>
        <p className="mt-2 text-lg font-bold">{q.prompt}</p>
        {q.audio_text && (
          <Button variant="secondary" className="mt-4" onClick={() => speakZh(q.audio_text!, { rate: 0.85 })}>
            <Volume2 className="h-4 w-4" /> Putar audio
          </Button>
        )}
        {q.passage_zh && <p className="mt-4 rounded-3xl bg-rose/40 p-5 font-hanzi text-2xl leading-relaxed">{q.passage_zh}</p>}
        <div className="mt-5 grid gap-3">
          {q.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => setChoice(i)}
              className={cn(
                "rounded-3xl border-2 p-4 text-left font-hanzi font-semibold transition",
                choice === i ? "border-blossom bg-rose/30" : "border-plum/10 hover:border-blossom/50",
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-between gap-3">
          <Button variant="ghost" onClick={() => setChoice(-1)} className={cn(choice === -1 && "bg-plum/10")}>
            Saya tidak tahu
          </Button>
          <Button onClick={submit} disabled={choice === null}>
            Jawab <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </BentoCard>
    </div>
  );
}
