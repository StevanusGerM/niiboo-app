import { BentoCard, ButtonLink } from "@/components/ui";

export default function NotFound() {
  return (
    <BentoCard className="mx-auto mt-10 max-w-md p-10 text-center">
      <p className="font-hanzi text-6xl font-bold text-blossom">迷路了</p>
      <p className="mt-2 text-sm font-semibold text-plum-soft">mí lù le — tersesat</p>
      <p className="mt-4 text-plum-soft">Halaman yang kamu cari tidak ditemukan.</p>
      <ButtonLink href="/" className="mt-6">
        Kembali ke beranda
      </ButtonLink>
    </BentoCard>
  );
}
