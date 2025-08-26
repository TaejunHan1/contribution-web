// pages/index.js - 정담 서비스 소개 랜딩 페이지
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

  return (
    <>
      <Head>
        <title>정담 - 디지털 경조사 관리 서비스</title>
        <meta
          name="description"
          content="종이 방명록을 디지털로! QR코드로 간편하게 부조하고 실시간으로 관리하는 스마트 경조사 시스템"
        />
      </Head>

      <div className="min-h-screen bg-white">
        {/* 헤더 */}
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💎</span>
              <span className="text-xl font-bold text-gray-900">정담</span>
            </div>
            <div className="hidden md:flex space-x-6">
              <a href="#features" className="text-gray-600 hover:text-blue-600">기능</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-blue-600">사용법</a>
              <a href="#templates" className="text-gray-600 hover:text-blue-600">템플릿</a>
              <a href="#download" className="text-gray-600 hover:text-blue-600">앱 다운로드</a>
            </div>
          </div>
        </header>

        {/* 히어로 섹션 */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-8 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* 왼쪽 텍스트 */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                  🔥 7초만에 이해하는 디지털 부조 시스템
                </div>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
                  종이 방명록은<br />
                  <span className="text-blue-600">이제 안녕!</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                  <span className="font-semibold text-gray-900">QR 스캔 → 디지털 방명록 → 실시간 관리</span><br />
                  결혼식·장례식이 이렇게 간편할 줄이야! 
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg">
                    📱 무료 앱 다운로드
                  </button>
                  <button 
                    onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}
                    className="bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-colors border-2 border-blue-200"
                  >
                    🚀 실제 템플릿 체험
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    무료 다운로드
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    1분 설치
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    즉시 사용 가능
                  </div>
                </div>
              </div>
              
              {/* 오른쪽 실제 템플릿 미리보기 */}
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl shadow-2xl p-6 mx-auto max-w-sm">
                  {/* 모바일 프레임 */}
                  <div className="bg-white rounded-[2rem] shadow-2xl p-2 relative">
                    {/* 노치 */}
                    <div className="bg-black rounded-full w-32 h-6 mx-auto mb-2 flex items-center justify-center">
                      <div className="bg-gray-800 rounded-full w-4 h-4 mr-2"></div>
                      <div className="bg-gray-800 rounded-sm w-12 h-1"></div>
                    </div>
                    
                    {/* 화면 내용 - 스크린샷 API로 미리보기 */}
                    <div className="bg-white rounded-[1.5rem] overflow-hidden min-h-[500px] relative">
                      <img
                        src="https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic&screenshot=true"
                        alt="실제 템플릿 미리보기"
                        className="w-full h-full object-cover object-top"
                        onError={(e) => {
                          console.log('스크린샷 로딩 실패, fallback 표시');
                          e.target.style.display = 'none';
                          e.target.nextElementSibling.style.display = 'flex';
                        }}
                      />
                      {/* fallback */}
                      <div className="bg-gradient-to-br from-pink-50 to-rose-100 p-6 h-full text-center flex flex-col justify-center items-center absolute inset-0" style={{ display: 'none' }}>
                        <div className="text-2xl mb-4">💒</div>
                        <h3 className="font-bold text-gray-900 mb-2">김민호 ♥ 이지은</h3>
                        <p className="text-sm text-gray-600 mb-4">2025년 3월 15일 (토)</p>
                        <div className="bg-white rounded-lg p-3 mb-4 shadow">
                          <div className="w-16 h-16 bg-gray-800 rounded mx-auto mb-2 flex items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded grid grid-cols-3 gap-px">
                              {[...Array(9)].map((_, i) => (
                                <div key={i} className="bg-black rounded-sm"></div>
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">QR 스캔</p>
                        </div>
                        <div className="w-full space-y-2">
                          <div className="bg-pink-500 text-white py-2 px-4 rounded-full text-xs font-semibold">
                            💝 부조금 기록하기
                          </div>
                          <div className="bg-blue-500 text-white py-2 px-4 rounded-full text-xs font-semibold">
                            💌 축하메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* 홈 인디케이터 */}
                    <div className="bg-black rounded-full w-32 h-1 mx-auto mt-2"></div>
                  </div>
                </div>
                
                <div className="absolute -top-3 -right-3 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse shadow-lg">
                  실제 링크!
                </div>
                <div className="absolute -bottom-3 -left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                  👆 클릭해서 체험
                </div>
                
                {/* 클릭 가능한 오버레이 */}
                <div 
                  className="absolute inset-0 bg-transparent cursor-pointer rounded-3xl"
                  onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* 문제점 제시 */}
        <section className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">이런 불편함 겪어보셨죠?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">😰</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">종이 방명록 분실</h3>
                <p className="text-sm md:text-base text-gray-600">소중한 축의금 기록이 담긴 방명록을 잃어버리는 불상사...</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">📝</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">손글씨 해독의 어려움</h3>
                <p className="text-sm md:text-base text-gray-600">알아보기 힘든 손글씨로 나중에 정리할 때 스트레스...</p>
              </div>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">💸</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">부조금 계산 실수</h3>
                <p className="text-sm md:text-base text-gray-600">현금 관리와 수동 계산으로 인한 누락이나 착오...</p>
              </div>
            </div>
          </div>
        </section>

        {/* 솔루션 소개 */}
        <section className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">정담이 모든 걸 해결해드립니다</h2>
              <p className="text-lg md:text-xl text-gray-600">모바일 앱 + 웹 페이지로 완벽한 디지털 경조사 관리</p>
            </div>
            
            {/* 앱 + 웹 연동 설명 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 md:p-8 rounded-3xl mb-8 md:mb-16">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">📱 모바일 앱 (주최자용)</h3>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 청첩장/부고장 제작</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> QR코드 생성</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 실시간 부조금 확인</li>
                    <li className="flex items-center"><span className="text-blue-600 mr-2 text-sm">✓</span> 참석자 관리</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">💻 웹 페이지 (참석자용)</h3>
                  <ul className="space-y-2 md:space-y-3 text-sm md:text-base text-gray-700">
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> QR코드로 접속</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 온라인 방명록 작성</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 부조금 기록</li>
                    <li className="flex items-center"><span className="text-green-600 mr-2 text-sm">✓</span> 축하 메시지 남기기</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 사용 방법 */}
        <section id="how-it-works" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">이렇게 간단합니다</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="text-center">
                <div className="bg-blue-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📱</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">1. 앱에서 행사 생성</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">결혼식/장례식 정보를 입력하고 예쁜 템플릿 선택</p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📷</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">2. QR코드 생성</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">행사장에 QR코드를 출력해서 게시</p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">💝</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">3. 참석자가 QR 스캔</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">휴대폰으로 스캔하면 웹 방명록으로 이동</p>
              </div>
              <div className="text-center">
                <div className="bg-orange-100 w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-sm md:text-base">4. 실시간 확인</h3>
                <p className="text-gray-600 text-xs md:text-sm px-2">앱에서 부조금과 방명록을 실시간 확인</p>
              </div>
            </div>
          </div>
        </section>

        {/* 주요 기능 */}
        <section id="features" className="py-12 md:py-20">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">핵심 기능들</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">🎨</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">다양한 템플릿</h3>
                <p className="text-sm md:text-base text-gray-700">결혼식 5종, 장례식 1종의 세련된 디자인 템플릿</p>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">⚡</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">실시간 동기화</h3>
                <p className="text-sm md:text-base text-gray-700">웹에서 입력된 정보가 앱으로 즉시 전송</p>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">🔒</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">안전한 관리</h3>
                <p className="text-sm md:text-base text-gray-700">클라우드 저장으로 데이터 분실 걱정 없음</p>
              </div>
              <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">📱</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">모바일 최적화</h3>
                <p className="text-sm md:text-base text-gray-700">참석자들이 쉽게 사용할 수 있는 모바일 친화적 설계</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">💳</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">간편한 부조</h3>
                <p className="text-sm md:text-base text-gray-700">이름과 금액만 입력하면 자동으로 기록</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-6 md:p-8 rounded-2xl">
                <div className="text-3xl md:text-4xl mb-3 md:mb-4">📊</div>
                <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-2 md:mb-3">통계 및 분석</h3>
                <p className="text-sm md:text-base text-gray-700">총 부조금액, 참석자 수 등 한눈에 파악</p>
              </div>
            </div>
          </div>
        </section>

        {/* 실제 템플릿 미리보기 */}
        <section id="templates" className="py-12 md:py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4">
            <div className="text-center mb-8 md:mb-16">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
                🎨 실제 서비스 템플릿
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">바로 사용 가능한 템플릿들</h2>
              <p className="text-lg md:text-xl text-gray-600">클릭하면 실제 템플릿 페이지를 체험해볼 수 있어요</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* 로맨틱 핑크 템플릿 */}
              <div className="group cursor-pointer" onClick={() => window.open('https://contribution-web-srgt.vercel.app/template/c3798b4a-1d11-4cf7-b4ae-aa3150de585f?template=romantic', '_blank')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="relative h-80 bg-gradient-to-br from-pink-50 to-rose-100 flex items-center justify-center">
                    {/* 실제 템플릿 미리보기 목업 */}
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💒</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">김민호 ♥ 이지은</h4>
                        <p className="text-xs text-gray-600 mb-3">2025년 3월 15일</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-pink-50 rounded p-1 text-xs">
                            💝 부조금 기록하기
                          </div>
                          <div className="bg-blue-50 rounded p-1 text-xs">
                            💌 축하메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
                      REAL
                    </div>
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      실제 링크
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">로맨틱 핑크</h3>
                    <p className="text-gray-600 text-sm mb-3">부드러운 핑크 톤의 로맨틱한 결혼식 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-pink-600 text-sm font-semibold">👆 실제 템플릿 체험</span>
                      <span className="text-xs text-gray-400 group-hover:text-pink-600">→ LIVE</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 모던 미니멀 템플릿 */}
              <div className="group cursor-pointer opacity-75" onClick={() => alert('곧 제공될 예정입니다!')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-80 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">💍</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">박준혁 ♥ 최서연</h4>
                        <p className="text-xs text-gray-600 mb-3">2025년 5월 24일</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-blue-50 rounded p-1 text-xs">
                            💝 부조금 기록하기
                          </div>
                          <div className="bg-indigo-50 rounded p-1 text-xs">
                            💌 축하메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SOON
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">모던 미니멀</h3>
                    <p className="text-gray-600 text-sm mb-3">깔끔하고 세련된 모던 스타일 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-600 text-sm font-semibold">곧 제공 예정</span>
                      <span className="text-xs text-gray-400">→ COMING</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 장례식 템플릿 */}
              <div className="group cursor-pointer opacity-75" onClick={() => alert('곧 제공될 예정입니다!')}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative h-80 bg-gradient-to-br from-gray-50 to-gray-200 flex items-center justify-center">
                    <div className="bg-white rounded-xl shadow-2xl p-4 max-w-48">
                      <div className="text-center">
                        <div className="text-2xl mb-2">🕊️</div>
                        <h4 className="font-bold text-gray-900 text-sm mb-1">고 김영호 님</h4>
                        <p className="text-xs text-gray-600 mb-3">향년 75세</p>
                        <div className="bg-gray-100 rounded p-2 mb-3">
                          <div className="w-12 h-12 bg-gray-300 rounded mx-auto flex items-center justify-center">
                            <span className="text-xs">QR</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">스캔하여 참여</p>
                        </div>
                        <div className="space-y-1">
                          <div className="bg-gray-50 rounded p-1 text-xs">
                            🙏 조의금 기록하기
                          </div>
                          <div className="bg-gray-50 rounded p-1 text-xs">
                            💐 추모메시지 남기기
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      SOON
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1">장례식 추모</h3>
                    <p className="text-gray-600 text-sm mb-3">정중하고 따뜻한 추모 템플릿</p>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600 text-sm font-semibold">곧 제공 예정</span>
                      <span className="text-xs text-gray-400">→ COMING</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 mb-4">💡 위 템플릿들은 실제 서비스에서 사용 중인 라이브 템플릿입니다</p>
              <div className="inline-flex items-center bg-yellow-50 text-yellow-800 px-4 py-2 rounded-full text-sm">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></span>
                실시간으로 부조금과 메시지가 업데이트됩니다
              </div>
            </div>
          </div>
        </section>

        {/* 데모 체험 */}
        <section id="demo" className="py-12 md:py-20">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">바로 체험해보세요</h2>
            <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8 px-2">QR코드가 없어도 경조사 ID로 직접 접속 가능합니다</p>
            
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 max-w-md mx-auto">
              <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-3 md:mb-4">경조사 ID로 체험하기</h3>
              <div className="space-y-3 md:space-y-4">
                <input
                  type="text"
                  value={eventId}
                  onChange={e => setEventId(e.target.value)}
                  placeholder="경조사 ID를 입력해주세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:text-base"
                  onKeyPress={e => e.key === 'Enter' && handleDirectAccess()}
                />
                <button
                  onClick={handleDirectAccess}
                  disabled={!eventId.trim()}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 text-sm md:text-base"
                >
                  체험하러 가기
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 앱 다운로드 */}
        <section id="download" className="py-12 md:py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">지금 바로 시작하세요</h2>
            <p className="text-lg md:text-xl mb-6 md:mb-8 opacity-90 px-2">정담 앱을 다운로드하고 첫 번째 디지털 경조사를 만들어보세요</p>
            <div className="flex flex-col md:flex-row gap-3 md:gap-4 justify-center px-4">
              <button className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm md:text-base">
                <span className="mr-2">📱</span> App Store에서 다운로드
              </button>
              <button className="bg-white text-blue-600 px-6 md:px-8 py-3 md:py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center text-sm md:text-base">
                <span className="mr-2">🤖</span> Google Play에서 다운로드
              </button>
            </div>
          </div>
        </section>


        {/* 푸터 */}
        <footer className="bg-gray-900 text-white py-8 md:py-12">
          <div className="max-w-6xl mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center space-x-2 mb-3 md:mb-4">
                  <span className="text-xl md:text-2xl">💎</span>
                  <span className="text-lg md:text-xl font-bold">정담</span>
                </div>
                <p className="text-gray-400 text-sm md:text-base">디지털 경조사 관리의 새로운 표준</p>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">서비스</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>모바일 청첩장</li>
                  <li>디지털 방명록</li>
                  <li>부조금 관리</li>
                  <li>QR코드 생성</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">지원</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>사용법 가이드</li>
                  <li>자주 묻는 질문</li>
                  <li>고객센터</li>
                  <li>피드백</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">회사</h4>
                <ul className="space-y-1 md:space-y-2 text-gray-400 text-xs md:text-sm">
                  <li>이용약관</li>
                  <li>개인정보처리방침</li>
                  <li>회사소개</li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-6 md:mt-8 pt-6 md:pt-8 text-center text-gray-400">
              <p className="text-xs md:text-sm">&copy; 2025 정담. 모든 권리 보유.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}