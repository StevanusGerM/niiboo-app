"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Bot, GraduationCap, House, PenLine, Video } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Beranda", icon: House },
  { href: "/learn", label: "Belajar", icon: PenLine },
  { href: "/reader", label: "Baca", icon: BookOpenText },
  { href: "/hsk", label: "HSK", icon: GraduationCap },
  { href: "/tutor", label: "Tutor AI", icon: Bot },
  { href: "/experts", label: "Pakar", icon: Video },
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
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 rounded-full px-1 py-2 text-[10px] font-bold transition sm:flex-row sm:justify-center sm:gap-1.5 sm:text-xs",
              active ? "bg-blossom text-white shadow-glow" : "text-cream/70 hover:bg-white/10 hover:text-cream",
            )}
          >
            <Icon className="h-5 w-5 shrink-0 sm:h-4 sm:w-4" strokeWidth={2.4} />
            <span className={cn("truncate", !active && "sm:hidden lg:inline")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
