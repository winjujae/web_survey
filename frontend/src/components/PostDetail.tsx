// src/components/PostDetail.tsx
"use client";
import styles from "./PostDetail.module.css";
import LikeButton from "./LikeButton";
import CommentForm from "./CommentForm";
import Comments from "./Comments";
import cmtStyles from "./Comments.module.css";
import { useState } from "react";

export default function PostDetail({ post }: { post: any }) {
  const [data, setData] = useState(post);

  return (
    <article className={styles.wrapper}>
      {/* 헤더 (작성자/시간) 그대로 */}
      <div className={styles.head}>
        <a className={styles.handle} href="#">{data.author}</a>
        <span className={styles.dot} />
        <time dateTime={data.createdAt}>
          {new Date(data.createdAt).toLocaleString("ko-KR", { hour12: false })}
        </time>
      </div>

      {/* ✅ 제목/메타(왼쪽) + 태그(오른쪽) 한 줄 */}
      <div className={styles.topRow}>
        <div className={styles.titleMeta}>
          <h1 className={styles.title}>{data.title}</h1>
          <div className={styles.meta}>
            <span>❤ {data.likes ?? 0}</span>
            <span>·</span>
            <span>조회 {data.views ?? 0}</span>
          </div>
        </div>

        {Array.isArray(data.tags) && data.tags.length > 0 && (
          <div className={styles.tags}>
            {data.tags.map((t: string) => (
              <span key={t} className={styles.tag}>#{t}</span>
            ))}
          </div>
        )}
      </div>

      <hr className={styles.hr} />

      {/* 본문 */}
      <div className={styles.body}>{data.body}</div>

      <hr className={styles.hr} />

      {/* 액션 */}
      <div className={styles.actions}>
        <LikeButton
          postId={data.id}
          initialCount={data.likes ?? 0}
          onChange={(cnt) => setData((d: any) => ({ ...d, likes: cnt }))}
        />
      </div>

      {/* 댓글 섹션 */}
      <section className={styles.comments}>
        <h3 className={cmtStyles.sectionTitle}>댓글 쓰기</h3>
        <CommentForm
          postId={data.id}
          onSubmitted={(c) =>
            setData((d: any) => ({ ...d, comments: [...(d.comments ?? []), c] }))
          }
        />
        <h3 className={cmtStyles.sectionTitle}>댓글 보기</h3>
        <Comments postId={data.id} comments={data.comments ?? []} />
      </section>
    </article>
  );
}
