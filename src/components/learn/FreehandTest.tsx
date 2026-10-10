"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Eraser, Loader2, RotateCcw, Star, Undo2 } from "lucide-react";
import { Button } from "@/components/ui";
import { mediansToPoints, scoreShape, type Pt } from "@/lib/hanzi-shape";
import { HANZI_PASS, hanziStars } from "@/lib/journey-store";
import { cn } from "@/lib/utils";

const INK = "#2B2D42";

/**
 * Blank pad (no outline, no hints). The learner writes from memory; only the final
 * shape is judged — stroke order and direction are ignored.
 */
export function FreehandTest({
  char,
  size,
  onScored,
}: {
  char: string;
  size: number;
  onScored: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Pt[][]>([]);
  const drawingRef = useRef(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [glyph, setGlyph] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = size * 0.05;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (const s of strokesRef.current) {
      if (s.length === 1) {
        ctx.beginPath();
        ctx.arc(s[0][0], s[0][1], ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      s.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
      ctx.stroke();
    }
  }, [size]);

  // Size the canvas for crisp lines on high-DPI screens.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    redraw();
  }, [size, redraw]);

  const clear = useCallback(() => {
    strokesRef.current = [];
    setStrokeCount(0);
    setResult(null);
    setGlyph(null);
    setError(null);
    redraw();
  }, [redraw]);

  useEffect(clear, [char, clear]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>): Pt => {
    const rect = e.currentTarget.getBoundingClientRect();
    return [((e.clientX - rect.left) * size) / rect.width, ((e.clientY - rect.top) * size) / rect.height];
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (result !== null || checking) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drawingRef.current = true;
    strokesRef.current.push([point(e)]);
    setStrokeCount(strokesRef.current.length);
    redraw();
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    strokesRef.current[strokesRef.current.length - 1].push(point(e));
    redraw();
  };
  const onUp = () => {
    drawingRef.current = false;
  };

  const undo = () => {
    strokesRef.current.pop();
    setStrokeCount(strokesRef.current.length);
    redraw();
  };

  const check = async () => {
    setChecking(true);
    setError(null);
    try {
      const { default: HW } = await import("hanzi-writer");
      const data = await HW.loadCharacterData(char);
      if (!data) throw new Error("no data");
      const score = scoreShape(strokesRef.current, mediansToPoints(data.medians));
      setGlyph(data.strokes);
      setResult(score);
      onScored(score);
    } catch {
      setError("Data karakter tidak bisa dimuat. Periksa koneksi internet.");
    } finally {
      setChecking(false);
    }
  };

  const stars = result === null ? 0 : hanziStars(result);
  const passed = result !== null && result >= HANZI_PASS;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* plain frame — deliberately no 米字格 guide lines in test mode */}
        <div className="absolute inset-0 rounded-3xl border-2 border-dashed border-blossom/50 bg-white" />
        {glyph && (
          <svg viewBox="0 0 1024 1024" className="absolute inset-0 h-full w-full p-4" aria-hidden>
            <g transform="scale(1, -1) translate(0, -900)">
              {glyph.map((d, i) => (
                <path key={i} d={d} fill="#FFD1DC" />
              ))}
            </g>
          </svg>
        )}
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className={cn("relative touch-none rounded-3xl", result === null ? "cursor-crosshair" : "cursor-default")}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          aria-label="Kanvas tes menulis — tulis karakter yang hilang dari ingatan"
        />
        {strokeCount === 0 && result === null && (
          <p className="pointer-events-none absolute inset-0 grid place-items-center px-10 text-center text-sm font-bold text-plum-soft/60">
            Tulis dari ingatan — bebas urutan & arah goresan
          </p>
        )}
      </div>

      {result !== null ? (
        <div className={cn("mt-4 w-full rounded-3xl p-4 text-center", passed ? "bg-emerald-50" : "bg-rose/40")}>
          <div className="flex justify-center gap-1">
            {[1, 2, 3].map((n) => (
              <Star
                key={n}
                className={cn("h-7 w-7", n <= stars ? "text-peach" : "text-plum/15")}
                fill={n <= stars ? "#FFB385" : "currentColor"}
              />
            ))}
          </div>
          <p className="mt-1 text-2xl font-black">{result}%</p>
          <p className="text-sm font-bold text-plum-soft">
            {passed ? "Bentuknya mirip! Lulus tes 🎉" : `Belum mirip — butuh ${HANZI_PASS}%. Lihat bayangan pink, lalu coba lagi!`}
          </p>
          <Button className="mt-3" onClick={clear}>
            <RotateCcw className="h-4 w-4" /> Coba lagi
          </Button>
        </div>
      ) : (
        <div className="mt-4 flex gap-2">
          <Button variant="secondary" onClick={undo} disabled={!strokeCount || checking} aria-label="Batalkan goresan">
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button variant="secondary" onClick={clear} disabled={!strokeCount || checking}>
            <Eraser className="h-4 w-4" /> Hapus
          </Button>
          <Button onClick={check} disabled={!strokeCount || checking}>
            {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Periksa
          </Button>
        </div>
      )}
      {error && <p className="mt-2 text-sm font-semibold text-blossom-dark">{error}</p>}
    </div>
  );
}
