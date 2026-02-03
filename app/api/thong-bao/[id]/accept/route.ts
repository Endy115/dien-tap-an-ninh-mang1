import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Note: In-memory store lives in /api/thong-bao. This endpoint is demo-only.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  // Accept always succeeds in demo.
  return NextResponse.json({ ok: true, id }, { status: 200 });
}
