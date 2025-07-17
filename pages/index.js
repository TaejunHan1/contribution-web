import Head from 'next/head';
import { useRouter } from 'next/router';

export default function HomePage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>정담 - 간편한 모바일 부조 시스템</title>
        <meta name="description" content="QR코드로 간편하게 부조하고, 디지털로 경조사를 관리하세요" />
      </Head>
      
      <div className="min-h-screen-mobile bg-gradient-to-br from-primary-50 to-primary-100">
        <div className="safe-top">
          <div className="px-6 py-12">
            
            {/* 헤더 */}
            <header className="text-center mb-12">
              <div className="text-6xl mb-4">📱</div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                정담
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                QR코드로 간편하게 부조하고<br />
                디지털로 경조사를 관리하세요
              </p>
            </header>

            {/* 기능 소개 */}
            <section className="space-y-6 mb-12">
              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📷</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">QR코드 스캔</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      휴대폰으로 QR코드를 스캔하면<br />
                      바로 부조 페이지로 이동해요
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">💳</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">간편한 부조</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      이름과 금액만 입력하면<br />
                      부조가 자동으로 기록돼요
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-soft">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">📊</div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">실시간 관리</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      부조 내역이 실시간으로<br />
                      앱에서 확인 가능해요
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* 앱 다운로드 */}
            <section className="text-center">
              <div className="bg-white rounded-xl p-8 shadow-soft">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  경조사 주최자이신가요?
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  정담 앱을 다운로드하고<br />
                  디지털 경조사를 시작해보세요
                </p>
                
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      window.open('https://apps.apple.com/app/jeongdam', '_blank');
                    }}
                    className="w-full bg-black text-white font-semibold py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🍎</span>
                    App Store에서 다운로드
                  </button>
                  
                  <button
                    onClick={() => {
                      window.open('https://play.google.com/store/apps/details?id=com.jeongdam', '_blank');
                    }}
                    className="w-full bg-green-600 text-white font-semibold py-4 px-6 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span>🤖</span>
                    Google Play에서 다운로드
                  </button>
                </div>
              </div>
            </section>

            {/* QR코드 직접 입력 */}
            <section className="mt-8 text-center">
              <button
                onClick={() => {
                  const eventId = prompt('경조사 ID를 입력해주세요:');
                  if (eventId) {
                    router.push(`/contribute/${eventId}`);
                  }
                }}
                className="text-primary-600 font-medium text-sm underline"
              >
                경조사 ID로 직접 접속하기
              </button>
            </section>

            {/* 푸터 */}
            <footer className="mt-16 text-center text-xs text-gray-500">
              <p>© 2025 정담. 모든 권리 보유.</p>
            </footer>

          </div>
        </div>
        
        <div className="safe-bottom"></div>
      </div>
    </>
  );
}