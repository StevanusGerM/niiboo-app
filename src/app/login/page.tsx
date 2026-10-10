"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button } from "@/components/ui";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useUser();
  const supabase = getSupabaseBrowser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!supabase) {
    return (
      <BentoCard className="mx-auto max-w-md text-center">
        <p className="text-xl font-extrabold">Mode Demo</p>
        <p className="mt-2 text-plum-soft">
          Supabase belum dikonfigurasi. Isi <code className="rounded bg-cream px-1">NEXT_PUBLIC_SUPABASE_URL</code> dan{" "}
          <code className="rounded bg-cream px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di <code>.env.local</code> untuk mengaktifkan akun.
        </p>
      </BentoCard>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const { error, data } =
      mode === "signin"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: {
              data: { full_name: fullName },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: error.message });
      return;
    }
    if (mode === "signup" && !data.session) {
      setMsg({ ok: true, text: "Cek email kamu untuk konfirmasi akun." });
      return;
    }
    await refresh();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="mx-auto max-w-md">
      <BentoCard className="p-8">
        <p className="text-center font-hanzi text-4xl font-bold text-blossom">欢迎</p>
        <h1 className="mt-1 text-center text-2xl font-extrabold">{mode === "signin" ? "Masuk ke NiiBooo" : "Buat akun NiiBooo"}</h1>
        <div className="mt-6 flex rounded-full bg-cream p-1">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn("flex-1 rounded-full py-2 text-sm font-bold", mode === m ? "bg-plum text-cream" : "text-plum-soft")}
            >
              {m === "signin" ? "Masuk" : "Daftar"}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-6 space-y-3">
          {mode === "signup" && (
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full rounded-2xl bg-cream px-4 py-3 outline-none ring-blossom/30 focus:ring-4"
            />
          )}
          <input
            required
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-2xl bg-cream px-4 py-3 outline-none ring-blossom/30 focus:ring-4"
          />
          <input
            required
            type="password"
            minLength={6}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Kata sandi (min. 6 karakter)"
            className="w-full rounded-2xl bg-cream px-4 py-3 outline-none ring-blossom/30 focus:ring-4"
          />
          <Button type="submit" disabled={busy} className="w-full py-3">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "Masuk" : "Daftar"}
          </Button>
        </form>
        {msg && (
          <p className={cn("mt-4 rounded-2xl px-4 py-3 text-sm font-semibold", msg.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose text-blossom-dark")}>
            {msg.text}
          </p>
        )}
      </BentoCard>
    </div>
  );
}
