import { Boo, SpeechBubble } from "@/components/mascot/Boo";
import { BentoCard, ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <BentoCard className="mx-auto mt-10 flex max-w-md flex-col items-center p-10 text-center">
      <SpeechBubble>Aduh, Boo tersesat… 🐾</SpeechBubble>
      <Boo mood="sad" size={150} className="mt-3" />
      <p className="font-hanzi text-6xl font-bold text-blossom">迷路了</p>
      <p className="mt-2 text-sm font-semibold text-plum-soft">mí lù le — tersesat</p>
      <p className="mt-4 text-plum-soft">Halaman yang kamu cari tidak ditemukan.</p>
      <ButtonLink href="/" className="mt-6">
        Kembali ke beranda
      </ButtonLink>
    </BentoCard>
  );
}
