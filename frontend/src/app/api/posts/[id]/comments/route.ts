// src/app/api/posts/[id]/comments/route.ts
import { NextResponse } from "next/server";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE_URL}/api/comments/post/${params.id}`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const res = await fetch(`${API_BASE_URL}/api/comments`, { method: 'POST', cache: 'no-store', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...body, post_id: params.id }) });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
