"use client";

import { useEffect, useRef, useState } from "react";
import { Info, Lightbulb, Mic, RotateCcw, SendHorizontal, Sparkles, Volume2, Wand2 } from "lucide-react";
import { Boo } from "@/components/mascot/Boo";
import { BooWith } from "@/components/mascot/BooWith";
import { Sticker } from "@/components/mascot/Stickers";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, HskBadge, PageHeader } from "@/components/ui";
import { createRecognizer, explainSpeechError, isRecognitionSupported, speakZh } from "@/lib/speech";
import { scenarios, type Line } from "@/lib/tutor/scenarios";
import type { TutorResponse } from "@/lib/tutor/engine";
import { cn } from "@/lib/utils";

type Msg =
  | { role: "ai"; line: Line; note?: string; suggestions?: string[] }
  | { role: "user"; text: string }
  | { role: "feedback"; feedback: NonNullable<TutorResponse["feedback"]> };

/** "free" = open conversation on any topic (AI). The rest are optional roleplay starters. */
interface Mode {
  id: string;
  title: string;
  title_zh: string;
  level?: number;
  emoji: string;
  opener: Line;
  steps?: number;
}

const FREE: Mode = {
  id: "free",
  title: "Ngobrol bebas",
  title_zh: "自由聊天",
  emoji: "💬",
  opener: {
    zh: "你好！我是Boo老师。今天你想聊什么？",
    pinyin: "Nǐ hǎo! Wǒ shì Boo lǎoshī. Jīntiān nǐ xiǎng liáo shénme?",
    id: "Halo! Aku Boo Laoshi. Hari ini kamu mau ngobrol tentang apa? Boleh topik apa saja!",
  },
};

const MODES: Mode[] = [
  FREE,
  ...scenarios.map((s) => ({
    id: s.id,
    title: s.title,
    title_zh: s.title_zh,
    level: s.level,
    emoji: s.emoji,
    opener: s.steps[0].ai,
    steps: s.steps.length,
  })),
];

const STARTERS = ["我喜欢玩游戏。", "你喜欢吃什么？", "\"terima kasih\" bahasa Mandarinnya apa?", "wo3 jin1tian1 hen3 lei4"];

