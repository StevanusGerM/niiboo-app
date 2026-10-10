"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Layers, Library, Lightbulb, Lock, Mic, PenTool } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BooWith } from "@/components/mascot/BooWith";
import { BentoCard, PageHeader } from "@/components/ui";
import type { JourneyUnit } from "@/lib/journey";
import { useJourney } from "@/lib/use-journey";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/database";
import { Flashcards } from "./Flashcards";
import { HanziWriterPad, type WriteMode } from "./HanziWriterPad";
import { SpeechPractice } from "./SpeechPractice";

export type Tab = "cards" | "write" | "speak";
const TABS: { key: Tab; label: string; icon: typeof Layers }[] = [
  { key: "cards", label: "Kartu kosakata", icon: Layers },
  { key: "write", label: "Tulis Hanzi", icon: PenTool },
  { key: "speak", label: "Latihan bicara", icon: Mic },
];

/** Lesson screen, opened from a journey node or the practice room. */
export function LearnStudio({
  lessons,
  units,
  lessonId: initialLessonId,
  initialTab,
  initialWriteMode,
}: {
  lessons: Lesson[];
  units: JourneyUnit[];
  lessonId: string;
  initialTab?: Tab;
  initialWriteMode?: WriteMode;
}) {
  const { progress } = useUser();
  const { states } = useJourney(units);
  const [lessonId, setLessonId] = useState(initialLessonId);
  const [tab, setTab] = useState<Tab>(initialTab ?? "cards");

  const lesson = lessons.find((l) => l.id === lessonId) ?? lessons[0];
  const levelLessons = lessons.filter((l) => l.hsk_level === lesson.hsk_level);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/journey" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-plum shadow-chunky-white">
          <ArrowLeft className="h-4 w-4" /> Peta
        </Link>
        <Link href="/practice" className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-sm font-extrabold text-plum shadow-chunky-white">
          <Library className="h-4 w-4" /> Ruang Latihan
        </Link>
      </div>
      <PageHeader
        eyebrow={`HSK ${lesson.hsk_level} · Pelajaran`}
        title={lesson.title}
        description="Hafalkan kosakata, kuasai urutan goresan, dan latih pelafalan dengan pengenalan suara."
        illustration={<BooWith prop="pencil" mood="happy" size={110} />}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)] [&>*]:min-w-0">
        {/* Lessons in this level — locked ones open via the map */}
        <div className="space-y-3">
          {levelLessons.map((l, i) => {
            const done = progress[l.id]?.is_completed;
            const open = l.id === lesson.id || !!states[`lesson-${l.id}`]?.unlocked;
            const active = l.id === lesson.id;
            return (
              <button
                key={l.id}
                onClick={() => open && setLessonId(l.id)}
                disabled={!open}
                className={cn(
                  "flex w-full items-center gap-3 rounded-3xl p-4 text-left transition",
                  active
                    ? "bg-blossom text-white shadow-glow"
                    : open
                      ? "bg-white shadow-soft hover:-translate-y-0.5"
                      : "cursor-not-allowed bg-white/50 text-plum/40",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-extrabold",
                    active ? "bg-white/25" : open ? "bg-rose text-blossom-dark" : "bg-plum/5",
                  )}
                >
                  {!open ? <Lock className="h-4 w-4" /> : done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-extrabold">{l.title}</span>
                  <span className={cn("text-xs font-semibold", active ? "text-white/80" : "text-plum-soft")}>
                    {open ? `${l.content_json.vocab.length} kata` : "Buka lewat Peta"}
                    {open && done && ` · skor ${progress[l.id]?.score ?? 0}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="min-w-0 space-y-4">
          <BentoCard tone="rose">
            <p className="text-xs font-bold uppercase tracking-wider text-blossom-dark">{lesson.category}</p>
            <p className="mt-1 text-plum-soft">{lesson.content_json.intro}</p>
            {lesson.content_json.grammar_tip && (
              <p className="mt-3 flex gap-2 rounded-2xl bg-white/70 p-3 text-sm">
                <Lightbulb className="h-4 w-4 shrink-0 text-peach" />
                {lesson.content_json.grammar_tip}
              </p>
            )}
          </BentoCard>

          <div className="flex gap-1 rounded-full bg-white p-1 shadow-soft">
            {TABS.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full px-3 py-2.5 text-sm font-bold transition",
                  tab === key ? "bg-plum text-cream" : "text-plum-soft hover:text-plum",
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          {tab === "cards" && <Flashcards key={lesson.id} lesson={lesson} />}
          {tab === "write" && <HanziWriterPad key={lesson.id} vocab={lesson.content_json.vocab} initialMode={initialWriteMode} />}
          {tab === "speak" && <SpeechPractice key={lesson.id} vocab={lesson.content_json.vocab} />}
        </div>
      </div>
    </>
  );
}
