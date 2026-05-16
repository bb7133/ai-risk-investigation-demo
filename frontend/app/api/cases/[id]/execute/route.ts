import { NextResponse } from "next/server";
import { resolveRealCase } from "@/lib/api/backend-adapter";

export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: Context) {
  const { id } = await context.params;
  return NextResponse.json(await resolveRealCase(id));
}
