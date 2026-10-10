"use client";

import Link from "next/link";
import { useState } from "react";
import { BookOpenText, Check, Layers, Lock, Map as MapIcon, Mic, PenTool, Star } from "lucide-react";
import { BooWith } from "@/components/mascot/BooWith";
import { Sticker, type StickerName } from "@/components/mascot/Stickers";
import { BentoCard, HskBadge, PageHeader } from "@/components/ui";
import type { JourneyUnit } from "@/lib/journey";
import { useJourney } from "@/lib/use-journey";
import { HSK_LEVELS, cn } from "@/lib/utils";
import type { Lesson, ParallelStory } from "@/types/database";

type Tab = "lessons" | "stories";
const STORY_STICKERS: StickerName[] = ["baozi", "lantern", "cloud", "tea", "bamboo"];
const STORY_TONES = ["lilac", "peach", "mint"] as const;

/**
 * Replay corner: everything already unlocked on the journey map, freely
 * re-playable. Locked items point back to the map.
 */
export function PracticeRoom({
  units,
  lessons,
  stories,
  initialTab,
}: {
  units: JourneyUnit[];
  lessons: Lesson[];
  stories: ParallelStory[];
  initialTab: Tab;
}) {
  const { states } = useJourney(units);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [level, setLevel] = useState<number | "all">("all");

  const levels = HSK_LEVELS.filter((l) =>
    tab === "lessons" ? lessons.some((x) => x.hsk_level === l) : stories.some((x) => x.hsk_level === l),
  );
  const shownLessons = lessons.filter((l) => level === "all" || l.hsk_level === level);
  const shownStories = stories.filter((s) => level === "all" || s.hsk_level === level);
  const openLessons = lessons.filter((l) => states[`lesson-${l.id}`]?.unlocked).length;
  const openStories = stories.filter((s) => states[`story-${s.id}`]?.unlocked).length;

  return (
    <>
      <PageHeader
        eyebrow="Ruang Latihan"
        title="Ulangi yang sudah kamu buka"
        description="Latih lagi kosakata, tulisan Hanzi, dan pelafalan — atau baca ulang cerita favoritmu. Materi baru terbuka lewat Peta."
        illustration={<BooWith prop="star" mood="happy" size={110} />}
        action={
          <Link
            href="/journey"
            className="inline-flex items-center gap-2 self-start rounded-full bg-plum px-4 py-2 text-sm font-extrabold text-cream shadow-chunky-plum transition active:translate-y-[3px] active:shadow-none sm:self-auto"
          >
            <MapIcon className="h-4 w-4" /> Ke Peta
          </Link>
        }
      />

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-2 sm:max-w-md">
        {(
          [
            ["lessons", "Kosakata & Hanzi", Layers, `${openLessons}/${lessons.length} terbuka`, "pink"],
            ["stories", "Perpustakaan Cerita", BookOpenText, `${openStories}/${stories.length} terbuka`, "lilac"],
          ] as const
        ).map(([key, label, Icon, sub, tone]) => (
          <button
            key={key}
            onClick={() => {
              setTab(key);
              setLevel("all");
            }}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-3xl border-2 px-3 py-3 text-sm font-black transition active:translate-y-[3px] active:shadow-none",
              tab === key
                ? tone === "pink"
                  ? "border-blossom bg-blossom text-white shadow-chunky-pink"
                  : "border-lilac bg-lilac text-white shadow-chunky-lilac"
                : "border-plum/10 bg-white text-plum shadow-chunky-white",
            )}
          >
            <span className="flex items-center gap-1.5">
              <Icon className="h-4 w-4" /> {label}
            </span>
            <span className={cn("text-[11px] font-extrabold", tab === key ? "opacity-80" : "text-plum-soft")}>{sub}</span>
          </button>
        ))}
      </div>

      {/* Level filter */}
      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4">
        {(["all", ...levels] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-extrabold transition",
              l === level ? "bg-plum text-cream" : "bg-white text-plum-soft ring-1 ring-plum/10 hover:text-plum",
            )}
          >
            {l === "all" ? "Semua" : `HSK ${l}`}
          </button>
        ))}
      </div>

      {tab === "lessons" ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownLessons.map((l) => {
            const st = states[`lesson-${l.id}`];
            const open = !!st?.unlocked;
            const vocab = l.content_json.vocab;
            return (
              <BentoCard key={l.id} className={cn("flex flex-col", !open && "bg-white/60 shadow-none")}>
                <div className="flex items-start justify-between gap-2">
                  <HskBadge level={l.hsk_level} />
                  {st?.completed ? <Stars count={st.stars} /> : !open && <Lock className="h-5 w-5 text-plum/30" />}
                </div>
                <p className={cn("mt-3 text-lg font-black", !open && "text-plum/40")}>{l.title}</p>
                <p className={cn("mt-1 truncate font-hanzi text-xl", open ? "text-plum-soft" : "text-plum/25 blur-[3px]")}>
                  {vocab.map((v) => v.hanzi).join(" · ")}
                </p>
                <div className="mt-auto pt-4">
                  {open ? (
                    <div className="grid grid-cols-3 gap-2">
                      <ActionLink href={`/learn?lesson=${l.id}&tab=cards`} icon={Layers} label="Kartu" tone="bg-rose text-blossom-dark" />
                      <ActionLink href={`/learn?lesson=${l.id}&tab=write`} icon={PenTool} label="Tulis" tone="bg-mint-light text-mint-dark" />
                      <ActionLink href={`/learn?lesson=${l.id}&tab=speak`} icon={Mic} label="Bicara" tone="bg-ocean-light text-ocean-dark" />
                    </div>
                  ) : (
                    <LockedNote />
                  )}
                </div>
              </BentoCard>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shownStories.map((s, i) => {
            const st = states[`story-${s.id}`];
            const open = !!st?.unlocked;
            const card = (
              <BentoCard
                tone={open ? STORY_TONES[i % STORY_TONES.length] : "white"}
                className={cn("h-full transition", open ? "group-hover:-translate-y-1" : "bg-white/60 shadow-none")}
              >
                <Sticker
                  name={STORY_STICKERS[i % STORY_STICKERS.length]}
                  size={72}
                  rotate={i % 2 ? 10 : -10}
                  className={cn("pointer-events-none absolute -right-2 -top-2", !open && "opacity-30 grayscale")}
                />
                <HskBadge level={s.hsk_level} className="bg-white/70" />
                <p className={cn("mt-6 font-hanzi text-4xl font-bold", !open && "text-plum/30")}>{s.title_zh}</p>
                <p className={cn("mt-1 font-semibold", open ? "text-plum-soft" : "text-plum/30")}>{s.title_id}</p>
                <div className="mt-5">
                  {open ? (
                    <span className="inline-flex items-center gap-1.5 text-sm font-black text-plum">
                      {st?.completed ? (
                        <>
                          <Check className="h-4 w-4 text-mint-dark" strokeWidth={3} /> Sudah dibaca · baca lagi →
                        </>
                      ) : (
                        <>{s.content_pairs.length} kalimat · mulai baca →</>
                      )}
                    </span>
                  ) : (
                    <LockedNote />
                  )}
                </div>
              </BentoCard>
            );
            return open ? (
              <Link key={s.id} href={`/reader/${s.id}`} className="group">
                {card}
              </Link>
            ) : (
              <div key={s.id}>{card}</div>
            );
          })}
        </div>
      )}
    </>
  );
}

function ActionLink({ href, icon: Icon, label, tone }: { href: string; icon: typeof Layers; label: string; tone: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-xs font-black shadow-chunky-white transition active:translate-y-[3px] active:shadow-none",
        tone,
      )}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}

function LockedNote() {
  return (
    <Link href="/journey" className="inline-flex items-center gap-1.5 text-sm font-extrabold text-plum-soft hover:text-blossom">
      <Lock className="h-4 w-4" /> Buka dulu di Peta →
    </Link>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${count} dari 3 bintang`}>
      {[1, 2, 3].map((n) => (
        <Star key={n} className={cn("h-4 w-4", n <= count ? "text-sunny" : "text-plum/15")} fill="currentColor" />
      ))}
    </span>
  );
}
