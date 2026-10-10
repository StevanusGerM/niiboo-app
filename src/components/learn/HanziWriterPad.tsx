"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import { Check, Eye, GraduationCap, PenTool, Play, RotateCcw, Star } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button } from "@/components/ui";
import { HANZI_PASS, JOURNEY_EVENT, hanziStars, readHanzi, recordHanziPractice, recordHanziTest, type HanziRecord } from "@/lib/journey-store";
import { cn } from "@/lib/utils";
import type { VocabItem } from "@/types/content";
import { FreehandTest } from "./FreehandTest";

const SIZE = 280;

export type WriteMode = "watch" | "practice" | "test";

const MODES: { key: WriteMode; step: number; label: string; hint: string; icon: typeof Eye }[] = [
  { key: "watch", step: 1, label: "Lihat", hint: "Perhatikan urutan goresannya.", icon: Eye },
  { key: "practice", step: 2, label: "Latihan", hint: "Ikuti bayangan abu-abu, goresan demi goresan.", icon: PenTool },
  { key: "test", step: 3, label: "Tes", hint: "Tanpa bayangan! Tulis dari ingatan — yang dinilai hanya bentuknya.", icon: GraduationCap },
];

/** Stroke-order trainer (hanzi-writer) + free-hand shape test. */
export function HanziWriterPad({ vocab, initialMode = "watch" }: { vocab: VocabItem[]; initialMode?: WriteMode }) {
  const { recordActivity } = useUser();
  const chars = useMemo(() => Array.from(new Set(vocab.flatMap((v) => Array.from(v.hanzi)))), [vocab]);
  const [char, setChar] = useState(chars[0]);
  const [mode, setMode] = useState<WriteMode>(initialMode);
  const [status, setStatus] = useState("");
  const [mistakes, setMistakes] = useState(0);
  const [error, setError] = useState(false);
  const [records, setRecords] = useState<Record<string, HanziRecord>>({});
  const hostRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  // Keep the latest callback without re-creating the writer when it changes.
  const recordRef = useRef(recordActivity);
  recordRef.current = recordActivity;

  const owner = vocab.find((v) => v.hanzi.includes(char));
  const meta = MODES.find((m) => m.key === mode)!;

  useEffect(() => {
    const sync = () => setRecords(readHanzi());
    sync();
    window.addEventListener(JOURNEY_EVENT, sync);
    return () => window.removeEventListener(JOURNEY_EVENT, sync);
  }, []);

  // hanzi-writer for "watch" and "practice"
  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host || !char || mode === "test") return;
    host.innerHTML = "";
    setError(false);
    setMistakes(0);
    setStatus("");

    import("hanzi-writer").then(({ default: HW }) => {
      if (cancelled) return;
      const writer = HW.create(host, char, {
        width: SIZE,
        height: SIZE,
        padding: 16,
        strokeColor: "#2B2D42",
        radicalColor: "#FF6584",
        outlineColor: "#E9E3E6",
        highlightColor: "#FFB385",
        drawingColor: "#FF6584",
        drawingWidth: 22,
        strokeAnimationSpeed: 1.1,
        delayBetweenStrokes: 220,
        showOutline: true, // the "shadow guide"
        showCharacter: mode === "watch",
        onLoadCharDataError: () => !cancelled && setError(true),
      });
      writerRef.current = writer;
      if (mode === "watch") {
        void writer.animateCharacter();
      } else {
        void writer.quiz({
          showHintAfterMisses: 2,
          onMistake: (data) => setMistakes(data.totalMistakes),
          onCorrectStroke: (data) => setStatus(`Goresan ${data.strokeNum + 1} benar!`),
          onComplete: (data) => {
            setStatus(data.totalMistakes === 0 ? "Sempurna! 完美！ Siap untuk tes?" : `Selesai dengan ${data.totalMistakes} kesalahan.`);
            recordHanziPractice(char);
            recordRef.current(data.totalMistakes === 0 ? 10 : 5);
          },
        });
      }
    });

    return () => {
      cancelled = true;
      writerRef.current = null;
    };
  }, [char, mode]);

  const onTestScored = (score: number) => {
    recordHanziTest(char, score);
    if (score >= HANZI_PASS) recordRef.current(5 + hanziStars(score) * 5);
  };

  const passedCount = chars.filter((c) => (records[c]?.best ?? 0) >= HANZI_PASS).length;

  return (
    <div className="space-y-4">
      {/* Step tabs */}
      <div className="grid grid-cols-3 gap-2">
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-3xl border-2 px-2 py-3 text-sm font-black transition active:translate-y-[3px] active:shadow-none",
              mode === m.key
                ? m.key === "test"
                  ? "border-plum bg-plum text-cream shadow-chunky-plum"
                  : "border-blossom bg-blossom text-white shadow-chunky-pink"
                : "border-plum/10 bg-white text-plum shadow-chunky-white",
            )}
          >
            <span className="flex items-center gap-1.5">
              <m.icon className="h-4 w-4" /> {m.label}
            </span>
            <span className={cn("text-[10px] font-extrabold uppercase tracking-wider", mode === m.key ? "opacity-80" : "text-plum-soft")}>
              Tahap {m.step}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
        <BentoCard className="flex flex-col items-center">
          {mode === "test" ? (
            <FreehandTest key={char} char={char} size={SIZE} onScored={onTestScored} />
          ) : (
            <>
              <div className="relative" style={{ width: SIZE, height: SIZE }}>
                {/* 米字格 practice grid */}
                <svg width={SIZE} height={SIZE} className="absolute inset-0 rounded-3xl bg-cream" aria-hidden>
                  <g stroke="#FFD1DC" strokeWidth="1.5" strokeDasharray="6 6">
                    <line x1="0" y1="0" x2={SIZE} y2={SIZE} />
                    <line x1={SIZE} y1="0" x2="0" y2={SIZE} />
                    <line x1={SIZE / 2} y1="0" x2={SIZE / 2} y2={SIZE} />
                    <line x1="0" y1={SIZE / 2} x2={SIZE} y2={SIZE / 2} />
                  </g>
                  <rect x="1" y="1" width={SIZE - 2} height={SIZE - 2} rx="24" fill="none" stroke="#FF6584" strokeWidth="2" />
                </svg>
                <div ref={hostRef} className="relative touch-none" />
                {error && (
                  <p className="absolute inset-0 grid place-items-center p-6 text-center text-sm text-plum-soft">
                    Data goresan tidak bisa dimuat. Periksa koneksi internet.
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                className="mt-4"
                onClick={() => (mode === "watch" ? void writerRef.current?.animateCharacter() : setMode("practice"))}
              >
                {mode === "watch" ? <Play className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
                {mode === "watch" ? "Putar lagi" : "Ulangi"}
              </Button>
            </>
          )}
        </BentoCard>

        <div className="space-y-4">
          <BentoCard tone="plum">
            <p className="text-xs font-bold uppercase tracking-wider text-cream/60">
              Tahap {meta.step} · {meta.label}
            </p>
            {mode === "test" ? (
              // Never reveal the answer in test mode — prompt with the word, target masked.
              <>
                <p className="mt-1 text-sm font-bold text-cream/70">Tulis karakter yang hilang:</p>
                <p className="mt-1 font-hanzi text-4xl font-bold tracking-wider">
                  {owner ? Array.from(owner.hanzi).map((c, i) => (c === char ? <span key={i} className="text-peach">□</span> : c)) : "□"}
                </p>
                {owner && (
                  <p className="mt-2 text-cream/80">
                    {owner.pinyin} · {owner.meaning}
                  </p>
                )}
              </>
            ) : (
              <>
                <p className="mt-1 font-hanzi text-5xl font-bold">{char}</p>
                {owner && (
                  <p className="mt-2 text-cream/80">
                    dari <span className="font-hanzi font-bold text-cream">{owner.hanzi}</span> · {owner.pinyin} · {owner.meaning}
                  </p>
                )}
              </>
            )}
            <p className="mt-3 text-sm font-semibold text-peach" aria-live="polite">
              {mode === "practice" && status ? status : meta.hint}
              {mode === "practice" && mistakes > 0 && !status.startsWith("Selesai") && ` · Kesalahan: ${mistakes}`}
            </p>
          </BentoCard>

          <BentoCard>
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-extrabold">{mode === "test" ? "Pilih soal" : "Pilih karakter"}</p>
              <p className="text-xs font-bold text-plum-soft">
                Lulus tes: {passedCount}/{chars.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {chars.map((c, idx) => {
                const rec = records[c];
                const stars = hanziStars(rec?.best ?? 0);
                return (
                  <button
                    key={c}
                    onClick={() => setChar(c)}
                    className={cn(
                      "relative flex h-16 w-14 flex-col items-center justify-center rounded-2xl font-hanzi text-xl font-bold ring-1 transition active:scale-95",
                      c === char ? "bg-blossom text-white ring-blossom" : "bg-white text-plum ring-plum/10 hover:ring-blossom",
                    )}
                  >
                    {mode === "test" ? <span className="font-sans text-lg font-black">{idx + 1}</span> : c}
                    <span className="mt-0.5 flex gap-px">
                      {[1, 2, 3].map((n) => (
                        <Star
                          key={n}
                          className={cn("h-2.5 w-2.5", n <= stars ? "text-peach" : c === char ? "text-white/30" : "text-plum/15")}
                          fill="currentColor"
                        />
                      ))}
                    </span>
                    {rec?.practiced && (
                      <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-semibold text-plum-soft">✓ = sudah latihan dengan bayangan · ⭐ = nilai tes tanpa bayangan</p>
          </BentoCard>
        </div>
      </div>
    </div>
  );
}
