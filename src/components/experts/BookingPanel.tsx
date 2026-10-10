"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarClock, Check, Coins, ExternalLink, Languages, Loader2, Plus, Star, X } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button } from "@/components/ui";
import { experts, type Expert } from "@/data/experts";
import { cancelBooking, createBooking, listBookings } from "@/lib/bookings";
import { cn } from "@/lib/utils";
import type { BookingStatus, ExpertBooking } from "@/types/database";

const TZ = "Asia/Jakarta";
const JKT_OFFSET_MS = 7 * 3600 * 1000;
const DAYS_AHEAD = 10;

const STATUS: Record<BookingStatus, { label: string; cls: string }> = {
  pending: { label: "Menunggu konfirmasi", cls: "bg-peach/30 text-plum" },
  confirmed: { label: "Terkonfirmasi", cls: "bg-emerald-100 text-emerald-800" },
  completed: { label: "Selesai", cls: "bg-plum/10 text-plum-soft" },
  cancelled: { label: "Dibatalkan", cls: "bg-plum/5 text-plum-soft line-through" },
};

/** Upcoming weekdays in Jakarta time. */
function upcomingDays() {
  const jktNow = new Date(Date.now() + JKT_OFFSET_MS);
  const days: { key: string; date: Date }[] = [];
  for (let i = 0; days.length < 7 && i < DAYS_AHEAD; i++) {
    const d = new Date(jktNow.getTime() + i * 86_400_000);
    const wd = d.getUTCDay();
    if (wd === 0 || wd === 6) continue;
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
    days.push({ key, date: new Date(`${key}T12:00:00+07:00`) });
  }
  return days;
}

const slotIso = (dayKey: string, hour: number) => new Date(`${dayKey}T${String(hour).padStart(2, "0")}:00:00+07:00`).toISOString();

