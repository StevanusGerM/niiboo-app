"use client";

import { useState } from "react";
import { Check, PartyPopper, RotateCcw, Volume2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, ProgressBar } from "@/components/ui";
import { speakZh } from "@/lib/speech";
import { cn } from "@/lib/utils";
import type { Lesson } from "@/types/database";

/**
 * Simple Leitner-style session: "Ulangi" sends the card to the back of the queue,
 * "Hafal" removes it. Score = cards known on the first try.
 */
export function Flashcards({ lesson }: { lesson: Lesson }) {
  const { completeLesson } = useUser();
  const vocab = lesson.content_json.vocab;
  const [queue, setQueue] = useState(() => vocab.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [missed, setMissed] = useState<Set<number>>(new Set());
  const [score, setScore] = useState<number | null>(null);

  const current = queue[0];
  const card = current !== undefined ? vocab[current] : undefined;
  const learned = vocab.length - queue.length;

  const next = (known: boolean) => {
    if (current === undefined) return;
    setFlipped(false);
    if (known) {
      const rest = queue.slice(1);
      setQueue(rest);
      if (rest.length === 0) {
        const s = Math.round(((vocab.length - missed.size) / vocab.length) * 100);
        setScore(s);
        void completeLesson(lesson.id, s);
      }
    } else {
      setMissed((m) => new Set(m).add(current));
      setQueue([...queue.slice(1), current]);
    }
  };

  const restart = () => {
    setQueue(vocab.map((_, i) => i));
    setMissed(new Set());
    setScore(null);
    setFlipped(false);
  };

  if (!card) {
    return (
      <BentoCard tone="gradient" className="p-8 text-center">
        <PartyPopper className="mx-auto h-12 w-12" />
        <p className="mt-3 text-3xl font-extrabold">Pelajaran selesai!</p>
        <p className="mt-1 text-white/90">
          Skor: {score}% · {vocab.length - missed.size} dari {vocab.length} kata langsung hafal
        </p>
        <Button variant="dark" className="mt-5" onClick={restart}>
          <RotateCcw className="h-4 w-4" /> Ulangi kartu
        </Button>
      </BentoCard>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <ProgressBar value={(learned / vocab.length) * 100} />
        <span className="shrink-0 text-sm font-bold text-plum-soft">
          {learned}/{vocab.length}
        </span>
      </div>

      <div className="[perspective:1200px]">
        <button
          onClick={() => setFlipped((f) => !f)}
          className={cn(
            "relative h-72 w-full rounded-bento-lg transition-transform duration-500 [transform-style:preserve-3d]",
            flipped && "[transform:rotateY(180deg)]",
          )}
          aria-label="Balik kartu"
        >
          <div className="absolute inset-0 grid place-items-center rounded-bento-lg bg-white shadow-soft ring-1 ring-plum/5 [backface-visibility:hidden]">
            <div>
              <p className="font-hanzi text-7xl font-bold sm:text-8xl">{card.hanzi}</p>
              <p className="mt-4 text-sm font-semibold text-plum-soft">Ketuk untuk melihat arti</p>
            </div>
          </div>
          <div className="absolute inset-0 grid place-items-center rounded-bento-lg bg-plum text-cream shadow-soft [backface-visibility:hidden] [transform:rotateY(180deg)]">
            <div>
              <p className="font-hanzi text-5xl font-bold">{card.hanzi}</p>
              <p className="mt-3 text-2xl font-bold text-peach">{card.pinyin}</p>
              <p className="mt-1 text-lg">{card.meaning}</p>
            </div>
          </div>
        </button>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={() => speakZh(card.hanzi, { rate: 0.75 })}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-white shadow-soft"
          aria-label="Dengarkan"
        >
          <Volume2 className="h-5 w-5 text-blossom" />
        </button>
        <Button variant="secondary" className="flex-1 py-3" onClick={() => next(false)}>
          <RotateCcw className="h-4 w-4" /> Ulangi
        </Button>
        <Button className="flex-1 py-3" onClick={() => next(true)}>
          <Check className="h-4 w-4" /> Hafal
        </Button>
      </div>
    </div>
  );
}
