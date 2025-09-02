//src/features/posts/posts-service.ts
// 실제 API 붙이면 fetch로 교체
export async function apiReact(postId: string, dir: 1 | -1, token?: string) {
  await new Promise(r => setTimeout(r, 200)); // mock latency
  if (Math.random() < 0.05) throw new Error("네트워크 오류"); // 실패 케이스 시뮬
  return { ok: true };
}
