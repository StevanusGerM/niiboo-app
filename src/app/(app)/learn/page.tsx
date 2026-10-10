import type { Metadata } from "next";
import { LearnStudio } from "@/components/learn/LearnStudio";
import { getLessons } from "@/lib/data";

export const metadata: Metadata = { title: "Belajar" };

type Props = { searchParams: Promise<{ lesson?: string; tab?: string; mode?: string; level?: string }> };

const TABS = ["cards", "write", "speak"] as const;
const MODES = ["watch", "practice", "test"] as const;
const pick = <T extends string>(list: readonly T[], v?: string) => list.find((x) => x === v);

export default async function LearnPage({ searchParams }: Props) {
  const [{ lesson, tab, mode, level }, lessons] = await Promise.all([searchParams, getLessons()]);
  return (
    <LearnStudio
      lessons={lessons}
      initialLessonId={lesson}
      initialTab={pick(TABS, tab)}
      initialWriteMode={pick(MODES, mode)}
      initialLevel={level ? Number(level) : undefined}
    />
  );
}
