// src/app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
import { addComment } from "@/lib/mock";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { userId, body } = await req.json();
  if (!body?.trim()) {
    return NextResponse.json({ message: "내용은 필수입니다." }, { status: 400 });
  }
  const c = addComment(params.id, userId ?? "anon", body);
  if (!c) return NextResponse.json({ message: "post not found" }, { status: 404 });
  return NextResponse.json(c, { status: 201 });
}
