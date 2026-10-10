import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MockTest } from "@/components/hsk/MockTest";
import { getExamSections } from "@/lib/data";

type Props = { params: Promise<{ level: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `Mock Test HSK ${(await params).level}` };
}

export default async function MockPage({ params }: Props) {
  const level = Number((await params).level);
  if (!Number.isInteger(level) || level < 1 || level > 6) notFound();
  const sections = await getExamSections(level);
  return <MockTest level={level} sections={sections} mode="mock" />;
}
