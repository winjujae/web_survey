import { NextRequest } from "next/server";

// 백엔드가 boardId 필터를 지원하면 false로 전환해 바로 프록시만 하도록 사용
const USE_BFF_FILTER = true;

// slug -> boardId 매핑 (필요 시 실제 ID로 교체)
const SLUG_TO_ID: Record<string, string> = {
  talk: "talk",
  treatment: "treatment",
  reviews: "reviews",
  clinics: "clinics",
};

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const boardId = SLUG_TO_ID[slug];

  // slug가 정의되지 않은 경우 빈 배열 반환(또는 404 선택 가능)
  if (!boardId) {
    return Response.json([], { status: 200 });
  }

  const sp = req.nextUrl.searchParams;
  const tag = sp.get("tag") ?? undefined;
  const page = Number(sp.get("page") ?? "1");
  const limit = Number(sp.get("limit") ?? "50");

  // 백엔드 베이스 URL (예: http://localhost:3300)
  const origin = process.env.API_URL!;
  const base = `${origin}/api/posts`;

  if (!USE_BFF_FILTER) {
    // 백엔드가 boardId 필터를 지원하는 경우: 바로 프록시
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("limit", String(limit));
    qs.set("boardId", boardId);
    if (tag) qs.set("tag", tag);

    const r = await fetch(`${base}?${qs.toString()}`, { cache: "no-store" });
    const bodyText = await r.text();
    return new Response(bodyText, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("Content-Type") ?? "application/json" },
    });
  }

  // 임시 대안: 전체 목록을 받아 BFF에서 필터링
  const r = await fetch(`${base}`, { cache: "no-store" });
  if (!r.ok) {
    const bodyText = await r.text();
    return new Response(bodyText, {
      status: r.status,
      headers: { "Content-Type": r.headers.get("Content-Type") ?? "application/json" },
    });
  }

  const all = await r.json();
  // 예시 스키마: { boardId: string, tags?: string[] } 가정
  let filtered = Array.isArray(all) ? all.filter((p: any) => p?.boardId === boardId) : [];

  if (tag) {
    filtered = filtered.filter((p: any) => {
      const tags: string[] = Array.isArray(p?.tags) ? p.tags : [];
      return tags.includes(tag);
    });
  }

  // 간단한 페이지네이션
  const start = (Math.max(1, page) - 1) * Math.max(1, limit);
  const end = start + Math.max(1, limit);
  const pageItems = filtered.slice(start, end);

  return Response.json(pageItems, { status: 200 });
}