import { cn } from "@/lib/utils";

export type BooMood = "idle" | "happy" | "wave" | "shy" | "peek" | "sad";

const PLUM = "#2B2D42";
const PINK = "#FF6584";
const PINK_SOFT = "#FF8FA6";
const BELLY = "#FFF1F4";

/**
 * Boo the panda — NiiBooo's mascot. Pure SVG so it stays crisp on every screen.
 * Moods: idle (blinking), happy, wave, shy (covers eyes), peek (one eye), sad.
 */
export function Boo({
  mood = "idle",
  size = 200,
  float = false,
  className,
  title = "Boo si panda",
}: {
  mood?: BooMood;
  size?: number;
  float?: boolean;
  className?: string;
  title?: string;
}) {
  const coverLeft = mood === "shy" || mood === "peek";
  const coverRight = mood === "shy";
  const armsUp = coverLeft; // paws are on the face

  return (
    <svg
      viewBox="0 0 200 220"
      width={size}
      height={(size * 220) / 200}
      role="img"
      aria-label={title}
      className={cn("select-none overflow-visible", float && "animate-float", className)}
    >
      {/* ground shadow */}
      <ellipse cx="100" cy="213" rx="52" ry="6" fill={PLUM} opacity="0.1" />

      {/* feet */}
      <ellipse cx="68" cy="204" rx="19" ry="12" fill={PLUM} />
      <ellipse cx="132" cy="204" rx="19" ry="12" fill={PLUM} />
      <circle cx="68" cy="203" r="5" fill={PINK_SOFT} />
      <circle cx="132" cy="203" r="5" fill={PINK_SOFT} />

      {/* body */}
      <ellipse cx="100" cy="168" rx="58" ry="45" fill="white" stroke={PLUM} strokeWidth="4" />
      <ellipse cx="100" cy="176" rx="34" ry="26" fill={BELLY} />

      {/* arms */}
      {!armsUp && <ellipse cx="48" cy="166" rx="14" ry="25" transform="rotate(25 48 166)" fill={PLUM} />}
      {mood !== "wave" && !(armsUp && coverRight) && (
        <ellipse cx="152" cy="166" rx="14" ry="25" transform="rotate(-25 152 166)" fill={PLUM} />
      )}

      {/* scarf */}
      <path d="M50 130 Q100 156 150 130 L152 142 Q100 168 48 142 Z" fill={PINK} />
      <path d="M128 146 L140 172 L126 170 L118 150 Z" fill={PINK} />

      {/* ears */}
      <circle cx="50" cy="40" r="23" fill={PLUM} />
      <circle cx="150" cy="40" r="23" fill={PLUM} />
      <circle cx="50" cy="40" r="10" fill={PINK_SOFT} />
      <circle cx="150" cy="40" r="10" fill={PINK_SOFT} />

      {/* head */}
      <ellipse cx="100" cy="88" rx="73" ry="62" fill="white" stroke={PLUM} strokeWidth="4" />

      {/* bow */}
      <g transform="translate(128 30) rotate(18)">
        <path d="M0 0 L-14 -9 L-14 9 Z" fill={PINK} />
        <path d="M0 0 L14 -9 L14 9 Z" fill={PINK} />
        <circle r="4.5" fill={PINK_SOFT} />
      </g>

      {/* waving arm — drawn over the head edge so it stays visible */}
      {mood === "wave" && (
        <g className="animate-wave" style={{ transformOrigin: "150px 150px" }}>
          <ellipse cx="180" cy="128" rx="14" ry="26" transform="rotate(-30 180 128)" fill={PLUM} />
          <circle cx="186" cy="112" r="5" fill={PINK_SOFT} />
        </g>
      )}

      {/* eye patches */}
      <ellipse cx="70" cy="88" rx="17" ry="22" transform="rotate(-25 70 88)" fill={PLUM} />
      <ellipse cx="130" cy="88" rx="17" ry="22" transform="rotate(25 130 88)" fill={PLUM} />

      {/* eyes */}
      {mood === "happy" || mood === "wave" ? (
        <g stroke="white" strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M62 90 Q71 79 80 90" />
          <path d="M120 90 Q129 79 138 90" />
        </g>
      ) : (
        <>
          {!coverLeft && <Eye cx={72} cy={87} sad={mood === "sad"} />}
          {!coverRight && <Eye cx={128} cy={87} sad={mood === "sad"} />}
        </>
      )}
      {mood === "sad" && (
        <g stroke="white" strokeWidth="3" strokeLinecap="round">
          <path d="M60 70 L78 76" />
          <path d="M140 70 L122 76" />
        </g>
      )}

      {/* cheeks */}
      <ellipse cx="50" cy="110" rx="12" ry="7" fill={PINK} opacity="0.5" />
      <ellipse cx="150" cy="110" rx="12" ry="7" fill={PINK} opacity="0.5" />

      {/* nose */}
      <path d="M92 101 Q100 96 108 101 Q105 109 100 110 Q95 109 92 101 Z" fill={PLUM} />

      {/* mouth */}
      {mood === "sad" ? (
        <path d="M89 123 Q100 114 111 123" stroke={PLUM} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      ) : mood === "happy" || mood === "wave" ? (
        <>
          <path d="M88 114 Q100 132 112 114 Z" fill={PLUM} />
          <path d="M94 121 Q100 128 106 121 Q100 118 94 121 Z" fill={PINK} />
        </>
      ) : (
        <path d="M89 114 Q94.5 121 100 114 Q105.5 121 111 114" stroke={PLUM} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      )}

      {/* paws over the eyes */}
      {coverLeft && <Paw cx={70} cy={90} />}
      {coverRight && <Paw cx={130} cy={90} />}
    </svg>
  );
}

