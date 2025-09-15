// src/features/posts/components/NewPostForm.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/auth-context";
import { useLoginDialog } from "@/features/auth/components/LoginDialogProvider";
import { createPost } from "@/lib/api";

type Seg = { value: string; label: string };

const SEGMENTS: Seg[] = [
  { value: "talk",       label: "소통하기" },
  { value: "treatment",  label: "치료/약 정보" },
  { value: "reviews",    label: "관리후기/제품리뷰" },
  { value: "clinics",    label: "지역 병원/클리닉" },
];

const TITLE_MAX = 80;
const BODY_MIN  = 10;

export default function NewPostForm() {
  const { user } = useAuth();
  const { openLogin } = useLoginDialog();

  const [boardId, setBoardId] = useState<Seg["value"]>("talk");
  const [title, setTitle] = useState("");
  const [body, setBody]   = useState("");
  const [tagText, setTagText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) openLogin();
  }, [user, openLogin]);

  const titleCount = `${title.length}/${TITLE_MAX}`;
  const bodyOk = body.trim().length >= BODY_MIN;

  const onAddTag = (raw: string) => {
    const t = raw.trim().replace(/^#/, "");
    if (!t) return;
    if (tags.includes(t)) return;
    setTags(prev => [...prev, t]);
    setTagText("");
  };

  const removeTag = (t: string) => setTags(prev => prev.filter(x => x !== t));

  const disabled = useMemo(() => {
    if (!user) return true;
    if (!title.trim() || title.length > TITLE_MAX) return true;
    if (!bodyOk) return true;
    return false;
  }, [user, title, bodyOk]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled || !user) return;
    setSubmitting(true);
    setErr("");

    try {
      const isUuidV4 = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
      const saved = await createPost(
        {
          title: title.trim(),
          content: body.trim(),
          category_id: isUuidV4(boardId) ? boardId : undefined,
          tags: tags.length > 0 ? tags : [],
          is_anonymous: false,
        }
        /* , user.token */
      );

      // 성공 시 상세 페이지로 이동
      window.location.href = `/posts/${saved.id}`; //홈은 "/"
    } catch (e: any) {
      setErr(e.message ?? "게시글 등록에 실패했습니다.");
      setSubmitting(false);
    }
  };

  return (
    <form className="form fancy" onSubmit={onSubmit}>
      <div className="form__head">
        <h2>새 글 쓰기</h2>
        <p className="muted">탈모 치료 경험과 정보를 함께 나눠요.</p>
      </div>

      {err && <div className="form__alert">{err}</div>}

      {/* 게시판 선택 (Segmented) */}
      <div className="field">
        <label className="label">게시판</label>
        <div className="seg">
          {SEGMENTS.map(s => (
            <button
              type="button"
              key={s.value}
              className="seg__btn"
              aria-pressed={boardId === s.value}
              onClick={() => setBoardId(s.value)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* 제목 */}
      <div className="field">
        <label className="label">제목</label>
        <div className="input-shell">
          <input
            className="input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            maxLength={TITLE_MAX}
            placeholder="예) 미녹시딜 3개월차 변화 공유합니다"
            autoFocus
          />
          <span className="counter">{titleCount}</span>
        </div>
        <p className="helper">간결하고 핵심이 보이게 작성해 주세요.</p>
      </div>

      {/* 내용 */}
      <div className="field">
        <label className="label">내용</label>
        <div className="input-shell">
          <textarea
            className="textarea"
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="내용을 입력하세요 (사진/수치/기간이 있으면 좋아요)"
          />
        </div>
        <p className={"helper " + (bodyOk ? "" : "danger")}>
          최소 {BODY_MIN}자 이상 작성해 주세요.
        </p>
      </div>

      {/* 태그 (칩) */}
      <div className="field">
        <label className="label">태그</label>
        <div className="chips">
          {tags.map(t => (
            <span className="chip" key={t}>
              #{t}
              <button type="button" aria-label={`${t} 제거`} onClick={() => removeTag(t)}>×</button>
            </span>
          ))}
          <input
            className="chip-input"
            value={tagText}
            onChange={e => setTagText(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " " || e.key === ",") {
                e.preventDefault();
                onAddTag(tagText);
              }
              if (e.key === "Backspace" && !tagText && tags.length) {
                removeTag(tags[tags.length - 1]);
              }
            }}
            placeholder="피나스테리드, 미녹시딜…"
          />
        </div>
        <p className="helper">스페이스/엔터/쉼표로 태그를 추가할 수 있어요.</p>
      </div>

      {/* 액션 */}
      <div className="form__actions">
        <button type="button" className="btn" onClick={() => (window.location.href = "/")} disabled={submitting}>
          취소
        </button>
        <button type="submit" className="btn btn-primary" disabled={disabled || submitting}>
          {submitting ? "등록 중…" : "등록"}
        </button>
      </div>
    </form>
  );
}
