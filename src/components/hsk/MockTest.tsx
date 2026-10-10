"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  Headphones,
  Lightbulb,
  PenLine,
  RotateCcw,
  Trophy,
  Volume2,
  XCircle,
} from "lucide-react";
import { Boo } from "@/components/mascot/Boo";
import { BooWith } from "@/components/mascot/BooWith";
import { Dragon, Sticker } from "@/components/mascot/Stickers";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, ButtonLink, HskBadge, ProgressBar, ProgressRing } from "@/components/ui";
import { markNode, starsFor } from "@/lib/journey-store";
import { speakZh, stopSpeaking } from "@/lib/speech";
import { cn, formatTime, normalizeZh } from "@/lib/utils";
import type { ExamQuestion } from "@/types/content";
import type { HskExam, SectionType } from "@/types/database";

type Mode = "mock" | "practice";
type Answer = number | number[]; // option index (mcq) or fragment order (order)
type Phase = "intro" | "running" | "result";

const SECTION_META: Record<
  SectionType,
  { label: string; zh: string; icon: typeof Headphones; secondsPerQ: number; color: string; ring: string; tone: "ocean" | "lilac" | "mint" }
> = {
  listening: { label: "Mendengar", zh: "听力", icon: Headphones, secondsPerQ: 60, color: "text-ocean-dark", ring: "#5AB4F5", tone: "ocean" },
  reading: { label: "Membaca", zh: "阅读", icon: BookOpen, secondsPerQ: 75, color: "text-lilac-dark", ring: "#A78BFA", tone: "lilac" },
  writing: { label: "Menulis", zh: "书写", icon: PenLine, secondsPerQ: 90, color: "text-mint-dark", ring: "#3CCFA4", tone: "mint" },
};
const MAX_LISTENS = 2;

function isCorrect(q: ExamQuestion, a: Answer | undefined) {
  if (a === undefined) return false;
  if (q.kind === "mcq") return a === q.answer;
  if (!Array.isArray(a)) return false;
  return normalizeZh(a.map((i) => q.fragments[i]).join("")) === normalizeZh(q.answer);
}

function answerText(q: ExamQuestion, a: Answer | undefined) {
  if (a === undefined || (Array.isArray(a) && a.length === 0)) return "— tidak dijawab —";
  if (q.kind === "mcq") return typeof a === "number" ? q.options[a] : "";
  return Array.isArray(a) ? a.map((i) => q.fragments[i]).join("") : "";
}

