/** @type {import('next').NextConfig} */
const nextConfig = {
  // 실험적 기능들
  experimental: {
    // 앱 디렉토리 사용 (Next.js 13+)
    appDir: false,
    
    // 서버 컴포넌트 최적화
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
    
    // 이미지 최적화
    optimizePackageImports: ['@supabase/supabase-js'],
  },

  // 리액트 설정
  reactStrictMode: true,
  
  // SWC 설정 (Babel 대신 사용)
  swcMinify: true,
  
  // 이미지 최적화 설정
  images: {
    // 외부 이미지 도메인 허용
    domains: [
      'cdn.jsdelivr.net',
      'fonts.googleapis.com',
      'images.unsplash.com',
    ],
    
    // 이미지 형식 설정
    formats: ['image/webp', 'image/avif'],
    
    // 이미지 크기 설정
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    
    // 최적화 설정
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // 컴파일러 설정
  compiler: {
    // 프로덕션에서 console.log 제거
    removeConsole: process.env.NODE_ENV === 'production',
    
    // React Developer Tools 설정
    reactRemoveProperties: process.env.NODE_ENV === 'production',
  },

  // 환경 변수
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // 퍼블릭 런타임 설정
  publicRuntimeConfig: {
    APP_NAME: '정담',
    APP_VERSION: '1.0.0',
  },

  // 서버 런타임 설정
  serverRuntimeConfig: {
    // 서버에서만 사용되는 설정
  },

  // 페이지 설정
  async rewrites() {
    return [
      // API 프록시 (필요시)
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.jeongdam.com/:path*',
      },
    ];
  },

  // 리다이렉트 설정
  async redirects() {
    return [
      // 구형 경로 리다이렉트
      {
        source: '/old-contribute/:eventId',
        destination: '/contribute/:eventId',
        permanent: true,
      },
      // 메인 도메인 리다이렉트 (필요시)
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },

  // 헤더 설정
  async headers() {
    return [
      {
        // 모든 페이지에 적용되는 보안 헤더
        source: '/(.*)',
        headers: [
          // 보안 헤더들
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          // 캐시 제어
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          },
        ],
      },
      {
        // API 라우트에 CORS 설정
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        // 정적 자산 캐시 설정
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // 폰트 캐시 설정
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // 웹팩 설정 커스터마이징
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // 카메라 관련 polyfill (모바일 QR 스캔용)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Bundle Analyzer (개발 모드에서만)
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    // PWA 서비스 워커 설정
    if (!isServer && !dev) {
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BUILD_ID': JSON.stringify(buildId),
        })
      );
    }

    return config;
  },

  // 압축 설정
  compress: true,

  // 전력 추론 (성능 최적화)
  poweredByHeader: false,

  // 트레일링 슬래시 설정
  trailingSlash: false,

  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 검사 비활성화 (CI/CD에서 별도 실행)
    ignoreDuringBuilds: false,
    dirs: ['pages', 'components', 'lib'],
  },

  // TypeScript 설정
  typescript: {
    // 빌드 시 TypeScript 검사 비활성화 (CI/CD에서 별도 실행)
    ignoreBuildErrors: false,
  },

  // 출력 설정
  output: 'standalone', // Docker 컨테이너에 최적화

  // 국제화 설정 (다국어 지원 시)
  i18n: {
    locales: ['ko', 'en'],
    defaultLocale: 'ko',
    localeDetection: true,
  },

  // 성능 분석 설정
  ...(process.env.NODE_ENV === 'production' && {
    generateBuildId: async () => {
      // 고유한 빌드 ID 생성
      return `build-${Date.now()}`;
    },
  }),

  // 개발 서버 설정
  ...(process.env.NODE_ENV === 'development' && {
    onDemandEntries: {
      // 개발 모드에서 페이지 유지 시간
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
};

// PWA 설정 (next-pwa 플러그인 사용 시)
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1년
        },
      },
    },
    {
      urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'jsdelivr-cdn',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-font-assets',
        expiration: {
          maxEntries: 4,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
        },
      },
    },
    {
      urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-image-assets',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
        },
      },
    },
    {
      urlPattern: /\/_next\/image\?url=.+$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'next-image',
        expiration: {
          maxEntries: 64,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
        },
      },
    },
    {
      urlPattern: /\.(?:js)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-js-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /\.(?:css|less)$/i,
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'static-style-assets',
        expiration: {
          maxEntries: 32,
          maxAgeSeconds: 24 * 60 * 60, // 1일
        },
      },
    },
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-api',
        networkTimeoutSeconds: 10,
        expiration: {
          maxEntries: 16,
          maxAgeSeconds: 5 * 60, // 5분
        },
        cacheableResponse: {
          statuses: [0, 200],
        },
      },
    },
  ],
  buildExcludes: [/middleware-manifest\.json$/],
  disable: process.env.NODE_ENV === 'development',
});

// PWA 플러그인 조건부 적용
let finalConfig = nextConfig;

// PWA는 프로덕션에서만 활성화
if (process.env.NODE_ENV === 'production') {
  try {
    const withPWA = require('next-pwa')({
      dest: 'public',
      register: true,
      skipWaiting: true,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 365 * 24 * 60 * 60, // 1년
            },
          },
        },
        {
          urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'jsdelivr-cdn',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60, // 1일
            },
          },
        },
        {
          urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-font-assets',
            expiration: {
              maxEntries: 4,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
            },
          },
        },
        {
          urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-image-assets',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
            },
          },
        },
        {
          urlPattern: /\/_next\/image\?url=.+$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'next-image',
            expiration: {
              maxEntries: 64,
              maxAgeSeconds: 7 * 24 * 60 * 60, // 7일
            },
          },
        },
        {
          urlPattern: /\.(?:js)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-js-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60, // 1일
            },
          },
        },
        {
          urlPattern: /\.(?:css|less)$/i,
          handler: 'StaleWhileRevalidate',
          options: {
            cacheName: 'static-style-assets',
            expiration: {
              maxEntries: 32,
              maxAgeSeconds: 24 * 60 * 60, // 1일
            },
          },
        },
        {
          urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'supabase-api',
            networkTimeoutSeconds: 10,
            expiration: {
              maxEntries: 16,
              maxAgeSeconds: 5 * 60, // 5분
            },
            cacheableResponse: {
              statuses: [0, 200],
            },
          },
        },
      ],
      buildExcludes: [/middleware-manifest\.json$/],
      disable: process.env.NODE_ENV === 'development',
    });
    
    finalConfig = withPWA(nextConfig);
  } catch (error) {
    console.warn('PWA plugin not available, continuing without PWA features');
    finalConfig = nextConfig;
  }
}

module.exports = finalConfig;