"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { ArrowLeft, Check, Eye, EyeOff, Loader2, Lock, Mail, Smile } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { Boo, SpeechBubble, type BooMood } from "@/components/mascot/Boo";
import { clearGuest, enableGuest } from "@/lib/guest";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import { ChunkyButton, ChunkyLink } from "./ChunkyButton";

type Mode = "login" | "signup";
type Field = "name" | "email" | "password" | null;

/** Turn Supabase auth errors into friendly Indonesian messages. */
function friendlyError(message: string) {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) return "Email atau kata sandinya belum cocok. Coba lagi, ya!";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Email ini sudah terdaftar. Yuk, masuk saja!";
  if (m.includes("email not confirmed")) return "Emailmu belum dikonfirmasi. Cek kotak masuk dulu, ya!";
  if (m.includes("password") && (m.includes("6") || m.includes("short") || m.includes("weak")))
    return "Kata sandinya terlalu pendek. Minimal 6 karakter, ya!";
  if (m.includes("rate limit") || m.includes("too many")) return "Wah, terlalu cepat! Tunggu sebentar lalu coba lagi.";
  if (m.includes("invalid") && m.includes("email")) return "Sepertinya format emailnya kurang tepat.";
  if (m.includes("fetch") || m.includes("network")) return "Koneksi internet bermasalah. Coba lagi, ya!";
  return "Ups, ada yang salah. Coba lagi sebentar lagi, ya!";
}

const COPY = {
  login: {
    title: "Selamat datang kembali!",
    bubble: "Senang lihat kamu lagi! 🎉",
    cta: "Masuk",
    switchText: "Belum punya akun?",
    switchLink: "Daftar gratis",
    switchHref: "/signup",
  },
  signup: {
    title: "Ayo buat akunmu!",
    bubble: "Kenalan dulu, yuk! 👋",
    cta: "Buat akun",
    switchText: "Sudah punya akun?",
    switchLink: "Masuk di sini",
    switchHref: "/login",
  },
} as const;

