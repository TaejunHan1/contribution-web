// components/templates/WarmOrangeTemplate.js
// 앱의 VintageAppTemplate(웜 오렌지)과 1:1 디자인 매칭 버전
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './WarmOrangeTemplate.module.css';

// ══════════════════════════════════════════════════════
// 유틸
// ══════════════════════════════════════════════════════
const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.uri || image.url || image.src || null;
};

const formatPhone = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  return phone || '';
};

const GALLERY_CAPTIONS = [
  '함께라서 좋은 날 ☀️',
  '웃음이 가득한 하루 😊',
  '소중한 우리의 기록 📸',
  '같이 걸어온 길 🌿',
  '오늘도 사랑해 💕',
  '둘만의 특별한 순간 ✨',
  '설레는 매일 🌸',
  '행복을 담다 🎞️',
];

const DEFAULT_GREETING =
  '같은 곳을 바라보며 걸어온 두 사람이\n이제 한 길을 같이 걸어가려 합니다.\n\n저희 두 사람의 새로운 시작을\n따뜻한 마음으로 축복해주시면\n더 없는 기쁨으로 간직하겠습니다.';

const INITIAL_REVIEWS = [
  { name: '김영희', emoji: '❤️', message: '두 분 정말 축하드려요! 행복하게 잘 살아요~', time: '방금 전' },
  { name: '박철수', emoji: '🎉', message: '결혼 축하해! 정말 잘 어울리는 커플이야', time: '1시간 전' },
  { name: '이수진', emoji: '💐', message: '예쁜 사랑 오래오래 하세요 ♥', time: '3시간 전' },
];

// ══════════════════════════════════════════════════════
// 인트로 오버레이 (당근 알림 스타일)
// ══════════════════════════════════════════════════════
const IntroOverlay = ({ visible, groomName, brideName, onDismiss }) => {
  if (!visible) return null;
  return (
    <div className={styles.introOverlay} onClick={onDismiss}>
      <div className={styles.introBlur} />
      <div className={styles.notifCard} onClick={onDismiss}>
        <div className={styles.notifIcon}>
          <span>🥕</span>
        </div>
        <div className={styles.notifContent}>
          <div className={styles.notifTopRow}>
            <div className={styles.notifAppRow}>
              <span className={styles.notifAppName}>경조앱</span>
              <span className={styles.notifDot} />
            </div>
            <span className={styles.notifTime}>방금 전</span>
          </div>
          <p className={styles.notifMessage}>
            따뜻한 이웃,{' '}
            <strong className={styles.notifCouple}>{groomName || '신랑'} ♥ {brideName || '신부'}</strong>
            {' '}님의 모바일 청첩장이 도착했어요! 💌
          </p>
          <span className={styles.notifHint}>터치해서 열어보기</span>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 히어로 사진 크로스페이드 (클릭 시 확대)
// ══════════════════════════════════════════════════════
const HeroSlideshow = ({ images, onPress }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images?.length]);
  if (!images || images.length === 0) {
    return <div className={styles.heroPlaceholder}>🧡</div>;
  }
  const currentSrc = getImageSrc(images[idx]);
  return (
    <>
      {images.map((img, i) => {
        const src = getImageSrc(img);
        if (!src) return null;
        return (
          <img
            key={i}
            src={src}
            alt=""
            className={`${styles.heroImage} ${i === idx ? styles.heroImageActive : ''}`}
          />
        );
      })}
      {/* 클릭으로 뷰어 열기 — 하단 텍스트 영역은 제외하려 top만 차지 */}
      <button
        type="button"
        className={styles.heroClickZone}
        aria-label="크게 보기"
        onClick={() => currentSrc && onPress && onPress(currentSrc)}
      />
    </>
  );
};

