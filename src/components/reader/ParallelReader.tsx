"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, BookmarkPlus, Check, Columns2, EyeOff, Gauge, Pause, Play, Rows2, Trash2, Volume2, X } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, HskBadge } from "@/components/ui";
import { markNode } from "@/lib/journey-store";
import { isTtsSupported, speakZh, stopSpeaking } from "@/lib/speech";
import { KEYS, readLocal, writeLocal } from "@/lib/storage";
import { cn } from "@/lib/utils";
import type { GlossToken } from "@/types/content";
import type { ParallelStory } from "@/types/database";

type Layout = "side" | "stacked" | "quiz";
type SavedWord = { w: string; py: string; id: string };

const RATES = [0.6, 0.8, 1, 1.2];
/** Rough Mandarin TTS speed used to estimate the karaoke cursor when boundary events are missing. */
const CHARS_PER_SEC = 3.6;

export function ParallelReader({ story }: { story: ParallelStory }) {
  const { recordActivity } = useUser();
  const pairs = story.content_pairs;
  const hasTimedAudio = !!story.audio_url && pairs.every((p) => typeof p.start === "number");

  const [layout, setLayout] = useState<Layout>("side");
  const [showPinyin, setShowPinyin] = useState(true);
  const [rate, setRate] = useState(0.8);
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [activeToken, setActiveToken] = useState(-1);
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [selected, setSelected] = useState<GlossToken | null>(null);
  const [saved, setSaved] = useState<SavedWord[]>([]);
  const [finished, setFinished] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const sessionRef = useRef(0); // invalidates stale TTS callbacks
  const rafRef = useRef<number>(0);
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [ttsOk, setTtsOk] = useState(true);
  useEffect(() => {
    setSaved(readLocal<SavedWord[]>(KEYS.savedWords, []));
    setTtsOk(isTtsSupported());
  }, []);

  // Char offset where each token starts, per sentence.
  const tokenOffsets = useMemo(
    () =>
      pairs.map((p) => {
        let acc = 0;
        return p.tokens.map((t) => {
          const start = acc;
          acc += t.w.length;
          return start;
        });
      }),
    [pairs],
  );

  const tokenAtChar = useCallback(
    (sentence: number, charIndex: number) => {
      const offs = tokenOffsets[sentence] ?? [];
      let idx = 0;
      for (let i = 0; i < offs.length; i++) if (offs[i] <= charIndex) idx = i;
      return idx;
    },
    [tokenOffsets],
  );

  const stopAll = useCallback(() => {
    sessionRef.current += 1;
    cancelAnimationFrame(rafRef.current);
    stopSpeaking();
    audioRef.current?.pause();
    setPlaying(false);
    setActiveToken(-1);
  }, []);

  useEffect(() => stopAll, [stopAll]);

  // Keep the active sentence in view.
  useEffect(() => {
    if (active >= 0) rowRefs.current[active]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [active]);

  const onFinished = useCallback(() => {
    setPlaying(false);
    setActiveToken(-1);
    if (!finished) {
      setFinished(true);
      recordActivity(15);
      markNode(`story-${story.id}`, 3);
    }
  }, [finished, recordActivity, story.id]);

  /* ---------------- TTS karaoke ---------------- */
  const speakFrom = useCallback(
    (index: number, session: number) => {
      if (session !== sessionRef.current) return;
      if (index >= pairs.length) {
        onFinished();
        return;
      }
      setActive(index);
      setActiveToken(0);
      const text = pairs[index].zh;
      let gotBoundary = false;
      const startedAt = performance.now();

      const tick = () => {
        if (session !== sessionRef.current || gotBoundary) return;
        const chars = ((performance.now() - startedAt) / 1000) * CHARS_PER_SEC * rate;
        setActiveToken(tokenAtChar(index, Math.min(chars, text.length - 1)));
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);

      speakZh(text, {
        rate,
        onBoundary: (ci) => {
          if (session !== sessionRef.current) return;
          gotBoundary = true;
          setActiveToken(tokenAtChar(index, ci));
        },
        onEnd: () => {
          cancelAnimationFrame(rafRef.current);
          if (session !== sessionRef.current) return;
          setTimeout(() => speakFrom(index + 1, session), 350);
        },
      });
    },
    [pairs, rate, tokenAtChar, onFinished],
  );

  /* ---------------- Audio-file karaoke ---------------- */
  const onTimeUpdate = () => {
    const t = audioRef.current?.currentTime ?? 0;
    const i = pairs.findIndex((p) => t >= (p.start ?? 0) && t < (p.end ?? Infinity));
    if (i === -1) return;
    setActive(i);
    const p = pairs[i];
    const frac = (t - (p.start ?? 0)) / Math.max(0.01, (p.end ?? t + 1) - (p.start ?? 0));
    setActiveToken(tokenAtChar(i, Math.floor(frac * p.zh.length)));
  };

  const playFrom = (index: number) => {
    stopAll();
    const session = sessionRef.current;
    setPlaying(true);
    if (hasTimedAudio && audioRef.current) {
      audioRef.current.currentTime = pairs[index].start ?? 0;
      audioRef.current.playbackRate = rate;
      void audioRef.current.play();
    } else {
      speakFrom(index, session);
    }
  };

  const togglePlay = () => (playing ? stopAll() : playFrom(Math.max(0, active)));

  /* ---------------- Glossary ---------------- */
  const pickToken = (tok: GlossToken) => {
    if (!tok.id) return;
    setSelected(tok);
    if (!playing) speakZh(tok.w, { rate: 0.8 });
  };

  const isSaved = (w: string) => saved.some((s) => s.w === w);
  const toggleSave = (tok: GlossToken) => {
    const next = isSaved(tok.w)
      ? saved.filter((s) => s.w !== tok.w)
      : [...saved, { w: tok.w, py: tok.py ?? "", id: tok.id ?? "" }];
    setSaved(next);
    writeLocal(KEYS.savedWords, next);
  };

  const progressPct = active < 0 ? 0 : Math.round(((active + 1) / pairs.length) * 100);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] [&>*]:min-w-0">
      <div>
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <Link href="/reader" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft" aria-label="Kembali">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <HskBadge level={story.hsk_level} />
          {finished && (
            <span className="inline-flex items-center gap-1 rounded-full bg-plum px-3 py-1 text-xs font-bold text-cream">
              <Check className="h-3 w-3" /> Selesai · +15 XP
            </span>
          )}
        </div>
        <h1 className="font-hanzi text-4xl font-bold sm:text-5xl">{story.title_zh}</h1>
        <p className="mt-1 text-lg font-semibold text-plum-soft">{story.title_id}</p>

        {/* Player bar */}
        <div className="sticky top-[68px] z-20 mt-5 flex flex-wrap items-center gap-2 rounded-full bg-white/95 p-2 shadow-soft ring-1 ring-plum/5 backdrop-blur">
          <button
            onClick={togglePlay}
            disabled={!hasTimedAudio && !ttsOk}
            className="grid h-11 w-11 place-items-center rounded-full bg-blossom text-white shadow-glow transition active:scale-95 disabled:opacity-40"
            aria-label={playing ? "Jeda" : "Putar"}
          >
            {playing ? <Pause className="h-5 w-5" fill="white" /> : <Play className="ml-0.5 h-5 w-5" fill="white" />}
          </button>
          <div className="mx-1 hidden h-2 flex-1 overflow-hidden rounded-full bg-plum/10 sm:block">
            <div className="h-full rounded-full bg-blossom-gradient transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <button
            onClick={() => setRate(RATES[(RATES.indexOf(rate) + 1) % RATES.length])}
            className="inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold hover:bg-plum/5"
            title="Kecepatan"
          >
            <Gauge className="h-4 w-4" /> {rate}×
          </button>
          <button
            onClick={() => setShowPinyin((v) => !v)}
            className={cn("rounded-full px-3 py-2 text-sm font-bold", showPinyin ? "bg-rose text-blossom-dark" : "hover:bg-plum/5")}
          >
            Pinyin
          </button>
          <div className="flex rounded-full bg-cream p-1">
            {(
              [
                ["side", Columns2, "Berdampingan"],
                ["stacked", Rows2, "Bertumpuk"],
                ["quiz", EyeOff, "Uji diri (terjemahan disembunyikan)"],
              ] as const
            ).map(([key, Icon, label]) => (
              <button
                key={key}
                onClick={() => {
                  setLayout(key);
                  setRevealed(new Set());
                }}
                title={label}
                aria-label={label}
                aria-pressed={layout === key}
                className={cn("grid h-8 w-8 place-items-center rounded-full", layout === key ? "bg-plum text-cream" : "text-plum-soft")}
              >
                <Icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>

        {!hasTimedAudio && !ttsOk && (
          <p className="mt-3 text-sm text-plum-soft">Browser ini tidak mendukung text-to-speech. Coba Chrome atau Edge.</p>
        )}
        {hasTimedAudio && story.audio_url && (
          <audio ref={audioRef} src={story.audio_url} onTimeUpdate={onTimeUpdate} onEnded={onFinished} preload="metadata" />
        )}

        {/* Sentences */}
        <div className="mt-5 space-y-3">
          {pairs.map((pair, i) => {
            const isActive = i === active;
            const hidden = layout === "quiz" && !revealed.has(i);
            return (
              <div
                key={i}
                ref={(el) => {
                  rowRefs.current[i] = el;
                }}
                className={cn(
                  "grid gap-3 rounded-3xl p-4 transition-all sm:p-5",
                  layout === "side" ? "md:grid-cols-2 md:gap-6" : "grid-cols-1",
                  isActive ? "bg-white shadow-soft ring-2 ring-blossom" : "bg-white/60 ring-1 ring-plum/5",
                )}
              >
                <div className="flex gap-3">
                  <button
                    onClick={() => playFrom(i)}
                    className={cn(
                      "mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-extrabold transition",
                      isActive ? "bg-blossom text-white" : "bg-rose text-blossom-dark hover:bg-blossom hover:text-white",
                    )}
                    aria-label={`Putar kalimat ${i + 1}`}
                  >
                    {isActive && playing ? <Volume2 className="h-4 w-4" /> : i + 1}
                  </button>
                  <p className="font-hanzi text-2xl leading-[2.4] sm:text-[1.7rem]" lang="zh-CN">
                    {pair.tokens.map((tok, ti) => {
                      const lit = isActive && ti <= activeToken && activeToken >= 0;
                      const isPunct = !tok.id;
                      return isPunct ? (
                        <span key={ti} className={lit ? "text-blossom" : undefined}>
                          {tok.w}
                        </span>
                      ) : (
                        <button
                          key={ti}
                          onClick={() => pickToken(tok)}
                          className={cn(
                            "rounded-lg px-0.5 transition-colors hover:bg-rose",
                            lit && "text-blossom",
                            isActive && ti === activeToken && "bg-rose",
                            selected?.w === tok.w && "underline decoration-blossom decoration-2 underline-offset-8",
                          )}
                        >
                          <ruby>
                            {tok.w}
                            {showPinyin && (
                              <rt className="font-sans text-[0.42em] font-semibold tracking-wide text-plum-soft">{tok.py}</rt>
                            )}
                          </ruby>
                        </button>
                      );
                    })}
                  </p>
                </div>
                <div
                  className={cn(
                    "self-center border-plum/10 pl-11 md:pl-0",
                    layout === "side" && "md:border-l md:pl-6",
                  )}
                >
                  {hidden ? (
                    <button
                      onClick={() => setRevealed((s) => new Set(s).add(i))}
                      className="w-full rounded-2xl border-2 border-dashed border-plum/15 px-4 py-3 text-left text-sm font-semibold text-plum-soft hover:border-blossom hover:text-blossom"
                    >
                      Coba terjemahkan dulu, lalu ketuk untuk melihat →
                    </button>
                  ) : (
                    <p className={cn("text-base leading-relaxed sm:text-lg", isActive ? "text-plum" : "text-plum-soft")}>{pair.id}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Glossary (side panel on desktop, bottom sheet on mobile) */}
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div
          className={cn(
            "fixed inset-x-4 bottom-24 z-30 transition lg:static",
            selected ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0 lg:pointer-events-auto lg:translate-y-0 lg:opacity-100",
          )}
        >
          <BentoCard tone="plum" className="animate-pop-in">
            {selected ? (
              <>
                <div className="flex items-start justify-between">
                  <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Glosarium</p>
                  <button onClick={() => setSelected(null)} aria-label="Tutup" className="text-cream/60 hover:text-cream">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-2 font-hanzi text-5xl font-bold">{selected.w}</p>
                <p className="mt-1 text-lg font-semibold text-peach">{selected.py}</p>
                <p className="mt-1 text-cream/90">{selected.id}</p>
                <div className="mt-4 flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => speakZh(selected.w, { rate: 0.7 })}>
                    <Volume2 className="h-4 w-4" /> Dengar
                  </Button>
                  <Button className="flex-1" onClick={() => toggleSave(selected)}>
                    {isSaved(selected.w) ? <Check className="h-4 w-4" /> : <BookmarkPlus className="h-4 w-4" />}
                    {isSaved(selected.w) ? "Tersimpan" : "Simpan"}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-xs font-bold uppercase tracking-wider text-cream/60">Glosarium instan</p>
                <p className="mt-2 text-cream/90">Ketuk kata Mandarin mana pun untuk melihat pinyin, arti, dan pelafalannya.</p>
              </>
            )}
          </BentoCard>
        </div>

        <BentoCard className="mt-4 hidden lg:block">
          <p className="text-sm font-extrabold">Kosakata tersimpan ({saved.length})</p>
          {saved.length === 0 ? (
            <p className="mt-2 text-sm text-plum-soft">Belum ada. Simpan kata dari glosarium.</p>
          ) : (
            <ul className="mt-3 max-h-72 space-y-2 overflow-y-auto pr-1">
              {saved.map((s) => (
                <li key={s.w} className="flex items-center justify-between gap-2 rounded-2xl bg-cream px-3 py-2">
                  <button onClick={() => speakZh(s.w)} className="min-w-0 text-left">
                    <span className="font-hanzi text-lg font-bold">{s.w}</span>{" "}
                    <span className="text-sm text-blossom-dark">{s.py}</span>
                    <p className="truncate text-xs text-plum-soft">{s.id}</p>
                  </button>
                  <button
                    onClick={() => toggleSave({ w: s.w, py: s.py, id: s.id })}
                    aria-label="Hapus"
                    className="text-plum-soft hover:text-blossom"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </BentoCard>
      </aside>
    </div>
  );
}
