"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Crown, Dumbbell, Headphones, Lock, PenTool, Play, Star, Trophy } from "lucide-react";
import { ChunkyButton, ChunkyLink } from "@/components/auth/ChunkyButton";
import { Boo, SpeechBubble } from "@/components/mascot/Boo";
import { Dragon, Sticker, type StickerName } from "@/components/mascot/Stickers";
import { useUser } from "@/components/providers/UserProvider";
import { ProgressBar } from "@/components/ui";
import { resolveStates, type JourneyNode, type JourneyUnit, type NodeKind, type NodeState } from "@/lib/journey";
import { HANZI_PASS, JOURNEY_EVENT, readHanzi, readNodes, type HanziRecord, type NodeRecord } from "@/lib/journey-store";
import { cn } from "@/lib/utils";

/** Each node kind gets its own colour from the supporting palette. */
const KIND: Record<NodeKind, { label: string; icon: typeof BookOpen; on: string; chip: string }> = {
  lesson: { label: "Pelajaran", icon: BookOpen, on: "bg-blossom text-white shadow-[0_6px_0_0_#D9435F]", chip: "bg-rose text-blossom-dark" },
  story: { label: "Cerita", icon: Headphones, on: "bg-lilac text-white shadow-[0_6px_0_0_#7C5CE8]", chip: "bg-lilac-light text-lilac-dark" },
  hanzi: { label: "Tulis Hanzi", icon: PenTool, on: "bg-mint text-white shadow-[0_6px_0_0_#22A882]", chip: "bg-mint-light text-mint-dark" },
  practice: { label: "Latihan", icon: Dumbbell, on: "bg-ocean text-white shadow-[0_6px_0_0_#2F8FD6]", chip: "bg-ocean-light text-ocean-dark" },
  boss: { label: "Ujian Bos", icon: Crown, on: "bg-sunny text-plum shadow-[0_6px_0_0_#E9A825]", chip: "bg-sunny-light text-[#9A6B00]" },
};

/** Decorative stickers per world, scattered along the path. */
const WORLD_STICKERS: Record<number, StickerName[]> = {
  1: ["bamboo", "baozi", "cloud"],
  2: ["lantern", "tea", "star"],
  3: ["cloud", "book", "lantern"],
  4: ["headphones", "star", "sparkle"],
  5: ["cloud", "bamboo", "tea"],
  6: ["lantern", "sparkle", "trophy"],
};

/** Horizontal zig-zag offsets (px) that give the path its winding look. */
const OFFSETS = [0, 52, 80, 52, 0, -52, -80, -52];

const BOO_LINES = ["Ayo lanjut!", "Kamu pasti bisa!", "加油！", "Sedikit lagi!"];

