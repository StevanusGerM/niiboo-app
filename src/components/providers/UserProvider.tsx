"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { KEYS, readLocal, writeLocal } from "@/lib/storage";
import type { Profile } from "@/types/database";

type ProgressMap = Record<string, { is_completed: boolean; score: number | null }>;
type ActivityLog = Record<string, number>; // "YYYY-MM-DD" -> xp earned

interface UserContextValue {
  profile: Profile;
  userId: string | null;
  isDemo: boolean;
  loading: boolean;
  progress: ProgressMap;
  activity: ActivityLog;
  setLevel: (level: number) => Promise<void>;
  completeLesson: (lessonId: string, score: number) => Promise<void>;
  recordActivity: (xp?: number) => void;
  adjustDemoTokens: (delta: number) => void;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const DEMO_PROFILE: Profile = {
  id: "demo",
  username: "pelajar",
  full_name: "Pelajar NiiBooo",
  avatar_url: null,
  current_hsk_level: 1,
  streak_days: 0,
  token_balance: 5,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

const UserContext = createContext<UserContextValue | null>(null);

export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function computeStreak(log: ActivityLog) {
  let streak = 0;
  const d = new Date();
  // Today not done yet? The streak still counts from yesterday.
  if (!log[dayKey(d)]) d.setDate(d.getDate() - 1);
  while (log[dayKey(d)]) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export function UserProvider({ children }: { children: ReactNode }) {
  const supabase = getSupabaseBrowser();
  const [profile, setProfile] = useState<Profile>(DEMO_PROFILE);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState<ProgressMap>({});
  const [activity, setActivity] = useState<ActivityLog>({});

  const loadDemo = useCallback(() => {
    setUserId(null);
    setProfile({ ...DEMO_PROFILE, ...readLocal<Partial<Profile>>(KEYS.demoProfile, {}) });
    setProgress(readLocal<ProgressMap>(KEYS.demoProgress, {}));
  }, []);

  const refresh = useCallback(async () => {
    setActivity(readLocal<ActivityLog>(KEYS.activity, {}));
    if (!supabase) {
      loadDemo();
      setLoading(false);
      return;
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      loadDemo();
      setLoading(false);
      return;
    }
    setUserId(user.id);
    const [{ data: prof }, { data: rows }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      supabase.from("user_progress").select("lesson_id,is_completed,score").eq("user_id", user.id),
    ]);
    if (prof) setProfile(prof);
    setProgress(
      Object.fromEntries((rows ?? []).map((r) => [r.lesson_id, { is_completed: r.is_completed, score: r.score }])),
    );
    setLoading(false);
  }, [supabase, loadDemo]);

  useEffect(() => {
    void refresh();
    if (!supabase) return;
    const { data: sub } = supabase.auth.onAuthStateChange(() => void refresh());
    return () => sub.subscription.unsubscribe();
  }, [supabase, refresh]);

  const patchProfile = useCallback(
    async (patch: Partial<Pick<Profile, "current_hsk_level" | "streak_days">>) => {
      setProfile((p) => ({ ...p, ...patch }));
      if (supabase && userId) {
        await supabase.from("profiles").update(patch).eq("id", userId);
      } else {
        writeLocal(KEYS.demoProfile, { ...readLocal<Partial<Profile>>(KEYS.demoProfile, {}), ...patch });
      }
    },
    [supabase, userId],
  );

  const recordActivity = useCallback(
    (xp = 10) => {
      const log = readLocal<ActivityLog>(KEYS.activity, {});
      const today = dayKey();
      log[today] = (log[today] ?? 0) + xp;
      writeLocal(KEYS.activity, log);
      setActivity({ ...log });
      const streak = computeStreak(log);
      if (streak !== profile.streak_days) void patchProfile({ streak_days: streak });
    },
    [patchProfile, profile.streak_days],
  );

  const setLevel = useCallback((level: number) => patchProfile({ current_hsk_level: level }), [patchProfile]);

  const completeLesson = useCallback(
    async (lessonId: string, score: number) => {
      const entry = { is_completed: true, score };
      setProgress((p) => ({ ...p, [lessonId]: entry }));
      if (supabase && userId) {
        await supabase
          .from("user_progress")
          .upsert(
            { user_id: userId, lesson_id: lessonId, ...entry, updated_at: new Date().toISOString() },
            { onConflict: "user_id,lesson_id" },
          );
      } else {
        writeLocal(KEYS.demoProgress, { ...readLocal<ProgressMap>(KEYS.demoProgress, {}), [lessonId]: entry });
      }
      recordActivity(score >= 80 ? 30 : 20);
    },
    [supabase, userId, recordActivity],
  );

  const adjustDemoTokens = useCallback((delta: number) => {
    setProfile((p) => {
      const token_balance = Math.max(0, p.token_balance + delta);
      writeLocal(KEYS.demoProfile, { ...readLocal<Partial<Profile>>(KEYS.demoProfile, {}), token_balance });
      return { ...p, token_balance };
    });
  }, []);

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    loadDemo();
  }, [supabase, loadDemo]);

  const value = useMemo<UserContextValue>(
    () => ({
      profile,
      userId,
      isDemo: !userId,
      loading,
      progress,
      activity,
      setLevel,
      completeLesson,
      recordActivity,
      adjustDemoTokens,
      refresh,
      signOut,
    }),
    [profile, userId, loading, progress, activity, setLevel, completeLesson, recordActivity, adjustDemoTokens, refresh, signOut],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside <UserProvider>");
  return ctx;
}
