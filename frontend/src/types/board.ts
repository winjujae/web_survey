export type Board = {
  id: string;          // ex) "seoul-general"
  slug: string;        // URL segment
  title: string;       // 보이는 이름
  parent?: string;     // 상위 카테고리 id (없으면 루트)
  count?: number;      // 글 수(옵션)
};
