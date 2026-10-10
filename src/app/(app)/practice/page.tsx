import type { Metadata } from "next";
import { PracticeRoom } from "@/components/practice/PracticeRoom";
import { getLessons, getStories } from "@/lib/data";
import { buildJourney } from "@/lib/journey";

export const metadata: Metadata = { title: "Ruang Latihan" };

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function PracticePage({ searchParams }: Props) {
  const [{ tab }, lessons, stories] = await Promise.all([searchParams, getLessons(), getStories()]);
  return (
    <PracticeRoom
      units={buildJourney(lessons, stories)}
      lessons={lessons}
      stories={stories}
      initialTab={tab === "stories" ? "stories" : "lessons"}
    />
  );
}
