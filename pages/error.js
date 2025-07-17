import { useRouter } from 'next/router';
import Head from 'next/head';

export default function ErrorPage() {
  const router = useRouter();
  const { message } = router.query;

  const errorMessage = message || '알 수 없는 오류가 발생했습니다.';

  return (
    <>
      <Head>
        <title>오류 - 정담</title>
      </Head>
      
      <div className="min-h-screen-mobile bg-gray-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-soft p-8">
            <div className="text-6xl mb-6">❌</div>
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              문제가 발생했습니다
            </h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {errorMessage}
            </p>
            
            <div className="space-y-3">
              <button
                onClick={() => router.back()}
                className="w-full btn-primary"
              >
                이전으로 돌아가기
              </button>
              
              <button
                onClick={() => router.push('/')}
                className="w-full btn-secondary"
              >
                홈으로 이동
              </button>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-2">
                문제가 지속되면 앱을 이용해보세요
              </p>
              <button
                onClick={() => {
                  window.open('https://apps.apple.com/app/jeongdam', '_blank');
                }}
                className="text-primary-600 font-semibold text-sm underline"
              >
                📱 정담 앱 다운로드
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}