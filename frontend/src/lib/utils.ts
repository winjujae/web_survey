export function shuffle<T>(a: T[]): T[] {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function cryptoRandomId(): string {
  try {
    const r = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(r).map(b => b.toString(16).padStart(2,"0")).join("");
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function fmtTimeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}일 전`;
  const date = new Date(ts);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>\"']/g, (m) =>
    ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;" } as const)[m] || m
  );
}

// 게시글 관련 유틸리티 함수들
export function calculateHotScore(post: { likes?: number; dislikes?: number; createdAt: string }): number {
  const up = post.likes ?? 0;
  const down = post.dislikes ?? 0;
  const score = Math.max(up - down, 0);
  const order = Math.log10(Math.max(score, 1));
  const epoch = 1_700_000_000; // 고정 기준(초)
  const t = (Date.parse(post.createdAt) / 1000) - epoch;
  // 5일 하프라이프 느낌으로 시간 가중
  return order + t / (60 * 60 * 24 * 5);
}

export function calculateSearchScore(post: { title: string; excerpt?: string; tags?: string[] }, query: string): number {
  const q = query.toLowerCase();
  return (
    (post.title.toLowerCase().includes(q) ? 3 : 0) +
    ((post.excerpt ?? "").toLowerCase().includes(q) ? 2 : 0) +
    (post.tags?.some(t => t.toLowerCase().includes(q)) ? 1 : 0)
  );
}