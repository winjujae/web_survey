import { NextResponse } from "next/server";
import { headers } from "next/headers";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3300';

export async function GET() {
  try {
    const h = await headers();
    const incomingCookie = h.get('cookie') ?? '';
    const res = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': incomingCookie,
      },
    });
    const data = await res.json();
    const next = NextResponse.json(data, { status: res.status });
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) next.headers.set('set-cookie', setCookie);
    return next;
  } catch (e) {
    return NextResponse.json({ authenticated: false }, { status: 502 });
  }
}


