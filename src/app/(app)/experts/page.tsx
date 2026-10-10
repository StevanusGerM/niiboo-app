import type { Metadata } from "next";
import { BookingPanel } from "@/components/experts/BookingPanel";
import { PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Sesi Live dengan Pakar" };

export default function ExpertsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Human Expert"
        title="Sesi Zoom 1-on-1"
        description="Gunakan token untuk memesan sesi live dengan pengajar bersertifikat. Link Zoom dikirim setelah pengajar mengonfirmasi jadwal."
      />
      <BookingPanel />
    </>
  );
}
