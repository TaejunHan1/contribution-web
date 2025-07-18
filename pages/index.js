// pages/index.js - 토스 스타일 홈페이지
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

export default function HomePage() {
  const router = useRouter();
  const [eventId, setEventId] = useState('');

  const handleDirectAccess = () => {
    if (eventId.trim()) {
      router.push(`/contribute/${eventId.trim()}`);
    }
  };

  const features = [
    {
      icon: '📷',
      title: 'QR코드 스캔',
      description: '휴대폰으로 QR코드를 스캔하면\n바로 부조 페이지로 이동해요',
      gradient: 'gradient-primary',
    },
    {
      icon: '💳',
      title: '간편한 부조',
      description: '이름과 금액만 입력하면\n부조가 자동으로 기록돼요',
      gradient: 'gradient-wedding',
    },
    {
      icon: '📊',
      title: '실시간 관리',
      description: '부조 내역이 실시간으로\n앱에서 확인 가능해요',
      gradient: 'gradient-funeral',
    },
  ];

  return (
    <>
      <Head>
        <title>정담 - 간편한 모바일 부조 시스템</title>
        <meta
          name="description"
          content="QR코드로 간편하게 부조하고, 디지털로 경조사를 관리하세요"
        />
      </Head>

      <div className="min-h-screen-mobile bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* 상단 안전 영역 */}
        <div className="safe-area-top">
          {/* 메인 헤더 */}
          <header className="text-center px-6 pt-12 pb-8">
            <div className="mb-6">
              <div
                className="icon-wrapper icon-primary mx-auto mb-4"
                style={{ width: '80px', height: '80px', fontSize: '40px' }}
              >
                💎
              </div>
            </div>

            <h1 className="text-display-1 text-gray-900 mb-4">정담</h1>
            <p className="text-body-1 text-gray-600 leading-relaxed max-w-sm mx-auto">
              QR코드로 간편하게 부조하고
              <br />
              디지털로 경조사를 관리하세요
            </p>
          </header>

          {/* 기능 소개 카드들 */}
          <section className="px-6 mb-8">
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="card-toss slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`icon-wrapper ${feature.gradient}`}>
                      {feature.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-title-3 text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-body-2 text-gray-600 leading-relaxed whitespace-pre-line">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* QR코드 직접 입력 섹션 */}
          <section className="px-6 mb-8">
            <div className="card-toss">
              <div className="text-center mb-6">
                <h2 className="text-title-2 text-gray-900 mb-2">
                  QR코드가 없나요?
                </h2>
                <p className="text-body-2 text-gray-600">
                  경조사 ID를 직접 입력해서 접속하세요
                </p>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  placeholder="경조사 ID를 입력해주세요"
                  className="input-toss text-center"
                  onKeyPress={e => e.key === 'Enter' && handleDirectAccess()}
                />

                <button
                  onClick={handleDirectAccess}
                  disabled={!eventId.trim()}
                  className="btn-toss btn-primary w-full"
                >
                  부조하러 가기
                </button>
              </div>
            </div>
          </section>

          {/* 푸터 */}
          <footer className="px-6 pb-8 text-center">
            <div className="divider-toss"></div>
            <p className="text-caption-2 text-gray-500">
              © 2025 정담. 모든 권리 보유.
            </p>
            <div className="mt-4 space-x-4">
              <button className="text-caption-1 text-gray-600 underline">
                이용약관
              </button>
              <button className="text-caption-1 text-gray-600 underline">
                개인정보처리방침
              </button>
            </div>
          </footer>
        </div>

        {/* 하단 안전 영역 */}
        <div className="safe-area-bottom"></div>
      </div>
    </>
  );
}
