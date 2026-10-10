"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Mic, MicOff, Volume2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, ProgressRing } from "@/components/ui";
import {
  createRecognizer,
  explainSpeechError,
  isInAppBrowser,
  isRecognitionSupported,
  pronunciationScore,
  requestMicPermission,
  speakZh,
  type SpeechProblem,
} from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { VocabItem } from "@/types/content";
import { VoiceRecorder } from "./VoiceRecorder";

type Mode = "auto" | "record";

export function SpeechPractice({ vocab }: { vocab: VocabItem[] }) {
  const { recordActivity } = useUser();
  const [idx, setIdx] = useState(0);
  const [listening, setListening] = useState(false);
  const [heard, setHeard] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [problem, setProblem] = useState<SpeechProblem | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const [inApp, setInApp] = useState(false);
  const [mode, setMode] = useState<Mode>("auto");
  const recRef = useRef<SpeechRecognition | null>(null);

  const item = vocab[idx];

  useEffect(() => {
    const ok = isRecognitionSupported();
    setSupported(ok);
    setInApp(isInAppBrowser());
    if (!ok) setMode("record");
    return () => recRef.current?.abort();
  }, []);

  const reset = (i: number) => {
    recRef.current?.abort();
    setIdx(i);
    setHeard(null);
    setScore(null);
    setProblem(null);
    setNotice(null);
    setListening(false);
  };

  const finalize = (transcripts: string[]) => {
    const scored = transcripts
      .filter(Boolean)
      .map((t) => ({ t, s: pronunciationScore(item.hanzi, t) }))
      .sort((a, b) => b.s - a.s);
    if (!scored.length) return;
    setHeard(scored[0].t);
    setScore(scored[0].s);
    recordActivity(scored[0].s >= 80 ? 5 : 2);
  };

  const listen = () => {
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = createRecognizer();
    if (!rec) return;
    recRef.current = rec;
    setProblem(null);
    setNotice(null);
    setHeard(null);
    setScore(null);

    // iOS can end the session without a final result, so remember the latest guess.
    let latest: string[] = [];
    let scored = false;
    let failed = false;

    rec.onresult = (e) => {
      const result = e.results[e.results.length - 1];
      latest = Array.from({ length: result.length }, (_, i) => result[i].transcript);
      setHeard(latest[0] ?? null);
      if (result.isFinal && !scored) {
        scored = true;
        finalize(latest);
      }
    };
    rec.onerror = (e) => {
      if (e.error === "aborted") return;
      failed = true;
      setProblem(explainSpeechError(e.error));
    };
    rec.onend = () => {
      setListening(false);
      if (scored || failed) return;
      if (latest.length) {
        scored = true;
        finalize(latest);
      } else {
        setProblem(explainSpeechError("no-speech"));
      }
    };

    setListening(true);
    try {
      rec.start();
    } catch {
      setListening(false);
      setProblem(explainSpeechError("unknown"));
    }
  };

  const askMic = async () => {
    const ok = await requestMicPermission();
    if (ok) {
      setProblem(null);
      setNotice("Mikrofon sudah diizinkan! Ketuk tombol mic lagi.");
    } else {
      setNotice("Izin masih ditolak. Ikuti langkah di atas lewat Pengaturan, lalu muat ulang halaman.");
    }
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
        {/* Mode switch */}
        <div className="mb-4 flex w-full rounded-full bg-white/10 p-1 text-xs font-black">
          {(
            [
              ["auto", "Dinilai otomatis"],
              ["record", "Rekam & bandingkan"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                recRef.current?.abort();
                setListening(false);
                setMode(key);
              }}
              disabled={key === "auto" && !supported}
              className={cn(
                "flex-1 rounded-full px-3 py-2 transition disabled:opacity-40",
                mode === key ? "bg-blossom text-white" : "text-cream/70 hover:text-cream",
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === "record" ? (
          <>
            {!supported && (
              <p className="mb-3 flex items-start gap-2 rounded-2xl bg-white/10 p-3 text-left text-xs font-semibold text-cream/80">
                <MicOff className="mt-0.5 h-4 w-4 shrink-0 text-peach" />
                {inApp
                  ? "Browser di dalam aplikasi (WA/IG/LINE) tidak mendukung penilaian otomatis. Buka situs ini di Safari atau Chrome untuk dinilai otomatis."
                  : "Penilaian otomatis tidak tersedia di browser ini — pakai rekam & bandingkan dulu, ya!"}
              </p>
            )}
            <VoiceRecorder target={item.hanzi} onSelfRated={(good) => recordActivity(good ? 3 : 1)} />
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
            <p className="mt-4 font-bold">{listening ? "Mendengarkan… ucapkan sekarang" : "Ketuk lalu ucapkan kata di kiri"}</p>
            {listening && heard && <p className="mt-1 font-hanzi text-lg text-cream/80">{heard}</p>}

            {problem && (
              <div className="mt-4 w-full rounded-3xl bg-white/10 p-4 text-left text-sm">
                <p className="flex items-center gap-2 font-black text-peach">
                  <AlertCircle className="h-4 w-4 shrink-0" /> {problem.title}
                </p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-cream/85">
                  {problem.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
                <div className="mt-3 flex flex-wrap gap-2">
                  {problem.canRequestMic && (
                    <Button onClick={() => void askMic()} className="py-2">
                      <Mic className="h-4 w-4" /> Izinkan mikrofon
                    </Button>
                  )}
                  <Button variant="secondary" className="py-2" onClick={() => setMode("record")}>
                    Pakai rekam & bandingkan
                  </Button>
                </div>
              </div>
            )}
            {notice && <p className="mt-3 text-sm font-bold text-mint">{notice}</p>}

            {score !== null && !listening && (
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
