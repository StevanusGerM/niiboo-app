import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LearnStudio } from "@/components/learn/LearnStudio";
import { getLessons, getStories } from "@/lib/data";
import { buildJourney } from "@/lib/journey";

export const metadata: Metadata = { title: "Pelajaran" };

type Props = { searchParams: Promise<{ lesson?: string; tab?: string; mode?: string }> };

const TABS = ["cards", "write", "speak"] as const;
const MODES = ["watch", "practice", "test"] as const;
const pick = <T extends string>(list: readonly T[], v?: string) => list.find((x) => x === v);

/** Lesson screen. Browsing lessons happens in the journey map / practice room. */
export default async function LearnPage({ searchParams }: Props) {
  const [{ lesson, tab, mode }, lessons, stories] = await Promise.all([searchParams, getLessons(), getStories()]);
  if (!lesson || !lessons.some((l) => l.id === lesson)) redirect("/practice");
  return (
    <LearnStudio
      lessons={lessons}
      units={buildJourney(lessons, stories)}
      lessonId={lesson}
      initialTab={pick(TABS, tab)}
      initialWriteMode={pick(MODES, mode)}
    />
  );
}
