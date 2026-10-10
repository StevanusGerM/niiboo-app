"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type HanziWriter from "hanzi-writer";
import { Eye, PenTool, Play, RotateCcw } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button } from "@/components/ui";
import { cn } from "@/lib/utils";
import type { VocabItem } from "@/types/content";

const SIZE = 280;

/** Interactive stroke-order trainer powered by hanzi-writer (character data loads from its CDN). */
export function HanziWriterPad({ vocab }: { vocab: VocabItem[] }) {
  const { recordActivity } = useUser();
  // Unique characters across the lesson vocabulary.
  const chars = useMemo(() => Array.from(new Set(vocab.flatMap((v) => Array.from(v.hanzi)))), [vocab]);
  const [char, setChar] = useState(chars[0]);
  const [mode, setMode] = useState<"watch" | "quiz">("watch");
  const [status, setStatus] = useState<string>("");
  const [mistakes, setMistakes] = useState(0);
  const [error, setError] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const writerRef = useRef<HanziWriter | null>(null);
  // Keep the latest callback without re-creating the writer when it changes.
  const recordRef = useRef(recordActivity);
  recordRef.current = recordActivity;

  const owner = vocab.find((v) => v.hanzi.includes(char));

  useEffect(() => {
    let cancelled = false;
    const host = hostRef.current;
    if (!host || !char) return;
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
        outlineColor: "#F1E7EA",
        highlightColor: "#FFB385",
        drawingColor: "#FF6584",
        drawingWidth: 22,
        strokeAnimationSpeed: 1.1,
        delayBetweenStrokes: 220,
        showOutline: true,
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
            setStatus(data.totalMistakes === 0 ? "Sempurna! 完美！" : `Selesai dengan ${data.totalMistakes} kesalahan.`);
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

  return (
    <div className="grid gap-4 md:grid-cols-[auto_minmax(0,1fr)]">
      <BentoCard className="flex flex-col items-center">
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
        <div className="mt-4 flex gap-2">
          <Button variant={mode === "watch" ? "dark" : "secondary"} onClick={() => setMode("watch")}>
            <Eye className="h-4 w-4" /> Lihat
          </Button>
          <Button variant={mode === "quiz" ? "primary" : "secondary"} onClick={() => setMode("quiz")}>
            <PenTool className="h-4 w-4" /> Tulis
          </Button>
          <Button
            variant="ghost"
            aria-label="Ulangi"
            onClick={() => (mode === "watch" ? void writerRef.current?.animateCharacter() : setMode("quiz"))}
          >
            {mode === "watch" ? <Play className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
          </Button>
        </div>
      </BentoCard>

      <div className="space-y-4">
        <BentoCard tone="plum">
          <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Sedang dilatih</p>
          <p className="mt-1 font-hanzi text-5xl font-bold">{char}</p>
          {owner && (
            <p className="mt-2 text-cream/80">
              dari <span className="font-hanzi font-bold text-cream">{owner.hanzi}</span> · {owner.pinyin} · {owner.meaning}
            </p>
          )}
          {mode === "quiz" && (
            <p className="mt-3 text-sm font-semibold text-peach" aria-live="polite">
              {status || "Gambar goresan pertama di kotak. Petunjuk muncul setelah 2 kesalahan."}
              {mistakes > 0 && !status.startsWith("Selesai") && ` · Kesalahan: ${mistakes}`}
            </p>
          )}
        </BentoCard>
        <BentoCard>
          <p className="mb-3 text-sm font-extrabold">Pilih karakter</p>
          <div className="flex flex-wrap gap-2">
            {chars.map((c) => (
              <button
                key={c}
                onClick={() => setChar(c)}
                className={cn("chip h-12 w-12 text-xl", c === char && "bg-blossom text-white ring-blossom")}
              >
                {c}
              </button>
            ))}
          </div>
        </BentoCard>
      </div>
    </div>
  );
}
