// src/app/layout.tsx
// (권장) layout은 서버 컴포넌트로 두는 게 좋아서 "use client" 지워도 됩니다.
import "./global.css";
import Link from "next/link";
import Providers from "./providers";
import UserBadge from "./components/UserBadge";
import SearchBox from "./components/SearchBox";
import WriteButton from "./components/WriteButton";
import RightDock from "./components/RightDock";

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

              <SearchBox />

              <nav className="hdr-actions">
                <Link className="btn" href="/boards/notice">공지</Link>
                <WriteButton />
                <UserBadge />
              </nav>
            </div>
          </header>

          {/* ✅ 기존 <aside className="side-right">…</aside> 제거 */}

          <main className="container with-side">{children}</main>

          {/* ✅ 플로팅 도크 */}
          <RightDock />
        </Providers>
      </body>
    </html>
  );
}
