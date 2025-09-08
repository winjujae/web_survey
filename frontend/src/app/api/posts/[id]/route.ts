// src/app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { getPost } from "@/lib/mock";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const p = getPost(params.id);
  if (!p) return NextResponse.json({ message: "Not found" }, { status: 404 });
  return NextResponse.json(p);
}
