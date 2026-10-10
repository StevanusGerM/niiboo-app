import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({ href = "/welcome", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)} aria-label="NiiBooo">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blossom-gradient font-hanzi text-xl font-bold text-white shadow-chunky-pink">
        你
      </span>
      <span className="text-2xl font-black tracking-tight text-plum">
        Nii<span className="text-blossom">Booo</span>
      </span>
    </Link>
  );
}
