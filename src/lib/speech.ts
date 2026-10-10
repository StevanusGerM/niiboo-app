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

/**
 * Mandarin recogniser. Interim results are on because iOS Safari sometimes ends
 * the session without ever marking a result as final — callers should keep the
 * latest transcript and score it on `onend` if no final result arrived.
 */
export function createRecognizer(): SpeechRecognition | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = "zh-CN";
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 3;
  return rec;
}

export function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

/** Browsers embedded in chat/social apps usually block the mic and speech APIs. */
export function isInAppBrowser() {
  if (typeof navigator === "undefined") return false;
  return /FBAN|FBAV|Instagram|Line\/|WhatsApp|Twitter|TikTok|musical_ly|Snapchat/i.test(navigator.userAgent);
}

export interface SpeechProblem {
  title: string;
  steps: string[];
  /** Offer a button that asks for microphone permission directly. */
  canRequestMic: boolean;
}

/** Friendly, device-aware explanation for a SpeechRecognition error code. */
export function explainSpeechError(code: string): SpeechProblem {
  const ios = isIOS();
  switch (code) {
    case "not-allowed":
      return {
        title: "Mikrofon belum diizinkan",
        steps: ios
          ? [
              "Ketuk tombol “Izinkan mikrofon” di bawah, lalu pilih Izinkan.",
              "Kalau tidak muncul: ketuk ikon “aA” di bilah alamat Safari › Pengaturan Situs Web › Mikrofon › Izinkan.",
              "Atau buka Pengaturan iPhone › Safari › Mikrofon › Izinkan.",
            ]
          : ["Ketuk tombol “Izinkan mikrofon” di bawah.", "Atau ketuk ikon gembok di bilah alamat › Izin › Mikrofon › Izinkan."],
        canRequestMic: true,
      };
    case "service-not-allowed":
      return {
        title: ios ? "Dikte iPhone belum aktif" : "Layanan pengenalan suara diblokir",
        steps: ios
          ? [
              "Buka Pengaturan › Umum › Keyboard › aktifkan “Aktifkan Dikte”.",
              "Di menu yang sama, tambahkan keyboard “Chinese, Simplified” (Mandarin) agar Dikte mengenali bahasa Mandarin.",
              "Pastikan juga Pengaturan › Durasi Layar › Batasan Konten & Privasi tidak memblokir Siri & Dikte.",
              "Kembali ke sini lalu ketuk mic lagi.",
            ]
          : ["Browser ini tidak mengizinkan pengenalan suara. Coba Google Chrome versi terbaru."],
        canRequestMic: !ios,
      };
    case "language-not-supported":
      return {
        title: "Bahasa Mandarin belum tersedia untuk pengenalan suara",
        steps: ios
          ? ["Tambahkan keyboard “Chinese, Simplified”: Pengaturan › Umum › Keyboard › Keyboard › Tambah Keyboard Baru.", "Lalu coba lagi."]
          : ["Coba Google Chrome versi terbaru dengan koneksi internet."],
        canRequestMic: false,
      };
    case "audio-capture":
      return {
        title: "Mikrofon tidak terdeteksi",
        steps: ["Pastikan tidak ada aplikasi lain (telepon, rekam suara) yang sedang memakai mikrofon.", "Lepas lalu pasang lagi earphone, kemudian coba lagi."],
        canRequestMic: true,
      };
    case "network":
      return {
        title: "Butuh koneksi internet",
        steps: ["Pengenalan suara memakai layanan online. Periksa koneksi internet, lalu coba lagi."],
        canRequestMic: false,
      };
    case "no-speech":
      return {
        title: "Suaramu belum terdengar",
        steps: ["Ketuk mic, tunggu sebentar, lalu ucapkan kata dengan jelas dan agak keras."],
        canRequestMic: false,
      };
    default:
      return {
        title: "Pengenalan suara terhenti",
        steps: ["Ketuk mic dan coba lagi."],
        canRequestMic: false,
      };
  }
}

/** Ask for microphone access explicitly (must be called from a tap). */
export async function requestMicPermission(): Promise<boolean> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  } catch {
    return false;
  }
}

export function isRecordingSupported() {
  return typeof window !== "undefined" && !!navigator.mediaDevices?.getUserMedia && typeof window.MediaRecorder !== "undefined";
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
