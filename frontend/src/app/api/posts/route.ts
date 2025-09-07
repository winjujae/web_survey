// src/app/api/posts/route.ts
import { NextResponse } from "next/server";
import { addPost, getPosts } from "@/lib/mock";

export async function GET() {
  return NextResponse.json(getPosts(50));
}

export async function POST(req: Request) {
  const { title, body, boardId, tags, authorId } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ message: "제목은 필수입니다." }, { status: 400 });
  }
  const saved = addPost({
    title,
    body,
    boardId,
    tags: Array.isArray(tags) ? tags : [],
    authorId,
  });
  return NextResponse.json(saved, { status: 201 });
}
