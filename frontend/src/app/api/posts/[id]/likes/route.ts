// src/app/api/posts/[id]/likes/route.ts
import { NextResponse } from "next/server";
import { toggleLike } from "@/lib/mock";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId } = await req.json();
  const r = toggleLike(params.id, userId ?? "anon");
  if (!r) return NextResponse.json({ message: "post not found" }, { status: 404 });
  return NextResponse.json(r);
}