function Eye({ cx, cy, sad }: { cx: number; cy: number; sad?: boolean }) {
  return (
    <g className="animate-blink" style={{ transformOrigin: `${cx}px ${cy}px` }}>
      <circle cx={cx} cy={cy} r={sad ? 7 : 8.5} fill="white" />
      <circle cx={cx + 1} cy={cy + (sad ? 2 : 1)} r={sad ? 3.5 : 4.8} fill={PLUM} />
      <circle cx={cx + 3} cy={cy - 2} r="1.8" fill="white" />
    </g>
  );
}

function Paw({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx="22" ry="19" fill={PLUM} />
      <ellipse cx={cx} cy={cy + 4} rx="8" ry="6" fill={PINK_SOFT} />
      <circle cx={cx - 9} cy={cy - 7} r="3.2" fill={PINK_SOFT} />
      <circle cx={cx} cy={cy - 10} r="3.2" fill={PINK_SOFT} />
      <circle cx={cx + 9} cy={cy - 7} r="3.2" fill={PINK_SOFT} />
    </g>
  );
}

/** Rounded speech bubble that pops in whenever it re-mounts (give it a `key`). */
export function SpeechBubble({
  children,
  className,
  tail = "bottom",
}: {
  children: React.ReactNode;
  className?: string;
  tail?: "bottom" | "left";
}) {
  return (
    <div
      className={cn(
        "relative w-fit max-w-[260px] animate-bubble-in rounded-3xl border-2 border-plum/10 bg-white px-5 py-3 text-center text-base font-extrabold leading-snug text-plum shadow-chunky-white",
        className,
      )}
    >
      {children}
      <svg
        aria-hidden
        width="22"
        height="13"
        viewBox="0 0 22 13"
        className={cn(
          "absolute",
          tail === "bottom" ? "-bottom-[11px] left-1/2 -translate-x-1/2" : "-left-[15px] top-1/2 -translate-y-1/2 rotate-90",
        )}
      >
        <path d="M0 0 L11 12 L22 0 Z" fill="white" />
        <path d="M1 0 L11 11 L21 0" fill="none" stroke="rgba(43,45,66,0.1)" strokeWidth="2" />
      </svg>
    </div>
  );
}
