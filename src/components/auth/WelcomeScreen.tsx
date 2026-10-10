"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Boo } from "@/components/mascot/Boo";
import { SpeechBubble } from "@/components/mascot/Boo";
import { enableGuest } from "@/lib/guest";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ChunkyButton, ChunkyLink } from "./ChunkyButton";
import { Logo } from "./Logo";

const GREETINGS = [
  <span key="a" className="font-hanzi">你好！ nǐ hǎo!</span>,
  <span key="b">Hai, aku Boo! 🐼</span>,
  <span key="c">Yuk belajar Mandarin bareng!</span>,
];

const FEATURES = [
  { emoji: "🎧", label: "Cerita karaoke" },
  { emoji: "✍️", label: "Tulis Hanzi" },
  { emoji: "🏆", label: "Latihan HSK" },
  { emoji: "💬", label: "Ngobrol sama Boo" },
];

export function WelcomeScreen() {
  const router = useRouter();
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % GREETINGS.length), 2800);
    return () => clearInterval(t);
  }, []);

  const tryAsGuest = () => {
    enableGuest();
    router.replace("/");
    router.refresh();
  };

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] md:px-8">
      <header className="flex justify-center md:justify-start">
        <Logo />
      </header>

      <div className="flex flex-1 flex-col md:grid md:grid-cols-2 md:items-center md:gap-10 lg:gap-16">
        {/* Mascot stage */}
        <section className="flex flex-1 flex-col items-center justify-center py-3 md:h-[560px] md:rounded-[44px] md:bg-blossom-gradient md:shadow-glow">
          <div className="flex h-16 items-end md:h-24">
            <SpeechBubble key={i} className="md:text-lg">
              {GREETINGS[i]}
            </SpeechBubble>
          </div>
          <div className="mt-3">
            <Boo mood="wave" size={165} float className="drop-shadow-xl md:hidden" />
            <Boo mood="wave" size={300} float className="hidden drop-shadow-2xl md:block" />
          </div>
        </section>

        {/* Copy + actions */}
        <section className="flex flex-col items-center text-center md:items-start md:text-left">
          <h1 className="text-[1.75rem] font-black leading-tight text-plum sm:text-4xl lg:text-5xl">
            Belajar Mandarin jadi <span className="text-blossom">seru</span> bareng Boo!
          </h1>
          <p className="mt-2 max-w-md text-[15px] font-semibold text-plum-soft sm:mt-3 sm:text-lg">
            Cerita bergambar suara, permainan menulis Hanzi, dan latihan HSK — cukup 5 menit sehari.
          </p>

          <ul className="mt-5 hidden flex-wrap justify-center gap-2 sm:flex md:justify-start">
            {FEATURES.map((f) => (
              <li
                key={f.label}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-plum/10 bg-white px-3 py-1.5 text-sm font-extrabold text-plum"
              >
                <span aria-hidden>{f.emoji}</span> {f.label}
              </li>
            ))}
          </ul>

          <div className="mt-6 w-full max-w-sm space-y-4 sm:mt-8">
            {isSupabaseConfigured ? (
              <>
                <ChunkyLink href="/signup">Mulai sekarang</ChunkyLink>
                <ChunkyLink href="/login" tone="white">
                  Aku sudah punya akun
                </ChunkyLink>
              </>
            ) : (
              <>
                <ChunkyButton onClick={tryAsGuest}>Mulai (mode demo)</ChunkyButton>
                <p className="text-sm font-semibold text-plum-soft">
                  Akun belum aktif karena Supabase belum dikonfigurasi. Progres disimpan di perangkat ini.
                </p>
              </>
            )}
          </div>

          {isSupabaseConfigured && (
            <button
              onClick={tryAsGuest}
              className="group mt-3 inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-extrabold text-plum-soft transition hover:bg-white hover:text-blossom"
            >
              Coba dulu tanpa akun <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
