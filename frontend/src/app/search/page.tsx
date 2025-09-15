// src/app/search/page.tsx
import Hero from "../ui/Hero";
import LeftMenu from "../ui/LeftMenu";
import SearchContainer from "../components/SearchContainer";

export default function SearchPage() {
  return (
    <>
      <Hero 
        title="게시글 검색"
        subtitle="제목, 내용, 태그에서 원하는 정보를 찾아보세요."
      />
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginTop: 12 }}>
        <div>
          <LeftMenu />
        </div>
        <div>
          <SearchContainer />
        </div>
      </div>
    </>
  );
}
