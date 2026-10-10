import type { Metadata } from "next";
import { PlacementTest, type PlacementItem } from "@/components/placement/PlacementTest";
import { getAllExams } from "@/lib/data";

export const metadata: Metadata = { title: "Tes Penempatan" };

export default async function PlacementPage() {
  const exams = await getAllExams();
  // Every multiple-choice item in the HSK bank doubles as a calibrated placement item.
  const bank: PlacementItem[] = exams.flatMap((e) =>
    e.questions_json.flatMap((q) => (q.kind === "mcq" ? [{ level: e.hsk_level, q }] : [])),
  );
  return <PlacementTest bank={bank} />;
}
