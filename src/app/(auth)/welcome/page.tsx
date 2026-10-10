import type { Metadata } from "next";
import { WelcomeScreen } from "@/components/auth/WelcomeScreen";

export const metadata: Metadata = { title: "Selamat datang" };

export default function WelcomePage() {
  return <WelcomeScreen />;
}
