import "server-only";
import { getSupabaseServer } from "@/lib/supabase/server";
import { sampleExams } from "@/data/exams";
import { sampleLessons } from "@/data/lessons";
import { sampleStories } from "@/data/stories";
import type { HskExam, Lesson, ParallelStory } from "@/types/database";

/**
 * Server-side data access. Every function reads from Supabase when configured
 * and falls back to the bundled sample content (demo mode, empty tables, or errors).
 */

export async function getStories(): Promise<ParallelStory[]> {
  const sb = await getSupabaseServer();
  if (sb) {
    const { data, error } = await sb.from("parallel_stories").select("*").order("hsk_level");
    if (!error && data?.length) return data;
  }
  return sampleStories;
}

export async function getStory(id: string): Promise<ParallelStory | null> {
  const sb = await getSupabaseServer();
  if (sb) {
    const { data, error } = await sb.from("parallel_stories").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data;
  }
  return sampleStories.find((s) => s.id === id) ?? null;
}

export async function getLessons(level?: number): Promise<Lesson[]> {
  const sb = await getSupabaseServer();
  if (sb) {
    let query = sb.from("lessons").select("*").order("hsk_level").order("created_at");
    if (level) query = query.eq("hsk_level", level);
    const { data, error } = await query;
    if (!error && data?.length) return data;
  }
  return level ? sampleLessons.filter((l) => l.hsk_level === level) : sampleLessons;
}

export async function getExamSections(level: number): Promise<HskExam[]> {
  const sb = await getSupabaseServer();
  if (sb) {
    const { data, error } = await sb.from("hsk_exams").select("*").eq("hsk_level", level);
    if (!error && data?.length) return sortSections(data);
  }
  return sortSections(sampleExams.filter((e) => e.hsk_level === level));
}

export async function getAllExams(): Promise<HskExam[]> {
  const sb = await getSupabaseServer();
  if (sb) {
    const { data, error } = await sb.from("hsk_exams").select("*");
    if (!error && data?.length) return data;
  }
  return sampleExams;
}

const ORDER = { listening: 0, reading: 1, writing: 2 } as const;
function sortSections(rows: HskExam[]) {
  return [...rows].sort((a, b) => ORDER[a.section_type] - ORDER[b.section_type]);
}
