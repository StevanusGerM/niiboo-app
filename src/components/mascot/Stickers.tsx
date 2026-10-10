import { cn } from "@/lib/utils";

/**
 * Cartoon sticker set (pure SVG, 100×100 viewBox) with a chunky plum outline
 * so they match Boo. Many have little kawaii faces.
 */

const P = "#2B2D42"; // outline
const SW = 4; // outline width

export type StickerName =
  | "lantern"
  | "baozi"
  | "bamboo"
  | "cloud"
  | "tea"
  | "star"
  | "book"
  | "headphones"
  | "pencil"
  | "trophy"
  | "heart"
  | "sparkle";

function Face({ x, y, s = 1, blush = "#FF6584" }: { x: number; y: number; s?: number; blush?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle cx="-9" cy="0" r="3" fill={P} />
      <circle cx="9" cy="0" r="3" fill={P} />
      <circle cx="-8" cy="-1" r="1" fill="white" />
      <circle cx="10" cy="-1" r="1" fill="white" />
      <path d="M-4 5 Q0 9 4 5" stroke={P} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="-15" cy="6" rx="4" ry="2.5" fill={blush} opacity="0.5" />
      <ellipse cx="15" cy="6" rx="4" ry="2.5" fill={blush} opacity="0.5" />
    </g>
  );
}

