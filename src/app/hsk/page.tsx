import type { Metadata } from "next";
import { HskHub } from "@/components/hsk/HskHub";
import { PageHeader } from "@/components/ui";
import { getAllExams } from "@/lib/data";

export const metadata: Metadata = { title: "Persiapan HSK" };

export default async function HskPage() {
  const exams = await getAllExams();
  const counts: Record<number, number> = {};
  for (const e of exams) counts[e.hsk_level] = (counts[e.hsk_level] ?? 0) + e.questions_json.length;

  return (
    <>
      <PageHeader
        eyebrow="HSK Prep"
        title="Pusat Persiapan HSK"
        description="Simulasi ujian bertimer untuk bagian Mendengar, Membaca, dan Menulis — plus bank latihan dengan pembahasan lengkap."
      />
      <HskHub counts={counts} />
    </>
  );
}
