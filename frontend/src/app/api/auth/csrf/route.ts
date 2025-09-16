import { NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function GET() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/csrf`, {
      method: 'GET',
      cache: 'no-store',
      credentials: 'include',
    });
    const data = await res.json();
    const next = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) next.headers.set('set-cookie', setCookie);
    return next;
  } catch (e) {
    return NextResponse.json({ success: false }, { status: 502 });
  }
}


