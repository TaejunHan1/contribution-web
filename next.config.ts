/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // 이미지 최적화 설정
  images: {
    domains: [
      'localhost',
      // Supabase Storage 도메인 (실제 프로젝트에 맞게 변경)
      'your-project.supabase.co',
    ],
  },
  
  // 환경변수 설정
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  },
  
  // PWA 지원을 위한 헤더 설정
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // 리다이렉트 설정
  async redirects() {
    return [
      {
        source: '/',
        destination: '/contribute',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;