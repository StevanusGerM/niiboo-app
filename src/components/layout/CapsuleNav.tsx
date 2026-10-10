"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot, GraduationCap, House, Map as MapIcon, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Beranda", icon: House, match: ["/"] },
  // Lessons, stories and the practice room all live under the map.
  { href: "/journey", label: "Peta", icon: MapIcon, match: ["/journey", "/practice", "/learn", "/reader"] },
  { href: "/tutor", label: "Tutor AI", icon: Bot, match: ["/tutor"] },
  { href: "/hsk", label: "HSK", icon: GraduationCap, match: ["/hsk", "/placement"] },
  { href: "/experts", label: "Pakar", icon: Video, match: ["/experts"] },
];

export function CapsuleNav() {
  const pathname = usePathname();
  // Hide during a running exam to avoid accidental navigation.
  if (pathname.includes("/mock")) return null;

  return (
    <nav
      aria-label="Navigasi utama"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto flex w-[calc(100%-2rem)] max-w-xl items-center justify-between gap-1 rounded-full bg-plum/95 p-2 shadow-soft backdrop-blur sm:bottom-6"
    >
      {items.map(({ href, label, icon: Icon, match }) => {
        const active = href === "/" ? pathname === "/" : match.some((m) => pathname.startsWith(m));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            aria-label={label}
            title={label}
            className={cn(
              "flex min-w-0 items-center justify-center gap-1.5 rounded-full px-2 py-2.5 text-xs font-extrabold transition",
              active ? "flex-[2] bg-blossom text-white shadow-glow sm:flex-[1.3]" : "flex-1 text-cream/70 hover:bg-white/10 hover:text-cream",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.4} />
            {/* Phones: active label only. Tablets and up: every label. */}
            <span className={cn("truncate", !active && "hidden sm:inline")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
