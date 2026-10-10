import { FloatingHanzi } from "@/components/auth/FloatingHanzi";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden bg-cream">
      <FloatingHanzi />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
