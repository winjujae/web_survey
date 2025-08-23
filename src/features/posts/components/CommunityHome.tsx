import React, { useEffect, useMemo, useRef, useState } from "react";
import type { SortKey, Post } from "../../../types/post";
import { fmtTimeAgo, escapeHtml, cryptoRandomId } from "../../../lib/utils";
import { PAGE_SIZE, THEME_KEY } from "../../../lib/constants";
import { usePosts } from "../posts-context";

/** 외부에서 헤더 우측에 넣을 엘리먼트를 주입(로그인 버튼/아바타) */
export default function CommunityHome({ headerRight }: { headerRight?: React.ReactNode }) {
  const { posts, setPosts, toggleLike } = usePosts();

  const [currentSort, setCurrentSort] = useState<SortKey>("hot");
  const [page, setPage] = useState(0);
  const [query, setQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  // 상세 모달
  const [selected, setSelected] = useState<Post | null>(null);
  const detailRef = useRef<HTMLDialogElement | null>(null);

  // 글쓰기 모달
  const composeRef = useRef<HTMLDialogElement | null>(null);
  const [titleInput, setTitleInput] = useState("");
  const [bodyInput, setBodyInput] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  // Infinite sentinel
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  /** Theme */
  useEffect(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      (document.documentElement as any).dataset.theme = saved;
      applyTheme(saved);
    }
  }, []);
  function applyTheme(mode: string) {
    (document.documentElement.style as any).colorScheme = mode === "light" ? "light" : "dark";
  }
  function toggleTheme() {
    const cur = (document.documentElement as any).dataset.theme || "auto";
    const next = cur === "light" ? "dark" : "light";
    (document.documentElement as any).dataset.theme = next;
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  }

  /** Search/Filter */
  const searchedAndTagged = useMemo(() => {
    const q = query.trim().toLowerCase();
    let res = posts;
    if (q) {
      res = res.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.author.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    if (filterTag) res = res.filter((p) => p.tags.includes(filterTag));
    return res;
  }, [posts, query, filterTag]);

  /** Sort */
  const sorted = useMemo(() => {
    switch (currentSort) {
      case "hot": return [...searchedAndTagged].sort((a, b) => b.hot - a.hot);
      case "new": return [...searchedAndTagged].sort((a, b) => b.createdAt - a.createdAt);
      case "top": {
        const week = Date.now() - 1000 * 60 * 60 * 24 * 7;
        return searchedAndTagged
          .filter((p) => p.createdAt >= week)
          .sort((a, b) => b.hot + b.comments * 3 - (a.hot + a.comments * 3));
      }
      case "follow": return searchedAndTagged.filter((p) => p.isFollowing);
      default: return searchedAndTagged;
    }
  }, [searchedAndTagged, currentSort]);

  /** Counts */
  const counts = useMemo(() => {
    const base = searchedAndTagged;
    const hot = [...base].sort((a, b) => b.hot - a.hot).length;
    const newer = [...base].sort((a, b) => b.createdAt - a.createdAt).length;
    const week = Date.now() - 1000 * 60 * 60 * 24 * 7;
    const top = base.filter((p) => p.createdAt >= week).length;
    const follow = base.filter((p) => p.isFollowing).length;
    return { hot, new: newer, top, follow };
  }, [searchedAndTagged]);

  /** Page slice */
  const pageSlice = useMemo(() => sorted.slice(0, (page + 1) * PAGE_SIZE), [sorted, page]);

  /** Infinite scroll */
  useEffect(() => {
    if (!sentinelRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setIsBusy(true);
          setTimeout(() => {
            setPage((prev) => {
              const next = prev + 1;
              setIsBusy(false);
              return next;
            });
          }, 50);
        }
      });
    }, { rootMargin: "800px 0px" });
    io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);
  useEffect(() => { setPage(0); }, [currentSort, query, filterTag]);

  /** Actions */
  function openCompose() {
    setTitleInput(""); setBodyInput(""); setTagsInput(""); composeRef.current?.showModal();
  }
  function closeCompose() { composeRef.current?.close(); }
  function submitCompose() {
    const title = titleInput.trim();
    const body = bodyInput.trim() || "작성한 내용";
    const tags = tagsInput.split(",").map(s => s.trim().toLowerCase()).filter(Boolean).slice(0, 4);
    if (!title) { alert("제목을 입력해 주세요."); return; }
    const newPost: Post = {
      id: cryptoRandomId(), title, body, author: "you", createdAt: Date.now(),
      hot: Math.floor(Math.random() * 30) + 1, comments: 0, views: 0,
      tags: tags.length ? tags : ["notice"], isFollowing: true,
    };
    setPosts(prev => [newPost, ...prev]);
    setCurrentSort("new");
    closeCompose();
  }

  /** Render helpers */
  function FeedItem({ p }: { p: Post }) {
    const onOpen = () => { setSelected(p); detailRef.current?.showModal(); };
    const onKey = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); }
    };
    return (
      <article
        className="card card--compact"
        tabIndex={0}
        role="button"
        aria-label={`${escapeHtml(p.title)} - @${p.author}`}
        onClick={onOpen}
        onKeyDown={onKey}
      >
        <div className="head-compact">
          <div className="avatar mini" aria-hidden>{p.author[0].toUpperCase()}</div>
          <span className="handle">@{p.author}</span>
          <span className="dot" />
          <time dateTime={new Date(p.createdAt).toISOString()}>{fmtTimeAgo(p.createdAt)}</time>
          <h2 className="title-inline">{escapeHtml(p.title)}</h2>
        </div>
      </article>
    );
  }

  const trend = useMemo(() => [...posts].sort((a, b) => b.hot - a.hot).slice(0, 5), [posts]);

  /** ===== JSX ===== */
  return (
    <>
      {/* Header */}
      <header className="header" role="banner">
        <div className="container header-inner">
          <a href="#" className="logo" aria-label="홈으로 이동">
            <div className="logo-badge">C</div><span>Community</span>
          </a>

          <label className="search" aria-label="게시글 검색">
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="currentColor" d="M21 21L16.65 16.65M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" />
            </svg>
            <input
              id="searchInput" type="search" placeholder="검색: 글 제목·태그·작성자"
              autoComplete="off" value={query} onChange={(e) => setQuery(e.target.value)}
            />
          </label>

          <div className="hdr-actions">
            <button id="themeBtn" className="btn" aria-pressed="false" title="라이트/다크 모드 토글" onClick={toggleTheme}>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" d="M12 3a1 1 0 0 1 1 1v1.05a7 7 0 1 1-2 0V4a1 1 0 0 1 1-1Z" />
              </svg>
              테마
            </button>

            {/* 여기로 외부에서 로그인/아바타 주입 */}
            {headerRight}
          </div>
        </div>

        <div className="container">
          <nav className="tabs" role="tablist" aria-label="피드 정렬">
            {(["hot","new","top","follow"] as SortKey[]).map((key) => (
              <button
                key={key} className="tab" role="tab" data-sort={key}
                aria-selected={currentSort === key} onClick={() => setCurrentSort(key)}
              >
                {key === "hot" && <>🔥 핫 <small id="count-hot">{counts.hot}</small></>}
                {key === "new" && <>🆕 최신 <small id="count-new">{counts.new}</small></>}
                {key === "top" && <>🏆 주간 Top <small id="count-top">{counts.top}</small></>}
                {key === "follow" && <>👥 팔로잉 <small id="count-follow">{counts.follow}</small></>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main with right sidebar */}
      <main className="container with-side" role="main">
        {/* Feed */}
        <section aria-label="게시글 목록">
          <div id="feed" className="feed" aria-live="polite" aria-busy={isBusy}>
            {pageSlice.map((p) => <FeedItem key={p.id} p={p} />)}
          </div>
          {pageSlice.length < sorted.length && (
            <div id="sentinel" ref={sentinelRef} className="skeleton" aria-hidden="true" />
          )}
        </section>

        {/* Right side */}
        <aside className="side-right" aria-label="탐색 & 인기 태그 & 트렌드">
          <section className="panel">
            <h3>탐색</h3>
            <div className="nav-list">
              <a className="nav-item" onClick={(e) => e.preventDefault()}>🏠 For You</a>
              <a className="nav-item" onClick={(e) => e.preventDefault()}>👥 팔로잉</a>
              <a className="nav-item" onClick={(e) => e.preventDefault()}>🔖 북마크</a>
              <a className="nav-item" onClick={(e) => e.preventDefault()}>⚙️ 설정</a>
            </div>
          </section>

          <section className="panel">
            <h3>인기 태그</h3>
            <div style={{ padding: 6 }}>
              {["javascript","react","design","startup","career","ai"].map(tag => (
                <button
                  key={tag} className="tag-chip" data-tag={tag}
                  onClick={() => setFilterTag(prev => (prev === tag ? "" : tag))}
                  style={{ outline: filterTag === tag ? "2px solid color-mix(in oklab, var(--accent) 60%, var(--border))" : "none" }}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>지금 뜨는 글</h3>
            <div className="trend" id="trendList">
              {trend.map((p, i) => (
                <a key={p.id} href="#" title={p.title} onClick={(e) => { e.preventDefault(); setSelected(p); detailRef.current?.showModal(); }}>
                  <span className="rank">{i + 1}</span>
                  <span style={{ flex: 1 }}>{p.title}</span>
                  <small style={{ color: "var(--muted)" }}>{p.hot} ❤️</small>
                </a>
              ))}
            </div>
          </section>

          <section className="panel">
            <h3>Top 기여자</h3>
            <div className="trend">
              <a href="#" onClick={(e) => e.preventDefault()}><span className="rank">1</span> @naver_dev <small style={{ marginLeft: "auto", color: "var(--muted)" }}>+120</small></a>
              <a href="#" onClick={(e) => e.preventDefault()}><span className="rank">2</span> @cat_coder <small style={{ marginLeft: "auto", color: "var(--muted)" }}>+98</small></a>
              <a href="#" onClick={(e) => e.preventDefault()}><span className="rank">3</span> @ui_holic <small style={{ marginLeft: "auto", color: "var(--muted)" }}>+76</small></a>
            </div>
          </section>

          <section className="panel">
            <div className="cta">
              <h3>커뮤니티 만들기</h3>
              <p>당신의 주제를 중심으로 새로운 공간을 열어보세요.</p>
              <button className="btn btn-primary" onClick={openCompose}>새 커뮤니티 생성</button>
            </div>
          </section>
        </aside>
      </main>

      {/* Bottom nav */}
      <nav className="bottom-nav" aria-label="모바일 하단 바">
        <div className="wrap">
          <button className="bottom-btn" aria-selected="true">🏠 홈</button>
          <button className="bottom-btn">🔥 핫</button>
          <button className="bottom-btn" onClick={openCompose}>✍️ 글</button>
          <button className="bottom-btn">🔎 검색</button>
          <button className="bottom-btn">👤 나</button>
        </div>
      </nav>

      {/* Compose Modal */}
      <dialog className="modal" id="composeModal" ref={composeRef} aria-labelledby="composeTitle" aria-modal="true">
        <div className="modal-card">
          <h2 id="composeTitle">새 글 작성</h2>
          <div className="row"><input placeholder="제목" maxLength={120} value={titleInput} onChange={(e) => setTitleInput(e.target.value)} /></div>
          <div className="row"><textarea placeholder="내용(마크다운 일부 지원 가정)" value={bodyInput} onChange={(e) => setBodyInput(e.target.value)} /></div>
          <div className="row"><input placeholder="태그(쉼표로 구분) 예: javascript,ui" value={tagsInput} onChange={(e) => setTagsInput(e.target.value)} /></div>
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={() => composeRef.current?.close()}>취소</button>
            <button className="btn btn-primary" onClick={submitCompose}>발행</button>
          </div>
        </div>
      </dialog>

      {/* Detail Modal */}
      <dialog className="modal" ref={detailRef} aria-labelledby="detailTitle" aria-modal="true">
        <div className="modal-card">
          {selected && (
            <>
              <h2 id="detailTitle" style={{ marginBottom: 4 }}>{escapeHtml(selected.title)}</h2>
              <div className="meta" style={{ marginBottom: 12 }}>
                <div className="avatar mini" aria-hidden>{selected.author[0].toUpperCase()}</div>
                <span>@{selected.author}</span>
                <span className="dot" />
                <time dateTime={new Date(selected.createdAt).toISOString()}>{fmtTimeAgo(selected.createdAt)}</time>
              </div>
              <p style={{ whiteSpace: "pre-wrap", marginTop: 0 }}>{escapeHtml(selected.body)}</p>
              <div className="tags" style={{ marginTop: 12 }}>
                {selected.tags.map((t) => (<span key={t} className="post-chip">#{t}</span>))}
              </div>
              <div className="actions">
                <button className="action like" aria-pressed={!!selected.liked} onClick={() => toggleLike(selected.id)}>
                  ❤️ 좋아요 <span>{posts.find((p) => p.id === selected.id)?.hot ?? selected.hot}</span>
                </button>
                <div className="action" title="댓글"><span>💬</span> {selected.comments}</div>
                <div className="action" title="조회수">👁️ {selected.views}</div>
                <button className="action" onClick={() => detailRef.current?.close()}>닫기</button>
              </div>
            </>
          )}
        </div>
      </dialog>
    </>
  );
}
