import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { BooWith } from "@/components/mascot/BooWith";
import { Sticker, type StickerName } from "@/components/mascot/Stickers";
import { BentoCard, HskBadge, PageHeader } from "@/components/ui";
import { getStories } from "@/lib/data";

export const metadata: Metadata = { title: "Pembaca Paralel" };

const tones = ["lilac", "peach", "mint"] as const;
const stickers: StickerName[] = ["baozi", "lantern", "cloud", "tea", "bamboo"];

export default async function ReaderIndexPage() {
  const stories = await getStories();
  return (
    <>
      <PageHeader
        eyebrow="Parallel Reader"
        title="Baca cerita, pahami konteks"
        description="Teks Mandarin dan Indonesia berdampingan, audio bergaya karaoke, dan glosarium instan di setiap kata."
        illustration={<BooWith prop="headphones" mood="happy" size={110} />}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stories.map((s, i) => (
          <Link key={s.id} href={`/reader/${s.id}`} className="group">
            <BentoCard tone={tones[i % tones.length]} className="h-full transition group-hover:-translate-y-1">
              <Sticker
                name={stickers[i % stickers.length]}
                size={72}
                rotate={i % 2 ? 10 : -10}
                className="pointer-events-none absolute -right-2 -top-2 transition group-hover:scale-110"
              />
              <HskBadge level={s.hsk_level} className="bg-white/70" />
              <p className="mt-6 font-hanzi text-4xl font-bold">{s.title_zh}</p>
              <p className="mt-1 font-semibold text-plum-soft">{s.title_id}</p>
              <p className="mt-3 line-clamp-2 font-hanzi text-plum/70">{s.content_pairs.map((p) => p.zh).join("")}</p>
              <p className="mt-6 inline-flex items-center gap-1 text-sm font-bold text-blossom-dark">
                {s.content_pairs.length} kalimat · Mulai baca <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </BentoCard>
          </Link>
        ))}
      </div>
    </>
  );
}
