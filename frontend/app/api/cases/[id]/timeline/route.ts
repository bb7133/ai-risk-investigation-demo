import { NextResponse } from "next/server";
import { getRealTimeline } from "@/lib/api/backend-adapter";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: Context) {
  const { id } = await context.params;
  return NextResponse.json(await getRealTimeline(id));
}
