import { NextResponse } from "next/server";
import { getRealCase, listRealCases } from "@/lib/api/backend-adapter";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await listRealCases());
}

export async function POST() {
  const cases = await listRealCases(50);
  if (cases.length === 0) {
    return NextResponse.json({ error: "no_cases" }, { status: 404 });
  }
  const selected = cases[Math.floor(Date.now() / 10_000) % cases.length];
  return NextResponse.json(await getRealCase(selected.id), { status: 201 });
}
