// pages/template/[eventId].js - 모바일 청첩장 템플릿 표시 페이지
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { getEventDetails, supabase } from '../../lib/supabase';
import KoreanElegantTemplate from '../../components/templates/KoreanElegantTemplate';
import VintageTemplate from '../../components/templates/VintageTemplate';
import ModernMinimalTemplate from '../../components/templates/ModernMinimalTemplate';
import RomanticPinkTemplate from '../../components/templates/RomanticPinkTemplate';
import ElegantGardenTemplate from '../../components/templates/ElegantGardenTemplate';

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

export default function TemplatePage() {
  const router = useRouter();
  const { eventId } = router.query;
  const template = router.query.template || 'modern';

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      
      // 먼저 API 경로로 시도
      const response = await fetch(`/api/template-data?eventId=${eventId}`);
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEvent(result.data);
        } else {
          // 데이터가 없으면 기본 샘플 데이터 사용
          setEvent(createSampleEventData(eventId));
        }
      } else {
        // API 에러 시 기본 샘플 데이터 사용
        console.warn('API error, using sample data:', response.status);
        setEvent(createSampleEventData(eventId));
      }
    } catch (error) {
      console.error('Event loading error:', error);
      // 에러 발생 시에도 기본 샘플 데이터 사용
      setEvent(createSampleEventData(eventId));
    } finally {
      setLoading(false);
    }
  };

  // 샘플 데이터 생성 함수
  const createSampleEventData = (id) => ({
    id: id,
    event_name: '모바일 청첩장',
    event_type: 'wedding',
    event_date: new Date().toISOString().split('T')[0],
    ceremony_time: '14:00',
    location: '웨딩홀',
    detailed_address: '',
    groom_name: '신랑',
    bride_name: '신부',
    groom_father_name: '신랑 아버지',
    groom_mother_name: '신랑 어머니', 
    bride_father_name: '신부 아버지',
    bride_mother_name: '신부 어머니',
    primary_contact: '010-0000-0000',
    secondary_contact: null,
    custom_message: '저희 두 사람의 소중한 순간에 함께해 주세요.',
    template_style: template,
    status: 'active'
  });

  const getTemplateComponent = () => {
    if (!event) return null;
    
    // 이미지 데이터 구성
    const categorizedImages = event.additional_info?.categorized_images || {};
    
    switch (template) {
      case 'modern':
        return <ModernMinimalTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'romantic':
        return <RomanticPinkTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'korean':
        return <KoreanElegantTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'garden':
        return <ElegantGardenTemplate eventData={event} categorizedImages={categorizedImages} />;
      case 'vintage':
        return <VintageTemplate eventData={event} categorizedImages={categorizedImages} />;
      default:
        return <ModernTemplate eventData={event} />;
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>청첩장 로딩 중...</title>
        </Head>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="loading-spinner mb-4"></div>
            <p className="text-gray-600">청첩장을 불러오는 중...</p>
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

  const getTemplateTitle = () => {
    switch (template) {
      case 'modern': return '모던 미니멀';
      case 'romantic': return '로맨틱 핑크';
      case 'korean': return '한국 전통';
      case 'garden': return '엘레간트 가든';
      case 'vintage': return '빈티지';
      default: return '모바일 청첩장';
    }
  };

  return (
    <>
      <Head>
        <title>{event.event_name} - {getTemplateTitle()}</title>
        <meta name="description" content={`${event.groom_name} & ${event.bride_name}의 결혼식에 초대합니다`} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* 소셜 미디어 메타 태그 */}
        <meta property="og:title" content={`${event.groom_name} & ${event.bride_name}의 결혼식`} />
        <meta property="og:description" content={`${new Date(event.event_date).toLocaleDateString('ko-KR')} ${event.ceremony_time || ''}`} />
        <meta property="og:type" content="website" />
        
        {/* 모바일 최적화 */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </Head>

      {getTemplateComponent()}
    </>
  );
}