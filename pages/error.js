// pages/error.js - 토스 스타일 에러 페이지
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function ErrorPage() {
  const router = useRouter();
  const { message } = router.query;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const errorMessage = message || '알 수 없는 오류가 발생했습니다.';

  const errorTypes = {
    'not_found': {
      icon: '🔍',
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
      suggestions: [
        'URL을 다시 확인해주세요',
        'QR코드를 다시 스캔해보세요',
        '앱에서 새로운 링크를 생성해보세요'
      ]
    },
    'expired': {
      icon: '⏰',
      title: '만료된 링크입니다',
      description: '경조사가 종료되었거나 링크가 만료되었습니다.',
      suggestions: [
        '주최자에게 새로운 링크를 요청하세요',
        '앱에서 직접 부조해보세요'
      ]
    },
    'network': {
      icon: '📶',
      title: '네트워크 연결을 확인해주세요',
      description: '인터넷 연결이 불안정하거나 서버에 일시적인 문제가 있습니다.',
      suggestions: [
        'Wi-Fi 또는 모바일 데이터를 확인하세요',
        '잠시 후 다시 시도해주세요',
        '앱을 사용해보세요'
      ]
    },
    'server': {
      icon: '⚠️',
      title: '서버 오류가 발생했습니다',
      description: '일시적인 서버 문제로 서비스를 이용할 수 없습니다.',
      suggestions: [
        '잠시 후 다시 시도해주세요',
        '문제가 지속되면 고객센터에 문의하세요'
      ]
    },
    'default': {
      icon: '❌',
      title: '문제가 발생했습니다',
      description: errorMessage,
      suggestions: [
        '페이지를 새로고침해보세요',
        '잠시 후 다시 시도해주세요',
        '앱을 사용해보세요'
      ]
    }
  };

  // 에러 메시지에 따라 타입 결정
  const getErrorType = () => {
    const msg = errorMessage.toLowerCase();
    if (msg.includes('not found') || msg.includes('찾을 수 없')) return 'not_found';
    if (msg.includes('expired') || msg.includes('만료')) return 'expired';
    if (msg.includes('network') || msg.includes('네트워크')) return 'network';
    if (msg.includes('server') || msg.includes('서버')) return 'server';
    return 'default';
  };

  const errorInfo = errorTypes[getErrorType()];

  if (!mounted) {
    return null;
  }

  return (
    <>
      <Head>
        <title>오류 - 정담</title>
        <meta name="description" content="페이지 오류" />
      </Head>
      
      <div className="min-h-screen-mobile flex items-center justify-center p-6" style={{background: 'var(--color-background-secondary)'}}>
        <div className="w-full max-w-md fade-in">
          <div className="card-toss text-center">
            
            {/* 에러 아이콘 */}
            <div className="icon-wrapper mx-auto mb-6" style={{
              width: '80px', 
              height: '80px', 
              fontSize: '40px',
              background: 'linear-gradient(135deg, #EF4444 0%, #F87171 100%)',
              color: 'white'
            }}>
              {errorInfo.icon}
            </div>
            
            {/* 에러 제목 */}
            <h1 className="text-title-1 text-gray-900 mb-4">
              {errorInfo.title}
            </h1>
            
            {/* 에러 설명 */}
            <p className="text-body-2 text-gray-600 mb-8 leading-relaxed">
              {errorInfo.description}
            </p>
            
            {/* 해결 방법 */}
            <div className="card-toss mb-8" style={{background: 'var(--color-gray-50)', border: 'none'}}>
              <h3 className="text-title-3 text-gray-900 mb-4">해결 방법</h3>
              <ul className="space-y-2 text-left">
                {errorInfo.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="badge-toss badge-primary" style={{
                      minWidth: '20px', 
                      height: '20px', 
                      borderRadius: '50%', 
                      fontSize: '12px', 
                      fontWeight: '700',
                      marginTop: '2px'
                    }}>
                      {index + 1}
                    </span>
                    <span className="text-body-2 text-gray-700">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* 액션 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-toss btn-primary w-full"
              >
                페이지 새로고침
              </button>
              
              <button
                onClick={() => router.back()}
                className="btn-toss btn-secondary w-full"
              >
                이전으로 돌아가기
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="btn-toss btn-ghost w-full"
              >
                홈으로 이동
              </button>
            </div>
            
            {/* 구분선 */}
            <div className="divider-toss"></div>
            
            {/* 도움말 섹션 */}
            <div className="text-center">
              <h4 className="text-title-3 text-gray-900 mb-4">
                여전히 문제가 있나요?
              </h4>
              
              <div className="grid grid-cols-1 gap-3">
                {/* 앱 다운로드 */}
                <button
                  onClick={() => {
                    window.open('https://apps.apple.com/app/jeongdam', '_blank');
                  }}
                  className="btn-toss btn-ghost w-full"
                >
                  <span className="mr-2">📱</span>
                  정담 앱 다운로드
                </button>
                
                {/* 고객센터 */}
                <button
                  onClick={() => {
                    window.open('mailto:support@jeongdam.com?subject=오류 문의', '_blank');
                  }}
                  className="btn-toss btn-ghost w-full"
                >
                  <span className="mr-2">💬</span>
                  고객센터 문의
                </button>
              </div>
              
              {/* 에러 정보 (개발용) */}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg text-left">
                  <div className="text-caption-1 text-gray-600 mb-2">개발자 정보:</div>
                  <div className="text-caption-2 text-gray-500 font-mono break-all">
                    {errorMessage}
                  </div>
                </div>
              )}
            </div>
            
            {/* 푸터 정보 */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl mb-2">🔒</div>
                  <div className="text-caption-1 text-gray-600">안전한<br/>보안</div>
                </div>
                <div>
                  <div className="text-2xl mb-2">🎯</div>
                  <div className="text-caption-1 text-gray-600">빠른<br/>지원</div>
                </div>
              </div>
              
              <p className="text-caption-2 text-gray-500 mt-6">
                © 2025 정담. 모든 권리 보유.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}