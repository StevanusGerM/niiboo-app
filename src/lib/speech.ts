"use client";

/** Thin wrappers around the Web Speech API (TTS + recognition) tuned for Mandarin. */

export function isTtsSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function getChineseVoice(): SpeechSynthesisVoice | null {
  if (!isTtsSupported()) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === "zh-CN") ??
    voices.find((v) => v.lang.toLowerCase().startsWith("zh")) ??
    null
  );
}

export function speakZh(
  text: string,
  opts: { rate?: number; onEnd?: () => void; onBoundary?: (charIndex: number) => void } = {},
) {
  if (!isTtsSupported()) {
    opts.onEnd?.();
    return null;
  }
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "zh-CN";
  u.rate = opts.rate ?? 0.9;
  const voice = getChineseVoice();
  if (voice) u.voice = voice;
  u.onend = () => opts.onEnd?.();
  u.onerror = () => opts.onEnd?.();
  if (opts.onBoundary) u.onboundary = (e) => opts.onBoundary?.(e.charIndex);
  window.speechSynthesis.speak(u);
  return u;
}

export function stopSpeaking() {
  if (isTtsSupported()) window.speechSynthesis.cancel();
}

export function isRecognitionSupported() {
  return typeof window !== "undefined" && !!(window.SpeechRecognition ?? window.webkitSpeechRecognition);
}

export function createRecognizer(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "zh-CN";
  rec.interimResults = false;
  rec.continuous = false;
  rec.maxAlternatives = 3;
  return rec;
}

/** Character-level similarity (0–100) between target hanzi and a transcript. */
export function pronunciationScore(target: string, heard: string) {
  const clean = (s: string) => s.replace(/[\s，。！？、,.!?]/g, "");
  const a = clean(target);
  const b = clean(heard);
  if (!a.length) return 0;
  const dp: number[][] = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1),
      );
    }
  }
  const dist = dp[a.length][b.length];
  return Math.max(0, Math.round((1 - dist / Math.max(a.length, b.length)) * 100));
}