export function TutorChat() {
  const { recordActivity, profile } = useUser();
  const [mode, setMode] = useState<Mode>(FREE);
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", line: FREE.opener }]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [micOk, setMicOk] = useState(false);
  const [recording, setRecording] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMicOk(isRecognitionSupported());
    fetch("/api/tutor")
      .then((r) => r.json())
      .then((d: { ai: boolean }) => setAiEnabled(d.ai))
      .catch(() => setAiEnabled(false));
  }, []);

  const begin = (m: Mode) => {
    setMode(m);
    setStep(0);
    setDone(false);
    setMessages([{ role: "ai", line: m.opener }]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || pending || done) return;
    // Conversation so far, as plain text, for the AI engine.
    const history = messages.flatMap((m) =>
      m.role === "user" ? [{ role: "user", text: m.text }] : m.role === "ai" ? [{ role: "tutor", text: m.line.zh }] : [],
    );
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setPending(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: mode.id, step, message, history, level: profile.current_hsk_level }),
      });
      if (res.status === 429) {
        const { error } = (await res.json()) as { error: string };
        throw new Error(error);
      }
      if (!res.ok) throw new Error();
      const data = (await res.json()) as TutorResponse;
      setMessages((m) => [
        ...m,
        ...(data.feedback ? [{ role: "feedback" as const, feedback: data.feedback }] : []),
        { role: "ai" as const, line: data.reply, note: data.note, suggestions: data.suggestions },
      ]);
      if (data.nextStep > step) recordActivity(5);
      setStep(data.nextStep);
      setDone(data.done);
    } catch (e) {
      const text = e instanceof Error && e.message ? e.message : "Koneksi bermasalah, coba lagi.";
      setMessages((m) => [...m, { role: "ai", line: { zh: "哎呀！", pinyin: "Āiyā!", id: text } }]);
    } finally {
      setPending(false);
    }
  };

  const dictate = () => {
    const rec = createRecognizer();
    if (!rec) return;
    rec.onresult = (e) => setInput(e.results[e.results.length - 1][0].transcript);
    rec.onend = () => setRecording(false);
    rec.onerror = (e) => {
      setRecording(false);
      if (e.error === "aborted" || e.error === "no-speech") return;
      const p = explainSpeechError(e.error);
      setMessages((m) => [...m, { role: "ai", line: { zh: "🎙️", pinyin: "", id: `${p.title}. ${p.steps[0]}` } }]);
    };
    setRecording(true);
    try {
      rec.start();
    } catch {
      setRecording(false);
    }
  };

  const lastAiIndex = messages.map((m) => m.role).lastIndexOf("ai");
  const freeWithoutAi = mode.id === "free" && aiEnabled === false;

  return (
    <>
      <PageHeader
        eyebrow="AI Smart Tutor"
        title="Ngobrol bareng Boo Laoshi"
        description="Bebas bahas apa saja — hobi, sekolah, game, atau tanya tata bahasa. Tulis dalam 汉字, pinyin (boleh angka nada, mis. ni3 hao3), atau bahasa Indonesia. Boo akan membalas sesuai levelmu dan mengoreksi nadamu."
        illustration={<BooWith prop="tea" mood="wave" size={110} />}
      />
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)] [&>*]:min-w-0">
        {/* Mode picker */}
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {MODES.map((m) => {
            const active = m.id === mode.id;
            const free = m.id === "free";
            return (
              <button
                key={m.id}
                onClick={() => begin(m)}
                className={cn(
                  "flex min-w-[220px] items-center gap-3 rounded-3xl border-2 p-4 text-left transition active:translate-y-[3px] lg:min-w-0",
                  active
                    ? free
                      ? "border-lilac bg-lilac text-white shadow-chunky-lilac"
                      : "border-plum bg-plum text-cream shadow-chunky-plum"
                    : "border-plum/10 bg-white shadow-chunky-white hover:-translate-y-0.5",
                )}
              >
                <span className={cn("grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl", free ? "bg-lilac-light" : "bg-rose")}>
                  {m.emoji}
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-black">{m.title}</span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="font-hanzi opacity-70">{m.title_zh}</span>
                    {m.level ? (
                      <HskBadge level={m.level} className="px-2 py-0.5 text-[10px]" />
                    ) : (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-black uppercase", active ? "bg-white/25" : "bg-lilac-light text-lilac-dark")}>
                        Topik apa saja
                      </span>
                    )}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Chat */}
        <BentoCard className="flex h-[72vh] min-h-[500px] flex-col p-0 sm:p-0">
          <div className="flex items-center justify-between gap-2 border-b border-plum/5 px-4 py-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-rose">
                <Boo mood={pending ? "idle" : "happy"} size={46} className="mt-3" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-black">Boo Laoshi · 包老师</p>
                <p className="flex items-center gap-1.5 truncate text-xs font-bold text-plum-soft">
                  {aiEnabled ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-mint-light px-2 py-0.5 text-mint-dark">
                      <Sparkles className="h-3 w-3" /> AI aktif
                    </span>
                  ) : aiEnabled === false ? (
                    <span className="rounded-full bg-sunny-light px-2 py-0.5 text-[#9A6B00]">Mode simulasi</span>
                  ) : null}
                  {mode.id === "free" ? "Ngobrol bebas" : `${mode.title}${!aiEnabled && mode.steps ? ` · ${Math.min(step + 1, mode.steps)}/${mode.steps}` : ""}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => setShowPinyin((v) => !v)}
                className={cn("rounded-full px-3 py-1.5 text-xs font-bold", showPinyin ? "bg-rose text-blossom-dark" : "bg-cream")}
              >
                Pinyin
              </button>
              <button onClick={() => begin(mode)} className="rounded-full bg-cream p-2" aria-label="Mulai ulang">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
            {/* playful backdrop */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.12]">
              <Sticker name="cloud" size={90} className="absolute -left-4 top-6" />
              <Sticker name="lantern" size={60} className="absolute right-4 top-24" rotate={10} />
              <Sticker name="bamboo" size={80} className="absolute bottom-6 right-2" />
            </div>

            {freeWithoutAi && (
              <div className="relative mx-auto max-w-md rounded-3xl border-2 border-dashed border-sunny bg-sunny-light/60 p-3 text-center text-xs font-bold text-plum">
                Ngobrol bebas memakai AI. Admin perlu menambahkan <code className="rounded bg-white px-1">ANTHROPIC_API_KEY</code> di server.
                Sementara itu, Boo masih bisa mengecek nada pinyin-mu.
              </div>
            )}

            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="relative ml-auto w-fit max-w-[80%] rounded-3xl rounded-br-lg bg-blossom px-4 py-3 font-hanzi text-white shadow-chunky-pink">
                    {m.text}
                  </div>
                );
              }
              if (m.role === "ai") {
                return (
                  <div key={i} className="relative flex max-w-[90%] items-end gap-2">
                    <span className="hidden h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-rose sm:grid">
                      <Boo mood="idle" size={36} className="mt-2.5" />
                    </span>
                    <div className="min-w-0">
                      <div className="w-fit rounded-3xl rounded-bl-lg border-2 border-plum/5 bg-cream px-4 py-3">
                        <div className="flex items-start gap-2">
                          <p className="font-hanzi text-lg font-medium">{m.line.zh}</p>
                          <button onClick={() => speakZh(m.line.zh)} aria-label="Dengarkan" className="mt-1 shrink-0 text-blossom">
                            <Volume2 className="h-4 w-4" />
                          </button>
                        </div>
                        {showPinyin && m.line.pinyin && <p className="text-sm font-semibold text-blossom-dark">{m.line.pinyin}</p>}
                        <p className="text-sm text-plum-soft">{m.line.id}</p>
                        {m.note && (
                          <p className="mt-2 flex gap-1.5 rounded-2xl bg-ocean-light px-3 py-2 text-sm text-plum">
                            <Info className="mt-0.5 h-4 w-4 shrink-0 text-ocean-dark" /> {m.note}
                          </p>
                        )}
                      </div>
                      {i === lastAiIndex && !pending && m.suggestions && m.suggestions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {m.suggestions.map((s) => (
                            <button
                              key={s}
                              onClick={() => void send(s)}
                              className="rounded-full border-2 border-lilac/40 bg-white px-3 py-1.5 font-hanzi text-sm font-semibold text-lilac-dark transition hover:bg-lilac-light"
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
              const f = m.feedback;
              const tone = {
                praise: "border-mint bg-mint-light",
                tone: "border-sunny bg-sunny-light",
                grammar: "border-ocean bg-ocean-light",
                hint: "border-peach bg-peach/10",
              }[f.kind];
              return (
                <div key={i} className={cn("relative mx-auto w-full max-w-md rounded-3xl border-2 border-dashed px-4 py-3 text-sm", tone)}>
                  <p className="flex items-center gap-1 font-black">
                    {f.kind === "hint" ? (
                      <Lightbulb className="h-4 w-4 text-peach" />
                    ) : f.kind === "grammar" ? (
                      <Wand2 className="h-4 w-4 text-ocean-dark" />
                    ) : (
                      <Sparkles className="h-4 w-4 text-blossom" />
                    )}
                    {f.kind === "tone" ? "Koreksi nada" : f.kind === "hint" ? "Petunjuk" : f.kind === "grammar" ? "Koreksi kalimat" : f.text}
                  </p>
                  {f.kind !== "praise" && <p className="mt-1 text-plum-soft">{f.text}</p>}
                  {f.toned && <p className="mt-1 text-base font-bold text-blossom-dark">{f.toned}</p>}
                  {f.notes && f.notes.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {f.notes.map((n, j) => (
                        <li key={j} className="flex flex-wrap items-center gap-x-2">
                          <span className="text-plum-soft line-through decoration-blossom">{n.written}</span>→
                          <span className="font-bold">{n.correct}</span>
                          <span className="font-hanzi">{n.hanzi}</span>
                          <span className="text-plum-soft">({n.meaning})</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {f.suggestion && (
                    <button onClick={() => setInput(f.suggestion!.zh)} className="mt-2 block text-left hover:underline">
                      <span className="font-hanzi text-base font-bold">{f.suggestion.zh}</span>{" "}
                      <span className="text-blossom-dark">{f.suggestion.pinyin}</span>
                      <span className="block text-plum-soft">{f.suggestion.id} · ketuk untuk memakai</span>
                    </button>
                  )}
                </div>
              );
            })}

            {/* Starter ideas before the learner says anything */}
            {messages.length === 1 && mode.id === "free" && (
              <div className="relative flex flex-wrap gap-2 pl-0 sm:pl-11">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="rounded-full border-2 border-plum/10 bg-white px-3 py-1.5 text-sm font-bold text-plum-soft transition hover:border-lilac hover:text-lilac-dark"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {pending && (
              <div className="relative flex items-end gap-2">
                <span className="hidden h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-rose sm:grid">
                  <Boo mood="idle" size={36} className="mt-2.5" />
                </span>
                <div className="flex w-fit gap-1 rounded-3xl bg-cream px-4 py-4">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-plum/40" style={{ animationDelay: `${d * 120}ms` }} />
                  ))}
                </div>
              </div>
            )}
            {done && (
              <div className="relative mx-auto w-fit rounded-full bg-plum px-4 py-2 text-sm font-bold text-cream">
                🎉 Roleplay selesai!{" "}
                <button className="underline" onClick={() => begin(mode)}>
                  Main lagi
                </button>{" "}
                ·{" "}
                <button className="underline" onClick={() => begin(FREE)}>
                  Ngobrol bebas
                </button>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-plum/5 p-3"
          >
            {micOk && (
              <button
                type="button"
                onClick={dictate}
                className={cn("grid h-11 w-11 shrink-0 place-items-center rounded-full bg-cream", recording && "animate-pulse bg-rose text-blossom")}
                aria-label="Bicara"
              >
                <Mic className="h-5 w-5" />
              </button>
            )}
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={done}
              maxLength={500}
              placeholder={done ? "Pilih mode lain atau main lagi" : "Tulis apa saja: 汉字, pinyin, atau bahasa Indonesia…"}
              className="min-w-0 flex-1 rounded-full bg-cream px-5 py-3 font-hanzi outline-none ring-blossom/30 placeholder:font-sans placeholder:text-plum-soft/70 focus:ring-4"
            />
            <Button type="submit" disabled={!input.trim() || pending || done} className="h-11 w-11 shrink-0 p-0" aria-label="Kirim">
              <SendHorizontal className="h-5 w-5" />
            </Button>
          </form>
        </BentoCard>
      </div>
    </>
  );
}
