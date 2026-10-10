import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Card */

type Tone = "white" | "pink" | "peach" | "rose" | "plum" | "gradient" | "mint" | "ocean" | "lilac" | "sunny";

const toneClasses: Record<Tone, string> = {
  white: "bg-white text-plum",
  pink: "bg-blossom text-white",
  peach: "bg-peach text-plum",
  rose: "bg-rose text-plum",
  plum: "bg-plum text-cream",
  gradient: "bg-blossom-gradient text-white",
  mint: "bg-mint-light text-plum",
  ocean: "bg-ocean-light text-plum",
  lilac: "bg-lilac-light text-plum",
  sunny: "bg-sunny-light text-plum",
};

export function BentoCard({
  tone = "white",
  className,
  children,
  ...rest
}: { tone?: Tone } & ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-bento p-5 shadow-soft ring-1 ring-plum/5 sm:p-6",
        toneClasses[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

/* -------------------------------------------------------------- Button */

type Variant = "primary" | "secondary" | "ghost" | "dark";
const variantClasses: Record<Variant, string> = {
  primary: "bg-blossom text-white hover:bg-blossom-dark shadow-glow",
  secondary: "bg-white text-plum ring-1 ring-plum/10 hover:bg-rose/60",
  ghost: "bg-transparent text-plum hover:bg-plum/5",
  dark: "bg-plum text-cream hover:bg-plum/90",
};
const base =
  "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blossom/30";

export function Button({ variant = "primary", className, ...rest }: { variant?: Variant } & ComponentProps<"button">) {
  return <button className={cn(base, variantClasses[variant], className)} {...rest} />;
}

export function ButtonLink({
  variant = "primary",
  className,
  ...rest
}: { variant?: Variant } & ComponentProps<typeof Link>) {
  return <Link className={cn(base, variantClasses[variant], className)} {...rest} />;
}

/* --------------------------------------------------------------- Badge */

export function Badge({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-plum/5 px-3 py-1 text-xs font-bold uppercase tracking-wide",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function HskBadge({ level, className }: { level: number; className?: string }) {
  return <Badge className={cn("bg-rose text-blossom-dark", className)}>HSK {level}</Badge>;
}

/* -------------------------------------------------------- ProgressRing */

export function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  track = "rgba(43,45,66,0.08)",
  color = "#FF6584",
  children,
}: {
  value: number; // 0–100
  size?: number;
  stroke?: number;
  track?: string;
  color?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (pct / 100) * c}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-plum/10", className)}>
      <div
        className="h-full rounded-full bg-blossom-gradient transition-all duration-500"
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

/* ---------------------------------------------------------- PageHeader */

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  illustration,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  /** Cartoon shown on the right of the header (hidden on very small screens). */
  illustration?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex items-end gap-4">
        {illustration && <div className="order-last shrink-0 sm:hidden">{illustration}</div>}
        <div className="min-w-0 flex-1">
        {eyebrow && <p className="mb-1 text-xs font-extrabold uppercase tracking-[0.2em] text-blossom">{eyebrow}</p>}
        <h1 className="text-3xl font-extrabold tracking-tight text-plum sm:text-4xl">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-plum-soft">{description}</p>}
        </div>
      </div>
      {action}
      {illustration && <div className="hidden shrink-0 sm:block">{illustration}</div>}
    </header>
  );
}
