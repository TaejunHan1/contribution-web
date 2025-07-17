import { useEffect } from 'react';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // 모바일 브라우저 주소창 숨김 처리
    const handleResize = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>정담 - 부조하기</title>
        <meta name="description" content="간편하고 안전한 모바일 부조 시스템" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#3b82f6" />
        
        {/* PWA 메타 태그 */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="정담" />
        
        {/* 오픈 그래프 */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="정담 - 부조하기" />
        <meta property="og:description" content="간편하고 안전한 모바일 부조 시스템" />
        <meta property="og:image" content="/images/og-image.jpg" />
        
        {/* 파비콘 */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        
        {/* 프리커넥트 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        
        {/* 폰트 프리로드 */}
        <link 
          rel="preload" 
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.8/dist/web/static/pretendard.css" 
          as="style" 
        />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <Component {...pageProps} />
      </main>

      {/* 토스트 알림 */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{
          top: 20,
          left: 20,
          right: 20,
        }}
        toastOptions={{
          // 기본 설정
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '350px',
            wordBreak: 'keep-all',
          },
          
          // 성공 토스트
          success: {
            style: {
              background: '#059669',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#059669',
            },
          },
          
          // 에러 토스트
          error: {
            style: {
              background: '#dc2626',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#dc2626',
            },
            duration: 5000,
          },
          
          // 로딩 토스트
          loading: {
            style: {
              background: '#3b82f6',
            },
          },
        }}
      />

      {/* 글로벌 스타일 */}
      <style jsx global>{`
        :root {
          --vh: 1vh;
        }
        
        .min-h-screen-mobile {
          min-height: 100vh;
          min-height: calc(var(--vh, 1vh) * 100);
        }
        
        /* 모바일 터치 최적화 */
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        /* 입력 필드 줌 방지 (iOS) */
        input[type="text"],
        input[type="number"],
        input[type="tel"],
        textarea,
        select {
          font-size: 16px;
        }
        
        /* 안전 영역 지원 */
        .safe-top {
          padding-top: max(1rem, env(safe-area-inset-top));
        }
        
        .safe-bottom {
          padding-bottom: max(1rem, env(safe-area-inset-bottom));
        }
        
        /* 스크롤 스냅 */
        .scroll-snap-y {
          scroll-snap-type: y mandatory;
        }
        
        .scroll-snap-start {
          scroll-snap-align: start;
        }
        
        /* 커스텀 리플 효과 */
        .ripple {
          position: relative;
          overflow: hidden;
        }
        
        .ripple::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
        }
        
        .ripple:active::before {
          width: 300px;
          height: 300px;
        }
      `}</style>
    </>
  );
}

export default MyApp;