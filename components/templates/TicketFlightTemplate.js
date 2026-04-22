// components/templates/TicketFlightTemplate.js
// 러브 티켓 (Love Ticket) — 앱 TicketFlightTemplate과 1:1 매칭
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './TicketFlightTemplate.module.css';

// ══════════════════════════════════════════════════════
// 유틸
// ══════════════════════════════════════════════════════
const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.uri || image.url || image.src || null;
};

const CAL_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const DEFAULT_GREETING =
  '각자의 길을 비행하던 두 사람이\n이제 한 비행기에 올라\n같은 목적지를 향해 날아가려 합니다.\n\n가장 설레는 첫 출발의 순간,\n소중한 분들을 저희의 비행에 초대합니다.\n귀한 걸음 하시어 축복해 주시면\n더없는 기쁨으로 간직하겠습니다.';

// 이륙 비행기 SVG
const AIRPLANE_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 100 100">
    <g fill="#2B3C88">
      <path d="M82.5,43.2 C82.5,37 72,33.5 58,35.8 L44,38 L25,25 L20,26 L30,42 L16,45 L11,39 L6,40 L11,51 C11,56 16,58.5 22,58.5 L73,58.5 C80,58.5 82.5,50 82.5,43.2 Z" />
      <path d="M26,72 L74,72" stroke="#2B3C88" strokeWidth="7" strokeLinecap="round" />
    </g>
  </svg>
);

