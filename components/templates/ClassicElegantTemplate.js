// components/templates/ClassicElegantTemplate.js
// 앱의 ClassicElegantTemplate과 1:1 디자인 매칭
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './ClassicElegantTemplate.module.css';

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

const formatGuestbookDateTime = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
    .format(date)
    .replace(/\.\s?/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();
};

const formatCeremonyTime = (time) => {
  const value = String(time || '').trim();
  if (!value) return '';

  const match = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return value;

  const period = hour < 12 ? '오전' : '오후';
  const displayHour = hour % 12 || 12;
  const minuteText = minute > 0 ? ` ${minute}분` : '';

  return `${period} ${displayHour}시${minuteText}`;
};

const trimFamilyName = (name) => {
  const clean = (name || '').trim();
  if (clean.length <= 2) return clean;
  return clean.slice(1);
};

const isAddressLike = (value) =>
  /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주|특별시|광역시|특별자치시|특별자치도|시\s|구\s|군\s|동\s|읍\s|면\s|로\s*\d|길\s*\d)/.test(value || '');

const stripParentheses = (value) =>
  (value || '').replace(/\s*\([^)]+\)\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();

const getParenthesizedDetails = (value) =>
  [...(value || '').matchAll(/\(([^)]+)\)/g)]
    .map((match) => match[1].trim())
    .filter(Boolean);

const getLocationLines = (...values) => {
  const candidates = values.map((value) => (value || '').trim()).filter(Boolean);
  const addressSource = candidates.find(isAddressLike) || candidates[0] || '';
  const parenthesizedDetails = candidates.flatMap(getParenthesizedDetails);
  const detailSource =
    parenthesizedDetails[0] ||
    candidates.find((value) => value !== addressSource && !isAddressLike(value)) ||
    '';
  const detailAddress = stripParentheses(detailSource);
  const mainAddress = stripParentheses(addressSource)
    .replace(detailAddress, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return [mainAddress, detailAddress].filter((line, index, lines) => line && lines.indexOf(line) === index);
};

const DEFAULT_GREETING =
  '서로가 마주보며 다져온 사랑을\n이제 함께 한 곳을 바라보며\n걸어갈 수 있는 큰 사랑으로 키우고자 합니다.\n\n저희 두 사람이 사랑의 이름으로\n지켜나갈 수 있게 앞날을\n축복해 주시면 감사하겠습니다.';

const CAL_DAYS = ['일', '월', '화', '수', '목', '금', '토'];
const CUSTOM_INVITATION_EVENT_IDS = new Set([
  '640a5d7e-059d-46f5-bef2-7bae63ce93e1',
  '65e2dd46-65c7-447d-9113-d57e712eac02',
]);
const isCustomInvitationEvent = (eventId) => CUSTOM_INVITATION_EVENT_IDS.has(eventId);

// ══════════════════════════════════════════════════════
// 히어로 사진 크로스페이드
// ══════════════════════════════════════════════════════
const HeroSlideshow = ({ images, onPress }) => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!images || images.length <= 1) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images?.length]);
  if (!images || images.length === 0) {
    return <div className={styles.heroPlaceholder}>💍</div>;
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
            draggable={false}
            className={`${styles.heroImage} ${i === idx ? styles.heroImageActive : ''}`}
          />
        );
      })}
      <button
        type="button"
        className={styles.heroClickZone}
        aria-label="사진 크게 보기"
        onClick={() => currentSrc && onPress?.(currentSrc)}
      />
    </>
  );
};

