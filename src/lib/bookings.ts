"use client";

import { getSupabaseBrowser } from "@/lib/supabase/client";
import { KEYS, readLocal, writeLocal } from "@/lib/storage";
import type { ExpertBooking } from "@/types/database";

/** Booking service — Supabase RPCs when signed in, localStorage in demo mode. */

export async function listBookings(userId: string | null): Promise<ExpertBooking[]> {
  const sb = getSupabaseBrowser();
  if (sb && userId) {
    const { data, error } = await sb
      .from("expert_bookings")
      .select("*")
      .eq("user_id", userId)
      .order("scheduled_time", { ascending: true });
    if (error) throw error;
    return data ?? [];
  }
  return readLocal<ExpertBooking[]>(KEYS.demoBookings, []).sort((a, b) => a.scheduled_time.localeCompare(b.scheduled_time));
}

export async function createBooking(
  userId: string | null,
  input: { expertName: string; scheduledTime: string; cost: number },
): Promise<ExpertBooking> {
  const sb = getSupabaseBrowser();
  if (sb && userId) {
    const { data, error } = await sb.rpc("book_expert_session", {
      p_expert_name: input.expertName,
      p_scheduled_time: input.scheduledTime,
      p_cost: input.cost,
    });
    if (error) throw new Error(error.message.includes("insufficient") ? "Token tidak cukup." : error.message);
    return data as ExpertBooking;
  }
  const booking: ExpertBooking = {
    id: crypto.randomUUID(),
    user_id: "demo",
    expert_name: input.expertName,
    scheduled_time: input.scheduledTime,
    status: "pending",
    zoom_link: null,
    token_cost: input.cost,
    created_at: new Date().toISOString(),
  };
  writeLocal(KEYS.demoBookings, [...readLocal<ExpertBooking[]>(KEYS.demoBookings, []), booking]);
  return booking;
}

export async function cancelBooking(userId: string | null, booking: ExpertBooking) {
  const sb = getSupabaseBrowser();
  if (sb && userId) {
    const { error } = await sb.rpc("cancel_expert_session", { p_booking_id: booking.id });
    if (error) throw error;
    return;
  }
  writeLocal(
    KEYS.demoBookings,
    readLocal<ExpertBooking[]>(KEYS.demoBookings, []).map((b) => (b.id === booking.id ? { ...b, status: "cancelled" } : b)),
  );
}
