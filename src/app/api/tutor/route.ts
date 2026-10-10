import { NextResponse } from "next/server";
import { generateTutorReply, type TutorRequest } from "@/lib/tutor/engine";

export async function POST(request: Request) {
  let body: Partial<TutorRequest>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { scenarioId, step, message } = body;
  if (typeof scenarioId !== "string" || typeof step !== "number" || typeof message !== "string") {
    return NextResponse.json({ error: "scenarioId, step and message are required" }, { status: 400 });
  }
  if (!message.trim() || message.length > 500) {
    return NextResponse.json({ error: "message must be 1–500 characters" }, { status: 400 });
  }

  // Simulated latency so the chat feels conversational.
  await new Promise((r) => setTimeout(r, 450));
  return NextResponse.json(generateTutorReply({ scenarioId, step, message }));
}