const fmt = (iso: string, opts: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("id-ID", { timeZone: TZ, ...opts }).format(new Date(iso));

export function BookingPanel() {
  const { userId, isDemo, profile, refresh, adjustDemoTokens } = useUser();
  const [mounted, setMounted] = useState(false);
  const [expert, setExpert] = useState<Expert>(experts[0]);
  const [day, setDay] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [bookings, setBookings] = useState<ExpertBooking[]>([]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const days = useMemo(() => (mounted ? upcomingDays() : []), [mounted]);

  const load = useCallback(async () => {
    try {
      setBookings(await listBookings(userId));
    } catch {
      setMessage({ ok: false, text: "Gagal memuat jadwal." });
    }
  }, [userId]);

  useEffect(() => {
    setMounted(true);
    void load();
  }, [load]);

  useEffect(() => {
    if (!day && days.length) setDay(days[0].key);
  }, [days, day]);

  const taken = new Set(
    bookings.filter((b) => b.status !== "cancelled" && b.expert_name === expert.name).map((b) => new Date(b.scheduled_time).toISOString()),
  );
  const slots = day
    ? expert.hours.map((h) => ({ hour: h, iso: slotIso(day, h) })).filter((s) => new Date(s.iso).getTime() > Date.now() + 3600_000)
    : [];

  const canAfford = profile.token_balance >= expert.tokenCost;

  const book = async () => {
    if (!slot) return;
    setBusy(true);
    setMessage(null);
    try {
      await createBooking(userId, { expertName: expert.name, scheduledTime: slot, cost: expert.tokenCost });
      if (isDemo) adjustDemoTokens(-expert.tokenCost);
      else await refresh();
      setMessage({ ok: true, text: `Sesi dengan ${expert.name} dipesan! Tunggu konfirmasi & link Zoom.` });
      setSlot(null);
      await load();
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : "Gagal memesan." });
    } finally {
      setBusy(false);
    }
  };

  const cancel = async (b: ExpertBooking) => {
    if (!window.confirm(`Batalkan sesi dengan ${b.expert_name}? ${b.token_cost} token akan dikembalikan.`)) return;
    try {
      await cancelBooking(userId, b);
      if (isDemo) adjustDemoTokens(b.token_cost);
      else await refresh();
      await load();
    } catch {
      setMessage({ ok: false, text: "Gagal membatalkan sesi." });
    }
  };

  const upcoming = bookings.filter((b) => b.status !== "cancelled" && new Date(b.scheduled_time).getTime() > Date.now() - 3600_000);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="space-y-5">
        {/* Experts */}
        <div className="grid gap-3 sm:grid-cols-2">
          {experts.map((e) => {
            const active = e.name === expert.name;
            return (
              <button
                key={e.name}
                onClick={() => {
                  setExpert(e);
                  setSlot(null);
                }}
                className={cn(
                  "rounded-bento p-5 text-left transition",
                  active ? "bg-white shadow-soft ring-2 ring-blossom" : "bg-white/70 ring-1 ring-plum/5 hover:bg-white",
                )}
              >
                <div className="flex items-center gap-3">
                  <span className={cn("grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br text-xl font-extrabold text-white", e.color)}>
                    {e.name.split(" ")[1]?.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-extrabold">{e.name}</p>
                    <p className="truncate text-sm text-plum-soft">{e.title}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {e.specialties.map((s) => (
                    <span key={s} className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold">
                      {s}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-sm font-bold">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 text-peach" fill="#FFB385" /> {e.rating} · {e.sessions.toLocaleString("id-ID")} sesi
                  </span>
                  <span className="inline-flex items-center gap-1 text-blossom-dark">
                    <Coins className="h-4 w-4" /> {e.tokenCost}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1 text-xs text-plum-soft">
                  <Languages className="h-3 w-3" /> {e.languages.join(" · ")}
                </p>
              </button>
            );
          })}
        </div>

        {/* Schedule */}
        <BentoCard>
          <p className="flex items-center gap-2 text-lg font-extrabold">
            <CalendarClock className="h-5 w-5 text-blossom" /> Pilih jadwal (WIB)
          </p>
          <div className="scrollbar-none -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
            {days.map((d) => (
              <button
                key={d.key}
                onClick={() => {
                  setDay(d.key);
                  setSlot(null);
                }}
                className={cn(
                  "flex min-w-[64px] flex-col items-center rounded-2xl px-3 py-2 transition",
                  d.key === day ? "bg-plum text-cream" : "bg-cream hover:bg-rose/50",
                )}
              >
                <span className="text-xs font-bold uppercase opacity-70">{fmt(d.date.toISOString(), { weekday: "short" })}</span>
                <span className="text-xl font-extrabold">{fmt(d.date.toISOString(), { day: "numeric" })}</span>
                <span className="text-[10px] font-bold opacity-70">{fmt(d.date.toISOString(), { month: "short" })}</span>
              </button>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
            {slots.length === 0 && <p className="col-span-full text-sm text-plum-soft">Tidak ada slot tersisa di hari ini.</p>}
            {slots.map((s) => {
              const isTaken = taken.has(s.iso);
              return (
                <button
                  key={s.iso}
                  disabled={isTaken}
                  onClick={() => setSlot(s.iso)}
                  className={cn(
                    "rounded-2xl py-3 text-sm font-extrabold transition",
                    isTaken
                      ? "bg-plum/5 text-plum-soft line-through"
                      : slot === s.iso
                        ? "bg-blossom text-white shadow-glow"
                        : "bg-white ring-1 ring-plum/10 hover:ring-blossom",
                  )}
                >
                  {String(s.hour).padStart(2, "0")}:00
                </button>
              );
            })}
          </div>
        </BentoCard>
      </div>

      {/* Summary & my bookings */}
      <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <BentoCard tone="plum">
          <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Ringkasan</p>
          <p className="mt-2 text-lg font-extrabold">{expert.name}</p>
          <p className="text-sm text-cream/80">
            {slot ? fmt(slot, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) + " WIB" : "Pilih slot waktu"}
          </p>
          <div className="mt-4 flex items-center justify-between rounded-2xl bg-white/10 px-4 py-3 text-sm">
            <span>Biaya · 50 menit</span>
            <span className="inline-flex items-center gap-1 font-extrabold">
              <Coins className="h-4 w-4 text-peach" /> {expert.tokenCost} token
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between px-1 text-sm text-cream/70">
            <span>Saldo kamu</span>
            <span className="font-bold text-cream">{profile.token_balance} token</span>
          </div>
          <Button className="mt-4 w-full py-3" disabled={!slot || busy || !canAfford} onClick={book}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {canAfford ? "Pesan sesi" : "Token tidak cukup"}
          </Button>
          {isDemo && (
            <button
              onClick={() => adjustDemoTokens(5)}
              className="mt-3 inline-flex w-full items-center justify-center gap-1 text-xs font-bold text-cream/70 hover:text-cream"
            >
              <Plus className="h-3 w-3" /> Tambah 5 token (mode demo)
            </button>
          )}
          {message && (
            <p className={cn("mt-3 rounded-2xl px-3 py-2 text-sm font-semibold", message.ok ? "bg-emerald-100 text-emerald-900" : "bg-rose text-blossom-dark")}>
              {message.text}
            </p>
          )}
        </BentoCard>

        <BentoCard>
          <p className="font-extrabold">Sesi saya</p>
          {upcoming.length === 0 ? (
            <p className="mt-2 text-sm text-plum-soft">Belum ada sesi terjadwal.</p>
          ) : (
            <ul className="mt-3 space-y-2">
              {upcoming.map((b) => (
                <li key={b.id} className="rounded-2xl bg-cream p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold">{b.expert_name}</p>
                      <p className="text-xs text-plum-soft">
                        {fmt(b.scheduled_time, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} WIB
                      </p>
                    </div>
                    {b.status === "pending" && (
                      <button onClick={() => void cancel(b)} aria-label="Batalkan" className="text-plum-soft hover:text-blossom">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", STATUS[b.status].cls)}>{STATUS[b.status].label}</span>
                    {b.zoom_link ? (
                      <a href={b.zoom_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-blossom-dark">
                        Buka Zoom <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-plum-soft">Link Zoom menyusul</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
      </div>
    </div>
  );
}
