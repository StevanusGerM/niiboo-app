import type { Lesson, ParallelStory } from "@/types/database";
import type { HanziRecord, NodeRecord } from "./journey-store";

export type NodeKind = "lesson" | "hanzi" | "story" | "practice" | "boss";

export interface JourneyNode {
  id: string;
  kind: NodeKind;
  level: number;
  title: string;
  subtitle: string;
  href: string;
  xp: number;
  /** Hanzi node only: characters that count toward it. */
  chars?: string[];
}

export interface JourneyUnit {
  level: number;
  name: string;
  emoji: string;
  tagline: string;
  gradient: string;
  nodes: JourneyNode[];
}

export interface NodeState {
  stars: number; // 0–3
  completed: boolean;
  unlocked: boolean;
  current: boolean;
}

export const WORLDS: Record<number, { name: string; emoji: string; tagline: string; gradient: string }> = {
  1: { name: "Desa Bambu", emoji: "🎋", tagline: "Sapaan, angka, dan makanan pertama", gradient: "from-[#FF8FA6] to-[#FFB385]" },
  2: { name: "Pasar Lentera", emoji: "🏮", tagline: "Jalan-jalan, cuaca, dan belanja", gradient: "from-[#FF6584] to-[#FF9A76]" },
  3: { name: "Tembok Besar", emoji: "🏯", tagline: "Bercerita tentang perjalanan", gradient: "from-[#F7797D] to-[#C471ED]" },
  4: { name: "Kota Neon", emoji: "🌃", tagline: "Dunia kerja dan opini", gradient: "from-[#8E7CFF] to-[#FF6584]" },
  5: { name: "Gunung Kabut", emoji: "⛰️", tagline: "Isu sosial dan lingkungan", gradient: "from-[#5C5F7A] to-[#8E7CFF]" },
  6: { name: "Istana Naga", emoji: "🐉", tagline: "Bahasa formal tingkat mahir", gradient: "from-[#2B2D42] to-[#FF6584]" },
};

export function buildJourney(lessons: Lesson[], stories: ParallelStory[]): JourneyUnit[] {
  const levels = [1, 2, 3, 4, 5, 6];
  return levels
    .map((level) => {
      const ls = lessons.filter((l) => l.hsk_level === level);
      const ss = stories.filter((s) => s.hsk_level === level);
      const nodes: JourneyNode[] = [];

      ls.forEach((l, i) => {
        nodes.push({
          id: `lesson-${l.id}`,
          kind: "lesson",
          level,
          title: l.title,
          subtitle: `Pelajaran ${i + 1} · ${l.content_json.vocab.length} kosakata`,
          href: `/learn?lesson=${l.id}`,
          xp: 30,
        });
        // A story after the first lesson keeps the path varied.
        if (i === 0 && ss[0]) nodes.push(storyNode(ss[0], level));
      });
      ss.slice(ls.length ? 1 : 0).forEach((s) => nodes.push(storyNode(s, level)));

      if (ls.length) {
        const chars = Array.from(new Set(ls.flatMap((l) => l.content_json.vocab.flatMap((v) => Array.from(v.hanzi)))));
        nodes.push({
          id: `hanzi-${level}`,
          kind: "hanzi",
          level,
          title: "Tantangan Hanzi",
          subtitle: `Tulis tanpa bayangan · lulus ${hanziGoal(chars)} karakter`,
          href: `/learn?lesson=${ls[0].id}&tab=write&mode=test`,
          xp: 25,
          chars,
        });
      }
      nodes.push({
        id: `practice-${level}`,
        kind: "practice",
        level,
        title: "Latihan HSK",
        subtitle: "Soal latihan dengan pembahasan",
        href: `/hsk/${level}/practice`,
        xp: 25,
      });
      nodes.push({
        id: `boss-${level}`,
        kind: "boss",
        level,
        title: `Ujian Bos HSK ${level}`,
        subtitle: "Mock test bertimer · nilai ≥ 60% untuk lulus",
        href: `/hsk/${level}/mock`,
        xp: 40,
      });

      return { level, ...WORLDS[level], nodes };
    })
    .filter((u) => u.nodes.length > 0);
}

function storyNode(s: ParallelStory, level: number): JourneyNode {
  return {
    id: `story-${s.id}`,
    kind: "story",
    level,
    title: s.title_id,
    subtitle: `Cerita · ${s.title_zh}`,
    href: `/reader/${s.id}`,
    xp: 15,
  };
}

export const hanziGoal = (chars: string[]) => Math.min(3, chars.length);

const lessonStars = (score: number | null) => (score === null ? 1 : score >= 90 ? 3 : score >= 70 ? 2 : 1);

/**
 * Resolve completion / unlock state. Nodes unlock one after another; every unit
 * below the learner's HSK level is open (placement lets them skip ahead), and the
 * first node of their current level is always open.
 */
export function resolveStates(
  units: JourneyUnit[],
  ctx: {
    currentLevel: number;
    progress: Record<string, { is_completed: boolean; score: number | null }>;
    nodes: Record<string, NodeRecord>;
    hanzi: Record<string, HanziRecord>;
    hanziPass: number;
  },
): Record<string, NodeState> {
  const out: Record<string, NodeState> = {};
  let prevCompleted = true;
  let currentAssigned = false;

  for (const unit of units) {
    unit.nodes.forEach((node, i) => {
      let stars = 0;
      let completed = false;
      if (node.kind === "lesson") {
        const p = ctx.progress[node.id.replace(/^lesson-/, "")];
        completed = !!p?.is_completed;
        stars = completed ? lessonStars(p.score) : 0;
      } else if (node.kind === "hanzi") {
        const chars = node.chars ?? [];
        const passed = chars.filter((c) => (ctx.hanzi[c]?.best ?? 0) >= ctx.hanziPass).length;
        completed = passed >= hanziGoal(chars);
        stars = completed ? (passed >= chars.length ? 3 : passed >= Math.ceil(chars.length / 2) ? 2 : 1) : 0;
      } else {
        stars = ctx.nodes[node.id]?.stars ?? 0;
        completed = stars > 0;
      }

      const unlocked =
        completed || prevCompleted || unit.level < ctx.currentLevel || (unit.level === ctx.currentLevel && i === 0);
      // "You are here": first open, unfinished node at (or beyond) the learner's level.
      const current = !currentAssigned && unlocked && !completed && unit.level >= ctx.currentLevel;
      if (current) currentAssigned = true;

      out[node.id] = { stars, completed, unlocked, current };
      prevCompleted = completed;
    });
  }
  return out;
}
