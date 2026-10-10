import type { Metadata, Viewport } from "next";
import { Noto_Sans_SC, Nunito } from "next/font/google";
import { UserProvider } from "@/components/providers/UserProvider";
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800", "900"], variable: "--font-sans", display: "swap" });
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

export const viewport: Viewport = { themeColor: "#FF6584", width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${nunito.variable} ${notoSC.variable}`}>
      <body>
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
