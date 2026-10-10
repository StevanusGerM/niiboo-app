import type { Metadata } from "next";
import { JourneyMap } from "@/components/journey/JourneyMap";
import { getLessons, getStories } from "@/lib/data";
import { buildJourney } from "@/lib/journey";

export const metadata: Metadata = { title: "Petualangan" };

export default async function JourneyPage() {
  const [lessons, stories] = await Promise.all([getLessons(), getStories()]);
  return <JourneyMap units={buildJourney(lessons, stories)} />;
}
