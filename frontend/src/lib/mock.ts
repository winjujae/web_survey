import { DEMO_AUTHORS, DEMO_TAGS, LOREM } from "./constants";
import { cryptoRandomId, shuffle } from "./utils";
import type { Post } from "../types/post";

export function sampleTitle(i: number) {
  const t = [
    "2025 프론트엔드 트렌드 요약","React 상태관리, 이 조합이 답이었다",
    "디자이너 없이도 예쁜 UI 만드는 법","개발자 커리어: 연봉보다 중요한 것",
    "AI로 사이드프로젝트 0→1","CSS만으로 스켈레톤 로딩 구현하기",
    "Next.js 성능 체크리스트","스타트업에서 살아남기",
    "웹 접근성, 진짜 최소 가이드","디자인 토큰으로 팀 정렬하기",
  ];
  return t[i % t.length] + ` #${(i % 100) + 1}`;
}

export function makePosts(n = 60): Post[] {
  const now = Date.now();
  const arr: Post[] = [];
  for (let i = 0; i < n; i++) {
    const id = cryptoRandomId();
    const createdAt = now - i * 3600_000 * (0.5 + Math.random() * 12);
    const hot = Math.floor(Math.max(0, 200 - i * 1.5) + Math.random() * 120);
    const comments = Math.floor(Math.random() * 50);
    const views = hot * 5 + Math.floor(Math.random() * 500);
    const author = DEMO_AUTHORS[Math.floor(Math.random() * DEMO_AUTHORS.length)];
    const pickTags = shuffle([...DEMO_TAGS]).slice(0, 1 + Math.floor(Math.random() * 3));
    arr.push({
      id, title: sampleTitle(i), body: LOREM, author, createdAt, hot, comments, views,
      tags: pickTags, isFollowing: Math.random() > 0.6,
    });
  }
  return arr.sort((a, b) => b.createdAt - a.createdAt);
}
