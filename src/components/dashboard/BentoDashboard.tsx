"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, Coins, Compass, Flame, Map as MapIcon, Sparkles, Timer, Volume2 } from "lucide-react";
import { Boo } from "@/components/mascot/Boo";
import { BooWith } from "@/components/mascot/BooWith";
import { Dragon, Sticker } from "@/components/mascot/Stickers";
import { dayKey, useUser } from "@/components/providers/UserProvider";
import { BentoCard, ButtonLink, HskBadge, ProgressBar, ProgressRing } from "@/components/ui";
import { speakZh } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { Lesson, ParallelStory } from "@/types/database";

const DAILY_GOAL_XP = 50;
const WEEKDAYS = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export function BentoDashboard({ lessons, stories }: { lessons: Lesson[]; stories: ParallelStory[] }) {
  const { profile, progress, activity, loading } = useUser();
  const level = profile.current_hsk_level;
  const name = profile.full_name?.split(" ")[0] ?? profile.username ?? "teman";

  const levelLessons = lessons.filter((l) => l.hsk_level === level);
  const completed = levelLessons.filter((l) => progress[l.id]?.is_completed).length;
  const levelPct = levelLessons.length ? Math.round((completed / levelLessons.length) * 100) : 0;
  const nextLesson = levelLessons.find((l) => !progress[l.id]?.is_completed) ?? levelLessons[0] ?? lessons[0];

  const story = stories.find((s) => s.hsk_level === level) ?? stories[0];

  const todayXp = activity[dayKey()] ?? 0;

  const week = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { label: WEEKDAYS[d.getDay()], xp: activity[dayKey(d)] ?? 0, isToday: i === 6 };
    });
  }, [activity]);
  const maxXp = Math.max(DAILY_GOAL_XP, ...week.map((w) => w.xp));

  // Word of the day: deterministic pick from all vocab, rotates daily.
  const wordOfDay = useMemo(() => {
    const all = lessons.flatMap((l) => l.content_json.vocab ?? []);
    if (!all.length) return null;
    const seed = Math.floor(Date.now() / 86_400_000);
    return all[seed % all.length];
  }, [lessons]);

  return (
    <div className={cn("transition-opacity", loading && "opacity-60")}>
      <section className="grid auto-rows-[minmax(0,auto)] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Hero / daily goal */}
        <BentoCard tone="gradient" className="sm:col-span-2 lg:row-span-2">
          <div className="blob -right-10 -top-10 h-48 w-48 bg-white/40" />
          <div className="blob -bottom-16 left-10 h-40 w-40 bg-rose/70" />
          <BooWith prop="book" mood="wave" size={84} float className="pointer-events-none absolute right-3 top-3 sm:hidden" />
          <BooWith prop="book" mood="wave" size={150} float className="pointer-events-none absolute right-4 top-4 hidden sm:block lg:right-6 lg:top-6" />
          <Sticker name="sparkle" size={30} className="pointer-events-none absolute right-44 top-6 hidden sm:block" />
          <div className="relative flex h-full flex-col justify-between gap-6">
            <div className="pr-20 sm:pr-40">
              <p className="font-hanzi text-lg font-medium text-white/90">你好！</p>
              <h1 className="mt-1 text-3xl font-extrabold leading-tight sm:text-4xl">
                Hai {name}, siap naik level hari ini?
              </h1>
              <p className="mt-2 max-w-sm text-white/85">
                Selesaikan target harian {DAILY_GOAL_XP} XP untuk menjaga streak-mu tetap menyala.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <ProgressRing value={(todayXp / DAILY_GOAL_XP) * 100} size={112} color="#FFFFFF" track="rgba(255,255,255,0.25)">
                <div>
                  <p className="text-2xl font-extrabold">{todayXp}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">/ {DAILY_GOAL_XP} XP</p>
                </div>
              </ProgressRing>
              {nextLesson && (
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-wider text-white/75">Pelajaran berikutnya</p>
                  <p className="truncate text-xl font-extrabold">{nextLesson.title}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <ButtonLink href={`/learn?lesson=${nextLesson.id}`} variant="dark">
                      Lanjutkan <ArrowRight className="h-4 w-4" />
                    </ButtonLink>
                    <ButtonLink href="/journey" variant="secondary">
                      <MapIcon className="h-4 w-4" /> Peta
                    </ButtonLink>
                  </div>
                </div>
              )}
            </div>
          </div>
        </BentoCard>

        {/* Streak */}
        <BentoCard tone="plum">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Streak</p>
            <Sticker name="lantern" size={44} rotate={8} />
          </div>
          <p className="-mt-2 flex items-center gap-2 text-5xl font-extrabold">
            <Flame className="h-9 w-9 text-blossom" fill="#FF6584" />
            {profile.streak_days}
            <span className="ml-1 text-lg font-bold text-cream/60">hari</span>
          </p>
          <div className="mt-4 flex justify-between gap-1">
            {week.map((d) => (
              <div key={d.label + d.isToday} className="flex flex-col items-center gap-1">
                <span
                  className={cn(
                    "h-6 w-6 rounded-full",
                    d.xp > 0 ? "bg-blossom" : "bg-cream/10",
                    d.isToday && "ring-2 ring-peach ring-offset-2 ring-offset-plum",
                  )}
                />
                <span className="text-[10px] font-bold text-cream/50">{d.label}</span>
              </div>
            ))}
          </div>
        </BentoCard>

        {/* HSK level */}
        <BentoCard tone="rose">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-plum/60">Level kamu</p>
              <p className="text-4xl font-extrabold">HSK {level}</p>
              <p className="mt-1 text-sm text-plum-soft">
                {completed}/{levelLessons.length} pelajaran
              </p>
            </div>
            <ProgressRing value={levelPct} size={72} stroke={8}>
              <span className="text-sm font-extrabold">{levelPct}%</span>
            </ProgressRing>
          </div>
          <Link href="/placement" className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-blossom-dark hover:underline">
            <Compass className="h-4 w-4" /> Ikuti tes penempatan
          </Link>
        </BentoCard>

        {/* Story of the day */}
        {story && (
          <BentoCard tone="lilac" className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">
              <Sticker name="baozi" size={52} />
              <HskBadge level={story.hsk_level} className="bg-white/70" />
            </div>
            <p className="mt-4 font-hanzi text-3xl font-bold">{story.title_zh}</p>
            <p className="text-sm font-semibold text-lilac-dark">{story.title_id}</p>
            <p className="mt-2 line-clamp-2 font-hanzi text-sm text-plum/80">{story.content_pairs[0]?.zh}</p>
            <ButtonLink href={`/reader/${story.id}`} variant="dark" className="mt-4 w-full">
              Baca cerita
            </ButtonLink>
          </BentoCard>
        )}

        {/* Word of the day */}
        {wordOfDay && (
          <BentoCard tone="mint">
            <Sticker name="bamboo" size={58} className="pointer-events-none absolute -right-2 -top-2 opacity-80" />
            <p className="text-xs font-bold uppercase tracking-wider text-mint-dark">Kata hari ini</p>
            <div className="mt-2 flex items-end justify-between gap-2">
              <div>
                <p className="font-hanzi text-5xl font-bold">{wordOfDay.hanzi}</p>
                <p className="mt-1 font-semibold text-mint-dark">{wordOfDay.pinyin}</p>
                <p className="text-sm text-plum-soft">{wordOfDay.meaning}</p>
              </div>
              <button
                onClick={() => speakZh(wordOfDay.hanzi)}
                aria-label="Dengarkan pelafalan"
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white text-mint-dark shadow-chunky-white transition hover:scale-105"
              >
                <Volume2 className="h-5 w-5" />
              </button>
            </div>
          </BentoCard>
        )}

        {/* Mock exam */}
        <BentoCard className="sm:col-span-2">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <Dragon size={72} mood="fierce" className="-my-2 shrink-0" />
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-mint-dark">Lawan Xiao Long · simulasi ujian</p>
                <p className="text-xl font-extrabold">Mock Test HSK {level}</p>
                <p className="flex items-center gap-1 text-sm text-plum-soft">
                  <Timer className="h-4 w-4" /> Mendengar · Membaca · Menulis — dengan timer
                </p>
              </div>
            </div>
            <ButtonLink href={`/hsk/${level}/mock`}>Mulai ujian</ButtonLink>
          </div>
        </BentoCard>

        {/* AI tutor */}
        <BentoCard tone="plum" className="sm:col-span-1 lg:col-span-1">
          <div className="flex items-center gap-3">
            <span className="grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-rose">
              <Boo mood="happy" size={54} className="mt-3" />
            </span>
            <div>
              <p className="text-lg font-extrabold leading-tight">Boo Laoshi</p>
              <p className="text-xs font-bold text-peach">Tutor AI · ngobrol bebas</p>
            </div>
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <p className="w-fit rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 font-hanzi">你想吃什么？</p>
            <p className="ml-auto w-fit rounded-2xl rounded-br-md bg-blossom px-3 py-2">Wo xiang chi mifan</p>
            <p className="w-fit rounded-2xl rounded-bl-md bg-white/10 px-3 py-2 text-xs">
              <Sparkles className="mr-1 inline h-3 w-3 text-peach" />
              Nada: wǒ xiǎng chī mǐfàn
            </p>
          </div>
          <ButtonLink href="/tutor" className="mt-4 w-full">
            Ngobrol sekarang
          </ButtonLink>
        </BentoCard>

        {/* Expert booking */}
        <BentoCard tone="ocean" className="sm:col-span-1">
          <Sticker name="headphones" size={52} />
          <p className="mt-3 text-lg font-extrabold">Sesi Live dengan Pakar</p>
          <p className="mt-1 text-sm text-plum-soft">Zoom 1-on-1 bersama pengajar bersertifikat.</p>
          <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-sm font-bold">
            <Coins className="h-4 w-4 text-sunny-dark" /> {profile.token_balance} token
          </p>
          <ButtonLink href="/experts" variant="secondary" className="mt-4 w-full">
            Pesan jadwal
          </ButtonLink>
        </BentoCard>

        {/* Weekly XP */}
        <BentoCard className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 text-lg font-extrabold">
              <Sticker name="star" size={34} /> Aktivitas minggu ini
            </p>
            <p className="text-sm font-bold text-plum-soft">{week.reduce((a, d) => a + d.xp, 0)} XP</p>
          </div>
          <div className="mt-4 flex h-32 items-end gap-2" role="img" aria-label="Grafik XP 7 hari terakhir">
            {week.map((d) => (
              <div key={d.label + d.isToday} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full flex-1 items-end">
                  <div
                    title={`${d.xp} XP`}
                    className={cn("w-full rounded-xl transition-all", d.isToday ? "bg-blossom" : d.xp > 0 ? "bg-sunny" : "bg-sunny-light")}
                    style={{ height: `${Math.max(6, (d.xp / maxXp) * 100)}%` }}
                  />
                </div>
                <span className={cn("text-xs font-bold", d.isToday ? "text-blossom" : "text-plum-soft")}>{d.label}</span>
              </div>
            ))}
          </div>
          <ProgressBar value={(todayXp / DAILY_GOAL_XP) * 100} className="mt-4" />
        </BentoCard>
      </section>
    </div>
  );
}
