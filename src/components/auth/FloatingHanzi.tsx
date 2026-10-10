import { cn } from "@/lib/utils";

/** Decorative floating hanzi tiles behind the auth screens. */
const TILES = [
  { c: "你", pos: "left-[3%] top-[22%]", r: "-12deg", tone: "bg-rose text-blossom-dark", delay: "0s", mobile: true },
  { c: "好", pos: "right-[8%] top-[14%]", r: "10deg", tone: "bg-peach/60 text-plum", delay: "1.2s", mobile: true },
  { c: "学", pos: "left-[4%] bottom-[22%]", r: "8deg", tone: "bg-white text-plum", delay: "0.6s", mobile: false },
  { c: "爱", pos: "right-[3%] bottom-[38%]", r: "-8deg", tone: "bg-rose text-blossom", delay: "2s", mobile: false },
  { c: "中", pos: "left-[16%] top-[6%]", r: "4deg", tone: "bg-white text-blossom", delay: "1.6s", mobile: false },
  { c: "文", pos: "right-[4%] bottom-[8%]", r: "-6deg", tone: "bg-peach/50 text-plum", delay: "0.9s", mobile: false },
];

export function FloatingHanzi() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-rose/70 blur-3xl" />
      <div className="absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-peach/40 blur-3xl" />
      {TILES.map((t) => (
        <span
          key={t.c}
          style={{ ["--r" as string]: t.r, animationDelay: t.delay }}
          className={cn(
            "absolute grid h-14 w-14 animate-float-slow place-items-center rounded-2xl font-hanzi text-2xl font-bold opacity-70 shadow-chunky-white sm:h-16 sm:w-16 sm:text-3xl",
            t.pos,
            t.tone,
            !t.mobile && "hidden md:grid",
          )}
        >
          {t.c}
        </span>
      ))}
    </div>
  );
}
