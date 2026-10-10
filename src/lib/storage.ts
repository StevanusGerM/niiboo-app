/** Safe localStorage helpers for demo mode and per-device preferences. */
export function readLocal<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeLocal<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or blocked — ignore
  }
}

export const KEYS = {
  demoProfile: "niibooo.demo.profile",
  demoProgress: "niibooo.demo.progress",
  demoBookings: "niibooo.demo.bookings",
  savedWords: "niibooo.savedWords",
  activity: "niibooo.activity",
} as const;
