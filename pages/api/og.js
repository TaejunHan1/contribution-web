// pages/api/og.js - 동적 OG 이미지 생성 (Next.js Edge Runtime)
import { ImageResponse } from 'next/og';

export const config = {
  runtime: 'edge',
};

// 템플릿별 테마 색상
const THEMES = {
  'classic-elegant': { bg: '#FBF8F4', accent: '#8B7355', text: '#3D2B1F', border: '#C9B89A' },
  'romantic-pink':   { bg: '#FFF5F7', accent: '#C96B8E', text: '#6B2E45', border: '#F4C2CF' },
  'modern-dark':     { bg: '#1A1A2E', accent: '#E8D5B7', text: '#F0EDE8', border: '#4A4A6A' },
  'modern-minimal':  { bg: '#F8F9FA', accent: '#4A5568', text: '#2D3748', border: '#CBD5E0' },
  'elegant-garden':  { bg: '#F0F7F4', accent: '#5A7A6A', text: '#2D4A3E', border: '#A8C5B8' },
  'warm-orange':     { bg: '#FFF8F3', accent: '#D4845A', text: '#6B3419', border: '#F4C5A8' },
  'clean-white':     { bg: '#F5F8FB', accent: '#5B7FA6', text: '#2C4A6B', border: '#B8CDE0' },
  'aurora-black':    { bg: '#1C1C1C', accent: '#C4A882', text: '#EDE8E0', border: '#3A3A3A' },
  'korean':          { bg: '#FFF9F0', accent: '#8B4513', text: '#4A1F0A', border: '#D4A574' },
  'vintage':         { bg: '#FAF5E9', accent: '#8B6914', text: '#4A3008', border: '#D4B96A' },
};

const DEFAULT_THEME = THEMES['classic-elegant'];

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export default async function handler(req) {
  const { searchParams } = new URL(req.url);
  const eventId = searchParams.get('eventId');
  const template = searchParams.get('template') || 'classic-elegant';

  // 이벤트 데이터 Supabase REST로 직접 조회
  let eventData = null;
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && supabaseKey && eventId) {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/events?id=eq.${eventId}&select=groom_name,bride_name,event_date,ceremony_time,location`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
        }
      );
      const rows = await res.json();
      eventData = Array.isArray(rows) ? rows[0] : null;
    }
  } catch (_) {
    // 데이터 없이 기본값으로 렌더링
  }

  // 한국어 폰트 로딩
  let fontData;
  try {
    const css = await fetch(
      'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700',
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    ).then((r) => r.text());

    const woff2Url = css.match(/url\(([^)]+\.woff2)\)/)?.[1];
    if (woff2Url) {
      fontData = await fetch(woff2Url).then((r) => r.arrayBuffer());
    }
  } catch (_) {
    // 폰트 없이 렌더링
  }

  const theme = THEMES[template] ?? DEFAULT_THEME;

  const groomName = eventData?.groom_name || '신랑';
  const brideName = eventData?.bride_name || '신부';
  const location = eventData?.location || '';
  const ceremonyTime = eventData?.ceremony_time || '';

  let dateStr = '';
  if (eventData?.event_date) {
    const d = new Date(eventData.event_date);
    dateStr = `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${WEEKDAYS[d.getDay()]}요일`;
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          background: theme.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: fontData ? 'NotoSansKR' : 'sans-serif',
          position: 'relative',
        }}
      >
        {/* 바깥 테두리 */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            left: '24px',
            right: '24px',
            bottom: '24px',
            border: `2px solid ${theme.border}`,
          }}
        />
        {/* 안쪽 테두리 */}
        <div
          style={{
            position: 'absolute',
            top: '34px',
            left: '34px',
            right: '34px',
            bottom: '34px',
            border: `1px solid ${theme.border}`,
          }}
        />

        {/* 본문 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* 장식 */}
          <div style={{ color: theme.accent, fontSize: '22px', marginBottom: '18px', letterSpacing: '8px' }}>
            ✦ ✦ ✦
          </div>

          {/* 소제목 */}
          <div
            style={{
              color: theme.accent,
              fontSize: '22px',
              letterSpacing: '8px',
              marginBottom: '36px',
            }}
          >
            결혼식에 초대합니다
          </div>

          {/* 이름 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '28px',
              marginBottom: '36px',
            }}
          >
            <span style={{ color: theme.text, fontSize: '72px', fontWeight: '700' }}>
              {groomName}
            </span>
            <span style={{ color: theme.accent, fontSize: '52px' }}>♡</span>
            <span style={{ color: theme.text, fontSize: '72px', fontWeight: '700' }}>
              {brideName}
            </span>
          </div>

          {/* 구분선 */}
          <div
            style={{
              width: '220px',
              height: '1px',
              background: theme.border,
              marginBottom: '28px',
            }}
          />

          {/* 날짜 */}
          {dateStr ? (
            <div style={{ color: theme.text, fontSize: '24px', marginBottom: '8px', opacity: 0.85 }}>
              {dateStr}
            </div>
          ) : null}

          {/* 시간 */}
          {ceremonyTime ? (
            <div style={{ color: theme.text, fontSize: '22px', marginBottom: '12px', opacity: 0.7 }}>
              {ceremonyTime}
            </div>
          ) : null}

          {/* 장소 */}
          {location ? (
            <div style={{ color: theme.accent, fontSize: '22px', fontWeight: '700' }}>
              {location}
            </div>
          ) : null}
        </div>

        {/* 하단 브랜딩 */}
        <div
          style={{
            position: 'absolute',
            bottom: '52px',
            color: theme.text,
            fontSize: '15px',
            opacity: 0.35,
            letterSpacing: '3px',
          }}
        >
          정담 · 디지털 경조사
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: fontData
        ? [{ name: 'NotoSansKR', data: fontData, style: 'normal', weight: 400 }]
        : [],
    }
  );
}