const ART: Record<StickerName, React.ReactNode> = {
  lantern: (
    <>
      <line x1="50" y1="2" x2="50" y2="14" stroke={P} strokeWidth={SW} strokeLinecap="round" />
      <rect x="36" y="12" width="28" height="9" rx="3" fill="#FFC94A" stroke={P} strokeWidth={SW} />
      <ellipse cx="50" cy="50" rx="34" ry="30" fill="#FF6584" stroke={P} strokeWidth={SW} />
      <path d="M38 22 Q28 50 38 78 M62 22 Q72 50 62 78" stroke="#E94E6F" strokeWidth="3" fill="none" />
      <rect x="36" y="78" width="28" height="9" rx="3" fill="#FFC94A" stroke={P} strokeWidth={SW} />
      <path d="M44 87 L44 97 M50 87 L50 99 M56 87 L56 97" stroke="#FFC94A" strokeWidth="3.5" strokeLinecap="round" />
      <Face x={50} y={50} />
    </>
  ),
  baozi: (
    <>
      <path d="M38 18 Q34 10 40 4 M52 16 Q48 8 54 2 M64 18 Q60 10 66 4" stroke="#C9C3CF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M10 70 Q10 30 50 26 Q90 30 90 70 Q90 88 50 88 Q10 88 10 70 Z" fill="#FFF6EC" stroke={P} strokeWidth={SW} />
      <path d="M50 26 Q44 36 50 42 Q56 36 50 26 M36 32 Q40 40 48 42 M64 32 Q60 40 52 42" stroke={P} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Face x={50} y={64} />
    </>
  ),
  bamboo: (
    <>
      <rect x="22" y="14" width="18" height="82" rx="8" fill="#3CCFA4" stroke={P} strokeWidth={SW} />
      <rect x="56" y="28" width="18" height="68" rx="8" fill="#5FDDB8" stroke={P} strokeWidth={SW} />
      <path d="M22 42 H40 M22 68 H40 M56 52 H74 M56 76 H74" stroke={P} strokeWidth="3" />
      <path d="M40 30 Q58 14 72 18 Q60 30 40 30 Z" fill="#22A882" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 44 Q88 34 96 40 Q86 50 74 44 Z" fill="#22A882" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      <path d="M22 56 Q8 48 4 54 Q12 62 22 56 Z" fill="#22A882" stroke={P} strokeWidth="3" strokeLinejoin="round" />
    </>
  ),
  cloud: (
    <>
      <path
        d="M24 76 Q6 76 8 60 Q10 46 26 48 Q28 28 48 28 Q66 28 70 44 Q90 42 92 60 Q94 76 76 76 Z"
        fill="white"
        stroke={P}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face x={50} y={58} s={0.9} />
    </>
  ),
  tea: (
    <>
      <path d="M38 22 Q32 14 38 6 M52 22 Q46 14 52 6" stroke="#C9C3CF" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M78 46 Q94 46 92 60 Q90 72 74 70" stroke={P} strokeWidth={SW} fill="none" />
      <path d="M14 34 H82 Q82 86 48 86 Q14 86 14 34 Z" fill="#DDEFFD" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M14 34 H82" stroke={P} strokeWidth={SW} />
      <ellipse cx="48" cy="38" rx="30" ry="4" fill="#3CCFA4" opacity="0.5" />
      <Face x={48} y={60} s={0.9} />
    </>
  ),
  star: (
    <>
      <path
        d="M50 6 L62 36 L94 38 L69 58 L77 90 L50 72 L23 90 L31 58 L6 38 L38 36 Z"
        fill="#FFC94A"
        stroke={P}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face x={50} y={52} s={0.85} />
    </>
  ),
  book: (
    <>
      <path d="M50 24 Q30 12 8 18 V84 Q30 78 50 90 Z" fill="#EDE7FF" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M50 24 Q70 12 92 18 V84 Q70 78 50 90 Z" fill="#A78BFA" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M18 36 Q30 32 40 38 M18 50 Q30 46 40 52 M18 64 Q30 60 40 66" stroke="#A78BFA" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x="71" y="62" textAnchor="middle" fontSize="26" fontWeight="700" fill="white" fontFamily="var(--font-noto-sc), sans-serif">
        书
      </text>
    </>
  ),
  headphones: (
    <>
      <path d="M18 60 V48 Q18 14 50 14 Q82 14 82 48 V60" stroke={P} strokeWidth="8" fill="none" strokeLinecap="round" />
      <path d="M18 60 V48 Q18 14 50 14 Q82 14 82 48 V60" stroke="#5AB4F5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="8" y="52" width="24" height="36" rx="10" fill="#5AB4F5" stroke={P} strokeWidth={SW} />
      <rect x="68" y="52" width="24" height="36" rx="10" fill="#5AB4F5" stroke={P} strokeWidth={SW} />
      <path d="M44 62 Q50 56 56 62 M40 70 Q50 60 60 70" stroke="#FF6584" strokeWidth="3" fill="none" strokeLinecap="round" />
    </>
  ),
  pencil: (
    <g transform="rotate(35 50 50)">
      <rect x="38" y="6" width="24" height="16" rx="5" fill="#FF8FA6" stroke={P} strokeWidth={SW} />
      <rect x="38" y="20" width="24" height="8" fill="#C9C3CF" stroke={P} strokeWidth={SW} />
      <rect x="38" y="28" width="24" height="48" fill="#FFC94A" stroke={P} strokeWidth={SW} />
      <path d="M38 76 L50 98 L62 76 Z" fill="#FFE2B8" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M46 91 L50 98 L54 91 Z" fill={P} />
    </g>
  ),
  trophy: (
    <>
      <path d="M26 22 Q6 22 10 40 Q14 54 30 52 M74 22 Q94 22 90 40 Q86 54 70 52" stroke={P} strokeWidth={SW} fill="none" />
      <path d="M24 12 H76 V40 Q76 66 50 66 Q24 66 24 40 Z" fill="#FFC94A" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <rect x="42" y="66" width="16" height="12" fill="#E9A825" stroke={P} strokeWidth={SW} />
      <rect x="28" y="78" width="44" height="14" rx="4" fill="#FF6584" stroke={P} strokeWidth={SW} />
      <Face x={50} y={36} s={0.85} />
    </>
  ),
  heart: (
    <>
      <path
        d="M50 88 Q10 62 10 36 Q10 14 30 14 Q44 14 50 28 Q56 14 70 14 Q90 14 90 36 Q90 62 50 88 Z"
        fill="#FF6584"
        stroke={P}
        strokeWidth={SW}
        strokeLinejoin="round"
      />
      <Face x={50} y={46} s={0.9} blush="#FFFFFF" />
    </>
  ),
  sparkle: (
    <>
      <path d="M50 4 Q56 44 96 50 Q56 56 50 96 Q44 56 4 50 Q44 44 50 4 Z" fill="#FFC94A" stroke={P} strokeWidth={SW} strokeLinejoin="round" />
    </>
  ),
};

