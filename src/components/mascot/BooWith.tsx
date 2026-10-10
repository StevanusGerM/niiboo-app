import { cn } from "@/lib/utils";
import { Boo, type BooMood } from "./Boo";
import { Sticker, type StickerName } from "./Stickers";

/** Boo holding / next to a prop sticker — quick themed illustrations for each page. */
export function BooWith({
  prop,
  mood = "happy",
  size = 120,
  float,
  className,
  side = "right",
}: {
  prop: StickerName;
  mood?: BooMood;
  size?: number;
  float?: boolean;
  className?: string;
  side?: "left" | "right";
}) {
  const propSize = Math.round(size * 0.48);
  // Outer element takes the caller's positioning classes (e.g. `absolute`);
  // the inner one is the positioning context for the prop sticker.
  return (
    <div className={cn("inline-block", float && "animate-float", className)}>
      <div className="relative" style={{ width: size, height: (size * 220) / 200 }}>
        <Boo mood={mood} size={size} />
        <Sticker
          name={prop}
          size={propSize}
          rotate={side === "right" ? 12 : -12}
          className={cn("absolute bottom-[8%]", side === "right" ? "-right-[14%]" : "-left-[14%]")}
        />
      </div>
    </div>
  );
}
