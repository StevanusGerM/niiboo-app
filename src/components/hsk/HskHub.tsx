"use client";

import { ClipboardCheck, Dumbbell, Star } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, ButtonLink } from "@/components/ui";
import { HSK_LEVELS, cn } from "@/lib/utils";

const LEVEL_INFO: Record<number, { words: string; cefr: string }> = {
  1: { words: "150 kata", cefr: "A1" },
  2: { words: "300 kata", cefr: "A2" },
  3: { words: "600 kata", cefr: "B1" },
  4: { words: "1.200 kata", cefr: "B2" },
  5: { words: "2.500 kata", cefr: "C1" },
  6: { words: "5.000+ kata", cefr: "C2" },
};

export function HskHub({ counts }: { counts: Record<number, number> }) {
  const { profile } = useUser();
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {HSK_LEVELS.map((level) => {
        const mine = level === profile.current_hsk_level;
        return (
          <BentoCard key={level} tone={mine ? "gradient" : "white"} className={cn(mine && "ring-0")}>
            <div className="flex items-start justify-between">
              <div>
                <p className={cn("text-xs font-bold uppercase tracking-wider", mine ? "text-white/80" : "text-blossom")}>
                  {LEVEL_INFO[level].cefr} · {LEVEL_INFO[level].words}
                </p>
                <p className="text-4xl font-extrabold">HSK {level}</p>
              </div>
              {mine && (
                <span className="inline-flex items-center gap-1 rounded-full bg-white/25 px-3 py-1 text-xs font-bold">
                  <Star className="h-3 w-3" fill="white" /> Level kamu
                </span>
              )}
            </div>
            <p className={cn("mt-2 text-sm", mine ? "text-white/85" : "text-plum-soft")}>
              {counts[level] ?? 0} soal di bank latihan
            </p>
            <div className="mt-5 flex gap-2">
              <ButtonLink href={`/hsk/${level}/mock`} variant={mine ? "dark" : "primary"} className="flex-1">
                <ClipboardCheck className="h-4 w-4" /> Mock test
              </ButtonLink>
              <ButtonLink href={`/hsk/${level}/practice`} variant="secondary" className="flex-1">
                <Dumbbell className="h-4 w-4" /> Latihan
              </ButtonLink>
            </div>
          </BentoCard>
        );
      })}
    </div>
  );
}
