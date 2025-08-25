// src/app/App.tsx
import "../styles/global.css";
import { Providers } from "./providers";
import CommunityHome from "../features/posts/components/CommunityHome";
import LoginButton from "../features/auth/components/LoginButton";
import AccountMenu from "../features/auth/components/AccountMenu";

export default function App() {
  return (
    <Providers>
      <header className="header">
        {/* ... 기존 헤더 좌측(로고/검색) 유지 ... */}
        <div className="hdr-actions">
          {/* 테마 버튼 등 기존 유지 */}
          {/* 로그인 상태에 따라 자동 전환 */}
          <LoginButton />
          <AccountMenu />
        </div>
      </header>

      <main className="container with-side">
        <CommunityHome />
      </main>
      {/* 하단 바/스타일 등은 기존 그대로 */}
    </Providers>
  );
}