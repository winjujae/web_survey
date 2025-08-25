export const metadata = {
  title: "Community",
  description: "Demo",
};

import "./global.css"; // 전역 CSS는 여기에서 import

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
