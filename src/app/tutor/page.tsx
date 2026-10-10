import type { Metadata } from "next";
import { TutorChat } from "@/components/tutor/TutorChat";

export const metadata: Metadata = { title: "Tutor AI" };

export default function TutorPage() {
  return <TutorChat />;
}
