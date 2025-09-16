// src/app/api/posts/route.ts
import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function GET() {
  try {
    if (process.env.NODE_ENV !== 'production') console.log('[DBG][BFF] GET /api/posts → backend fetch');
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      cache: 'no-store',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (process.env.NODE_ENV !== 'production') console.log('[DBG][BFF] backend status', res.status, 'data keys', Object.keys(data || {}));
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'BFF fetch failed' }, { status: 502 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const res = await fetch(`${API_BASE_URL}/api/posts`, {
      method: 'POST',
      cache: 'no-store',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e) {
    return NextResponse.json({ success: false, message: 'BFF post failed' }, { status: 502 });
  }
}