// ══════════════════════════════════════════════════════
// 달력 (결혼일 하트 표시, 2026 / 05 / 09 포맷)
// ══════════════════════════════════════════════════════
const ElegantCalendar = ({ targetDate, ceremonyTime, dDayText, groomName, brideName }) => {
  const wd = new Date(targetDate);
  if (isNaN(wd.getTime())) return null;
  const year = wd.getFullYear();
  const month = wd.getMonth();
  const day = wd.getDate();
  const firstDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  return (
    <div className={styles.calendarBlock}>
      <div className={styles.calMonthYear}>
        {year} / {String(month + 1).padStart(2, '0')} / {String(day).padStart(2, '0')}
      </div>
      {ceremonyTime ? (
        <div className={styles.weddingTimeInfo}>
          <span className={styles.weddingTimeLabel}>TIME</span>
          <span className={styles.weddingTimeText}>{formatCeremonyTime(ceremonyTime)}</span>
        </div>
      ) : null}
      <div className={styles.calendarWrap}>
        <div className={styles.calDayHeaderRow}>
          {CAL_DAYS.map((d, i) => (
            <span
              key={d}
              className={`${styles.calDayHeaderText} ${i === 0 ? styles.calSunday : ''}`}
            >
              {d}
            </span>
          ))}
        </div>
        <div className={styles.calDayHeaderDivider} />
        <div className={styles.calGrid}>
          {Array.from({ length: firstDow }).map((_, i) => (
            <div key={`e${i}`} className={styles.calCell} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const isWedding = d === day;
            const dow = (firstDow + i) % 7;
            const isSunday = dow === 0;
            if (isWedding) {
              return (
                <div key={i} className={styles.calCell}>
                  <div className={styles.calHeartWrap}>
                    <span className={styles.calHeartIcon}>♥</span>
                    <span className={styles.calHeartDay}>{d}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={i} className={styles.calCell}>
                <span className={`${styles.calDayText} ${isSunday ? styles.calSunday : ''}`}>
                  {d}
                </span>
              </div>
            );
          })}
        </div>
        {dDayText && (
          <div className={styles.calFooter}>
            <p className={styles.calFooterText}>
              {trimFamilyName(groomName) || '신랑'} ♥ {trimFamilyName(brideName) || '신부'}의 결혼식이{' '}
              <span className={styles.calFooterDday}>{dDayText}</span> 남았습니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 계좌 + 연락처 아코디언
// ══════════════════════════════════════════════════════
const MindAccordion = ({ side, people, activeKey, onToggle, onCopy }) => {
  const open = activeKey === side;
  const isGroom = side === 'groom';
  const hasNumber = people.some((person) => person.number);
  const hasContact = people.some((person) => person.contact);
  const titleSuffix =
    hasNumber && hasContact ? '계좌·연락처' :
    hasNumber ? '계좌' :
    hasContact ? '연락처' : '';
  return (
    <div className={styles.accordionCard}>
      <button type="button" className={styles.accordionHeader} onClick={() => onToggle(side)}>
        <span className={styles.accordionTitle}>
          {isGroom ? '신랑측' : '신부측'} {titleSuffix}
        </span>
        <span className={`${styles.accordionChevron} ${open ? styles.chevronOpen : ''}`}>▼</span>
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
              <a className={styles.personRow} href={`tel:${p.contact.replace(/\D/g, '')}`}>
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

const CustomTransportationGuide = () => (
  <div className={styles.transportGuide}>
    <div className={styles.transportItem}>
      <div className={styles.transportLabel}>지하철</div>
      <div className={styles.transportContent}>
        <strong>9호선 가양역</strong>
        <span>9번 출구 도보 1분 · 금부빌딩 8층</span>
      </div>
    </div>

    <div className={styles.transportItem}>
      <div className={styles.transportLabel}>버스</div>
      <div className={styles.transportContent}>
        <div className={styles.busLineList}>
          <span><b className={styles.busBlue}>간선</b>652, 672, 660</span>
          <span><b className={styles.busGreen}>지선</b>6632</span>
          <span><b className={styles.busRed}>광역</b>7700</span>
          <span><b className={styles.busGray}>공항</b>6008</span>
        </div>
      </div>
    </div>

    <div className={styles.transportItem}>
      <div className={styles.transportLabel}>자가용</div>
      <div className={styles.transportContent}>
        <div className={styles.parkingLots}>
          <div>
            <strong>본관 주차장</strong>
            <span>2시간 무료</span>
            <small>“루이비스 컨벤션 강서점” 또는 “양천로 476 금부빌딩” 검색</small>
          </div>
          <div>
            <strong>제2주차장</strong>
            <span>3시간 무료</span>
            <small>“가양 아벨테크노 지식산업센터” 검색</small>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
const ClassicElegantTemplate = ({
  eventData = {},
  categorizedImages = {},
  allowMessages,
  messageSettings = {},
}) => {
  // ── 모달 상태 ──
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

  // ── 기본 상태 ──
  const [viewerImage, setViewerImage] = useState(null);
  const [viewerIndex, setViewerIndex] = useState(-1);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [activeAccount, setActiveAccount] = useState(null);

  const modalOpeningRef = useRef(false);
  const modalClosingRef = useRef(false);
  const arrivalModalCheckedRef = useRef(false);
  const galleryScrollRef = useRef(null);
  const galleryDragRef = useRef({
    active: false,
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    moved: false,
  });
  const viewerSwipeRef = useRef({ startX: 0, startY: 0 });

  // 후기 섹션 노출 여부
  const shouldShowReviews =
    allowMessages !== undefined
      ? allowMessages !== false
      : (eventData?.allow_messages !== false);

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

  // ── 연락처 ──
  const groomContact =
    eventData.groomContact || eventData.groom_contact ||
    eventData.groom_phone || ai.groom_contact || ai.groom_phone || '';
  const brideContact =
    eventData.brideContact || eventData.bride_contact ||
    eventData.bride_phone || ai.bride_contact || ai.bride_phone || '';
  const groomFatherContact = eventData.groomFatherContact || ai.groom_father_contact || '';
  const groomMotherContact = eventData.groomMotherContact || ai.groom_mother_contact || '';
  const brideFatherContact = eventData.brideFatherContact || ai.bride_father_contact || '';
  const brideMotherContact = eventData.brideMotherContact || ai.bride_mother_contact || '';

  // ── 날짜 ──
  const weddingDate = eventData.date || eventData.event_date;
  const timeStr = eventData.ceremonyTime || eventData.ceremony_time || '';
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
  const locationLines = getLocationLines(locName, locAddr);
  const shouldShowParkingImage = isCustomInvitationEvent(eventData.id);

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
  };

  // ── 계좌 + 연락처 ──
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
  const accountPeople = [...accounts.groom, ...accounts.bride];
  const hasAccountNumber = accountPeople.some((person) => person.number);
  const hasContactNumber = accountPeople.some((person) => person.contact);
  const accountGuideText = (() => {
    if (hasAccountNumber && hasContactNumber) {
      return (
        <>
          계좌번호는 터치하면 복사되고,<br />연락처는 터치하면 전화가 연결됩니다.
        </>
      );
    }
    if (hasAccountNumber) return '계좌번호는 터치하면 복사됩니다.';
    if (hasContactNumber) return '연락처는 터치하면 전화가 연결됩니다.';
    return '';
  })();

  const toggleAccount = (side) => setActiveAccount((prev) => (prev === side ? null : side));

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

  // ── 공유 (OS 공유창) ──
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = `${groomName || '신랑'} ♥ ${brideName || '신부'} 결혼식 초대장`;
    const text = `${groomName || '신랑'} ♥ ${brideName || '신부'}의 결혼식 초대장입니다.${timeStr ? '\n' + timeStr : ''}\n${locName || ''}`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (err) { if (err?.name === 'AbortError') return; }
    }
    try {
      if (navigator.clipboard) await navigator.clipboard.writeText(url);
      else {
        const ta = document.createElement('textarea');
        ta.value = url; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
      }
      showToast('초대장 링크가 복사됐어요 📋');
    } catch { showToast('공유에 실패했어요'); }
  };

  // ═════════════════════════════════════════════════
  // 기존 Supabase 연동 로직
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
      .channel(`classic_elegant_guest_book_${eventData.id}`)
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
          .channel('classic-elegant-guestbook-changes')
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: formatGuestbookDateTime(p.new.created_at), content: p.new.message || '' };
            setGuestMessages((prev) => [m, ...prev]);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: formatGuestbookDateTime(p.new.created_at), content: p.new.message || '' };
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
      if (typeof window !== 'undefined') localStorage.setItem(`arrival_checked_${eventData.id}`, 'true');
      arrivalModalCheckedRef.current = true;
      if (showWelcomeChoice) setShowWelcomeChoice(false);
    }
  }, [myContribution]); // eslint-disable-line

  const mergedMessages = useMemo(() => {
    const ids = new Set(guestMessages.map((m) => m.id));
    const fromProps = (eventData.guestMessages || []).filter((m) => !ids.has(m.id));
    return [...guestMessages, ...fromProps];
  }, [guestMessages, eventData.guestMessages]);

  const displayMessages = useMemo(() => {
    return mergedMessages.filter((m) => m.content && m.content.trim() !== '');
  }, [mergedMessages]);

  // ── 모달 핸들러 ──
  const checkAndShowWelcomeChoice = () => {
    if (isCustomInvitationEvent(eventData?.id)) return false;
    if (arrivalModalCheckedRef.current || showWelcomeChoice) return false;
    const arrivalKey = `arrival_checked_${eventData?.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(arrivalKey)) return false;
    arrivalModalCheckedRef.current = true;
    setShowWelcomeChoice(true);
    return true;
  };
  const handleTriggerArrival = () => {
    if (isCustomInvitationEvent(eventData?.id)) return;
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
    const newMsg = {
      id: `temp-${Date.now()}`, from: g.name || '익명', phone: g.phone,
      date: formatGuestbookDateTime(new Date()), content: g.message || '',
    };
    setGuestMessages((prev) => [newMsg, ...prev]);
    setHasWrittenGuestbook(true);
    setTimeout(async () => { await fetchGuestbook(); }, 500);
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
        method: 'POST', headers: { 'Content-Type': 'application/json' },
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
      } else throw new Error(result.error || '축의금 등록 실패');
    } catch (e) {
      alert(`축의금 등록 오류:\n${e.message}`);
      throw e;
    }
  };

  useEffect(() => {
    if (!eventData?.id) return undefined;
    if (isCustomInvitationEvent(eventData.id)) {
      setShowWelcomeChoice(false);
      arrivalModalCheckedRef.current = true;
      return undefined;
    }
    const t = setTimeout(() => checkAndShowWelcomeChoice(), 1200);
    return () => clearTimeout(t);
  }, [eventData?.id]); // eslint-disable-line

  const greetingMessage = (() => {
    const m = eventData.customMessage || eventData.custom_message;
    if (typeof m === 'string' && m.trim()) return m;
    if (typeof m === 'object' && m?.poem) return m.poem;
    return DEFAULT_GREETING;
  })();

  const galleryItems = safeImages.gallery.map((img) => ({ src: getImageSrc(img) })).filter((i) => i.src);

  const scrollGallery = (direction) => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.86, 360);
    const maxLeft = Math.max(0, el.scrollWidth - el.clientWidth);
    const nextLeft = Math.max(0, Math.min(maxLeft, el.scrollLeft + direction * amount));

    el.scrollTo({ left: nextLeft, behavior: 'smooth' });
    window.setTimeout(() => {
      el.scrollLeft = nextLeft;
    }, 260);
  };

  const handleGalleryWheel = (event) => {
    const el = galleryScrollRef.current;
    if (!el) return;
    const canScroll = el.scrollWidth > el.clientWidth;
    if (!canScroll || Math.abs(event.deltaX) >= Math.abs(event.deltaY)) return;
    event.preventDefault();
    el.scrollLeft += event.deltaY;
  };

  const handleGalleryPointerDown = (event) => {
    const el = galleryScrollRef.current;
    if (!el || el.scrollWidth <= el.clientWidth) return;

    galleryDragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: el.scrollLeft,
      moved: false,
    };
  };

  const handleGalleryPointerMove = (event) => {
    const el = galleryScrollRef.current;
    const drag = galleryDragRef.current;
    if (!el || !drag.active || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    if (Math.abs(deltaX) > 6) {
      drag.moved = true;
    }
    if (drag.moved) {
      el.scrollLeft = drag.startScrollLeft - deltaX;
    }
  };

  const handleGalleryPointerEnd = (event) => {
    const drag = galleryDragRef.current;
    if (drag.pointerId !== event.pointerId) return;
    galleryDragRef.current.active = false;
  };

  const handleGalleryImagePress = (src) => {
    if (galleryDragRef.current.moved) {
      galleryDragRef.current.moved = false;
      return;
    }
    const nextIndex = galleryItems.findIndex((item) => item.src === src);
    setViewerIndex(nextIndex);
    setViewerImage(src);
  };

  const handleGalleryCardPointerUp = (src) => {
    if (galleryDragRef.current.moved) return;
    handleGalleryImagePress(src);
  };

  const handleGalleryCardClick = (event, src) => {
    if (event.detail !== 0) return;
    handleGalleryImagePress(src);
  };

  const openHeroViewer = (src) => {
    setViewerIndex(-1);
    setViewerImage(src);
  };

  const closeViewer = () => {
    setViewerImage(null);
    setViewerIndex(-1);
  };

  const moveViewer = (direction) => {
    if (galleryItems.length === 0) return;
    const currentIndex = viewerIndex >= 0 ? viewerIndex : galleryItems.findIndex((item) => item.src === viewerImage);
    if (currentIndex < 0) return;
    const nextIndex = (currentIndex + direction + galleryItems.length) % galleryItems.length;
    setViewerIndex(nextIndex);
    setViewerImage(galleryItems[nextIndex].src);
  };

  const handleViewerTouchStart = (event) => {
    if (event.touches.length > 1) {
      if (event.cancelable) event.preventDefault();
      return;
    }
    const touch = event.touches[0];
    viewerSwipeRef.current = { startX: touch.clientX, startY: touch.clientY };
  };

  const handleViewerTouchMove = (event) => {
    if (event.touches.length > 1 && event.cancelable) {
      event.preventDefault();
    }
  };

  const handleViewerTouchEnd = (event) => {
    if (viewerIndex < 0 || galleryItems.length <= 1) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - viewerSwipeRef.current.startX;
    const deltaY = touch.clientY - viewerSwipeRef.current.startY;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
      moveViewer(deltaX < 0 ? 1 : -1);
    }
  };

  return (
    <>
      <div className={styles.root}>
        {/* ═══ 1. 히어로 ═══ */}
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <HeroSlideshow images={safeImages.main} onPress={openHeroViewer} />
            <div className={styles.heroInnerFrame} />
          </div>
        </section>

        {/* 이름 — 사진 아래 */}
        <div className={styles.heroTextSection}>
          <h1 className={styles.heroNames}>
            <span>{groomName || '신랑'}</span>
            <span className={styles.heroHeart}>♥</span>
            <span>{brideName || '신부'}</span>
          </h1>
        </div>

        {/* ═══ 2. 인사말 ═══ */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Invitation</div>
          <div className={styles.divider} />
          <p className={styles.greetingText}>{greetingMessage}</p>
          {(groomFather || groomMother || brideFather || brideMother) && (
            <div className={styles.parentsWrap}>
              <p className={styles.parentsText}>
                {groomFather || '아버지'}{groomFather && groomMother ? ' · ' : ''}{groomMother || '어머니'}
                <span className={styles.parentsRole}>의 장남 </span>
                <span className={styles.parentsChild}>{groomName || '신랑'}</span>
              </p>
              <p className={styles.parentsText} style={{ marginTop: 8 }}>
                {brideFather || '아버지'}{brideFather && brideMother ? ' · ' : ''}{brideMother || '어머니'}
                <span className={styles.parentsRole}>의 장녀 </span>
                <span className={styles.parentsChild}>{brideName || '신부'}</span>
              </p>
            </div>
          )}
        </section>

        {/* ═══ 3. 달력 ═══ */}
        {weddingDate && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Date</div>
            <div className={styles.divider} />
            <ElegantCalendar
              targetDate={weddingDate}
              ceremonyTime={timeStr}
              dDayText={dDayText}
              groomName={groomName}
              brideName={brideName}
            />
          </section>
        )}

        {/* ═══ 4. 갤러리 ═══ */}
        {galleryItems.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Gallery</div>
            <div className={styles.divider} />
            <div className={styles.galleryOuter}>
              {galleryItems.length > 4 && (
                <button
                  type="button"
                  className={`${styles.galleryNavButton} ${styles.galleryNavPrev}`}
                  aria-label="이전 사진 보기"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    scrollGallery(-1);
                  }}
                >
                  ‹
                </button>
              )}
              <div
                ref={galleryScrollRef}
                className={styles.galleryScrollWrap}
                onWheel={handleGalleryWheel}
                onPointerDown={handleGalleryPointerDown}
                onPointerMove={handleGalleryPointerMove}
                onPointerUp={handleGalleryPointerEnd}
                onPointerCancel={handleGalleryPointerEnd}
              >
                <div className={styles.galleryGrid}>
                  {galleryItems.map((item, idx) => (
                    <button
                      type="button"
                      key={idx}
                      className={styles.galleryCard}
                      onPointerUp={() => handleGalleryCardPointerUp(item.src)}
                      onClick={(event) => handleGalleryCardClick(event, item.src)}
                    >
                      <img src={item.src} alt="" className={styles.galleryImage} draggable={false} />
                    </button>
                  ))}
                </div>
              </div>
              {galleryItems.length > 4 && <div className={styles.galleryFadeRight} />}
              {galleryItems.length > 4 && (
                <button
                  type="button"
                  className={`${styles.galleryNavButton} ${styles.galleryNavNext}`}
                  aria-label="다음 사진 보기"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation();
                    scrollGallery(1);
                  }}
                >
                  ›
                </button>
              )}
            </div>
            {galleryItems.length > 4 && (
              <p className={styles.galleryHint} aria-label="옆으로 밀면 사진이 더 있어요">
                <button
                  type="button"
                  className={styles.galleryHintArrow}
                  aria-label="이전 사진 보기"
                  onClick={() => scrollGallery(-1)}
                >
                  ‹
                </button>
                <span>옆으로 밀면 사진이 더 있어요</span>
                <button
                  type="button"
                  className={styles.galleryHintArrow}
                  aria-label="다음 사진 보기"
                  onClick={() => scrollGallery(1)}
                >
                  ›
                </button>
              </p>
            )}
          </section>
        )}

        {/* ═══ 5. 오시는 길 ═══ */}
        {locName && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Location</div>
            <div className={styles.divider} />
            {locationLines.length > 0 ? (
              <p className={styles.locationAddr}>
                {locationLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </p>
            ) : (
              <p className={styles.locationName}>{locName}</p>
            )}
            <div className={styles.mapContainer}>
              <GoogleMapEmbed
                address={`${locName} ${locAddr}`.trim()}
                venueName={locName}
                width="100%"
                height="240px"
              />
            </div>
            {!shouldShowParkingImage && (eventData.parking_info || eventData.parkingInfo) && (
              <div className={styles.parkingCard}>
                <span>🅿️</span>
                <div>
                  <div className={styles.parkingTitle}>주차 안내</div>
                  <div className={styles.parkingText}>{eventData.parking_info || eventData.parkingInfo}</div>
                </div>
              </div>
            )}
            {shouldShowParkingImage && (
              <CustomTransportationGuide />
            )}
          </section>
        )}

        {/* ═══ 6. 계좌 + 연락처 (Mind) ═══ */}
        {hasAnyAccount && (
          <section className={styles.section}>
            <div className={styles.sectionLabel}>Mind</div>
            <div className={styles.divider} />
            {accountGuideText && (
              <p className={styles.accountDesc}>{accountGuideText}</p>
            )}
            {accounts.groom.length > 0 && (
              <MindAccordion
                side="groom"
                people={accounts.groom}
                activeKey={activeAccount}
                onToggle={toggleAccount}
                onCopy={copyToClipboard}
              />
            )}
            {accounts.bride.length > 0 && (
              <MindAccordion
                side="bride"
                people={accounts.bride}
                activeKey={activeAccount}
                onToggle={toggleAccount}
                onCopy={copyToClipboard}
              />
            )}
          </section>
        )}

        {/* ═══ 7. 방명록 (Guestbook) ═══ */}
        {shouldShowReviews && (
          <section className={`${styles.section} ${styles.sectionSurface}`}>
            <div className={styles.sectionLabel}>Guestbook</div>
            <div className={styles.divider} />
            {displayMessages.length === 0 ? (
              <div className={styles.emptyReviews}>
                <span className={styles.emptyReviewsIcon}>✉️</span>
                <p className={styles.emptyReviewsText}>
                  아직 메시지가 없어요.<br />
                  첫 번째 축하의 글을 남겨주세요.
                </p>
              </div>
            ) : (
              displayMessages.slice(0, 10).map((msg, idx) => (
                <div key={msg.id || idx} className={styles.gbCard}>
                  <div className={styles.gbCardHeader}>
                    <span className={styles.gbCardName}>{msg.from}</span>
                    <div className={styles.gbCardMeta}>
                      {canEditMessage(msg) && (
                        <button
                          type="button"
                          className={styles.gbEditBtn}
                          onClick={() => handleEditMessage(msg)}
                        >
                          수정
                        </button>
                      )}
                      <span className={styles.gbCardTime}>{msg.date}</span>
                    </div>
                  </div>
                  <p className={styles.gbCardMessage}>{msg.content}</p>
                </div>
              ))
            )}
            {!hasWrittenGuestbook && (
              <button
                type="button"
                className={styles.gbWriteBtn}
                onClick={handleGuestbookModalOpen}
                disabled={showGuestbookModal}
              >
                ✏️ 메시지 작성하기
              </button>
            )}
          </section>
        )}

        {/* ═══ 푸터 ═══ */}
        <footer className={styles.footer}>
          <div className={styles.footerThankYou}>Thank You</div>
          <div className={styles.footerNames}>{groomName || '신랑'} &amp; {brideName || '신부'}</div>
          <div className={styles.footerBtns}>
            <button type="button" className={styles.footerBtn} onClick={handleShare}>
              초대장 공유하기
            </button>
          </div>
        </footer>

        <div style={{ height: 40 }} />
      </div>

      {/* ═══ 토스트 ═══ */}
      {toast.visible && (
        <div className={styles.toast}><span>{toast.message}</span></div>
      )}

      {viewerImage && (
        <div
          className={styles.viewerBg}
          onClick={closeViewer}
          onTouchStart={handleViewerTouchStart}
          onTouchMove={handleViewerTouchMove}
          onTouchEnd={handleViewerTouchEnd}
          onDoubleClick={(event) => {
            if (event.cancelable) event.preventDefault();
          }}
        >
          <button
            type="button"
            className={styles.viewerClose}
            aria-label="사진 닫기"
            onClick={(event) => {
              event.stopPropagation();
              closeViewer();
            }}
          >
            ✕
          </button>
          {viewerIndex >= 0 && galleryItems.length > 1 && (
            <>
              <button
                type="button"
                className={`${styles.viewerNavButton} ${styles.viewerNavPrev}`}
                aria-label="이전 사진 보기"
                onClick={(event) => {
                  event.stopPropagation();
                  moveViewer(-1);
                }}
              >
                ‹
              </button>
              <button
                type="button"
                className={`${styles.viewerNavButton} ${styles.viewerNavNext}`}
                aria-label="다음 사진 보기"
                onClick={(event) => {
                  event.stopPropagation();
                  moveViewer(1);
                }}
              >
                ›
              </button>
              <div className={styles.viewerCounter}>
                {viewerIndex + 1} / {galleryItems.length}
              </div>
            </>
          )}
          <img
            src={viewerImage}
            alt=""
            className={styles.viewerImage}
            draggable={false}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {/* ═══ 모달들 ═══ */}
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
        onTriggerArrival={
          isCustomInvitationEvent(eventData?.id)
            ? undefined
            : handleTriggerArrival
        }
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

export default ClassicElegantTemplate;