export function MockTest({ level, sections, mode }: { level: number; sections: HskExam[]; mode: Mode }) {
  const { recordActivity } = useUser();
  const [phase, setPhase] = useState<Phase>("intro");
  const [sectionIdx, setSectionIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [checked, setChecked] = useState<Record<string, boolean>>({}); // practice mode
  const [listens, setListens] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  const section = sections[sectionIdx];
  const questions = section?.questions_json ?? [];
  const question = questions[qIdx];
  const meta = section ? SECTION_META[section.section_type] : SECTION_META.listening;
  const sectionSeconds = (s: HskExam) => s.questions_json.length * SECTION_META[s.section_type].secondsPerQ;
  const totalQuestions = sections.reduce((n, s) => n + s.questions_json.length, 0);
  const maxScore = level <= 2 ? 200 : 300;

  /* ------------------------------- timer (mock only) */
  useEffect(() => {
    if (mode !== "mock" || phase !== "running") return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [mode, phase, sectionIdx]);

  const finish = useCallback(() => {
    stopSpeaking();
    setPhase("result");
    recordActivity(mode === "mock" ? 40 : 25);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [mode, recordActivity]);

  const nextSection = useCallback(() => {
    stopSpeaking();
    if (sectionIdx + 1 >= sections.length) {
      finish();
      return;
    }
    const next = sectionIdx + 1;
    setSectionIdx(next);
    setQIdx(0);
    setTimeLeft(sectionSeconds(sections[next]));
  }, [sectionIdx, sections, finish]);

  useEffect(() => {
    if (mode === "mock" && phase === "running" && timeLeft === 0) nextSection();
  }, [timeLeft, mode, phase, nextSection]);

  /* ------------------------------- guard against leaving mid-exam */
  useEffect(() => {
    if (phase !== "running") return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [phase]);

  const start = () => {
    setPhase("running");
    setSectionIdx(0);
    setQIdx(0);
    setAnswers({});
    setChecked({});
    setListens({});
    setTimeLeft(sections[0] ? sectionSeconds(sections[0]) : 0);
  };

  const setAnswer = (a: Answer) => {
    if (!question || checked[question.id]) return;
    setAnswers((prev) => ({ ...prev, [question.id]: a }));
  };

  const playAudio = (q: Extract<ExamQuestion, { kind: "mcq" }>) => {
    if (!q.audio_text) return;
    const used = listens[q.id] ?? 0;
    if (mode === "mock" && used >= MAX_LISTENS) return;
    setListens((l) => ({ ...l, [q.id]: used + 1 }));
    stopSpeaking();
    speakZh(q.audio_text, { rate: 0.85 });
  };

  /* ------------------------------- keyboard shortcuts (1–4) */
  useEffect(() => {
    if (phase !== "running" || question?.kind !== "mcq") return;
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= question.options.length) setAnswer(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  /* ------------------------------- results */
  const results = useMemo(() => {
    const perSection = sections.map((s) => {
      const correct = s.questions_json.filter((q) => isCorrect(q, answers[q.id])).length;
      return { type: s.section_type, correct, total: s.questions_json.length };
    });
    const correct = perSection.reduce((n, s) => n + s.correct, 0);
    const pct = totalQuestions ? Math.round((correct / totalQuestions) * 100) : 0;
    return { perSection, correct, pct, scaled: Math.round((pct / 100) * maxScore), passed: pct >= 60 };
  }, [answers, sections, totalQuestions, maxScore]);

  // Report the result to the journey map (mock exam = boss node, practice = checkpoint).
  useEffect(() => {
    if (phase !== "result") return;
    markNode(`${mode === "mock" ? "boss" : "practice"}-${level}`, starsFor(results.pct));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a run finishes
  }, [phase]);

  if (!sections.length) {
    return (
      <BentoCard>
        <p className="font-bold">Belum ada soal untuk HSK {level}.</p>
        <ButtonLink href="/hsk" variant="secondary" className="mt-4">
          Kembali
        </ButtonLink>
      </BentoCard>
    );
  }

  /* ================================ INTRO */
  if (phase === "intro") {
    return (
      <div className="mx-auto max-w-3xl">
        <Link href="/hsk" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-plum-soft hover:text-plum">
          <ArrowLeft className="h-4 w-4" /> Pusat HSK
        </Link>
        <BentoCard tone="gradient" className="p-8">
          <div className="blob -right-10 -top-10 h-48 w-48 bg-white/40" />
          {mode === "mock" ? (
            <Dragon size={130} mood="fierce" float className="pointer-events-none absolute -bottom-3 right-3 hidden sm:block" />
          ) : (
            <BooWith prop="pencil" mood="happy" size={120} float className="pointer-events-none absolute bottom-2 right-6 hidden sm:block" />
          )}
          <HskBadge level={level} className="bg-white/80" />
          <h1 className="mt-4 text-3xl font-extrabold sm:text-4xl">
            {mode === "mock" ? `Simulasi Ujian HSK ${level}` : `Bank Latihan HSK ${level}`}
          </h1>
          <p className="mt-2 max-w-lg text-white/90 sm:pr-32">
            {mode === "mock"
              ? "Kerjakan seperti ujian sungguhan: setiap bagian memiliki batas waktu dan audio hanya bisa diputar dua kali."
              : "Tanpa batas waktu. Periksa setiap jawaban dan pelajari penjelasannya langsung."}
          </p>
        </BentoCard>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {sections.map((s) => {
            const m = SECTION_META[s.section_type];
            return (
              <BentoCard key={s.id} tone={m.tone}>
                <m.icon className={cn("h-6 w-6", m.color)} />
                <p className="mt-3 text-lg font-extrabold">
                  {m.label} <span className="font-hanzi text-plum-soft">{m.zh}</span>
                </p>
                <p className="text-sm text-plum-soft">
                  {s.questions_json.length} soal
                  {mode === "mock" && ` · ${Math.ceil(sectionSeconds(s) / 60)} menit`}
                </p>
              </BentoCard>
            );
          })}
        </div>
        <Button onClick={start} className="mt-6 w-full py-4 text-base">
          {mode === "mock" ? "Mulai ujian" : "Mulai latihan"} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    );
  }

  /* ================================ RESULT */
  if (phase === "result") {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <BentoCard tone={results.passed ? "gradient" : "plum"} className="p-8">
            <div className="pointer-events-none absolute -bottom-2 right-3 hidden sm:block">
              {results.passed ? <BooWith prop="trophy" mood="happy" size={130} float /> : <Boo mood="sad" size={120} />}
            </div>
            {results.passed && (
              <>
                <Sticker name="sparkle" size={28} className="pointer-events-none absolute right-40 top-8 hidden sm:block" />
                <Sticker name="star" size={36} rotate={14} className="pointer-events-none absolute right-6 top-6 hidden sm:block" />
              </>
            )}
            <Trophy className="h-8 w-8" />
            <p className="mt-3 text-sm font-bold uppercase tracking-wider opacity-80">Hasil HSK {level}</p>
            <p className="text-5xl font-extrabold">
              {results.scaled}
              <span className="text-xl font-bold opacity-70"> / {maxScore}</span>
            </p>
            <p className="mt-2 text-lg font-bold">{results.passed ? "Lulus! 太棒了！" : "Belum lulus — ayo coba lagi! 加油！"}</p>
            <p className="mt-1 text-sm opacity-80">
              {results.correct} dari {totalQuestions} benar · batas lulus 60%
            </p>
          </BentoCard>
          <BentoCard className="flex flex-col justify-center gap-4">
            {results.perSection.map((s) => {
              const m = SECTION_META[s.type];
              const pct = s.total ? Math.round((s.correct / s.total) * 100) : 0;
              return (
                <div key={s.type} className="flex items-center gap-4">
                  <ProgressRing value={pct} size={56} stroke={6} color={m.ring}>
                    <m.icon className={cn("h-4 w-4", m.color)} />
                  </ProgressRing>
                  <div className="flex-1">
                    <p className="font-extrabold">{m.label}</p>
                    <p className="text-sm text-plum-soft">
                      {s.correct}/{s.total} benar · {pct}%
                    </p>
                  </div>
                </div>
              );
            })}
          </BentoCard>
        </div>

        <h2 className="mb-3 mt-8 text-2xl font-extrabold">Pembahasan</h2>
        <div className="space-y-3">
          {sections.flatMap((s) =>
            s.questions_json.map((q, i) => {
              const ok = isCorrect(q, answers[q.id]);
              return (
                <BentoCard key={q.id} className="p-5">
                  <div className="flex items-start gap-3">
                    {ok ? (
                      <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-mint" />
                    ) : (
                      <XCircle className="mt-0.5 h-6 w-6 shrink-0 text-blossom" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-plum-soft">
                        {SECTION_META[s.section_type].label} · Soal {i + 1}
                      </p>
                      <p className="mt-1 font-semibold">{q.prompt}</p>
                      {q.kind === "mcq" && (q.passage_zh || q.audio_text) && (
                        <p className="mt-1 font-hanzi text-lg">{q.passage_zh ?? q.audio_text}</p>
                      )}
                      <p className="mt-2 text-sm">
                        Jawabanmu: <span className={cn("font-hanzi font-bold", ok ? "text-mint-dark" : "text-blossom")}>{answerText(q, answers[q.id])}</span>
                      </p>
                      {!ok && (
                        <p className="text-sm">
                          Jawaban benar:{" "}
                          <span className="font-hanzi font-bold text-mint-dark">
                            {q.kind === "mcq" ? q.options[q.answer] : q.answer}
                          </span>
                        </p>
                      )}
                      <p className="mt-2 flex gap-2 rounded-2xl bg-cream p-3 text-sm text-plum-soft">
                        <Lightbulb className="h-4 w-4 shrink-0 text-peach" /> {q.explanation}
                      </p>
                    </div>
                  </div>
                </BentoCard>
              );
            }),
          )}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={start}>
            <RotateCcw className="h-4 w-4" /> Ulangi
          </Button>
          <ButtonLink href="/hsk" variant="secondary">
            Pusat HSK
          </ButtonLink>
        </div>
      </div>
    );
  }

  /* ================================ RUNNING */
  if (!question) return null;
  const answer = answers[question.id];
  const isChecked = !!checked[question.id];
  const lowTime = mode === "mock" && timeLeft <= 30;
  const isLastQ = qIdx === questions.length - 1;
  const answeredInSection = questions.filter((q) => answers[q.id] !== undefined).length;

  return (
    <div className="mx-auto max-w-3xl">
      {/* Exam header */}
      <div className="sticky top-[68px] z-20 mb-4 rounded-full bg-white/95 p-2 pl-4 shadow-soft ring-1 ring-plum/5 backdrop-blur">
        <div className="flex items-center gap-3">
          <meta.icon className={cn("h-5 w-5 shrink-0", meta.color)} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold">
              {meta.label} <span className="font-hanzi text-plum-soft">{meta.zh}</span> · {qIdx + 1}/{questions.length}
            </p>
            <ProgressBar value={((qIdx + 1) / questions.length) * 100} className="mt-1 h-1.5" />
          </div>
          {mode === "mock" ? (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-4 py-2 font-mono text-sm font-bold tabular-nums",
                lowTime ? "animate-pulse bg-blossom text-white" : "bg-plum text-cream",
              )}
              aria-live="polite"
            >
              <Clock className="h-4 w-4" /> {formatTime(timeLeft)}
            </span>
          ) : (
            <span className="rounded-full bg-rose px-4 py-2 text-sm font-bold text-blossom-dark">Latihan</span>
          )}
        </div>
      </div>

      {/* Section stepper */}
      <div className="mb-4 flex gap-2">
        {sections.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              i < sectionIdx ? "bg-plum" : i === sectionIdx ? "bg-blossom" : "bg-plum/10",
            )}
          />
        ))}
      </div>

      <BentoCard key={question.id} className="animate-pop-in p-6 sm:p-8">
        <p className="text-lg font-bold">{question.prompt}</p>

        {question.kind === "mcq" && question.audio_text && (
          <div className="mt-4 flex items-center gap-3 rounded-3xl bg-cream p-3">
            <button
              onClick={() => playAudio(question)}
              disabled={mode === "mock" && (listens[question.id] ?? 0) >= MAX_LISTENS}
              className="grid h-14 w-14 place-items-center rounded-full bg-blossom text-white shadow-glow transition active:scale-95 disabled:bg-plum/20 disabled:shadow-none"
              aria-label="Putar audio"
            >
              <Volume2 className="h-6 w-6" />
            </button>
            <p className="text-sm font-semibold text-plum-soft">
              {mode === "mock"
                ? `Sisa putar: ${MAX_LISTENS - (listens[question.id] ?? 0)}×`
                : "Putar sebanyak yang kamu mau."}
            </p>
          </div>
        )}

        {question.kind === "mcq" && question.passage_zh && (
          <p className="mt-4 rounded-3xl bg-rose/40 p-5 font-hanzi text-2xl leading-relaxed" lang="zh-CN">
            {question.passage_zh}
          </p>
        )}

        {/* Options */}
        {question.kind === "mcq" && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {question.options.map((opt, i) => {
              const selected = answer === i;
              const reveal = isChecked;
              const right = reveal && i === question.answer;
              const wrong = reveal && selected && i !== question.answer;
              return (
                <button
                  key={i}
                  onClick={() => setAnswer(i)}
                  disabled={isChecked}
                  className={cn(
                    "flex items-center gap-3 rounded-3xl border-2 p-4 text-left font-semibold transition",
                    right
                      ? "border-mint bg-mint-light"
                      : wrong
                        ? "border-blossom bg-rose/40"
                        : selected
                          ? "border-blossom bg-rose/30"
                          : "border-plum/10 bg-white hover:border-blossom/50",
                  )}
                >
                  <span
                    className={cn(
                      "grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-extrabold",
                      selected ? "bg-blossom text-white" : "bg-cream text-plum-soft",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="font-hanzi text-base">{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Sentence ordering */}
        {question.kind === "order" && (
          <OrderBuilder
            fragments={question.fragments}
            value={Array.isArray(answer) ? answer : []}
            onChange={(v) => setAnswer(v)}
            locked={isChecked}
          />
        )}

        {/* Practice feedback */}
        {isChecked && (
          <div
            className={cn(
              "mt-5 rounded-3xl p-4 text-sm",
              isCorrect(question, answer) ? "bg-mint-light text-plum" : "bg-rose/40 text-plum",
            )}
          >
            <p className="font-extrabold">
              {isCorrect(question, answer)
                ? "Benar! 对了！"
                : `Kurang tepat. Jawaban: ${question.kind === "mcq" ? question.options[question.answer] : question.answer}`}
            </p>
            {question.kind === "mcq" && question.audio_text && (
              <p className="mt-1 font-hanzi">Transkrip: {question.audio_text}</p>
            )}
            <p className="mt-1">{question.explanation}</p>
          </div>
        )}
      </BentoCard>

      {/* Question jump grid (mock) */}
      {mode === "mock" && (
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((q, i) => (
            <button
              key={q.id}
              onClick={() => setQIdx(i)}
              className={cn(
                "h-9 w-9 rounded-full text-sm font-bold transition",
                i === qIdx
                  ? "bg-plum text-cream"
                  : answers[q.id] !== undefined
                    ? "bg-blossom text-white"
                    : "bg-white text-plum-soft ring-1 ring-plum/10",
              )}
            >
              {i + 1}
            </button>
          ))}
          <span className="ml-auto self-center text-sm font-semibold text-plum-soft">
            {answeredInSection}/{questions.length} terjawab
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-6 flex items-center justify-between gap-3">
        <Button variant="secondary" onClick={() => setQIdx((i) => Math.max(0, i - 1))} disabled={qIdx === 0}>
          <ArrowLeft className="h-4 w-4" /> Sebelumnya
        </Button>
        {mode === "practice" && !isChecked ? (
          <Button
            onClick={() => setChecked((c) => ({ ...c, [question.id]: true }))}
            disabled={answer === undefined || (Array.isArray(answer) && answer.length === 0)}
          >
            Periksa
          </Button>
        ) : isLastQ ? (
          <Button
            variant="dark"
            onClick={() => {
              if (
                mode === "mock" &&
                answeredInSection < questions.length &&
                !window.confirm("Masih ada soal yang belum dijawab. Lanjut ke bagian berikutnya?")
              )
                return;
              nextSection();
            }}
          >
            {sectionIdx + 1 >= sections.length ? "Selesai & lihat hasil" : "Bagian berikutnya"} <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={() => setQIdx((i) => i + 1)}>
            Berikutnya <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function OrderBuilder({
  fragments,
  value,
  onChange,
  locked,
}: {
  fragments: string[];
  value: number[];
  onChange: (v: number[]) => void;
  locked: boolean;
}) {
  return (
    <div className="mt-5">
      <div
        className={cn(
          "flex min-h-[72px] flex-wrap items-center gap-2 rounded-3xl border-2 border-dashed p-3",
          value.length ? "border-blossom/40 bg-rose/20" : "border-plum/15",
        )}
      >
        {value.length === 0 && <p className="px-2 text-sm text-plum-soft">Ketuk potongan kata di bawah untuk menyusun kalimat…</p>}
        {value.map((fi, pos) => (
          <button
            key={`${fi}-${pos}`}
            disabled={locked}
            onClick={() => onChange(value.filter((_, p) => p !== pos))}
            className="chip bg-blossom text-white ring-blossom"
          >
            {fragments[fi]}
          </button>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {fragments.map((f, i) =>
          value.includes(i) ? (
            <span key={i} className="chip opacity-25">
              {f}
            </span>
          ) : (
            <button key={i} disabled={locked} onClick={() => onChange([...value, i])} className="chip">
              {f}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
