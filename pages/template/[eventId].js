// pages/template/[eventId].js - 모바일 청첩장 템플릿 표시 페이지
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import dynamic from 'next/dynamic';
import { getEventDetails } from '../../lib/supabase';

const KoreanElegantTemplate = dynamic(() => import('../../components/templates/KoreanElegantTemplate'), { ssr: false });
const VintageTemplate = dynamic(() => import('../../components/templates/VintageTemplate'), { ssr: false });
const ModernMinimalTemplate = dynamic(() => import('../../components/templates/ModernMinimalTemplate'), { ssr: false });
const RomanticPinkTemplate = dynamic(() => import('../../components/templates/RomanticPinkTemplate'), { ssr: false });
const ElegantGardenTemplate = dynamic(() => import('../../components/templates/ElegantGardenTemplate'), { ssr: false });
const ModernDarkTemplate = dynamic(() => import('../../components/templates/ModernDarkTemplate'), { ssr: false });
const AuroraBlackTemplate = dynamic(() => import('../../components/templates/AuroraBlackTemplate'), { ssr: false });
const WarmOrangeTemplate = dynamic(() => import('../../components/templates/WarmOrangeTemplate'), { ssr: false });
const CleanWhiteTemplate = dynamic(() => import('../../components/templates/CleanWhiteTemplate'), { ssr: false });
const ClassicElegantTemplate = dynamic(() => import('../../components/templates/ClassicElegantTemplate'), { ssr: false });
const TicketFlightTemplate = dynamic(() => import('../../components/templates/TicketFlightTemplate'), { ssr: false });
const CinemaTemplate = dynamic(() => import('../../components/templates/CinemaTemplate'), { ssr: false });
const FallingPetals = dynamic(() => import('../../components/FallingPetals'), { ssr: false });
const BackgroundMusicPlayer = dynamic(() => import('../../components/BackgroundMusicPlayer'), { ssr: false });
const WeddingIntroOverlay = dynamic(() => import('../../components/WeddingIntroOverlay'), { ssr: false });

const DEFAULT_SITE_URL = 'https://jeongdamm.com';
const OG_IMAGE_VERSION = '3';

const parseJsonField = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const parseJsonArrayItems = (value, fallback = []) => {
  const items = parseJsonField(value, fallback);
  if (!Array.isArray(items)) return fallback;

  return items.map((item) => {
    if (typeof item !== 'string') return item;
    return parseJsonField(item, item);
  });
};

const buildInvitationTitle = (event) => {
  if (!event) return '모바일 청첩장';
  return `${event.groom_name || '신랑'} ♡ ${event.bride_name || '신부'} 결혼식에 초대합니다`;
};

