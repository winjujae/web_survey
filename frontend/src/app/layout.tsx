// src/app/layout.tsx
// (권장) layout은 서버 컴포넌트로 두는 게 좋아서 "use client" 지워도 됩니다.
import "./global.css";
import Link from "next/link";
import Providers from "./providers";
import UserBadge from "./components/UserBadge";
import SearchBox from "./components/SearchBox";
import WriteButton from "./components/WriteButton";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>
          <header className="header">
            <div className="container header-inner">
              <Link href="/" className="logo">
                <span className="logo-badge">J</span>
                자라머니
              </Link>

              {/* ⬇️ 기존 label 블록을 SearchBox로 교체 */}
              <SearchBox />

              <nav className="hdr-actions">
                <Link className="btn" href="/boards/notice">공지</Link>
                {/* ⬇️ 기존 글쓰기 버튼을 WriteButton으로 교체 */}
                <WriteButton />
                <UserBadge />
              </nav>
            </div>
          </header>

          <aside className="side-right">
            <div className="panel">
              <h3>인기 태그</h3>
              <div className="tag-chip">#병원</div>
              <div className="tag-chip">#후기</div>
              <div className="tag-chip">#서울</div>
            </div>
            <div className="panel">
              <h3>공지</h3>
              <div className="trend">
                <a href="/posts/1"><span className="rank">1</span><span>필독! 게시판 이용 규칙</span></a>
                <a href="/posts/2"><span className="rank">2</span><span>매너 가이드</span></a>
              </div>
            </div>
          </aside>

          <main className="container with-side">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
