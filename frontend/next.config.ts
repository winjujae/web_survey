import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15 최적화 설정
  experimental: {
    // Turbopack 안정화 (이미 package.json에서 --turbopack 사용 중)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  
  // 성능 최적화
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  
  // 컴파일러 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // 캐싱 정책 (Next.js 15 기본값)
  cacheHandler: undefined, // 기본 캐시 핸들러 사용
};

export default nextConfig;
