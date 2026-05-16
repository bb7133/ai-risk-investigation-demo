import { NextResponse } from "next/server";
import { chatWithRealAgents } from "@/lib/api/backend-adapter";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: Context) {
  const { id } = await context.params;
  const body = (await req.json().catch(() => ({}))) as { message?: unknown };
  const message = typeof body.message === "string" ? body.message.trim() : "";
  if (!message) return NextResponse.json({ error: "message_required" }, { status: 400 });
  return NextResponse.json(await chatWithRealAgents(id, message));
}
