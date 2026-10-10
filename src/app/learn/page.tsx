import type { Metadata } from "next";
import { LearnStudio } from "@/components/learn/LearnStudio";
import { getLessons } from "@/lib/data";

export const metadata: Metadata = { title: "Belajar" };

type Props = { searchParams: Promise<{ lesson?: string }> };

export default async function LearnPage({ searchParams }: Props) {
  const [{ lesson }, lessons] = await Promise.all([searchParams, getLessons()]);
  return <LearnStudio lessons={lessons} initialLessonId={lesson} />;
}
