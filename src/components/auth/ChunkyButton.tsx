import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "pink" | "plum" | "white";

const tones: Record<Tone, string> = {
  pink: "bg-blossom text-white shadow-chunky-pink hover:bg-[#FF7593]",
  plum: "bg-plum text-cream shadow-chunky-plum hover:bg-[#363851]",
  white: "bg-white text-blossom-dark ring-2 ring-plum/10 shadow-chunky-white hover:bg-rose/30",
};

const base =
  "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-base font-black uppercase tracking-wide transition-all duration-100 active:translate-y-[5px] active:shadow-none disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blossom/40";

/** Big, bouncy "3D" button used on the playful auth screens. */
export function ChunkyButton({ tone = "pink", className, ...rest }: { tone?: Tone } & ComponentProps<"button">) {
  return <button className={cn(base, tones[tone], className)} {...rest} />;
}

export function ChunkyLink({ tone = "pink", className, ...rest }: { tone?: Tone } & ComponentProps<typeof Link>) {
  return <Link className={cn(base, tones[tone], className)} {...rest} />;
}
