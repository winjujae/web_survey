//types/post.ts
export type SortKey = "hot" | "new" | "top" | "follow" | "announce" ;

export type Post = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: number;
  hot: number;
  comments: number;
  views: number;
  tags: string[];
  isFollowing: boolean;
  liked?: boolean;
};