"use client";

import { useEffect, useRef, useState } from "react";
import { Circle, Play, RotateCcw, Square, ThumbsUp, Volume2 } from "lucide-react";
import { Button } from "@/components/ui";
import { isRecordingSupported, speakZh } from "@/lib/speech";
import { cn } from "@/lib/utils";

const MAX_SECONDS = 5;

function pickMimeType() {
  const types = ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/aac"];
  return types.find((t) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(t));
}

/**
 * Fallback when speech recognition isn't available (e.g. iPhone without
 * Mandarin dictation): record yourself, play it back next to the model audio,
 * and rate your own attempt.
 */
export function VoiceRecorder({ target, onSelfRated }: { target: string; onSelfRated: (good: boolean) => void }) {
  const [supported, setSupported] = useState(true);
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rated, setRated] = useState(false);
  const recRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => setSupported(isRecordingSupported()), []);

  // New word → clear the previous take.
  useEffect(() => {
    setUrl((old) => {
      if (old) URL.revokeObjectURL(old);
      return null;
    });
    setRated(false);
    setError(null);
  }, [target]);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      recRef.current?.stream.getTracks().forEach((t) => t.stop());
    },
    [],
  );

  const start = async () => {
    setError(null);
    setRated(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickMimeType();
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      const chunks: Blob[] = [];
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: rec.mimeType || mimeType || "audio/mp4" });
        setUrl((old) => {
          if (old) URL.revokeObjectURL(old);
          return URL.createObjectURL(blob);
        });
        setRecording(false);
      };
      recRef.current = rec;
      rec.start();
      setRecording(true);
      timerRef.current = setTimeout(() => rec.state === "recording" && rec.stop(), MAX_SECONDS * 1000);
    } catch {
      setError("Mikrofon belum diizinkan. Izinkan akses mikrofon untuk situs ini, lalu coba lagi.");
    }
  };

  const stop = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (recRef.current?.state === "recording") recRef.current.stop();
  };

  if (!supported) {
    return <p className="text-sm text-cream/70">Perekaman suara juga tidak didukung di browser ini. Coba Safari atau Chrome versi terbaru.</p>;
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={recording ? stop : () => void start()}
          className={cn(
            "grid h-16 w-16 place-items-center rounded-full text-white transition active:scale-95",
            recording ? "animate-pulse bg-blossom ring-8 ring-blossom/30" : "bg-blossom shadow-glow",
          )}
          aria-label={recording ? "Berhenti merekam" : "Mulai merekam"}
        >
          {recording ? <Square className="h-6 w-6" fill="white" /> : <Circle className="h-7 w-7" fill="white" />}
        </button>
        <Button variant="secondary" onClick={() => speakZh(target, { rate: 0.7 })}>
          <Volume2 className="h-4 w-4" /> Contoh
        </Button>
      </div>
      <p className="mt-3 text-center text-sm font-bold text-cream/80">
        {recording ? `Merekam… (maks ${MAX_SECONDS} detik)` : url ? "Dengarkan rekamanmu, lalu bandingkan dengan contoh." : "Ketuk tombol merah, ucapkan kata, lalu ketuk lagi."}
      </p>

      {url && !recording && (
        <div className="mt-3 rounded-3xl bg-white/10 p-3">
          <audio src={url} controls playsInline className="w-full" />
          {!rated ? (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setRated(true);
                  onSelfRated(false);
                }}
              >
                <RotateCcw className="h-4 w-4" /> Belum mirip
              </Button>
              <Button
                onClick={() => {
                  setRated(true);
                  onSelfRated(true);
                }}
              >
                <ThumbsUp className="h-4 w-4" /> Sudah mirip
              </Button>
            </div>
          ) : (
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-bold text-mint">
              <Play className="h-4 w-4" /> Tersimpan! Coba kata berikutnya.
            </p>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-center text-sm font-semibold text-peach">{error}</p>}
    </div>
  );
}
