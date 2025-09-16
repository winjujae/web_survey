// src/app/api/posts/[id]/likes/route.ts
import { NextResponse } from "next/server";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${params.id}/like`, { method: 'POST', cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
