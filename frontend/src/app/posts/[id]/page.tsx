//src/app/posts/[id]/page.tsx
import { getPost } from "@/lib/mock";
import { notFound } from "next/navigation";
import { formatKSTDateTime } from "@/lib/time";

export default function PostDetail({ params }: { params: { id: string }}) {
  const post = getPost(params.id);
  if (!post) return notFound();

  return (
    <article className="card" style={{padding: 16}}>
      <div className="head-compact">
        <span className="avatar mini">{post.author[0]}</span>
        <a className="handle" href="#">{post.author}</a>
        <span className="dot" />
        <time dateTime={post.createdAt}>
          {formatKSTDateTime(post.createdAt)}
        </time>
      </div>
      <h1 className="title" style={{fontSize: 22, marginTop: 12}}>{post.title}</h1>
      <div className="meta" style={{marginTop: 6}}>
        ❤ {post.likes ?? 0} <span className="dot" /> 조회 {post.views ?? 0}
      </div>
      <hr style={{borderColor: "var(--border)", margin: "12px 0"}} />
      <div style={{whiteSpace: "pre-wrap"}}>{post.body}</div>
    </article>
  );
}