export function JourneyMap({ units }: { units: JourneyUnit[] }) {
  const { profile, progress, loading } = useUser();
  const [nodes, setNodes] = useState<Record<string, NodeRecord>>({});
  const [hanzi, setHanzi] = useState<Record<string, HanziRecord>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const currentRef = useRef<HTMLDivElement>(null);
  const scrolled = useRef(false);

  useEffect(() => {
    const sync = () => {
      setNodes(readNodes());
      setHanzi(readHanzi());
    };
    sync();
    window.addEventListener(JOURNEY_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(JOURNEY_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const states = useMemo(
    () => resolveStates(units, { currentLevel: profile.current_hsk_level, progress, nodes, hanzi, hanziPass: HANZI_PASS }),
    [units, profile.current_hsk_level, progress, nodes, hanzi],
  );

  const all = units.flatMap((u) => u.nodes);
  const earned = all.reduce((n, node) => n + (states[node.id]?.stars ?? 0), 0);
  const done = all.filter((node) => states[node.id]?.completed).length;
  const currentId = all.find((node) => states[node.id]?.current)?.id ?? null;

  // Bring "you are here" into view once data is ready.
  useEffect(() => {
    if (loading || scrolled.current || !currentRef.current) return;
    scrolled.current = true;
    const el = currentRef.current;
    requestAnimationFrame(() => {
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      // Only scroll when the node is actually off-screen (skip hidden/zero-height viewports).
      if (vh > 200 && (top > vh * 0.75 || top < 0)) el.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [loading, currentId]);

  const booLine = BOO_LINES[done % BOO_LINES.length];

  return (
    <div className="mx-auto max-w-2xl">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[32px] bg-plum p-5 text-cream shadow-chunky-plum sm:p-6">
        <div className="blob -right-10 -top-10 h-40 w-40 bg-blossom/40" />
        <div className="relative flex items-center gap-4">
          <Boo mood="happy" size={84} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-peach">Petualangan Boo</p>
            <h1 className="text-2xl font-black leading-tight sm:text-3xl">Peta Belajarmu</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm font-extrabold">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Star className="h-4 w-4 text-sunny" fill="#FFC94A" /> {earned}/{all.length * 3}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1">
                <Trophy className="h-4 w-4 text-peach" /> {done}/{all.length} langkah
              </span>
            </div>
          </div>
        </div>
        <ProgressBar value={(done / Math.max(1, all.length)) * 100} className="relative mt-4 bg-white/10" />
        {currentId && (
          <ChunkyButton
            tone="pink"
            className="relative mt-4 py-3"
            onClick={() => {
              currentRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
              setSelected(currentId);
            }}
          >
            <Play className="h-5 w-5" fill="white" /> Lanjutkan petualangan
          </ChunkyButton>
        )}
      </div>

      {units.map((unit) => {
        const unitDone = unit.nodes.filter((n) => states[n.id]?.completed).length;
        const unitLocked = unit.nodes.every((n) => !states[n.id]?.unlocked);
        const bossDone = states[`boss-${unit.level}`]?.completed;
        return (
          <section key={unit.level} className="mt-10" aria-label={`Unit HSK ${unit.level}`}>
            {/* Unit banner */}
            <div
              className={cn(
                "relative overflow-hidden rounded-[28px] bg-gradient-to-r p-5 text-white",
                unit.gradient,
                unitLocked ? "opacity-60 grayscale-[40%]" : "shadow-glow",
              )}
            >
              <span aria-hidden className="absolute -right-2 -top-3 text-7xl opacity-30">
                {unit.emoji}
              </span>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/80">Unit {unit.level} · HSK {unit.level}</p>
              <p className="mt-0.5 flex items-center gap-2 text-2xl font-black">
                {unit.emoji} {unit.name}
                {bossDone && <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-xs font-black">👑 Tamat</span>}
                {unitLocked && <Lock className="h-5 w-5" />}
              </p>
              <p className="text-sm font-bold text-white/85">{unit.tagline}</p>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/25">
                  <div className="h-full rounded-full bg-white transition-all" style={{ width: `${(unitDone / unit.nodes.length) * 100}%` }} />
                </div>
                <span className="text-xs font-black">
                  {unitDone}/{unit.nodes.length}
                </span>
              </div>
            </div>

            {/* Winding path */}
            <div className="relative flex flex-col items-center gap-6 pb-2 pt-8">
              {/* scenery */}
              {WORLD_STICKERS[unit.level]?.map((name, k) => (
                <Sticker
                  key={name + k}
                  name={name}
                  size={k === 1 ? 52 : 64}
                  float
                  rotate={k % 2 ? 10 : -8}
                  className={cn(
                    "pointer-events-none absolute opacity-90",
                    unitLocked && "opacity-40 grayscale",
                    k === 0 && "left-0 top-[12%]",
                    k === 1 && "right-0 top-[42%]",
                    k === 2 && "bottom-[12%] left-2",
                  )}
                />
              ))}
              {unit.nodes.map((node, i) => {
                const st = states[node.id];
                const offset = OFFSETS[i % OFFSETS.length];
                const isCurrent = node.id === currentId;
                const open = selected === node.id;
                return (
                  <Fragment key={node.id}>
                    <div
                      ref={isCurrent ? currentRef : undefined}
                      className="relative flex flex-col items-center"
                      style={{ transform: `translateX(${offset}px)` }}
                    >
                      {isCurrent && (
                        <div className="absolute -top-11 z-10">
                          <span className="animate-bubble-in rounded-xl bg-white px-3 py-1 text-xs font-black uppercase tracking-wide text-blossom shadow-chunky-white ring-2 ring-plum/10">
                            Mulai
                          </span>
                        </div>
                      )}
                      <NodeButton node={node} state={st} current={isCurrent} onClick={() => setSelected(open ? null : node.id)} />
                      {st?.completed && <Stars count={st.stars} />}

                      {node.kind === "boss" && !isCurrent && (
                        <div
                          className={cn(
                            "pointer-events-none absolute top-1/2 -translate-y-1/2",
                            offset > 0 ? "right-full mr-3" : "left-full ml-3",
                            !st?.unlocked && "opacity-50 grayscale",
                          )}
                        >
                          <Dragon size={70} mood={st?.completed ? "happy" : "fierce"} float />
                        </div>
                      )}
                      {isCurrent && (
                        <div
                          className={cn(
                            "pointer-events-none absolute top-1/2 hidden -translate-y-1/2 flex-col items-center min-[400px]:flex",
                            offset > 0 ? "right-full mr-4" : "left-full ml-4",
                          )}
                        >
                          <SpeechBubble className="px-3 py-1.5 text-xs">{booLine}</SpeechBubble>
                          <Boo mood="wave" size={78} className="mt-1" />
                        </div>
                      )}
                    </div>

                    {open && <NodeCard node={node} state={st} onClose={() => setSelected(null)} />}
                  </Fragment>
                );
              })}
            </div>
          </section>
        );
      })}

      <p className="mt-10 text-center text-xs font-semibold text-plum-soft">
        Progres cerita, latihan HSK, dan tantangan Hanzi disimpan di perangkat ini.
      </p>
    </div>
  );
}

function NodeButton({
  node,
  state,
  current,
  onClick,
}: {
  node: JourneyNode;
  state?: NodeState;
  current: boolean;
  onClick: () => void;
}) {
  const Icon = state?.unlocked ? (state.completed && node.kind !== "boss" ? Check : KIND[node.kind].icon) : Lock;
  const boss = node.kind === "boss";
  const size = boss ? "h-[88px] w-[88px]" : "h-[72px] w-[72px]";

  const look = !state?.unlocked
    ? "bg-[#E9E6EA] text-plum/30 shadow-[0_6px_0_0_#D3CFD6]"
    : boss
      ? state.completed
        ? KIND.boss.on
        : "bg-plum text-peach shadow-chunky-plum"
      : state.completed || current
        ? KIND[node.kind].on
        : "border-4 border-rose bg-white text-blossom shadow-[0_6px_0_0_rgba(43,45,66,0.15)]";

  return (
    <button
      onClick={onClick}
      aria-label={`${KIND[node.kind].label}: ${node.title}${state?.completed ? " (selesai)" : state?.unlocked ? "" : " (terkunci)"}`}
      className={cn(
        "relative grid place-items-center rounded-full transition-all duration-100 hover:brightness-105 active:translate-y-[6px] active:shadow-none",
        size,
        look,
      )}
    >
      {current && <span className="absolute -inset-2.5 animate-ping rounded-full border-4 border-blossom/40" aria-hidden />}
      {current && <span className="absolute -inset-2.5 rounded-full border-4 border-blossom/30" aria-hidden />}
      <Icon className={boss ? "h-10 w-10" : "h-8 w-8"} strokeWidth={2.6} />
    </button>
  );
}

function Stars({ count }: { count: number }) {
  return (
    <div className="mt-2 flex gap-0.5" aria-label={`${count} dari 3 bintang`}>
      {[1, 2, 3].map((n) => (
        <Star
          key={n}
          className={cn("h-4 w-4", n === 2 && "-translate-y-1", n <= count ? "text-sunny" : "text-plum/15")}
          fill="currentColor"
        />
      ))}
    </div>
  );
}

function NodeCard({ node, state, onClose }: { node: JourneyNode; state?: NodeState; onClose: () => void }) {
  const meta = KIND[node.kind];
  return (
    <div className="w-[min(340px,92vw)] animate-bubble-in rounded-[28px] border-2 border-plum/10 bg-white p-5 shadow-chunky-white">
      <div className="flex items-start justify-between gap-3">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black uppercase tracking-wide", meta.chip)}>
          <meta.icon className="h-3.5 w-3.5" /> {meta.label}
        </span>
        <button onClick={onClose} className="text-sm font-black text-plum-soft hover:text-plum" aria-label="Tutup">
          ✕
        </button>
      </div>
      <p className="mt-2 text-xl font-black">{node.title}</p>
      <p className="text-sm font-semibold text-plum-soft">{node.subtitle}</p>
      {state?.completed && (
        <div className="mt-2">
          <Stars count={state.stars} />
        </div>
      )}
      {state?.unlocked ? (
        <ChunkyLink href={node.href} tone={node.kind === "boss" ? "plum" : "pink"} className="mt-4 py-3">
          {state.completed ? "Ulangi" : "Mulai"} · +{node.xp} XP
        </ChunkyLink>
      ) : (
        <>
          <ChunkyButton tone="white" className="mt-4 py-3" disabled>
            <Lock className="h-4 w-4" /> Terkunci
          </ChunkyButton>
          <p className="mt-2 text-center text-xs font-bold text-plum-soft">Selesaikan langkah sebelumnya untuk membuka.</p>
        </>
      )}
    </div>
  );
}
