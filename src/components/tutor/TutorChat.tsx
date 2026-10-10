"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, Lightbulb, Mic, RotateCcw, SendHorizontal, Sparkles, Volume2 } from "lucide-react";
import { useUser } from "@/components/providers/UserProvider";
import { BentoCard, Button, HskBadge, PageHeader } from "@/components/ui";
import { createRecognizer, isRecognitionSupported, speakZh } from "@/lib/speech";
import { scenarios, type Line, type Scenario } from "@/lib/tutor/scenarios";
import type { TutorResponse } from "@/lib/tutor/engine";
import { cn } from "@/lib/utils";

type Msg =
  | { role: "ai"; line: Line }
  | { role: "user"; text: string }
  | { role: "feedback"; feedback: NonNullable<TutorResponse["feedback"]> };

export function TutorChat() {
  const { recordActivity } = useUser();
  const [scenario, setScenario] = useState<Scenario>(scenarios[0]);
  const [messages, setMessages] = useState<Msg[]>([{ role: "ai", line: scenarios[0].steps[0].ai }]);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [showPinyin, setShowPinyin] = useState(true);
  const [micOk, setMicOk] = useState(false);
  const [recording, setRecording] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMicOk(isRecognitionSupported()), []);

  const begin = (s: Scenario) => {
    setScenario(s);
    setStep(0);
    setDone(false);
    setMessages([{ role: "ai", line: s.steps[0].ai }]);
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pending]);

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || pending || done) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: message }]);
    setPending(true);
    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scenarioId: scenario.id, step, message }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as TutorResponse;
      setMessages((m) => [
        ...m,
        ...(data.feedback ? [{ role: "feedback" as const, feedback: data.feedback }] : []),
        { role: "ai" as const, line: data.reply },
      ]);
      if (data.nextStep > step) recordActivity(5);
      setStep(data.nextStep);
      setDone(data.done);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "ai", line: { zh: "网络有问题。", pinyin: "Wǎngluò yǒu wèntí.", id: "Koneksi bermasalah, coba lagi." } },
      ]);
    } finally {
      setPending(false);
    }
  };

  const dictate = () => {
    const rec = createRecognizer();
    if (!rec) return;
    rec.onresult = (e) => setInput(e.results[0][0].transcript);
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    setRecording(true);
    rec.start();
  };

  return (
    <>
      <PageHeader
        eyebrow="AI Smart Tutor"
        title="Roleplay & koreksi nada"
        description="Balas dalam Hanzi atau pinyin (boleh pakai angka nada, mis. ni3 hao3). Tutor akan mengoreksi nadamu dan memberi contoh jawaban."
      />
      <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        {/* Scenario picker */}
        <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => begin(s)}
              className={cn(
                "flex min-w-[220px] items-center gap-3 rounded-3xl p-4 text-left transition lg:min-w-0",
                s.id === scenario.id ? "bg-plum text-cream shadow-soft" : "bg-white shadow-soft hover:-translate-y-0.5",
              )}
            >
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose text-2xl">{s.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate font-extrabold">{s.title}</span>
                <span className="flex items-center gap-2 text-sm">
                  <span className="font-hanzi opacity-70">{s.title_zh}</span>
                  <HskBadge level={s.level} className="px-2 py-0.5 text-[10px]" />
                </span>
              </span>
            </button>
          ))}
        </div>

        {/* Chat */}
        <BentoCard className="flex h-[70vh] min-h-[480px] flex-col p-0 sm:p-0">
          <div className="flex items-center justify-between border-b border-plum/5 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blossom-gradient text-white">
                <Bot className="h-5 w-5" />
              </span>
              <div>
                <p className="font-extrabold">Li Laoshi · 李老师</p>
                <p className="text-xs font-semibold text-plum-soft">
                  Langkah {Math.min(step + 1, scenario.steps.length)}/{scenario.steps.length} · {scenario.title}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setShowPinyin((v) => !v)}
                className={cn("rounded-full px-3 py-1.5 text-xs font-bold", showPinyin ? "bg-rose text-blossom-dark" : "bg-cream")}
              >
                Pinyin
              </button>
              <button onClick={() => begin(scenario)} className="rounded-full bg-cream p-2" aria-label="Mulai ulang">
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5 sm:px-6" aria-live="polite">
            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="ml-auto w-fit max-w-[80%] rounded-3xl rounded-br-lg bg-blossom px-4 py-3 font-hanzi text-white">
                    {m.text}
                  </div>
                );
              }
              if (m.role === "ai") {
                return (
                  <div key={i} className="w-fit max-w-[85%] rounded-3xl rounded-bl-lg bg-cream px-4 py-3">
                    <div className="flex items-start gap-2">
                      <p className="font-hanzi text-lg font-medium">{m.line.zh}</p>
                      <button onClick={() => speakZh(m.line.zh)} aria-label="Dengarkan" className="mt-1 text-blossom">
                        <Volume2 className="h-4 w-4" />
                      </button>
                    </div>
                    {showPinyin && <p className="text-sm font-semibold text-blossom-dark">{m.line.pinyin}</p>}
                    <p className="text-sm text-plum-soft">{m.line.id}</p>
                  </div>
                );
              }
              const f = m.feedback;
              return (
                <div
                  key={i}
                  className={cn(
                    "mx-auto w-full max-w-md rounded-3xl border-2 border-dashed px-4 py-3 text-sm",
                    f.kind === "praise" ? "border-emerald-300 bg-emerald-50" : "border-peach bg-peach/10",
                  )}
                >
                  <p className="flex items-center gap-1 font-extrabold">
                    {f.kind === "hint" ? <Lightbulb className="h-4 w-4 text-peach" /> : <Sparkles className="h-4 w-4 text-blossom" />}
                    {f.kind === "tone" ? "Koreksi nada" : f.kind === "hint" ? "Petunjuk" : f.text}
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
            {pending && (
              <div className="flex w-fit gap-1 rounded-3xl bg-cream px-4 py-4">
                {[0, 1, 2].map((d) => (
                  <span key={d} className="h-2 w-2 animate-bounce rounded-full bg-plum/40" style={{ animationDelay: `${d * 120}ms` }} />
                ))}
              </div>
            )}
            {done && (
              <div className="mx-auto w-fit rounded-full bg-plum px-4 py-2 text-sm font-bold text-cream">
                🎉 Roleplay selesai!{" "}
                <button className="underline" onClick={() => begin(scenario)}>
                  Main lagi
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
              placeholder={done ? "Pilih skenario lain atau main lagi" : "Ketik 汉字 atau pinyin (mis. wo3 xiang3 chi1 mi3fan4)…"}
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