const buildInvitationDescription = (event) => {
  if (!event) return '소중한 분들을 결혼식에 초대합니다';

  const date = event.event_date
    ? new Date(event.event_date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    : '';
  return [date, event.ceremony_time, event.location].filter(Boolean).join(' · ');
};

const buildPublicUrl = (path = '') => {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  const siteUrl = configuredSiteUrl && !configuredSiteUrl.includes('contribution-web-srgt.vercel.app')
    ? configuredSiteUrl
    : DEFAULT_SITE_URL;
  return `${siteUrl.replace(/\/$/, '')}${path}`;
};

const buildOgImageUrl = (eventId, template) => buildPublicUrl(
  `/api/og?eventId=${encodeURIComponent(eventId)}&template=${encodeURIComponent(template)}&ogv=${OG_IMAGE_VERSION}`
);

// 템플릿 컴포넌트들 (나중에 구현)
const ModernTemplate = ({ eventData }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-white">
        <h1 className="text-3xl font-light text-center mb-8">
          {eventData.groom_name || '신랑'} & {eventData.bride_name || '신부'}
        </h1>
        <div className="text-center mb-8">
          <p className="text-xl mb-2">Wedding Invitation</p>
          <p className="text-sm opacity-80">모던 미니멀 템플릿</p>
        </div>
        
        {/* 날짜 정보 */}
        <div className="text-center mb-8">
          <p className="text-lg mb-2">
            {new Date(eventData.event_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <p className="text-base opacity-80">
            {eventData.ceremony_time || '오후 2시'}
          </p>
        </div>
        
        {/* 장소 정보 */}
        <div className="text-center mb-8">
          <p className="text-lg mb-2">{eventData.location || '웨딩홀'}</p>
          {eventData.detailed_address && (
            <p className="text-sm opacity-80">{eventData.detailed_address}</p>
          )}
        </div>
        
        {/* 부조 참여 버튼 */}
        <div className="text-center">
          <a 
            href={`/contribute/${eventData.id}`}
            className="inline-block bg-white text-slate-900 px-8 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            방명록 작성하기
          </a>
        </div>
      </div>
    </div>
  </div>
);

const RomanticTemplate = ({ eventData }) => (
  <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-pink-100">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-2xl font-serif text-rose-800 mb-2">
            {eventData.groom_name || '신랑'} & {eventData.bride_name || '신부'}
          </h1>
          <p className="text-rose-600">로맨틱 핑크 템플릿</p>
        </div>
        
        {/* 날짜 정보 */}
        <div className="text-center mb-8 p-4 bg-rose-50 rounded-2xl">
          <p className="text-lg text-rose-800 mb-2">
            {new Date(eventData.event_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <p className="text-rose-600">
            {eventData.ceremony_time || '오후 2시'}
          </p>
        </div>
        
        {/* 장소 정보 */}
        <div className="text-center mb-8">
          <p className="text-lg text-rose-800 mb-2">{eventData.location || '웨딩홀'}</p>
          {eventData.detailed_address && (
            <p className="text-sm text-rose-600">{eventData.detailed_address}</p>
          )}
        </div>
        
        {/* 부조 참여 버튼 */}
        <div className="text-center">
          <a 
            href={`/contribute/${eventData.id}`}
            className="inline-block bg-rose-500 text-white px-8 py-3 rounded-full font-medium hover:bg-rose-600 transition-colors"
          >
            방명록 작성하기
          </a>
        </div>
      </div>
    </div>
  </div>
);

const KoreanTemplate = ({ eventData }) => (
  <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 border border-amber-200">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌸</div>
          <h1 className="text-2xl font-serif text-amber-800 mb-2">
            {eventData.groom_name || '신랑'} ♥ {eventData.bride_name || '신부'}
          </h1>
          <p className="text-amber-600">한국 전통 템플릿</p>
        </div>
        
        {/* 날짜 정보 */}
        <div className="text-center mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100">
          <p className="text-lg text-amber-800 mb-2">
            {new Date(eventData.event_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <p className="text-amber-700">
            {eventData.ceremony_time || '오후 2시'}
          </p>
        </div>
        
        {/* 장소 정보 */}
        <div className="text-center mb-8">
          <p className="text-lg text-amber-800 mb-2">{eventData.location || '웨딩홀'}</p>
          {eventData.detailed_address && (
            <p className="text-sm text-amber-600">{eventData.detailed_address}</p>
          )}
        </div>
        
        {/* 부조 참여 버튼 */}
        <div className="text-center">
          <a 
            href={`/contribute/${eventData.id}`}
            className="inline-block bg-amber-600 text-white px-8 py-3 rounded-full font-medium hover:bg-amber-700 transition-colors"
          >
            방명록 작성하기
          </a>
        </div>
      </div>
    </div>
  </div>
);

const GardenTemplate = ({ eventData }) => (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-xl p-8 border border-green-200">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌿</div>
          <h1 className="text-2xl font-serif text-green-800 mb-2">
            {eventData.groom_name || '신랑'} ♡ {eventData.bride_name || '신부'}
          </h1>
          <p className="text-green-600">엘레간트 가든 템플릿</p>
        </div>
        
        {/* 날짜 정보 */}
        <div className="text-center mb-8 p-4 bg-green-50 rounded-2xl border border-green-100">
          <p className="text-lg text-green-800 mb-2">
            {new Date(eventData.event_date).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long', 
              day: 'numeric',
              weekday: 'long'
            })}
          </p>
          <p className="text-green-700">
            {eventData.ceremony_time || '오후 2시'}
          </p>
        </div>
        
        {/* 장소 정보 */}
        <div className="text-center mb-8">
          <p className="text-lg text-green-800 mb-2">{eventData.location || '웨딩홀'}</p>
          {eventData.detailed_address && (
            <p className="text-sm text-green-600">{eventData.detailed_address}</p>
          )}
        </div>
        
        {/* 부조 참여 버튼 */}
        <div className="text-center">
          <a 
            href={`/contribute/${eventData.id}`}
            className="inline-block bg-green-600 text-white px-8 py-3 rounded-full font-medium hover:bg-green-700 transition-colors"
          >
            방명록 작성하기
          </a>
        </div>
      </div>
    </div>
  </div>
);

// VintageTemplate은 이미 import됨 - 중복 제거

export default function TemplatePage({
  serverEvent = null,
  serverOgEvent = null,
  serverTemplate = null,
  serverEventId = null,
}) {
  const router = useRouter();
  const { eventId } = router.query;
  const template = router.query.template || serverTemplate || 'modern';
  const currentEventId = serverEventId || eventId;
  const invitationUrl = currentEventId
    ? buildPublicUrl(`/template/${currentEventId}?template=${template}`)
    : buildPublicUrl();
  const ogImageUrl = currentEventId
    ? buildOgImageUrl(currentEventId, template)
    : buildPublicUrl('/api/og');

  const [event, setEvent] = useState(serverEvent);
  const [loading, setLoading] = useState(!serverEvent);
  const [error, setError] = useState(null);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [showIntro, setShowIntro] = useState(true);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const previousViewport = viewport?.getAttribute('content');

    if (viewport) {
      viewport.setAttribute(
        'content',
        'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover'
      );
    }

    const preventIfCancelable = (event) => {
      if (event.cancelable) {
        event.preventDefault();
      }
    };
    const preventPinchZoom = (event) => {
      if (event.touches && event.touches.length > 1) {
        preventIfCancelable(event);
      }
    };
    const preventGestureZoom = (event) => {
      preventIfCancelable(event);
    };
    const preventCtrlZoom = (event) => {
      if (event.ctrlKey || event.metaKey) {
        preventIfCancelable(event);
      }
    };
    const preventZoomKeys = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        ['+', '-', '=', '0'].includes(event.key)
      ) {
        preventIfCancelable(event);
      }
    };

    const listenerOptions = { passive: false, capture: true };
    window.addEventListener('touchstart', preventPinchZoom, listenerOptions);
    window.addEventListener('touchmove', preventPinchZoom, listenerOptions);
    window.addEventListener('gesturestart', preventGestureZoom, listenerOptions);
    window.addEventListener('gesturechange', preventGestureZoom, listenerOptions);
    window.addEventListener('gestureend', preventGestureZoom, listenerOptions);
    window.addEventListener('dblclick', preventGestureZoom, listenerOptions);
    window.addEventListener('wheel', preventCtrlZoom, listenerOptions);
    window.addEventListener('keydown', preventZoomKeys, listenerOptions);

    return () => {
      window.removeEventListener('touchstart', preventPinchZoom, true);
      window.removeEventListener('touchmove', preventPinchZoom, true);
      window.removeEventListener('gesturestart', preventGestureZoom, true);
      window.removeEventListener('gesturechange', preventGestureZoom, true);
      window.removeEventListener('gestureend', preventGestureZoom, true);
      window.removeEventListener('dblclick', preventGestureZoom, true);
      window.removeEventListener('wheel', preventCtrlZoom, true);
      window.removeEventListener('keydown', preventZoomKeys, true);
      if (viewport && previousViewport) {
        viewport.setAttribute('content', previousViewport);
      }
    };
  }, []);

  useEffect(() => {
    if (eventId && !serverEvent) {
      loadEventData();
    }
  }, [eventId]);

  // 웹폰트 로딩 감지
  useEffect(() => {
    const loadFonts = async () => {
      try {
        // 웹폰트가 로딩될 때까지 기다림
        // 폰트가 느려도 최대 800ms까지만 대기 → 그 이후에는 본문 즉시 렌더
        // (폰트는 백그라운드에서 계속 로딩되며 자연스럽게 교체됨 — FOUT)
        await Promise.race([
          document.fonts.ready,
          new Promise((resolve) => setTimeout(resolve, 800)),
        ]);
        setFontsLoaded(true);
      } catch (error) {
        console.log('Font loading error:', error);
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, []);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const result = await getEventDetails(eventId);

      if (result.success) {
        setEvent(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('Event loading error:', error);
      setError('경조사 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getTemplateComponent = () => {
    if (!event) return null;
    
    // 이미지 데이터 구성
    const categorizedImages = event.additional_info?.categorized_images || {};
    
    switch (template) {
      case 'modern':
      case 'modern-minimal':
        return <ModernMinimalTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'romantic':
      case 'romantic-pink':
        return <RomanticPinkTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'korean':
        return <KoreanElegantTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'garden':
        return <ElegantGardenTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'vintage':
        return <VintageTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'modern-dark':
        return <ModernDarkTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'elegant-garden':
        return <AuroraBlackTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'vintage-app':
        return <WarmOrangeTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'korean-elegant':
        return <CleanWhiteTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'classic-elegant':
        return <ClassicElegantTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'ticket-flight':
        return <TicketFlightTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'cinema-romance':
        return <CinemaTemplate eventData={event} categorizedImages={categorizedImages} />;
      default:
        return <ModernTemplate eventData={event} />;
    }
  };

  if (loading || !fontsLoaded) {
    const ogEvent = serverOgEvent || serverEvent;
    const ogEventId = serverEventId;
    const ogTemplate = serverTemplate || template;
    const loadingOgImageUrl = ogEventId
      ? buildOgImageUrl(ogEventId, ogTemplate)
      : ogImageUrl;
    const loadingTitle = buildInvitationTitle(ogEvent);
    const loadingDescription = buildInvitationDescription(ogEvent);
    return (
      <>
        <Head>
          <title>{ogEvent ? loadingTitle : '청첩장 로딩 중...'}</title>
          <meta
            key="viewport"
            name="viewport"
            content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
          />
          {ogEvent && (<>
            <meta key="description" name="description" content={loadingDescription} />
            <meta key="og:title" property="og:title" content={loadingTitle} />
            <meta key="og:description" property="og:description" content={loadingDescription} />
            <meta key="og:type" property="og:type" content="website" />
            <meta key="og:url" property="og:url" content={invitationUrl} />
            <meta key="og:image" property="og:image" content={loadingOgImageUrl} />
            <meta key="og:image:secure_url" property="og:image:secure_url" content={loadingOgImageUrl} />
            <meta key="og:image:width" property="og:image:width" content="1200" />
            <meta key="og:image:height" property="og:image:height" content="630" />
            <meta key="og:image:alt" property="og:image:alt" content={`${ogEvent.groom_name} ♡ ${ogEvent.bride_name} 청첩장`} />
            <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
            <meta key="twitter:title" name="twitter:title" content={loadingTitle} />
            <meta key="twitter:description" name="twitter:description" content={loadingDescription} />
            <meta key="twitter:image" name="twitter:image" content={loadingOgImageUrl} />
          </>)}
        </Head>
        <div className="min-h-screen flex items-center justify-center" style={{
          background: 'linear-gradient(135deg, #F8F5F2, #F3EFEC)',
          fontFamily: 'Noto Serif KR, serif'
        }}>
          <div className="text-center px-6">
            {/* 심플한 로딩 스피너 */}
            <div className="mb-6 flex justify-center">
              <div className="w-12 h-12 border-3 border-gray-200 border-t-rose-300 rounded-full animate-spin"></div>
            </div>
            
            {/* 로딩 텍스트 */}
            <div>
              <h2 className="text-lg font-medium text-gray-700 mb-2">
                {!fontsLoaded ? '청첩장을 준비하는 중...' : '청첩장을 불러오는 중...'}
              </h2>
              <p className="text-sm text-gray-500">잠시만 기다려주세요</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error || !event) {
    return (
      <>
        <Head>
          <title>청첩장을 찾을 수 없습니다</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              청첩장을 찾을 수 없습니다
            </h1>
            <p className="text-gray-600 mb-8">
              {error || '유효하지 않은 링크이거나 만료된 청첩장입니다.'}
            </p>
          </div>
        </div>
      </>
    );
  }

  const pageTitle = buildInvitationTitle(event);
  const pageDescription = buildInvitationDescription(event);

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta key="description" name="description" content={pageDescription} />
        <meta
          key="viewport"
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        
        {/* 웹폰트 프리로드 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          rel="preload" 
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;500;600;700&family=Sacramento&family=Pacifico&display=swap" 
          as="style"
        />
        <link 
          href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Dancing+Script:wght@400;500;600;700&family=Sacramento&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Noto+Serif+KR:wght@300;400;500;600&display=block" 
          rel="stylesheet"
        />
        
        {/* 소셜 미디어 OG 메타 태그 */}
        <meta key="og:title" property="og:title" content={pageTitle} />
        <meta key="og:description" property="og:description" content={pageDescription} />
        <meta key="og:type" property="og:type" content="website" />
        <meta key="og:url" property="og:url" content={invitationUrl} />
        <meta key="og:image" property="og:image" content={ogImageUrl} />
        <meta key="og:image:secure_url" property="og:image:secure_url" content={ogImageUrl} />
        <meta key="og:image:width" property="og:image:width" content="1200" />
        <meta key="og:image:height" property="og:image:height" content="630" />
        <meta key="og:image:alt" property="og:image:alt" content={`${event.groom_name} ♡ ${event.bride_name} 청첩장`} />
        <meta key="twitter:card" name="twitter:card" content="summary_large_image" />
        <meta key="twitter:title" name="twitter:title" content={pageTitle} />
        <meta key="twitter:description" name="twitter:description" content={pageDescription} />
        <meta key="twitter:image" name="twitter:image" content={ogImageUrl} />
        
        {/* 모바일 최적화 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      {getTemplateComponent()}
      <FallingPetals type={event.additional_info?.background_petal?.id} color={event.additional_info?.background_petal?.color} />
      <BackgroundMusicPlayer trackId={event.additional_info?.background_music?.id} />
      {showIntro && event.additional_info?.intro_effect?.id && event.additional_info.intro_effect.id !== 'none' && (
        <WeddingIntroOverlay
          introId={event.additional_info.intro_effect.id}
          tapToOpen={event.additional_info.intro_effect.tapToOpen || false}
          groomName={event.groom_name || ''}
          brideName={event.bride_name || ''}
          onEnd={() => setShowIntro(false)}
        />
      )}
    </>
  );
}

export async function getServerSideProps(context) {
  const eventId = context.params?.eventId || null;
  const serverTemplate = context.query?.template || null;

  if (!eventId) {
    return {
      props: {
        serverEvent: null,
        serverOgEvent: null,
        serverTemplate,
        serverEventId: null,
      },
    };
  }

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return {
        props: {
          serverEvent: null,
          serverOgEvent: null,
          serverTemplate,
          serverEventId: eventId,
        },
      };
    }

    const res = await fetch(
      `${supabaseUrl}/rest/v1/events?id=eq.${encodeURIComponent(eventId)}&status=eq.active&select=*`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!res.ok) {
      throw new Error(`Supabase fetch failed: ${res.status}`);
    }

    const rows = await res.json();
    const event = Array.isArray(rows) ? rows[0] : null;

    if (!event) {
      return {
        props: {
          serverEvent: null,
          serverOgEvent: null,
          serverTemplate,
          serverEventId: eventId,
        },
      };
    }

    const serverOgEvent = {
      id: event.id,
      groom_name: event.groom_name || null,
      bride_name: event.bride_name || null,
      event_date: event.event_date || null,
      ceremony_time: event.ceremony_time || null,
      location: event.location || null,
      template_style: event.template_style || null,
    };

    return {
      props: {
        serverEvent: null,
        serverOgEvent,
        serverTemplate: serverTemplate || event.template_style || null,
        serverEventId: eventId,
      },
    };
  } catch (error) {
    console.error('Template SSR event fetch error:', error);
    return {
      props: {
        serverEvent: null,
        serverOgEvent: null,
        serverTemplate,
        serverEventId: eventId,
      },
    };
  }
}
