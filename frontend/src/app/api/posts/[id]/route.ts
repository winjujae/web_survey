// src/app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${API_BASE_URL}/api/posts/${params.id}`, { cache: 'no-store', credentials: 'include' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