export function Sticker({
  name,
  size = 64,
  className,
  float,
  rotate = 0,
}: {
  name: StickerName;
  size?: number;
  className?: string;
  float?: boolean;
  rotate?: number;
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      className={cn("shrink-0 overflow-visible drop-shadow-sm", float && "animate-float-slow", className)}
      style={{ ["--r" as string]: `${rotate}deg`, transform: float ? undefined : `rotate(${rotate}deg)` }}
    >
      {ART[name]}
    </svg>
  );
}

/** Xiao Long 小龙 — Boo's little dragon friend (boss exams, HSK). */
export function Dragon({ size = 160, mood = "happy", className, float }: { size?: number; mood?: "happy" | "fierce"; className?: string; float?: boolean }) {
  const G = "#3CCFA4";
  const GD = "#22A882";
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      role="img"
      aria-label="Xiao Long si naga kecil"
      className={cn("shrink-0 overflow-visible", float && "animate-float", className)}
    >
      <ellipse cx="100" cy="192" rx="56" ry="6" fill={P} opacity="0.1" />
      {/* tail */}
      <path d="M150 160 Q190 150 186 118 Q184 104 172 108 Q178 130 146 140 Z" fill={G} stroke={P} strokeWidth={SW} strokeLinejoin="round" />
      <path d="M180 112 L194 100 L188 120 Z" fill="#FFC94A" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      {/* body */}
      <ellipse cx="100" cy="150" rx="54" ry="40" fill={G} stroke={P} strokeWidth={SW} />
      <ellipse cx="100" cy="158" rx="32" ry="26" fill="#D7F7EC" />
      <path d="M78 146 H122 M80 160 H120 M84 174 H116" stroke={GD} strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      {/* feet */}
      <ellipse cx="72" cy="186" rx="16" ry="9" fill={GD} stroke={P} strokeWidth="3" />
      <ellipse cx="128" cy="186" rx="16" ry="9" fill={GD} stroke={P} strokeWidth="3" />
      {/* arms */}
      <ellipse cx="54" cy="150" rx="11" ry="18" transform="rotate(30 54 150)" fill={G} stroke={P} strokeWidth="3" />
      <ellipse cx="146" cy="146" rx="11" ry="18" transform="rotate(-40 146 146)" fill={G} stroke={P} strokeWidth="3" />
      {/* horns */}
      <path d="M66 34 Q56 8 70 4 Q72 22 80 30 Z" fill="#FFC94A" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      <path d="M134 34 Q144 8 130 4 Q128 22 120 30 Z" fill="#FFC94A" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      {/* head */}
      <ellipse cx="100" cy="70" rx="58" ry="48" fill={G} stroke={P} strokeWidth={SW} />
      {/* spikes */}
      <path d="M84 24 L92 10 L100 24 L108 10 L116 24" fill="#FF8FA6" stroke={P} strokeWidth="3" strokeLinejoin="round" />
      {/* snout */}
      <ellipse cx="100" cy="88" rx="30" ry="20" fill="#D7F7EC" stroke={P} strokeWidth="3" />
      <ellipse cx="90" cy="84" rx="3" ry="4" fill={P} />
      <ellipse cx="110" cy="84" rx="3" ry="4" fill={P} />
      {/* eyes */}
      {mood === "happy" ? (
        <g stroke={P} strokeWidth="4.5" strokeLinecap="round" fill="none">
          <path d="M64 62 Q72 52 80 62" />
          <path d="M120 62 Q128 52 136 62" />
        </g>
      ) : (
        <g>
          <circle cx="72" cy="60" r="10" fill="white" stroke={P} strokeWidth="3" />
          <circle cx="128" cy="60" r="10" fill="white" stroke={P} strokeWidth="3" />
          <circle cx="74" cy="62" r="5" fill={P} />
          <circle cx="126" cy="62" r="5" fill={P} />
          <path d="M60 46 L82 52 M140 46 L118 52" stroke={P} strokeWidth="4" strokeLinecap="round" />
        </g>
      )}
      <ellipse cx="56" cy="78" rx="9" ry="5" fill="#FF6584" opacity="0.5" />
      <ellipse cx="144" cy="78" rx="9" ry="5" fill="#FF6584" opacity="0.5" />
      {/* mouth */}
      <path d="M90 98 Q100 106 110 98" stroke={P} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      {mood === "fierce" && <path d="M95 101 L97 106 L99 101 M101 101 L103 106 L105 101" fill="white" stroke={P} strokeWidth="1.5" />}
    </svg>
  );
}
