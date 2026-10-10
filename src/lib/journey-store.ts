"use client";

import { readLocal, writeLocal } from "@/lib/storage";

/**
 * Per-device progress for journey nodes that have no database table
 * (stories, HSK practice/mock checkpoints) and for Hanzi writing.
 * Lessons use `user_progress` via UserProvider.
 */

const NODES_KEY = "niibooo.journey.nodes";
const HANZI_KEY = "niibooo.journey.hanzi";
export const JOURNEY_EVENT = "niibooo:journey";

export type NodeRecord = { stars: number; updatedAt: string };
export type HanziRecord = { practiced: boolean; best: number };

export const readNodes = () => readLocal<Record<string, NodeRecord>>(NODES_KEY, {});
export const readHanzi = () => readLocal<Record<string, HanziRecord>>(HANZI_KEY, {});

function notify() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(JOURNEY_EVENT));
}

/** Store a node result, keeping the best star count (0 = attempted, not passed). */
export function markNode(id: string, stars: number) {
  const nodes = readNodes();
  const prev = nodes[id]?.stars ?? -1;
  nodes[id] = { stars: Math.max(prev, stars), updatedAt: new Date().toISOString() };
  writeLocal(NODES_KEY, nodes);
  notify();
}

export function recordHanziPractice(char: string) {
  const all = readHanzi();
  all[char] = { practiced: true, best: all[char]?.best ?? 0 };
  writeLocal(HANZI_KEY, all);
  notify();
}

export function recordHanziTest(char: string, score: number) {
  const all = readHanzi();
  all[char] = { practiced: all[char]?.practiced ?? false, best: Math.max(all[char]?.best ?? 0, score) };
  writeLocal(HANZI_KEY, all);
  notify();
}

/** Shared star rubric for percentage scores. */
export function starsFor(pct: number) {
  if (pct >= 90) return 3;
  if (pct >= 75) return 2;
  if (pct >= 60) return 1;
  return 0;
}

/** Free-hand Hanzi test: pass mark and stars (see calibration notes in hanzi-shape.ts). */
export const HANZI_PASS = 68;
export function hanziStars(score: number) {
  if (score >= 90) return 3;
  if (score >= 80) return 2;
  if (score >= HANZI_PASS) return 1;
  return 0;
}