// ══════════════════════════════════════════════════════
// 바코드 (flex 비율로 카드 전체 폭 채움)
// ══════════════════════════════════════════════════════
const Barcode = () => {
  // 촘촘하고 얇은 패턴 — 100개 바, 대부분 1, 간간이 2
  const pattern = Array.from({ length: 100 }, (_, i) => {
    if (i % 11 === 0) return 2;
    if (i % 17 === 0) return 2;
    return 1;
  });
  return (
    <div className={styles.barcodeRow}>
      {pattern.map((w, i) => (
        <div
          key={i}
          style={{
            flex: w,
            height: '100%',
            background: i % 2 === 0 ? '#111' : 'transparent',
          }}
        />
      ))}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 스터브 카드
// ══════════════════════════════════════════════════════
const StubCard = ({ headerBg = '#1e3799', icon, title, footer = 'barcode', children }) => {
  const renderFooter = () => {
    if (footer === 'barcode') {
      return (
        <>
          <div className={styles.dividerWrap}>
            <div className={styles.dividerLine} />
            <div className={styles.nub} style={{ left: -14 }} />
            <div className={styles.nub} style={{ right: -14 }} />
          </div>
          <div className={styles.barcodeBody}>
            <Barcode />
          </div>
        </>
      );
    }
    if (footer) {
      return (
        <>
          <div className={styles.dividerWrap}>
            <div className={styles.dividerLine} />
            <div className={styles.nub} style={{ left: -14 }} />
            <div className={styles.nub} style={{ right: -14 }} />
          </div>
          <div className={styles.footerBody}>{footer}</div>
        </>
      );
    }
    return null;
  };
  return (
    <div className={styles.stubCard}>
      <div className={styles.stubHeader} style={{ background: headerBg }}>
        <span className={styles.stubHeaderIcon}>{icon}</span>
        <span className={styles.stubHeaderText}>{title}</span>
      </div>
      <div className={styles.stubBody}>{children}</div>
      {renderFooter()}
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 달력
// ══════════════════════════════════════════════════════
const CalendarView = ({ year, month, day }) => {
  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return (
    <div>
      <div className={styles.calTopRow}>
        <div className={styles.calMonth}>{month}월</div>
        <div className={styles.calDetailBox}>
          <div className={styles.calDetailLabel}>탑승일</div>
          <div className={styles.calDetailValue}>
            {year}. {String(month).padStart(2, '0')}. {String(day).padStart(2, '0')}
          </div>
        </div>
      </div>
      <div className={styles.calHeaderRow}>
        {CAL_DAYS.map((d) => (
          <span key={d} className={styles.calDayLabel}>{d}</span>
        ))}
      </div>
      <div className={styles.calGrid}>
        {rows.flat().map((d, i) => (
          <div key={i} className={styles.calCell}>
            {d === day ? (
              <div className={styles.calPulse}>
                <span className={styles.calDday}>{d}</span>
              </div>
            ) : (
              <span className={styles.calDay}>{d ?? ''}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 계좌 아코디언
// ══════════════════════════════════════════════════════
const AccountItem = ({ label, bank, account, name, onCopy }) => {
  const [open, setOpen] = useState(false);
  const safeAccount = account || '';
  return (
    <div className={styles.accItem}>
      <button type="button" className={styles.accBtn} onClick={() => setOpen(!open)}>
        <span>👤 {label}</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>
      <div className={`${styles.accPanel} ${open ? styles.accPanelOpen : ''}`}>
        <span className={styles.accPanelText}>{bank} {safeAccount} ({name})</span>
        <button
          type="button"
          className={styles.accCopyBtn}
          onClick={(e) => {
            e.stopPropagation();
            onCopy(safeAccount.replace(/-/g, ''));
          }}
        >
          복사
        </button>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 슬라이더 "밀어서 탑승하기"
// ══════════════════════════════════════════════════════
const BoardingSlider = ({ onSuccess }) => {
  const [dragX, setDragX] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const sliderRef = useRef(null);
  const startXRef = useRef(null);
  const maxRef = useRef(0);

  useEffect(() => {
    if (sliderRef.current) {
      maxRef.current = sliderRef.current.offsetWidth - 56; // thumb size 48 + pad 4*2
    }
  }, []);

  const onPointerDown = (e) => {
    if (unlocked) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    startXRef.current = e.clientX;
  };
  const onPointerMove = (e) => {
    if (unlocked || startXRef.current == null) return;
    const dx = Math.max(0, Math.min(e.clientX - startXRef.current, maxRef.current));
    setDragX(dx);
  };
  const onPointerUp = () => {
    if (unlocked || startXRef.current == null) return;
    startXRef.current = null;
    if (dragX > maxRef.current * 0.85) {
      setDragX(maxRef.current);
      setUnlocked(true);
      onSuccess();
    } else {
      setDragX(0);
    }
  };

  const textOpacity = unlocked ? 1 : 1 - dragX / maxRef.current;

  return (
    <div ref={sliderRef} className={styles.slider}>
      <span className={styles.sliderText} style={{ opacity: textOpacity }}>
        {unlocked ? '탑승 수속 완료!' : '밀어서 탑승하기  >>'}
      </span>
      <div
        className={`${styles.sliderThumb} ${unlocked ? styles.sliderThumbUnlocked : ''}`}
        style={{ transform: `translateX(${dragX}px)` }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <span className={styles.sliderThumbIcon}>✈</span>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
const TicketFlightTemplate = ({
  eventData = {},
  categorizedImages = {},
  allowMessages,
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
  const [guestMessages, setGuestMessages] = useState([]);
  const [hasWrittenGuestbook, setHasWrittenGuestbook] = useState(false);
  const arrivalModalCheckedRef = useRef(false);

  // ── 탑승 상태 ──
  const [isBoarded, setIsBoarded] = useState(false);
  const [showStamp, setShowStamp] = useState(false);
  const [stampGone, setStampGone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [fadingOut, setFadingOut] = useState(false); // 인트로 페이드아웃

  const shouldShowReviews =
    allowMessages !== undefined
      ? allowMessages !== false
      : (eventData?.allow_messages !== false);

  // ── 데이터 ──
  const groomName = eventData.groomName || eventData.groom_name || '김철수';
  const brideName = eventData.brideName || eventData.bride_name || '이영희';
  const groomFather = eventData.groomFatherName || eventData.groom_father_name || '';
  const groomMother = eventData.groomMotherName || eventData.groom_mother_name || '';
  const brideFather = eventData.brideFatherName || eventData.bride_father_name || '';
  const brideMother = eventData.brideMotherName || eventData.bride_mother_name || '';

  const ai = (() => {
    if (!eventData.additional_info) return {};
    if (typeof eventData.additional_info === 'string') {
      try { return JSON.parse(eventData.additional_info); } catch { return {}; }
    }
    return eventData.additional_info || {};
  })();

  const weddingDate = eventData.date || eventData.event_date;
  const wd = new Date(weddingDate || Date.now());
  const calYear = isNaN(wd.getTime()) ? new Date().getFullYear() : wd.getFullYear();
  const calMonth = isNaN(wd.getTime()) ? 1 : wd.getMonth() + 1;
  const calDay = isNaN(wd.getTime()) ? 1 : wd.getDate();
  const dowKr = ['일', '월', '화', '수', '목', '금', '토'][wd.getDay()];
  const dateStr = !isNaN(wd.getTime())
    ? `${calYear}. ${String(calMonth).padStart(2, '0')}. ${String(calDay).padStart(2, '0')} (${dowKr})`
    : '';
  const timeStr = eventData.ceremonyTime || eventData.ceremony_time || '';
  let dDayText = '';
  if (!isNaN(wd.getTime())) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const target = new Date(wd); target.setHours(0, 0, 0, 0);
    const diff = Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff > 0) dDayText = `D-${diff}`;
    else if (diff === 0) dDayText = 'D-DAY';
    else dDayText = `D+${Math.abs(diff)}`;
  }

  const locName = eventData.hallName || eventData.hall_name || eventData.location || '웨딩홀';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '';

  // ── 이미지 처리 ──
  const defaultImages = {
    main: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=800&h=1000&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=600&h=700&fit=crop',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=600&h=700&fit=crop',
    ],
  };
  const processImageData = () => {
    if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;
    if (eventData?.processedImages?.length > 0) {
      const c = { main: [], gallery: [], all: [] };
      eventData.processedImages.forEach((img) => {
        const o = { uri: img.primaryUrl || img.publicUrl || img.uri, category: img.category };
        if (img.category && c[img.category]) c[img.category].push(o);
        c.all.push(o);
      });
      return c;
    }
    if (eventData?.image_urls?.length > 0) {
      const norm = eventData.image_urls.map((img) =>
        typeof img === 'string' ? { uri: img, category: 'main' } : { uri: img.publicUrl || img.uri || img, category: img.category || 'main' }
      );
      return {
        main: norm.filter((i) => i.category === 'main'),
        gallery: norm.filter((i) => i.category === 'gallery'),
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
  const mainImage = safeImages.main[0];
  const galleryImages = safeImages.gallery || [];

  // ── 계좌 그룹 (AccountItem이 account prop을 받으므로 필드명 account로 통일) ──
  const groomAccounts = [
    ai.groom_account_number && { label: `신랑 ${groomName}`.trim(), bank: ai.groom_bank_name || '은행', account: ai.groom_account_number, name: groomName },
    ai.groom_father_account_number && { label: groomFather ? `신랑 아버님 ${groomFather}` : '신랑 아버님', bank: ai.groom_father_bank_name || '은행', account: ai.groom_father_account_number, name: groomFather || '아버님' },
    ai.groom_mother_account_number && { label: groomMother ? `신랑 어머님 ${groomMother}` : '신랑 어머님', bank: ai.groom_mother_bank_name || '은행', account: ai.groom_mother_account_number, name: groomMother || '어머님' },
  ].filter(Boolean);
  const brideAccounts = [
    ai.bride_account_number && { label: `신부 ${brideName}`.trim(), bank: ai.bride_bank_name || '은행', account: ai.bride_account_number, name: brideName },
    ai.bride_father_account_number && { label: brideFather ? `신부 아버님 ${brideFather}` : '신부 아버님', bank: ai.bride_father_bank_name || '은행', account: ai.bride_father_account_number, name: brideFather || '아버님' },
    ai.bride_mother_account_number && { label: brideMother ? `신부 어머님 ${brideMother}` : '신부 어머님', bank: ai.bride_mother_bank_name || '은행', account: ai.bride_mother_account_number, name: brideMother || '어머님' },
  ].filter(Boolean);
  const hasAnyAccount = groomAccounts.length > 0 || brideAccounts.length > 0;

  // ── 이미지 뷰어 ──
  const [viewerImage, setViewerImage] = useState(null);

  // ── 토스트 ──
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastTimerRef = useRef(null);
  const showToast = (message) => {
    setToast({ visible: true, message });
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast({ visible: false, message: '' }), 2200);
  };
  const copyAccount = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('계좌번호가 복사되었어요');
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  // ── 탑승 성공: 폭죽 → 도장 → 인트로 페이드아웃 → 본문 마운트(페이드인) ──
  const onBoardingSuccess = () => {
    setShowConfetti(true);
    setTimeout(() => setShowStamp(true), 150);
    // 1.1초 후 도장 사라지고 인트로 페이드아웃 시작
    setTimeout(() => {
      setStampGone(true);
      setFadingOut(true);
    }, 1100);
    // 1.6초 후 완전히 언마운트하고 본문 페이드인 (CSS로)
    setTimeout(() => {
      setIsBoarded(true);
    }, 1600);
  };

  // ── 공유 (navigator.share → clipboard → legacy execCommand 순서) ──
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = `${groomName} ♥ ${brideName} 결혼식 초대장`;
    const text = `${groomName} ♥ ${brideName}의 결혼식 초대장입니다.${timeStr ? '\n' + timeStr : ''}\n${locName}`;

    // 1차: OS 공유창
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (err) { if (err?.name === 'AbortError') return; }
    }

    // 2차: Clipboard API (HTTPS에서만)
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        showToast('초대장 링크가 복사됐어요 📋');
        return;
      }
    } catch {}

    // 3차: legacy textarea + execCommand
    try {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      showToast('초대장 링크가 복사됐어요 📋');
    } catch {
      showToast('주소창의 URL을 직접 복사해주세요');
    }
  };

  // ═══════════════════════════════════════════════════════
  // Supabase 연동 (방명록 / 내 축의금)
  // ═══════════════════════════════════════════════════════
  useEffect(() => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (!verifiedPhone || !eventData?.id) return;
    let isSubscribed = true;
    const fetchMyContribution = async () => {
      try {
        const r = await fetch(`/api/get-my-contribution?eventId=${eventData.id}&phone=${encodeURIComponent(verifiedPhone)}`);
        const result = await r.json();
        if (result.success && result.contribution && isSubscribed) {
          setMyContribution({ ...result.contribution, amount: result.contribution.contributionAmount || result.contribution.amount });
        }
      } catch {}
    };
    fetchMyContribution();
    return () => { isSubscribed = false; };
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
          .channel('ticket-flight-guestbook')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (p) => {
            if (p.eventType === 'INSERT') {
              const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: new Date(p.new.created_at).toLocaleDateString('ko-KR'), content: p.new.message || '' };
              setGuestMessages((prev) => [m, ...prev]);
            } else if (p.eventType === 'UPDATE') {
              const m = { id: p.new.id, from: p.new.guest_name || '익명', phone: p.new.guest_phone, date: new Date(p.new.created_at).toLocaleDateString('ko-KR'), content: p.new.message || '' };
              setGuestMessages((prev) => prev.map((x) => (x.id === p.new.id ? m : x)));
            } else if (p.eventType === 'DELETE') {
              setGuestMessages((prev) => prev.filter((x) => x.id !== p.old.id));
            }
          })
          .subscribe();
      }
    }
    return () => { if (sub) sub.unsubscribe(); };
  }, [eventData?.id]);

  useEffect(() => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (verifiedPhone && guestMessages.length > 0) {
      setHasWrittenGuestbook(guestMessages.some((m) => m.phone === verifiedPhone && m.content?.trim()));
    }
  }, [guestMessages]);

  const displayMessages = useMemo(() => guestMessages.filter((m) => m.content?.trim()), [guestMessages]);

  // ── 모달 핸들러 ──
  const handleGuestbookSubmit = async (g) => {
    const newMsg = {
      id: `temp-${Date.now()}`,
      from: g.name || '익명',
      phone: g.phone,
      date: new Date().toLocaleDateString('ko-KR'),
      content: g.message || '',
    };
    setGuestMessages((prev) => [newMsg, ...prev]);
    setHasWrittenGuestbook(true);
    setTimeout(() => fetchGuestbook(), 500);
  };
  const handleEditMessage = (m) => { setEditingMessage(m); setShowEditModal(true); };
  const handleEditUpdate = async () => { await fetchGuestbook(); };
  const handleEditDelete = async () => {
    if (editingMessage?.id) {
      setGuestMessages((prev) => prev.map((m) => (m.id === editingMessage.id ? { ...m, content: '' } : m)));
    }
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
        setTimeout(() => setShowCompletionModal(true), 300);
      } else throw new Error(result.error || '축의금 등록 실패');
    } catch (e) {
      alert(`축의금 등록 오류:\n${e.message}`);
      throw e;
    }
  };

  useEffect(() => {
    if (isBoarded) {
      const t = setTimeout(() => {
        if (arrivalModalCheckedRef.current) return;
        const arrivalKey = `arrival_checked_${eventData?.id}`;
        if (typeof window !== 'undefined' && localStorage.getItem(arrivalKey)) return;
        arrivalModalCheckedRef.current = true;
        setShowWelcomeChoice(true);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [isBoarded]); // eslint-disable-line

  const greetingMessage = (() => {
    const m = eventData.customMessage || eventData.custom_message;
    if (typeof m === 'string' && m.trim()) return m;
    if (typeof m === 'object' && m?.poem) return m.poem;
    return DEFAULT_GREETING;
  })();

  // ═══════════════════════════════════════════════════════
  // BOARDED 렌더
  // ═══════════════════════════════════════════════════════
  if (isBoarded) {
    return (
      <>
        <div className={styles.boardedRoot}>
          {/* 히어로 사진 */}
          <div className={styles.heroPhotoWrap}>
            {mainImage ? (
              <img
                src={getImageSrc(mainImage)}
                alt=""
                className={styles.heroPhoto}
                onClick={() => setViewerImage(getImageSrc(mainImage))}
                style={{ cursor: 'pointer' }}
              />
            ) : (
              <div className={styles.heroPhotoPlaceholder}>💕</div>
            )}
            <div className={styles.heroOverlay}>
              <div className={styles.approvedStamp}>APPROVED</div>
              <h1 className={styles.flightTitle}>FLIGHT<br />TO LOVE</h1>
              <p className={styles.flightNames}>{groomName} & {brideName}</p>
            </div>
          </div>

          <div className={styles.cardsContainer}>
            {/* 초대의 인사 */}
            <StubCard icon="📣" title="초대의 인사">
              <div className={styles.greetingWrap}>
                <span className={styles.watermarkCentered}>DEPARTURE</span>
                <p className={styles.greetingText}>{greetingMessage}</p>
              </div>
            </StubCard>

            {/* 결혼식 일정 */}
            <StubCard
              icon="📅"
              title="결혼식 일정"
              footer={<span className={styles.ddayText}>D-Day 카운트다운 : {dDayText || '오늘'}</span>}
            >
              <CalendarView year={calYear} month={calMonth} day={calDay} />
            </StubCard>

            {/* 우리의 추억 */}
            {galleryImages.length > 0 && (
              <StubCard icon="📷" title="우리의 추억" footer={null}>
                {galleryImages[0] && (
                  <div
                    className={styles.galleryFull}
                    onClick={() => setViewerImage(getImageSrc(galleryImages[0]))}
                    style={{ cursor: 'pointer' }}
                  >
                    <img src={getImageSrc(galleryImages[0])} alt="" />
                  </div>
                )}
                {(galleryImages[1] || galleryImages[2]) && (
                  <div className={styles.galleryRow}>
                    {galleryImages[1] && (
                      <div
                        className={styles.galleryItem}
                        style={{ transform: 'rotate(-2deg)', cursor: 'pointer' }}
                        onClick={() => setViewerImage(getImageSrc(galleryImages[1]))}
                      >
                        <img src={getImageSrc(galleryImages[1])} alt="" />
                      </div>
                    )}
                    {galleryImages[2] && (
                      <div
                        className={styles.galleryItem}
                        style={{ transform: 'rotate(2deg)', cursor: 'pointer' }}
                        onClick={() => setViewerImage(getImageSrc(galleryImages[2]))}
                      >
                        <img src={getImageSrc(galleryImages[2])} alt="" />
                      </div>
                    )}
                  </div>
                )}
              </StubCard>
            )}

            {/* 오시는 길 */}
            <StubCard icon="📍" title="오시는 길" headerBg="#ff7675" footer={null}>
              <p className={styles.locName}>{locName}</p>
              {locAddr && <p className={styles.locAddr}>{locAddr}</p>}
              {dateStr && (
                <p className={styles.locDate}>
                  🗓 &nbsp;{dateStr}{timeStr ? `  ·  ${timeStr}` : ''}
                </p>
              )}
              <div className={styles.mapContainer}>
                <iframe
                  src={`https://www.google.com/maps?q=${encodeURIComponent(`${locName} ${locAddr}`.trim())}&output=embed&hl=ko`}
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="위치 지도"
                />
              </div>
              {/* 내비 버튼 */}
              <div className={styles.navBtns}>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => {
                    const q = encodeURIComponent(locAddr || locName);
                    window.open(`https://map.naver.com/v5/search/${q}`, '_blank');
                  }}
                >
                  네이버지도
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => {
                    const q = encodeURIComponent(locAddr || locName);
                    window.open(`https://map.kakao.com/?q=${q}`, '_blank');
                  }}
                >
                  카카오맵
                </button>
                <button
                  type="button"
                  className={styles.navBtn}
                  onClick={() => {
                    const q = encodeURIComponent(locAddr || locName);
                    window.open(`https://tmap.life/search?query=${q}`, '_blank');
                  }}
                >
                  티맵
                </button>
              </div>
              {(eventData.parkingInfo || eventData.parking_info) && (
                <div className={styles.parkingRow}>
                  <span className={styles.parkingBadge}>주차</span>
                  <span className={styles.parkingText}>{eventData.parkingInfo || eventData.parking_info}</span>
                </div>
              )}
            </StubCard>

            {/* 마음 전하기 */}
            {hasAnyAccount && (
              <StubCard icon="💰" title="마음 전하기">
                <p className={styles.accDesc}>
                  참석이 어려우신 분들을 위해<br />마음 전하실 곳을 안내해 드립니다.
                </p>
                {groomAccounts.length > 0 && (
                  <>
                    <div className={styles.accGroupLabel}>신랑측</div>
                    {groomAccounts.map((acc, i) => (
                      <AccountItem key={`g${i}`} {...acc} onCopy={copyAccount} />
                    ))}
                  </>
                )}
                {brideAccounts.length > 0 && (
                  <>
                    <div className={styles.accGroupLabel} style={{ marginTop: groomAccounts.length > 0 ? 16 : 0 }}>신부측</div>
                    {brideAccounts.map((acc, i) => (
                      <AccountItem key={`b${i}`} {...acc} onCopy={copyAccount} />
                    ))}
                  </>
                )}
              </StubCard>
            )}

            {/* 방명록 */}
            {shouldShowReviews && (
              <StubCard icon="✏️" title="방명록" footer={null}>
                {displayMessages.length === 0 ? (
                  <div className={styles.emptyReviews}>
                    <div className={styles.emptyIcon}>✉️</div>
                    <p className={styles.emptyText}>아직 메시지가 없어요.<br />첫 번째 축하의 글을 남겨주세요.</p>
                  </div>
                ) : (
                  displayMessages.slice(0, 20).map((msg) => (
                    <div key={msg.id} className={styles.reviewCard}>
                      <div className={styles.reviewTop}>
                        <span className={styles.reviewName}>{msg.from}</span>
                        <div className={styles.reviewMeta}>
                          {canEditMessage(msg) && (
                            <button
                              type="button"
                              className={styles.reviewEditBtn}
                              onClick={() => handleEditMessage(msg)}
                            >
                              수정
                            </button>
                          )}
                          <span className={styles.reviewDate}>{msg.date}</span>
                        </div>
                      </div>
                      <p className={styles.reviewText}>{msg.content}</p>
                    </div>
                  ))
                )}
                {!hasWrittenGuestbook && (
                  <button
                    type="button"
                    className={styles.addReviewBtn}
                    onClick={() => setShowGuestbookModal(true)}
                  >
                    + 축하 메시지 남기기
                  </button>
                )}
              </StubCard>
            )}

            {/* 푸터 */}
            <div className={styles.footerSection}>
              <h2 className={styles.footerTitle}>감사합니다</h2>
              <p className={styles.footerSub}>귀한 걸음으로 축복해 주세요</p>
              <p className={styles.footerNames}>{groomName} & {brideName}</p>
              <button type="button" className={styles.shareBtn} onClick={handleShare}>
                <span>✈</span>
                <span>초대장 공유하기</span>
              </button>
            </div>
          </div>
        </div>

        {toast.visible && <div className={styles.toast}>{toast.message}</div>}

        {/* 이미지 뷰어 */}
        {viewerImage && (
          <div className={styles.viewerBg} onClick={() => setViewerImage(null)}>
            <button
              type="button"
              className={styles.viewerClose}
              onClick={() => setViewerImage(null)}
            >
              ✕
            </button>
            <img src={viewerImage} alt="" className={styles.viewerImage} />
          </div>
        )}

        {/* 모달들 */}
        <WelcomeChoiceModal
          isOpen={showWelcomeChoice}
          onClose={() => setShowWelcomeChoice(false)}
          onSelectGuestbook={handleSelectGuestbook}
          onSelectContribution={handleSelectContribution}
          eventData={eventData}
        />
        <GuestbookModal
          isOpen={showGuestbookModal}
          onClose={() => setShowGuestbookModal(false)}
          onSubmit={handleGuestbookSubmit}
          eventData={eventData}
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
  }

  // ═══════════════════════════════════════════════════════
  // INTRO 렌더
  // ═══════════════════════════════════════════════════════
  return (
    <div className={`${styles.introRoot} ${fadingOut ? styles.fadingOut : ''}`}>
      {/* 하늘 배경 + 구름 */}
      <div className={styles.sky}>
        <div className={`${styles.cloud} ${styles.cloud1}`}>
          <div className={styles.cloudBase} />
          <div className={styles.cloudBumpL} />
          <div className={styles.cloudBumpC} />
          <div className={styles.cloudBumpR} />
        </div>
        <div className={`${styles.cloud} ${styles.cloud2}`}>
          <div className={styles.cloudBase} />
          <div className={styles.cloudBumpL} />
          <div className={styles.cloudBumpC} />
          <div className={styles.cloudBumpR} />
        </div>
        <div className={`${styles.cloud} ${styles.cloud3}`}>
          <div className={styles.cloudBase} />
          <div className={styles.cloudBumpL} />
          <div className={styles.cloudBumpC} />
          <div className={styles.cloudBumpR} />
        </div>
      </div>

      {/* 중앙 티켓 (위아래 둥실) */}
      <div className={styles.introContainer}>
        <div className={styles.ticketFloating}>
          <div className={styles.airlineRow}>
            <span className={styles.airlineText}>✈  LOVE AIRLINES</span>
          </div>
          <div className={styles.routeRow}>
            <div className={styles.cityLeft}>
              <div className={styles.cityName}>{groomName}</div>
              <div className={styles.cityParents}>
                {[groomFather, groomMother].filter(Boolean).join(' · ') || '아버지 · 어머니'}
              </div>
              <div className={styles.cityRole}>의 아들</div>
            </div>
            <div className={styles.planeWrap}>{AIRPLANE_SVG}</div>
            <div className={styles.cityRight}>
              <div className={styles.cityName}>{brideName}</div>
              <div className={styles.cityParents}>
                {[brideFather, brideMother].filter(Boolean).join(' · ') || '아버지 · 어머니'}
              </div>
              <div className={styles.cityRole}>의 딸</div>
            </div>
          </div>
          {mainImage ? (
            <img src={getImageSrc(mainImage)} alt="" className={styles.ticketPhoto} />
          ) : (
            <div className={styles.ticketPhotoPlaceholder}>💕</div>
          )}
          <div className={styles.ticketDivider}>
            <div className={styles.ticketDividerLine} />
          </div>
          <div className={styles.ticketInfo}>
            <div className={styles.ticketInfoItem}>
              <div className={styles.ticketInfoLabel}>날짜</div>
              <div className={styles.ticketInfoValue}>{dateStr || '날짜 미정'}</div>
            </div>
            <div className={styles.ticketInfoItem}>
              <div className={styles.ticketInfoLabel}>탑승 시간</div>
              <div className={styles.ticketInfoValue}>{timeStr || '시간 미정'}</div>
            </div>
            <div className={styles.ticketInfoItemFull}>
              <div className={styles.ticketInfoLabel}>예식장</div>
              <div className={styles.ticketInfoValue}>{locName}</div>
            </div>
          </div>
          {/* BOARDED 도장 */}
          {showStamp && (
            <div className={`${styles.boardedStamp} ${stampGone ? styles.boardedStampGone : ''}`}>
              BOARDED
            </div>
          )}
        </div>
      </div>

      {/* 하단 슬라이더 */}
      <BoardingSlider onSuccess={onBoardingSuccess} />

      {/* 폭죽 */}
      {showConfetti && (
        <div className={styles.confettiLayer}>
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className={styles.confettiPiece}
              style={{
                left: `${50 + (Math.random() - 0.5) * 20}%`,
                background: ['#ff7675', '#fff', '#ffeaa7', '#55efc4', '#74b9ff'][i % 5],
                animationDelay: `${Math.random() * 0.2}s`,
                animationDuration: `${1 + Math.random() * 0.8}s`,
                '--dx': `${(Math.random() - 0.5) * 400}px`,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketFlightTemplate;
