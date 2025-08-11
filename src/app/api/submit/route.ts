// src/app/api/submit/route.ts
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export const runtime = 'nodejs'; // Vercel Edge 아님 (pg는 Node 런타임 필요)

export async function POST(req: Request) {
  const { name, email, message, agree } = await req.json();

  if (!name || !email || !agree) {
    return NextResponse.json({ ok:false, error:'invalid' }, { status:400 });
  }

  try {
    // 최초 1회: 없으면 자동 생성
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contacts (
        id serial PRIMARY KEY,
        name text NOT NULL,
        email text NOT NULL,
        message text,
        created_at timestamptz DEFAULT now()
      )
    `);

    await pool.query(
      'INSERT INTO contacts (name, email, message) VALUES ($1, $2, $3)',
      [name, email, message]
    );

    return NextResponse.json({ ok:true });
  } catch (err) {
    console.error('DB Error:', err);
    return NextResponse.json({ ok:false, error:'db_error' }, { status:500 });
  }
}