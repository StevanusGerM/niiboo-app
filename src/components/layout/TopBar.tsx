"use client";

import Link from "next/link";
import { Coins, Flame, LogIn, LogOut } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function TopBar() {
  const { profile, isDemo, signOut } = useUser();
  const initial = (profile.full_name ?? profile.username ?? "N").charAt(0).toUpperCase();

  return (
    <header className="sticky top-0 z-30 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="NiiBooo beranda">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blossom-gradient font-hanzi text-xl font-bold text-white shadow-glow">
            你
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            Nii<span className="text-blossom">Booo</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-soft sm:inline-flex">
            <Flame className="h-4 w-4 text-blossom" /> {profile.streak_days}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-bold shadow-soft">
            <Coins className="h-4 w-4 text-peach" /> {profile.token_balance}
          </span>
          {isDemo ? (
            isSupabaseConfigured ? (
              <Link
                href="/login"
                className="inline-flex items-center gap-1 rounded-full bg-plum px-4 py-1.5 text-sm font-bold text-cream"
              >
                <LogIn className="h-4 w-4" /> Masuk
              </Link>
            ) : (
              <span
                title="Supabase belum dikonfigurasi — progres disimpan di browser ini."
                className="rounded-full bg-rose px-3 py-1.5 text-xs font-bold text-blossom-dark"
              >
                Mode Demo
              </span>
            )
          ) : (
            <button
              onClick={() => void signOut()}
              title="Keluar"
              className="group grid h-9 w-9 place-items-center rounded-full bg-plum font-bold text-cream"
            >
              <span className="group-hover:hidden">{initial}</span>
              <LogOut className="hidden h-4 w-4 group-hover:block" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