export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const { refresh } = useUser();
  const supabase = getSupabaseBrowser();
  const copy = COPY[mode];

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [focus, setFocus] = useState<Field>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorKey, setErrorKey] = useState(0);
  const [sentTo, setSentTo] = useState<string | null>(null);

  // Boo reacts to what the learner is doing.
  let mood: BooMood = "idle";
  let bubble: ReactNode = copy.bubble;
  if (busy) {
    mood = "happy";
    bubble = "Sebentar, ya… ⏳";
  } else if (error) {
    mood = "sad";
    bubble = error;
  } else if (focus === "password") {
    mood = showPw ? "peek" : "shy";
    bubble = showPw ? "Ups, kelihatan! 👀" : "Tenang, aku nggak ngintip! 🙈";
  } else if (focus === "name" && name) {
    mood = "happy";
    bubble = `Halo, ${name.split(" ")[0]}! 你好！`;
  } else if (focus === "email") {
    bubble = "Pakai email yang aktif, ya! 📮";
  }

  const goGuest = () => {
    enableGuest();
    router.replace("/");
    router.refresh();
  };

  if (!supabase) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <SpeechBubble>Akun belum bisa dipakai di sini 🙏</SpeechBubble>
          <Boo mood="sad" size={170} className="mt-4" />
          <p className="mt-4 max-w-xs font-semibold text-plum-soft">
            Supabase belum dikonfigurasi, jadi NiiBooo berjalan dalam mode demo.
          </p>
          <ChunkyButton className="mt-6" onClick={goGuest}>
            Main mode demo
          </ChunkyButton>
        </div>
      </Shell>
    );
  }

  if (sentTo) {
    return (
      <Shell>
        <div className="flex flex-col items-center text-center">
          <SpeechBubble>Hore, akunmu hampir siap! 🎉</SpeechBubble>
          <Boo mood="happy" size={180} float className="mt-4" />
          <h1 className="mt-4 text-3xl font-black">Cek emailmu!</h1>
          <p className="mt-2 max-w-xs font-semibold text-plum-soft">
            Kami mengirim link konfirmasi ke <span className="break-all font-extrabold text-plum">{sentTo}</span>. Klik link-nya, lalu
            kembali ke sini untuk masuk.
          </p>
          <ChunkyLink href="/login" className="mt-6">
            Ke halaman masuk
          </ChunkyLink>
        </div>
      </Shell>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: authError } =
        mode === "login"
          ? await supabase.auth.signInWithPassword({ email: email.trim(), password })
          : await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                data: { full_name: name.trim() },
                emailRedirectTo: `${window.location.origin}/auth/callback`,
              },
            });
      if (authError) throw authError;
      if (mode === "signup" && !data.session) {
        setSentTo(email.trim());
        return;
      }
      clearGuest();
      await refresh();
      router.replace("/");
      router.refresh();
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String(err)));
      setErrorKey((k) => k + 1);
    } finally {
      setBusy(false);
    }
  };

  const pwOk = password.length >= 6;
  // Typing again clears the error so Boo cheers up.
  const edit = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (error) setError(null);
  };

  return (
    <Shell>
      {/* Mascot */}
      <div className="flex flex-col items-center">
        <div className="flex min-h-[64px] items-end">
          <SpeechBubble key={String(bubble)}>{bubble}</SpeechBubble>
        </div>
        <Boo mood={mood} size={150} className="mt-3 drop-shadow-lg sm:hidden" />
        <Boo mood={mood} size={176} className="mt-3 hidden drop-shadow-lg sm:block" />
      </div>

      {/* Card */}
      <div
        key={errorKey}
        className={cn(
          "relative -mt-6 rounded-[32px] border-2 border-plum/10 bg-white p-6 shadow-chunky-white sm:p-8",
          error && "animate-shake",
        )}
      >
        <h1 className="text-center text-2xl font-black sm:text-3xl">{copy.title}</h1>

        <form onSubmit={submit} className="mt-6 space-y-4" noValidate={false}>
          {mode === "signup" && (
            <Input
              id="name"
              label="Nama panggilan"
              icon={<Smile className="h-5 w-5" />}
              value={name}
              onChange={edit(setName)}
              onFocus={() => setFocus("name")}
              onBlur={() => setFocus(null)}
              autoComplete="nickname"
              placeholder="Misal: Budi"
              required
              maxLength={40}
            />
          )}
          <Input
            id="email"
            label="Email"
            type="email"
            icon={<Mail className="h-5 w-5" />}
            value={email}
            onChange={edit(setEmail)}
            onFocus={() => setFocus("email")}
            onBlur={() => setFocus(null)}
            autoComplete="email"
            inputMode="email"
            placeholder="nama@email.com"
            required
          />
          <Input
            id="password"
            label="Kata sandi"
            type={showPw ? "text" : "password"}
            icon={<Lock className="h-5 w-5" />}
            value={password}
            onChange={edit(setPassword)}
            onFocus={() => setFocus("password")}
            onBlur={() => setFocus(null)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="••••••"
            required
            minLength={6}
            trailing={
              <button
                type="button"
                // keep focus in the field so Boo keeps reacting
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPw((v) => !v)}
                className="grid h-10 w-10 place-items-center rounded-xl text-plum-soft hover:bg-rose/40 hover:text-blossom"
                aria-label={showPw ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            }
          />
          {mode === "signup" && (
            <p className={cn("flex items-center gap-1.5 pl-1 text-sm font-bold", pwOk ? "text-mint-dark" : "text-plum-soft")}>
              <span className={cn("grid h-5 w-5 place-items-center rounded-full", pwOk ? "bg-mint-light0 text-white" : "bg-plum/10")}>
                {pwOk && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
              </span>
              Minimal 6 karakter
            </p>
          )}

          <ChunkyButton type="submit" disabled={busy} className="!mt-6">
            {busy && <Loader2 className="h-5 w-5 animate-spin" />}
            {copy.cta}
          </ChunkyButton>
        </form>

        <p className="mt-6 text-center font-bold text-plum-soft">
          {copy.switchText}{" "}
          <Link href={copy.switchHref} className="font-black text-blossom hover:underline">
            {copy.switchLink}
          </Link>
        </p>
      </div>

      <button
        onClick={goGuest}
        className="mx-auto mt-5 block rounded-full px-4 py-2 text-sm font-extrabold text-plum-soft hover:bg-white hover:text-blossom"
      >
        Coba dulu tanpa akun →
      </button>
    </Shell>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1rem,env(safe-area-inset-top))]">
      <div className="flex items-center">
        <Link
          href="/welcome"
          aria-label="Kembali"
          className="grid h-11 w-11 place-items-center rounded-2xl border-2 border-plum/10 bg-white text-plum shadow-chunky-white transition active:translate-y-[3px] active:shadow-none"
        >
          <ArrowLeft className="h-5 w-5" strokeWidth={3} />
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-center py-4">{children}</div>
    </div>
  );
}

function Input({
  id,
  label,
  icon,
  value,
  onChange,
  trailing,
  ...rest
}: {
  id: string;
  label: string;
  icon: ReactNode;
  value: string;
  onChange: (v: string) => void;
  trailing?: ReactNode;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "id">) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block pl-1 text-sm font-extrabold text-plum">
        {label}
      </label>
      <div className="group flex items-center gap-2 rounded-2xl border-2 border-plum/10 bg-cream px-3 transition focus-within:border-blossom focus-within:bg-white focus-within:ring-4 focus-within:ring-blossom/15">
        <span className="text-plum-soft transition group-focus-within:text-blossom">{icon}</span>
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent py-3.5 text-base font-bold text-plum outline-none placeholder:font-semibold placeholder:text-plum-soft/50"
          {...rest}
        />
        {trailing}
      </div>
    </div>
  );
}
