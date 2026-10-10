import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ParallelReader } from "@/components/reader/ParallelReader";
import { getStory } from "@/lib/data";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const story = await getStory((await params).id);
  return { title: story ? `${story.title_zh} · ${story.title_id}` : "Cerita" };
}

export default async function StoryPage({ params }: Props) {
  const story = await getStory((await params).id);
  if (!story) notFound();
  return <ParallelReader story={story} />;
}
