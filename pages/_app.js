// pages/_app.js - 토스 스타일 앱 설정
import { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 모바일 브라우저 뷰포트 높이 최적화
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // 초기 설정
    setVH();

    // 이벤트 리스너 등록
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);

    // iOS Safari 주소창 숨김 처리
    const handleResize = () => {
      setTimeout(setVH, 100);
    };

    window.addEventListener('load', setVH);
    window.addEventListener('scroll', handleResize);

    // 터치 스크롤 최적화
    document.body.style.overscrollBehavior = 'none';

    // iOS 줌 방지
    document.addEventListener('gesturestart', e => {
      e.preventDefault();
    });

    // 정리
    return () => {
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
      window.removeEventListener('load', setVH);
      window.removeEventListener('scroll', handleResize);
    };
  }, []);

  // 페이지 로딩 시 스크롤 맨 위로
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Head>
        <title>정담 - 디지털 경조사 관리</title>
        <meta name="description" content="종이 방명록을 디지털로! QR코드로 간편하게 부조하고 실시간으로 관리하는 스마트 경조사 시스템" />

        {/* 뷰포트 설정 */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />

        {/* 테마 컬러 */}
        <meta name="theme-color" content="#3182F6" />
        <meta name="msapplication-navbutton-color" content="#3182F6" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* PWA 설정 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="정담" />
        <meta name="application-name" content="정담" />

        {/* 오픈 그래프 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="정담 - 디지털 경조사 관리" />
        <meta
          property="og:description"
          content="종이 방명록을 디지털로! QR코드로 간편하게 부조하고 실시간으로 관리하는 스마트 경조사 시스템"
        />

        {/* 트위터 카드 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="정담 - 디지털 경조사 관리" />
        <meta
          name="twitter:description"
          content="종이 방명록을 디지털로! QR코드로 간편하게 부조하고 실시간으로 관리하는 스마트 경조사 시스템"
        />

        {/* 파비콘 */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />

        {/* 기본 프리커넥트만 유지 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
      </Head>

      {/* 메인 컨텐츠 */}
      <main
        className="min-h-screen"
        style={{ background: 'var(--color-background-secondary)' }}
      >
        <Component {...pageProps} />
      </main>

      {/* 토스 스타일 토스트 알림 */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName="toast-container"
        containerStyle={{
          top: 'max(20px, env(safe-area-inset-top))',
          left: 20,
          right: 20,
        }}
        toastOptions={{
          // 기본 설정
          duration: 3000,
          style: {
            background: 'white',
            color: 'var(--color-text-primary)',
            padding: '16px 20px',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '350px',
            wordBreak: 'keep-all',
            boxShadow: 'var(--shadow-lg)',
            border: '1px solid var(--color-gray-100)',
          },

          // 성공 토스트
          success: {
            style: {
              background: 'var(--color-success)',
              color: 'white',
              border: 'none',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'var(--color-success)',
            },
            duration: 2500,
          },

          // 에러 토스트
          error: {
            style: {
              background: 'var(--color-error)',
              color: 'white',
              border: 'none',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'var(--color-error)',
            },
            duration: 4000,
          },

          // 로딩 토스트
          loading: {
            style: {
              background: 'var(--color-primary)',
              color: 'white',
              border: 'none',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'var(--color-primary)',
            },
          },

          // 정보 토스트
          custom: {
            style: {
              background: 'var(--color-info)',
              color: 'white',
              border: 'none',
            },
          },
        }}
      />

      {/* 글로벌 스타일 및 최적화 */}
      <style jsx global>{`
        /* 뷰포트 높이 설정 */
        :root {
          --vh: 1vh;
        }

        /* 모바일 스크롤 최적화 */
        html {
          scroll-behavior: smooth;
          -webkit-text-size-adjust: 100%;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: none;
        }

        /* 터치 최적화 */
        * {
          -webkit-tap-highlight-color: transparent;
          -webkit-touch-callout: none;
        }

        /* 입력 필드 줌 방지 (iOS) */
        input[type='text'],
        input[type='number'],
        input[type='tel'],
        input[type='email'],
        textarea,
        select {
          font-size: 16px;
          border-radius: 0;
          -webkit-appearance: none;
          -webkit-border-radius: 0;
        }

        /* 버튼 터치 최적화 */
        button {
          -webkit-appearance: none;
          -webkit-border-radius: 0;
          border-radius: 0;
          touch-action: manipulation;
          user-select: none;
        }

        /* 이미지 최적화 */
        img {
          -webkit-user-drag: none;
          -khtml-user-drag: none;
          -moz-user-drag: none;
          -o-user-drag: none;
          user-drag: none;
        }

        /* 선택 방지 */
        .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }

        /* 토스트 컨테이너 최적화 */
        .toast-container {
          z-index: 9999;
          pointer-events: none;
        }

        .toast-container > div {
          pointer-events: auto;
        }

        /* 안전 영역 지원 */
        .safe-area-inset-top {
          padding-top: max(20px, env(safe-area-inset-top));
        }

        .safe-area-inset-bottom {
          padding-bottom: max(20px, env(safe-area-inset-bottom));
        }

        .safe-area-inset-left {
          padding-left: max(20px, env(safe-area-inset-left));
        }

        .safe-area-inset-right {
          padding-right: max(20px, env(safe-area-inset-right));
        }

        /* 스크롤바 숨김 (웹킷) */
        .hide-scrollbar {
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }

        /* 포커스 최적화 */
        .focus-visible:focus {
          outline: 2px solid var(--color-primary);
          outline-offset: 2px;
        }

        /* 다크 모드 지원 (미래 대비) */
        @media (prefers-color-scheme: dark) {
          :root {
            color-scheme: dark;
          }
        }

        /* 리듀스 모션 지원 */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* 프린트 최적화 */
        @media print {
          body {
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }

          .card-toss {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }

          .btn-toss {
            background: transparent !important;
            color: black !important;
            border: 1px solid black !important;
          }
        }

        /* 로딩 최적화 */
        .loading-skeleton {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
}

export default MyApp;
