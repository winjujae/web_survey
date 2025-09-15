// src/app/components/Breadcrumb.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumb() {
  const pathname = usePathname();
  
  if (pathname === "/") return null; // 메인 페이지에서는 브레드크럼 숨김

  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = [];

  // 홈 추가
  breadcrumbs.push({ label: "홈", href: "/" });

  // 경로별 브레드크럼 생성
  let currentPath = "";
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    let label = segment;
    
    // 특정 경로에 대한 라벨 매핑
    if (segment === "posts") {
      label = "게시글";
    } else if (segment === "profile") {
      label = "프로필";
    } else if (segment === "settings") {
      label = "설정";
    } else if (segment === "new") {
      label = "작성";
    } else if (segment === "talk") {
      label = "소통하기";
    } else if (segment === "treatment") {
      label = "치료/약 정보";
    } else if (segment === "reviews") {
      label = "관리후기/제품리뷰";
    } else if (segment === "clinics") {
      label = "지역 병원/클리닉";
    }

    // 마지막 세그먼트가 아니거나 ID인 경우 링크로 만들지 않음
    const isLast = index === pathSegments.length - 1;
    const isId = /^\d+$/.test(segment); // 숫자 ID인 경우
    
    breadcrumbs.push({
      label,
      href: isLast || isId ? undefined : currentPath
    });
  });

  return (
    <nav className="breadcrumb">
      {breadcrumbs.map((crumb, index) => (
        <span key={index} className="breadcrumb-item">
          {crumb.href ? (
            <Link href={crumb.href} className="breadcrumb-link">
              {crumb.label}
            </Link>
          ) : (
            <span className="breadcrumb-current">{crumb.label}</span>
          )}
          {index < breadcrumbs.length - 1 && (
            <span className="breadcrumb-separator">/</span>
          )}
        </span>
      ))}
    </nav>
  );
}
