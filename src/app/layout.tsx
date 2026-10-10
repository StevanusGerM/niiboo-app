import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Plus_Jakarta_Sans } from "next/font/google";
import { CapsuleNav } from "@/components/layout/CapsuleNav";
import { TopBar } from "@/components/layout/TopBar";
import { UserProvider } from "@/components/providers/UserProvider";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });
const notoSC = Noto_Sans_SC({
  weight: ["400", "500", "700"],
  variable: "--font-noto-sc",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: { default: "NiiBooo — Belajar Mandarin Jadi Seru", template: "%s · NiiBooo" },
  description:
    "Persiapan HSK 1–6, pembaca cerita paralel Mandarin–Indonesia, latihan menulis Hanzi, tutor AI, dan sesi live dengan pengajar.",
};

export const viewport: Viewport = { themeColor: "#FF6584" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${jakarta.variable} ${notoSC.variable}`}>
      <body>
        <UserProvider>
          <TopBar />
          <main className="mx-auto w-full max-w-6xl px-4 pb-36 pt-4 sm:px-6">{children}</main>
          <CapsuleNav />
        </UserProvider>
      </body>
    </html>
  );
}
