import { CapsuleNav } from "@/components/layout/CapsuleNav";
import { TopBar } from "@/components/layout/TopBar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-6xl px-4 pb-36 pt-4 sm:px-6">{children}</main>
      <CapsuleNav />
    </>
  );
}
