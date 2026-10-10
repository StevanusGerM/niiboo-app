"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Layers, Lightbulb, Mic, PenTool } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, PageHeader } from "@/components/ui";
import { HSK_LEVELS, cn } from "@/lib/utils";
import type { Lesson } from "@/types/database";
import { Flashcards } from "./Flashcards";
import { HanziWriterPad } from "./HanziWriterPad";
import { SpeechPractice } from "./SpeechPractice";

type Tab = "cards" | "write" | "speak";
const TABS: { key: Tab; label: string; icon: typeof Layers }[] = [
  { key: "cards", label: "Kartu kosakata", icon: Layers },
  { key: "write", label: "Tulis Hanzi", icon: PenTool },
  { key: "speak", label: "Latihan bicara", icon: Mic },
];

export function LearnStudio({ lessons, initialLessonId }: { lessons: Lesson[]; initialLessonId?: string }) {
  const { profile, progress, loading } = useUser();
  const initial = lessons.find((l) => l.id === initialLessonId);
  const [level, setLevel] = useState<number>(initial?.hsk_level ?? profile.current_hsk_level);
  const [lessonId, setLessonId] = useState<string | undefined>(initial?.id);
  const [tab, setTab] = useState<Tab>("cards");

  // Once the profile loads, jump to the learner's level (unless a lesson was linked directly).
  useEffect(() => {
    if (!loading && !initial) setLevel(profile.current_hsk_level);
  }, [loading, profile.current_hsk_level, initial]);

  const levelLessons = lessons.filter((l) => l.hsk_level === level);
  const lesson = levelLessons.find((l) => l.id === lessonId) ?? levelLessons[0];

  return (
    <>
      <PageHeader
        eyebrow="Kurikulum terstruktur"
        title="Pelajaran harian"
        description="Hafalkan kosakata, kuasai urutan goresan, dan latih pelafalan dengan pengenalan suara."
      />

      {/* Level switcher */}
      <div className="scrollbar-none -mx-4 mb-5 flex gap-2 overflow-x-auto px-4">
        {HSK_LEVELS.map((l) => (
          <button
            key={l}
            onClick={() => {
              setLevel(l);
              setLessonId(undefined);
            }}
            className={cn(
              "shrink-0 rounded-full px-5 py-2 text-sm font-extrabold transition",
              l === level ? "bg-plum text-cream" : "bg-white text-plum-soft ring-1 ring-plum/10 hover:text-plum",
            )}
          >
            HSK {l}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Lesson list */}
        <div className="space-y-3">
          {levelLessons.length === 0 && (
            <BentoCard>
              <p className="text-sm text-plum-soft">Belum ada pelajaran untuk HSK {level}.</p>
            </BentoCard>
          )}
          {levelLessons.map((l, i) => {
            const done = progress[l.id]?.is_completed;
            const activeLesson = l.id === lesson?.id;
            return (
              <button
                key={l.id}
                onClick={() => setLessonId(l.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-3xl p-4 text-left transition",
                  activeLesson ? "bg-blossom text-white shadow-glow" : "bg-white shadow-soft hover:-translate-y-0.5",
                )}
              >
                <span
                  className={cn(
                    "grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-sm font-extrabold",
                    activeLesson ? "bg-white/25" : "bg-rose text-blossom-dark",
                  )}
                >
                  {done ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-extrabold">{l.title}</span>
                  <span className={cn("text-xs font-semibold", activeLesson ? "text-white/80" : "text-plum-soft")}>
                    {l.content_json.vocab.length} kata
                    {done && ` · skor ${progress[l.id]?.score ?? 0}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Lesson workspace */}
        {lesson && (
          <div className="min-w-0 space-y-4">
            <BentoCard tone="rose">
              <p className="text-xs font-bold uppercase tracking-wider text-blossom-dark">{lesson.category}</p>
              <h2 className="text-2xl font-extrabold">{lesson.title}</h2>
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
            {tab === "write" && <HanziWriterPad key={lesson.id} vocab={lesson.content_json.vocab} />}
            {tab === "speak" && <SpeechPractice key={lesson.id} vocab={lesson.content_json.vocab} />}
          </div>
        )}
      </div>
    </>
  );
}