// ══════════════════════════════════════════════════════
// 당근 스타일 달력
// ══════════════════════════════════════════════════════
const DaangnCalendar = ({ targetDate, dDayText, dateStr, timeStr }) => {
  const wd = new Date(targetDate);
  if (isNaN(wd.getTime())) return null;
  const year = wd.getFullYear();
  const month = wd.getMonth();
  const day = wd.getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className={styles.calCard}>
      <div className={styles.calHeader}>
        <span className={styles.calMonthText}>{year}년 {month + 1}월</span>
        {dDayText ? <span className={styles.calDdayBadge}>{dDayText}</span> : null}
      </div>
      <div className={styles.calWeekRow}>
        {dayNames.map((n, i) => (
          <span
            key={n}
            className={`${styles.calWeekCell} ${i === 0 ? styles.calSunday : ''} ${i === 6 ? styles.calSaturday : ''}`}
          >
            {n}
          </span>
        ))}
      </div>
      <div className={styles.calGrid}>
        {cells.map((d, idx) => {
          const col = idx % 7;
          const isTarget = d === day;
          return (
            <div key={idx} className={styles.calDayCell}>
              {d ? (
                isTarget ? (
                  <div className={styles.calDayHighlight}>
                    <span>{d}</span>
                  </div>
                ) : (
                  <span
                    className={`${styles.calDayText} ${col === 0 ? styles.calSunday : ''} ${col === 6 ? styles.calSaturday : ''}`}
                  >
                    {d}
                  </span>
                )
              ) : null}
            </div>
          );
        })}
      </div>
      {timeStr ? (
        <div className={styles.calTimeRow}>
          <span>⏰</span>
          <span>{dateStr} {timeStr}</span>
        </div>
      ) : null}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 축의금 + 연락처 아코디언 (한쪽, 앱 동일)
// ══════════════════════════════════════════════════════
const GiftAccordion = ({ side, isGroom, people, activeKey, onToggle, onCopy, onToast }) => {
  const open = activeKey === side;
  return (
    <div className={styles.accordionCard}>
      <button
        type="button"
        className={styles.accordionHeader}
        onClick={() => onToggle(side)}
      >
        <div className={styles.accordionHeaderLeft}>
          <div
            className={styles.sideBadge}
            style={{ backgroundColor: isGroom ? '#FFF1E8' : '#FFF0F6' }}
          >
            <span>{isGroom ? '🤵' : '👰'}</span>
          </div>
          <span className={styles.accordionTitle}>{isGroom ? '신랑측' : '신부측'}</span>
        </div>
        <span className={styles.accordionChevron}>{open ? '▲' : '▼'}</span>
      </button>
      <div className={`${styles.accordionBody} ${open ? styles.accordionBodyOpen : ''}`}>
        {people.map((p, idx) => (
          <div key={idx} className={styles.personCard}>
            <div className={styles.personCardLabel}>{p.name}</div>
            {p.number ? (
              <button
                type="button"
                className={styles.personRow}
                onClick={() => onCopy(p.number)}
              >
                <span className={styles.personRowValue}>{p.bank} {p.number}</span>
                <span className={styles.copyBtn}>복사</span>
              </button>
            ) : null}
            {p.number && p.contact ? <div className={styles.personDivider} /> : null}
            {p.contact ? (
              <a
                className={styles.personRow}
                href={`tel:${p.contact.replace(/\D/g, '')}`}
              >
                <span className={styles.personRowValue}>📞 {formatPhone(p.contact)}</span>
                <span className={styles.callBtn}>전화</span>
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
const WarmOrangeTemplate = ({
  eventData = {},
  categorizedImages = {},
  allowMessages,
  messageSettings = {},
}) => {
  // 후기 섹션 노출 여부 — prop 우선, 없으면 eventData.allow_messages, 그것도 없으면 기본 true
  const shouldShowReviews =
    allowMessages !== undefined
      ? allowMessages !== false
      : (eventData?.allow_messages !== false);
  // ── 인트로 ──
  const [showIntro, setShowIntro] = useState(true);

  // ── 기본 상태 ── (신랑측 기본 펼침 — 앱은 닫혀있지만 웹은 바로 볼 수 있게)
  const [activeAccount, setActiveAccount] = useState('groom');
  const [viewerImage, setViewerImage] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  // 사랑 온도 — DB에서 초기값 로드 후 realtime 구독
  const [temperature, setTemperature] = useState(() => {
    const t = Number(eventData?.love_temperature);
    return Number.isFinite(t) ? t : 36.5;
  });
  const [tempReached100, setTempReached100] = useState(false);
  const [reviews] = useState(INITIAL_REVIEWS);

  // ── 모달 상태 (기존 유지) ──
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [myContribution, setMyContribution] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [contributionKey, setContributionKey] = useState(0);
  const [guestMessages, setGuestMessages] = useState([]);
  const [hasWrittenGuestbook, setHasWrittenGuestbook] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [, forceUpdate] = useState({});

  const modalOpeningRef = useRef(false);
  const modalClosingRef = useRef(false);
  const arrivalModalCheckedRef = useRef(false);

  // ── 이름 ──
  const groomName = eventData.groomName || eventData.groom_name || '';
  const brideName = eventData.brideName || eventData.bride_name || '';

  const ai = (() => {
    if (!eventData.additional_info) return {};
    if (typeof eventData.additional_info === 'string') {
      try { return JSON.parse(eventData.additional_info); } catch { return {}; }
    }
    return eventData.additional_info || {};
  })();

  // ── 부모님 ──
  const groomFather = eventData.groomFatherName || eventData.groom_father_name || '';
  const groomMother = eventData.groomMotherName || eventData.groom_mother_name || '';
  const brideFather = eventData.brideFatherName || eventData.bride_father_name || '';
  const brideMother = eventData.brideMotherName || eventData.bride_mother_name || '';

  // ── 연락처 (eventData / additional_info 양쪽 다 체크, 다양한 필드명 지원) ──
  const groomContact =
    eventData.groomContact || eventData.groom_contact ||
    eventData.groom_phone || eventData.groomPhone ||
    ai.groom_contact || ai.groom_phone || '';
  const brideContact =
    eventData.brideContact || eventData.bride_contact ||
    eventData.bride_phone || eventData.bridePhone ||
    ai.bride_contact || ai.bride_phone || '';
  const groomFatherContact =
    eventData.groomFatherContact || eventData.groom_father_contact ||
    ai.groom_father_contact || ai.groom_father_phone || '';
  const groomMotherContact =
    eventData.groomMotherContact || eventData.groom_mother_contact ||
    ai.groom_mother_contact || ai.groom_mother_phone || '';
  const brideFatherContact =
    eventData.brideFatherContact || eventData.bride_father_contact ||
    ai.bride_father_contact || ai.bride_father_phone || '';
  const brideMotherContact =
    eventData.brideMotherContact || eventData.bride_mother_contact ||
    ai.bride_mother_contact || ai.bride_mother_phone || '';

  // ── 날짜/시간 ──
  const weddingDate = eventData.date || eventData.event_date;
  const dateInfo = (() => {
    if (!weddingDate) return { full: '', year: '', month: '', day: '', dayOfWeek: '' };
    const d = new Date(weddingDate);
    if (isNaN(d.getTime())) return { full: '', year: '', month: '', day: '', dayOfWeek: '' };
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return { year: y, month: m, day, dayOfWeek: days[d.getDay()], full: `${y}년 ${m}월 ${day}일 ${days[d.getDay()]}` };
  })();
  const dateStr = dateInfo.full;
  const timeStr = eventData.ceremonyTime || eventData.ceremony_time || '';

  // ── D-day ──
  let dDayText = '';
  if (weddingDate) {
    const diff = Math.ceil((new Date(weddingDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diff > 0) dDayText = `D-${diff}`;
    else if (diff === 0) dDayText = 'D-Day';
    else dDayText = `D+${Math.abs(diff)}`;
  }

  // ── 장소 ──
  const locName = eventData.hallName || eventData.hall_name || eventData.location || '';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '';

  // ── 이미지 처리 ──
  const defaultImages = {
    main: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=800&h=1000&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1000&fit=crop',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=700&fit=crop',
    ],
  };
  const processImageData = () => {
    if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;
    if (eventData?.processedImages && eventData.processedImages.length > 0) {
      const c = { main: [], gallery: [], groom: [], bride: [], all: [] };
      eventData.processedImages.forEach((img) => {
        const o = { uri: img.primaryUrl || img.publicUrl || img.uri, publicUrl: img.publicUrl, category: img.category };
        if (img.category && c[img.category]) c[img.category].push(o);
        c.all.push(o);
      });
      return c;
    }
    if (eventData?.image_urls && eventData.image_urls.length > 0) {
      const norm = eventData.image_urls.map((img) =>
        typeof img === 'string' ? { uri: img, category: 'main' } : { uri: img.publicUrl || img.uri || img, category: img.category || 'main' }
      );
      return {
        main: norm.filter((i) => i.category === 'main'),
        gallery: norm.filter((i) => i.category === 'gallery'),
        groom: norm.filter((i) => i.category === 'groom'),
        bride: norm.filter((i) => i.category === 'bride'),
        all: norm,
      };
    }
    return defaultImages;
  };
  const processed = processImageData();
  const safeImages = {
    main: processed?.main?.length > 0 ? processed.main : defaultImages.main,
    gallery: processed?.gallery?.length > 0 ? processed.gallery : defaultImages.gallery,
    groom: processed?.groom?.length > 0 ? processed.groom : [],
    bride: processed?.bride?.length > 0 ? processed.bride : [],
  };

  // ── 축의금 & 연락처 통합 데이터 ──
  const buildPerson = (name, role, bank, number, contact) => {
    if (!number && !contact) return null;
    return { name: name || role, role, bank: bank || '', number: number || '', contact: contact || '' };
  };
  const accounts = {
    groom: [
      buildPerson(groomName || '신랑', '신랑', ai.groom_bank_name, ai.groom_account_number, groomContact),
      buildPerson(groomFather ? `${groomFather} 아버님` : '아버님', '아버님', ai.groom_father_bank_name, ai.groom_father_account_number, groomFatherContact),
      buildPerson(groomMother ? `${groomMother} 어머님` : '어머님', '어머님', ai.groom_mother_bank_name, ai.groom_mother_account_number, groomMotherContact),
    ].filter(Boolean),
    bride: [
      buildPerson(brideName || '신부', '신부', ai.bride_bank_name, ai.bride_account_number, brideContact),
      buildPerson(brideFather ? `${brideFather} 아버님` : '아버님', '아버님', ai.bride_father_bank_name, ai.bride_father_account_number, brideFatherContact),
      buildPerson(brideMother ? `${brideMother} 어머님` : '어머님', '어머님', ai.bride_mother_bank_name, ai.bride_mother_account_number, brideMotherContact),
    ].filter(Boolean),
  };
  const hasAnyAccount = accounts.groom.length > 0 || accounts.bride.length > 0;

  // ── 토스트 ──
  const toastTimerRef = useRef(null);
  const showToast = (message) => {
    setToast({ visible: true, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('계좌번호가 복사되었어요');
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  // ── 아코디언 토글 ──
  const toggleAccount = (side) => {
    setActiveAccount((prev) => (prev === side ? null : side));
  };

  // ── 사랑 온도 (아무나 누를 수 있고, 연타해도 되돌아가지 않음) ──
  const [floatingHearts, setFloatingHearts] = useState([]);

  // eventData 로드/변경 시 DB의 love_temperature 값으로 초기화 (새로고침 복원)
  useEffect(() => {
    if (eventData?.love_temperature == null) return;
    const t = Number(eventData.love_temperature);
    if (!Number.isFinite(t)) return;
    setTemperature((prev) => Math.max(prev, t));
    if (t >= 100) setTempReached100(true);
  }, [eventData?.love_temperature, eventData?.id]);

  // realtime 구독: 다른 사람이 올려도 즉시 반영 (단, 내 로컬값보다 낮으면 무시 — 되돌아감 방지)
  useEffect(() => {
    if (!eventData?.id) return;
    const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!u || !k) return;
    const supabase = createClient(u, k);
    const sub = supabase
      .channel(`love_temp_${eventData.id}`)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'events', filter: `id=eq.${eventData.id}` },
        (payload) => {
          const t = Number(payload?.new?.love_temperature);
          if (!Number.isFinite(t)) return;
          setTemperature((prev) => {
            const next = Math.max(prev, t); // 항상 단조 증가
            if (next >= 100 && !tempReached100) setTempReached100(true);
            return next;
          });
        })
      .subscribe();
    return () => { sub.unsubscribe(); };
  }, [eventData?.id]); // eslint-disable-line

  const handleTempPress = () => {
    // 로컬 즉시 반영 — setState 함수형으로 현재값 기준 증가 (연타해도 누락 없음)
    setTemperature((prev) => {
      if (prev >= 100) return prev;
      const next = Math.min(Number((prev + 0.1).toFixed(1)), 100);
      if (next >= 100 && !tempReached100) {
        setTempReached100(true);
        showToast('🎉 사랑 온도 100도 달성! 축하합니다!');
      }
      return next;
    });

    // 떠오르는 하트
    const id = Date.now() + Math.random();
    const x = Math.random() * 260 + 20;
    setFloatingHearts((prev) => [...prev, { id, x }]);
    setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== id)), 1500);

    // 서버 호출 — 가드 없음, 매 탭마다 발사. RPC가 원자적이라 동시 호출도 안전.
    // 응답값은 "현재값보다 높을 때만" 반영 → 로컬 누적치를 절대 되돌리지 않음
    if (!eventData?.id) return;
    fetch('/api/increment-love-temp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId: eventData.id }),
    })
      .then((r) => r.json())
      .then((result) => {
        if (!result?.success) return;
        const serverT = Number(result.temperature);
        if (!Number.isFinite(serverT)) return;
        setTemperature((prev) => Math.max(prev, serverT));
      })
      .catch(() => {});
  };
  const tempRatio = Math.min((temperature - 36.5) / (100 - 36.5), 1);

  // ── 공유 — 브라우저 기본 OS 공유창 (Web Share API) ──
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = `${groomName || '신랑'} ♡ ${brideName || '신부'} 결혼식 초대장`;
    const text = `${groomName || '신랑'} ♡ ${brideName || '신부'}의 결혼식 초대장이 도착했어요!\n${dateStr}${timeStr ? ' ' + timeStr : ''}\n${locName || ''}`;

    // Web Share API — 모바일 Safari/Chrome에서 OS 기본 공유창 (카톡/메시지/인스타 등)
    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (err) {
        if (err && err.name === 'AbortError') return; // 유저가 취소
        // 실패 시 아래 클립보드 복사로 fallthrough
      }
    }

    // 공유 API 미지원 (데스크톱·HTTP 환경) → 링크 복사
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement('textarea');
        ta.value = url;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      showToast('초대장 링크가 복사됐어요 📋');
    } catch {
      showToast('공유에 실패했어요. 주소창을 복사해주세요');
    }
  };

  // ═════════════════════════════════════════════════
  // 기존 데이터 연동 로직 (유지)
  // ═════════════════════════════════════════════════
  useEffect(() => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (!verifiedPhone || !eventData?.id) return;
    let isSubscribed = true;

    const fetchMyContribution = async () => {
      if (!isSubscribed) return;
      try {
        const r = await fetch(`/api/get-my-contribution?eventId=${eventData.id}&phone=${encodeURIComponent(verifiedPhone)}`);
        const result = await r.json();
        if (result.success && result.contribution && isSubscribed) {
          setMyContribution({ ...result.contribution, amount: result.contribution.contributionAmount || result.contribution.amount });
        }
      } catch {}
    };
    fetchMyContribution();

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const sub = supabase
      .channel(`warm_orange_guest_book_${eventData.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` },
        (payload) => {
          if (payload.new && payload.new.guest_phone === verifiedPhone) {
            const c = {
              id: payload.new.id,
              guestName: payload.new.guest_name,
              contributionAmount: payload.new.amount,
              amount: payload.new.amount,
              relationship: payload.new.relation_detail,
              side: payload.new.relation_category,
              phone: payload.new.guest_phone,
            };
            setMyContribution(c);
            setContributionKey((p) => p + 1);
            forceUpdate({});
          } else if (payload.old && payload.old.guest_phone === verifiedPhone && payload.eventType === 'DELETE') {
            setMyContribution(null);
          }
        })
      .subscribe();

    return () => { isSubscribed = false; sub.unsubscribe(); };
  }, [eventData?.id]);

  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    try {
      const r = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await r.json();
      if (result.success && result.messages) setGuestMessages(result.messages);
    } catch {}
  };

  useEffect(() => {
    fetchGuestbook();
    let sub = null;
    if (eventData?.id) {
      const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (u && k) {
        const supabase = createClient(u, k);
        sub = supabase
          .channel('warm-orange-guestbook-changes')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: new Date(p.new.created_at).toLocaleDateString('ko-KR'), content: p.new.message || '' };
            setGuestMessages((prev) => [m, ...prev]);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: new Date(p.new.created_at).toLocaleDateString('ko-KR'), content: p.new.message || '' };
            setGuestMessages((prev) => prev.map((x) => (x.id === p.new.id ? m : x)));
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            setGuestMessages((prev) => prev.filter((x) => x.id !== p.old.id));
          })
          .subscribe();
      }
    }
    return () => { if (sub) sub.unsubscribe(); };
  }, [eventData?.id]);

  useEffect(() => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (verifiedPhone && guestMessages.length > 0) {
      setHasWrittenGuestbook(guestMessages.some((m) => m.phone === verifiedPhone && m.content && m.content.trim() !== ''));
    } else {
      setHasWrittenGuestbook(false);
    }
  }, [guestMessages]);

  useEffect(() => {
    if (myContribution && eventData?.id) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`arrival_checked_${eventData.id}`, 'true');
      }
      arrivalModalCheckedRef.current = true;
      if (showWelcomeChoice) setShowWelcomeChoice(false);
    }
  }, [myContribution]); // eslint-disable-line

  const mergedMessages = useMemo(() => {
    const ids = new Set(guestMessages.map((m) => m.id));
    const fromProps = (eventData.guestMessages || []).filter((m) => !ids.has(m.id));
    return [...guestMessages, ...fromProps];
  }, [guestMessages, eventData.guestMessages]);

  // 실제 DB에서 온 메시지만 표시 (더미 데이터 없음)
  const displayMessages = useMemo(() => {
    return mergedMessages.filter((m) => m.content && m.content.trim() !== '');
  }, [mergedMessages]);

  const messagesPerPage = 3;
  const totalPages = Math.ceil(displayMessages.length / messagesPerPage);
  const pagedMessages = displayMessages.slice(currentPage * messagesPerPage, (currentPage + 1) * messagesPerPage);

  // ── 모달 핸들러 ──
  const checkAndShowWelcomeChoice = () => {
    if (arrivalModalCheckedRef.current || showWelcomeChoice) return false;
    const arrivalKey = `arrival_checked_${eventData?.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(arrivalKey)) return false;
    arrivalModalCheckedRef.current = true;
    setShowWelcomeChoice(true);
    return true;
  };

  const handleTriggerArrival = () => {
    const existing = myContribution?.amount || myContribution?.contributionAmount;
    if (existing) return;
    setTimeout(() => setShowContributionModal(true), 300);
  };

  const handleGuestbookModalOpen = () => {
    if (modalOpeningRef.current || showGuestbookModal) return;
    modalOpeningRef.current = true;
    setShowGuestbookModal(true);
    setTimeout(() => { modalOpeningRef.current = false; }, 500);
  };

  const handleGuestbookModalClose = () => {
    if (modalClosingRef.current) return;
    modalClosingRef.current = true;
    setShowGuestbookModal(false);
    setTimeout(() => { modalClosingRef.current = false; }, 300);
  };

  const handleGuestbookSubmit = async (g) => {
    try {
      const newMsg = {
        id: `temp-${Date.now()}`,
        from: g.name || '익명',
        phone: g.phone,
        date: new Date().toLocaleDateString('ko-KR'),
        content: g.message || '',
      };
      setGuestMessages((prev) => [newMsg, ...prev]);
      setHasWrittenGuestbook(true);
      setCurrentPage(0);
      setTimeout(async () => { await fetchGuestbook(); }, 500);
    } catch (e) {
      throw e;
    }
  };

  const handleEditMessage = (m) => { setEditingMessage(m); setShowEditModal(true); };
  const handleEditUpdate = async () => { await fetchGuestbook(); };
  const handleEditDelete = async () => {
    if (editingMessage?.id) {
      setGuestMessages((prev) => prev.map((m) => (m.id === editingMessage.id ? { ...m, content: '' } : m)));
    }
    setHasWrittenGuestbook(false);
    setShowEditModal(false);
    setEditingMessage(null);
  };
  const canEditMessage = (m) => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    return verifiedPhone && m.phone === verifiedPhone;
  };

  const handleSelectGuestbook = () => { setShowWelcomeChoice(false); setShowGuestbookModal(true); };
  const handleSelectContribution = () => {
    setShowWelcomeChoice(false);
    setTimeout(() => setShowContributionModal(true), 100);
  };

  const handleContributionSubmit = async (data) => {
    try {
      const r = await fetch('/api/submit-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await r.json();
      if (result.success) {
        if (typeof window !== 'undefined') localStorage.setItem(`arrival_checked_${eventData?.id}`, 'true');
        arrivalModalCheckedRef.current = true;
        setCompletionData(data);
        setShowContributionModal(false);
        setIsEditMode(false);
        if (isEditMode && myContribution) {
          setMyContribution({ ...myContribution, ...data, amount: data.contributionAmount });
          setContributionKey((p) => p + 1);
        }
        setTimeout(() => setShowCompletionModal(true), 300);
      } else {
        throw new Error(result.error || '축의금 등록 실패');
      }
    } catch (e) {
      alert(`축의금 등록 중 오류가 발생했습니다:\n${e.message}`);
      throw e;
    }
  };

  // 인트로 닫힌 뒤 Welcome choice
  const dismissIntro = () => {
    setShowIntro(false);
    setTimeout(() => checkAndShowWelcomeChoice(), 500);
  };

  // 인사말
  const greetingMessage = (() => {
    const m = eventData.customMessage || eventData.custom_message;
    if (typeof m === 'string' && m.trim()) return m;
    if (typeof m === 'object' && m?.poem) return m.poem;
    return DEFAULT_GREETING;
  })();

  // 갤러리 회전값 (index 기반 고정)
  const galleryItems = safeImages.gallery.map((img, idx) => ({
    src: getImageSrc(img),
    caption: GALLERY_CAPTIONS[idx % GALLERY_CAPTIONS.length],
    rotate: [-2.5, 1.8, -1.2, 2, -1.8, 1.2][idx % 6],
    height: [220, 180, 200][idx % 3],
  })).filter((i) => i.src);

  const allImages = [...safeImages.main, ...safeImages.gallery];

  return (
    <>
      {/* ═══ 인트로 오버레이 ═══ */}
      <IntroOverlay
        visible={showIntro}
        groomName={groomName}
        brideName={brideName}
        onDismiss={dismissIntro}
      />

      <div className={styles.root} style={{ opacity: showIntro ? 0.3 : 1 }}>
        {/* ═══ 1. 히어로 ═══ */}
        <section className={styles.hero}>
          <HeroSlideshow images={safeImages.main} onPress={setViewerImage} />
          <div className={styles.heroBottomFade} />
          <div className={styles.heroContent}>
            <div className={styles.heroBadge}>
              <span>저희 결혼합니다 🥕</span>
            </div>
            <h1 className={styles.heroNames}>
              <span>{groomName || '이민호'}</span>
              <span className={styles.heroHeart}>♥</span>
              <span>{brideName || '배하윤'}</span>
            </h1>
            <p className={styles.heroDate}>{dateStr} {timeStr}</p>
          </div>
        </section>

        {/* ═══ 2. 인사말 (앱: 단독 흰 섹션, 주황 타이틀, 부모 정보 항상 노출) ═══ */}
        <section className={styles.greetingSection}>
          <h2 className={styles.greetingTitle}>초대합니다</h2>
          <p className={styles.greetingText}>{greetingMessage}</p>
          <div className={styles.parentsBox}>
            <div className={styles.parentsRow}>
              <span className={styles.parentsNames}>
                {groomFather || '아버지'}
                {' · '}
                {groomMother || '어머니'}
              </span>
              <span className={styles.parentsRole}>의 아들</span>
              <span className={styles.parentsChild}>{groomName || '신랑'}</span>
            </div>
            <div className={styles.parentsRow} style={{ marginTop: 12 }}>
              <span className={styles.parentsNames}>
                {brideFather || '아버지'}
                {' · '}
                {brideMother || '어머니'}
              </span>
              <span className={styles.parentsRole}>의 딸</span>
              <span className={styles.parentsChild}>{brideName || '신부'}</span>
            </div>
          </div>
        </section>

        {/* ═══ 3. 사랑 온도 카드 ═══ */}
        <button type="button" className={styles.tempCard} onClick={handleTempPress}>
          <p className={styles.tempGuide}>터치해서 두 사람의 사랑 온도를 올려주세요!</p>
          <div className={styles.tempRow}>
            <span className={styles.tempFireIcon}>🔥</span>
            <div className={styles.tempBarArea}>
              <div className={styles.tempValueRow}>
                <span className={styles.tempValue}>{temperature.toFixed(1)}°C</span>
                <span className={styles.tempMax}>100°C</span>
              </div>
              <div className={styles.tempBarBg}>
                <div
                  className={styles.tempBarFill}
                  style={{ width: `${tempRatio * 100}%` }}
                />
              </div>
            </div>
          </div>
          {tempReached100 && (
            <p className={styles.tempCongrats}>🎉 축하해주셔서 감사합니다!</p>
          )}
        </button>
        {/* 떠오르는 하트 */}
        {floatingHearts.length > 0 && (
          <div className={styles.floatingHeartsLayer}>
            {floatingHearts.map((h) => (
              <span key={h.id} className={styles.floatingHeart} style={{ left: h.x }}>❤️</span>
            ))}
          </div>
        )}

        {/* ═══ 4. 스크랩북 갤러리 (2행 × N열 가로 스크롤) ═══ */}
        {galleryItems.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEmoji}>📷</span>
              <h2 className={styles.sectionTitle}>우리의 스크랩북</h2>
            </div>
            <div className={styles.galleryOuter}>
              <div className={styles.galleryScrollWrap}>
                <div className={styles.galleryGrid}>
                  {galleryItems.map((item, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={styles.polaroid}
                      style={{
                        '--r': `${item.rotate}deg`,
                        animationDelay: `${(idx % 6) * 0.4}s`,
                      }}
                      onClick={() => setViewerImage(item.src)}
                    >
                      <div className={styles.polaroidTape}>
                        <div className={styles.tapeStrip} />
                      </div>
                      <img src={item.src} alt="" className={styles.polaroidImage} style={{ height: item.height }} />
                      <span className={styles.polaroidCaption}>{item.caption}</span>
                    </button>
                  ))}
                </div>
              </div>
              {/* 4장 초과일 때 우측 페이드 (더 있다는 시각 힌트) */}
              {galleryItems.length > 4 && <div className={styles.galleryFadeRight} aria-hidden="true" />}
            </div>
            {galleryItems.length > 4 && (
              <p className={styles.galleryHint}>
                옆으로 밀면 사진 {galleryItems.length - 4}장이 더 있어요
              </p>
            )}
          </section>
        )}

        {/* ═══ 5. 지인들의 따뜻한 후기 (실제 DB 데이터만, 더미 없음) ═══ */}
        {shouldShowReviews && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEmoji}>💬</span>
              <h2 className={styles.sectionTitle}>지인들의 따뜻한 후기</h2>
            </div>
            {displayMessages.length === 0 ? (
              <div className={styles.emptyReviews}>
                <span className={styles.emptyReviewsIcon}>💌</span>
                <p className={styles.emptyReviewsText}>
                  아직 축하 메시지가 없어요.<br />
                  첫 번째 응원의 메시지를 남겨보세요!
                </p>
              </div>
            ) : (
              <>
                {pagedMessages.map((msg, idx) => (
                  <div key={msg.id || idx} className={styles.reviewCard}>
                    <div className={styles.reviewTop}>
                      <div className={styles.reviewAvatar}>
                        <span>{['🧡','🎉','💐','✨','🌸'][idx % 5]}</span>
                      </div>
                      <div className={styles.reviewMeta}>
                        <span className={styles.reviewName}>{msg.from}</span>
                        <span className={styles.reviewTime}>{msg.date}</span>
                      </div>
                      {canEditMessage(msg) && (
                        <button
                          type="button"
                          className={styles.editMsgBtn}
                          onClick={() => handleEditMessage(msg)}
                        >
                          수정
                        </button>
                      )}
                    </div>
                    <p className={styles.reviewMessage}>{msg.content}</p>
                  </div>
                ))}
                {totalPages > 1 && (
                  <div className={styles.pagination}>
                    <button type="button" onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0}>‹</button>
                    <div className={styles.pageDots}>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <button key={i} type="button" className={`${styles.pageDot} ${i === currentPage ? styles.pageDotActive : ''}`} onClick={() => setCurrentPage(i)} />
                      ))}
                    </div>
                    <button type="button" onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1}>›</button>
                  </div>
                )}
              </>
            )}
            {!hasWrittenGuestbook && (
              <button
                type="button"
                className={styles.addReviewBtn}
                onClick={handleGuestbookModalOpen}
                disabled={showGuestbookModal}
              >
                + 축하 메시지 남기기
              </button>
            )}
          </section>
        )}

        {/* ═══ 6. 축의금 + 연락처 ═══ */}
        {hasAnyAccount && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEmoji}>🧡</span>
              <h2 className={styles.sectionTitle}>축의금 보내기</h2>
            </div>
            <p className={styles.giftDesc}>계좌번호 터치하면 복사, 연락처 터치하면 전화가 연결됩니다</p>
            {accounts.groom.length > 0 && (
              <GiftAccordion
                side="groom"
                isGroom={true}
                people={accounts.groom}
                activeKey={activeAccount}
                onToggle={toggleAccount}
                onCopy={copyToClipboard}
                onToast={showToast}
              />
            )}
            {accounts.bride.length > 0 && (
              <GiftAccordion
                side="bride"
                isGroom={false}
                people={accounts.bride}
                activeKey={activeAccount}
                onToggle={toggleAccount}
                onCopy={copyToClipboard}
                onToast={showToast}
              />
            )}
          </section>
        )}

        {/* ═══ 7. 당근 스타일 달력 ═══ */}
        {weddingDate && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEmoji}>📅</span>
              <h2 className={styles.sectionTitle}>우리의 그날</h2>
            </div>
            <DaangnCalendar targetDate={weddingDate} dDayText={dDayText} dateStr={dateStr} timeStr={timeStr} />
          </section>
        )}

        {/* ═══ 8. 오시는 길 ═══ */}
        {locName && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionEmoji}>📍</span>
              <h2 className={styles.sectionTitle}>오시는 길</h2>
            </div>
            <p className={styles.locName}>{locName}</p>
            {locAddr && <p className={styles.locAddr}>{locAddr}</p>}
            <p className={styles.locDate}>{dateStr} {timeStr}</p>
            <div className={styles.mapContainer}>
              <GoogleMapEmbed
                address={`${locName} ${locAddr}`.trim()}
                venueName={locName}
                width="100%"
                height="240px"
              />
            </div>
            {(eventData.parking_info || eventData.parkingInfo) && (
              <div className={styles.parkingCard}>
                <span>🅿️</span>
                <div>
                  <div className={styles.parkingTitle}>주차 안내</div>
                  <div className={styles.parkingText}>{eventData.parking_info || eventData.parkingInfo}</div>
                </div>
              </div>
            )}
          </section>
        )}

        <div style={{ height: 120 }} />
      </div>

      {/* ═══ 하단 고정 버튼 ═══ */}
      <div className={styles.bottomBar}>
        <button type="button" className={styles.shareMainBtn} onClick={handleShare}>
          주변 지인에게 공유하기 🥕
        </button>
      </div>

      {/* ═══ 토스트 ═══ */}
      {toast.visible && (
        <div className={styles.toast}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* ═══ 이미지 뷰어 ═══ */}
      {viewerImage && (
        <div className={styles.viewerBg} onClick={() => setViewerImage(null)}>
          <button type="button" className={styles.viewerClose} onClick={() => setViewerImage(null)}>✕</button>
          <img src={viewerImage} className={styles.viewerImage} alt="" />
        </div>
      )}

      {/* ═══ 모달들 (기존 기능 유지) ═══ */}
      <WelcomeChoiceModal
        isOpen={showWelcomeChoice}
        onClose={() => setShowWelcomeChoice(false)}
        onSelectGuestbook={handleSelectGuestbook}
        onSelectContribution={handleSelectContribution}
        eventData={eventData}
      />
      <GuestbookModal
        isOpen={showGuestbookModal}
        onClose={handleGuestbookModalClose}
        onSubmit={handleGuestbookSubmit}
        eventData={eventData}
        onTriggerArrival={handleTriggerArrival}
        onBack={() => { setShowGuestbookModal(false); setShowWelcomeChoice(true); }}
      />
      <EditGuestbookModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingMessage(null); }}
        message={editingMessage}
        eventData={eventData}
        onUpdate={handleEditUpdate}
        onDelete={handleEditDelete}
      />
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => { setShowContributionModal(false); setIsEditMode(false); }}
        onBack={!isEditMode ? () => { setShowContributionModal(false); setShowWelcomeChoice(true); } : undefined}
        onSubmit={handleContributionSubmit}
        eventData={eventData}
        editData={isEditMode ? myContribution : null}
        onVerifiedExisting={(c) => setMyContribution({ ...c, amount: c.contributionAmount })}
      />
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setCompletionData(null); }}
        contributionData={completionData}
        eventData={eventData}
      />
    </>
  );
};

export default WarmOrangeTemplate;
