"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Mic, MicOff, Volume2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, ProgressRing } from "@/components/ui";
import { createRecognizer, isRecognitionSupported, pronunciationScore, speakZh } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { VocabItem } from "@/types/content";

export function SpeechPractice({ vocab }: { vocab: VocabItem[] }) {
  const { recordActivity } = useUser();
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const recRef = useRef<SpeechRecognition | null>(null);

  const item = vocab[idx];

  useEffect(() => {
    setSupported(isRecognitionSupported());
    return () => recRef.current?.abort();
  }, []);

  const reset = (i: number) => {
    recRef.current?.abort();
    setIdx(i);
    setHeard(null);
    setScore(null);
    setError(null);
    setListening(false);
  };

  const listen = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = createRecognizer();
    if (!rec) return;
    recRef.current = rec;
    setError(null);
    setHeard(null);
    setScore(null);
    rec.onresult = (e) => {
      // Take the best-matching alternative.
      const alts = Array.from({ length: e.results[0].length }, (_, i) => e.results[0][i].transcript);
      const scored = alts.map((t) => ({ t, s: pronunciationScore(item.hanzi, t) })).sort((a, b) => b.s - a.s);
      setHeard(scored[0].t);
      setScore(scored[0].s);
      recordActivity(scored[0].s >= 80 ? 5 : 2);
    };
    rec.onerror = (e) =>
      setError(e.error === "not-allowed" ? "Izin mikrofon ditolak. Aktifkan di pengaturan browser." : "Suara tidak terdengar, coba lagi.");
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  };

  if (!item) return null;

  const verdict =
    score === null ? null : score >= 90 ? "Luar biasa! 很好！" : score >= 60 ? "Hampir! Perhatikan nadanya." : "Coba lagi, dengarkan contohnya dulu.";

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BentoCard className="text-center">
        <p className="text-xs font-bold uppercase tracking-wider text-blossom">
          Ucapkan · {idx + 1}/{vocab.length}
        </p>
        <p className="mt-4 font-hanzi text-7xl font-bold">{item.hanzi}</p>
        <p className="mt-3 text-2xl font-bold text-blossom-dark">{item.pinyin}</p>
        <p className="text-plum-soft">{item.meaning}</p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            onClick={() => reset(Math.max(0, idx - 1))}
            disabled={idx === 0}
            className="grid h-11 w-11 place-items-center rounded-full bg-cream disabled:opacity-30"
            aria-label="Sebelumnya"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <Button variant="secondary" onClick={() => speakZh(item.hanzi, { rate: 0.7 })}>
            <Volume2 className="h-4 w-4" /> Contoh
          </Button>
          <button
            onClick={() => reset(Math.min(vocab.length - 1, idx + 1))}
            disabled={idx === vocab.length - 1}
            className="grid h-11 w-11 place-items-center rounded-full bg-cream disabled:opacity-30"
            aria-label="Berikutnya"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </BentoCard>

      <BentoCard tone="plum" className="flex flex-col items-center justify-center text-center">
        {!supported ? (
          <>
            <MicOff className="h-10 w-10 text-peach" />
            <p className="mt-3 font-bold">Pengenalan suara tidak tersedia</p>
            <p className="mt-1 text-sm text-cream/70">Gunakan Google Chrome atau Microsoft Edge di desktop/Android.</p>
          </>
        ) : (
          <>
            <button
              onClick={listen}
              className={cn(
                "grid h-24 w-24 place-items-center rounded-full bg-blossom text-white shadow-glow transition active:scale-95",
                listening && "animate-pulse ring-8 ring-blossom/30",
              )}
              aria-label={listening ? "Berhenti merekam" : "Mulai merekam"}
            >
              <Mic className="h-10 w-10" />
            </button>
            <p className="mt-4 font-bold">{listening ? "Mendengarkan…" : "Ketuk lalu ucapkan kata di kiri"}</p>
            {error && <p className="mt-2 text-sm text-peach">{error}</p>}
            {score !== null && (
              <div className="mt-5 flex items-center gap-4 rounded-3xl bg-white/10 p-4 text-left">
                <ProgressRing value={score} size={72} stroke={8} track="rgba(255,255,255,0.15)">
                  <span className="text-lg font-extrabold">{score}</span>
                </ProgressRing>
                <div>
                  <p className="font-bold">{verdict}</p>
                  <p className="text-sm text-cream/70">
                    Terdengar: <span className="font-hanzi text-cream">{heard || "—"}</span>
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </BentoCard>
    </div>
  );
}
