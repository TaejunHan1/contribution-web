// components/templates/CinemaTemplate.js
// 시네마 로맨스 — 앱 CinemaTemplate과 1:1 매칭
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import styles from './CinemaTemplate.module.css';

// ══════════════════════════════════════════════════════
// 유틸
// ══════════════════════════════════════════════════════
const getImageSrc = (image) => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.uri || image.url || image.src || null;
};

const CAL_DAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const MONTH_NAMES = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

// ══════════════════════════════════════════════════════
// 클래퍼보드
// ══════════════════════════════════════════════════════
const Clapperboard = ({ onClap, namesText, dateText, clapping }) => (
  <button type="button" onClick={onClap} className={styles.clapWrapBtn} aria-label="초대장 열기">
    <div className={`${styles.clapWrap} ${clapping ? styles.clapping : ''}`}>
      <div className={styles.clapStick}>
        {Array.from({ length: 7 }, (_, i) => (
          <div
            key={i}
            className={styles.clapStripe}
            style={{ left: `${i * 14.28}%`, background: i % 2 === 0 ? '#fff' : '#111' }}
          />
        ))}
      </div>
      <div className={styles.clapBoard}>
        <div className={styles.clapTopRow}>
          <div className={styles.clapTopCell}>
            <span className={styles.clapTopLabel}>SCENE</span>
            <span className={styles.clapTopValue}>01</span>
          </div>
          <div className={styles.clapTopCell}>
            <span className={styles.clapTopLabel}>TAKE</span>
            <span className={styles.clapTopValue}>24</span>
          </div>
          <div className={styles.clapTopCell}>
            <span className={styles.clapTopLabel}>ROLL</span>
            <span className={styles.clapTopValue}>10</span>
          </div>
        </div>
        <div className={styles.clapTitle}>WEDDING</div>
        <div className={styles.clapFooter}>
          <div className={styles.clapFooterCell}>
            <span className={styles.clapFooterLabel}>CAST</span>
            <span className={styles.clapFooterValue}>{namesText}</span>
          </div>
          <div className={styles.clapFooterDivider} />
          <div className={styles.clapFooterCell}>
            <span className={styles.clapFooterLabel}>DATE</span>
            <span className={styles.clapFooterValue}>{dateText}</span>
          </div>
        </div>
      </div>
    </div>
  </button>
);

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

  return (
    <div className={styles.calWrap}>
      <div className={styles.calTopRow}>
        <div className={styles.calTopLine} />
        <div className={styles.calTopCenter}>
          <div className={styles.calMonthBig}>{MONTH_NAMES[month - 1] || ''}</div>
          <div className={styles.calYearSmall}>{year}</div>
        </div>
        <div className={styles.calTopLine} />
      </div>

      <div className={styles.calHeaderRow}>
        {CAL_DAYS.map((d, i) => (
          <span
            key={d}
            className={styles.calDayLabel}
            style={{ color: i === 0 ? '#c86060' : i === 6 ? '#6a8fb8' : '#aaa' }}
          >
            {d}
          </span>
        ))}
      </div>
      <div className={styles.calDivider} />

      <div className={styles.calGrid}>
        {cells.map((d, i) => {
          const dow = i % 7;
          const isSun = dow === 0;
          const isSat = dow === 6;
          if (d === day) {
            return (
              <div key={i} className={styles.calCell}>
                <div className={styles.calWeddingMark}>{d}</div>
              </div>
            );
          }
          return (
            <div key={i} className={styles.calCell}>
              <span
                className={styles.calDay}
                style={{ color: isSun ? '#c86060' : isSat ? '#6a8fb8' : '#ddd' }}
              >
                {d ?? ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════
// 계좌 아코디언 — 계좌 + 연락처
// ══════════════════════════════════════════════════════
const AccountItem = ({ label, bank, account, name, contact, onCopy, onCall }) => {
  const [open, setOpen] = useState(false);
  const safeAccount = account || '';
  return (
    <div className={styles.accItem}>
      <button type="button" className={styles.accBtn} onClick={() => setOpen(!open)}>
        <span className={styles.accBtnLabel}>
          <span className={styles.accIcon}>🎞</span> {label}
        </span>
        <span className={styles.accChev}>{open ? '▲' : '▼'}</span>
      </button>
      <div className={`${styles.accPanel} ${open ? styles.accPanelOpen : ''}`}>
        <div className={styles.accPersonCard}>
          <div className={styles.accPersonLabel}>{name}</div>
          {safeAccount && (
            <button
              type="button"
              className={styles.accRow}
              onClick={() => onCopy(safeAccount.replace(/-/g, ''))}
            >
              <span className={styles.accValue}>{bank} {safeAccount}</span>
              <span className={styles.accCopyBtn}>복사</span>
            </button>
          )}
          {safeAccount && contact && <div className={styles.accDivider} />}
          {contact && (
            <button type="button" className={styles.accRow} onClick={() => onCall(contact)}>
              <span className={styles.accValue}>📞 {formatPhone(contact)}</span>
              <span className={styles.accCallBtn}>전화</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const formatPhone = (phone) => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
};

// ══════════════════════════════════════════════════════
// 메인 컴포넌트
// ══════════════════════════════════════════════════════
const CinemaTemplate = ({ eventData = {}, categorizedImages = {}, allowMessages }) => {
  // ── 인트로 상태 ──
  const [clapping, setClapping] = useState(false);
  const [flashing, setFlashing] = useState(false);
  const [curtainOpen, setCurtainOpen] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  // ── 모달 상태 ──
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [guestMessages, setGuestMessages] = useState([]);
  const [hasWrittenGuestbook, setHasWrittenGuestbook] = useState(false);

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

  const ai = useMemo(() => {
    if (!eventData.additional_info) return {};
    if (typeof eventData.additional_info === 'string') {
      try { return JSON.parse(eventData.additional_info); } catch { return {}; }
    }
    return eventData.additional_info || {};
  }, [eventData.additional_info]);

  const groomContact = eventData.groomContact || eventData.groom_contact || '';
  const brideContact = eventData.brideContact || eventData.bride_contact || '';
  const groomFatherContact = eventData.groomFatherContact || ai.groom_father_contact || '';
  const groomMotherContact = eventData.groomMotherContact || ai.groom_mother_contact || '';
  const brideFatherContact = eventData.brideFatherContact || ai.bride_father_contact || '';
  const brideMotherContact = eventData.brideMotherContact || ai.bride_mother_contact || '';

  const weddingDate = eventData.date || eventData.event_date;
  const wd = new Date(weddingDate || Date.now());
  const calYear = isNaN(wd.getTime()) ? new Date().getFullYear() : wd.getFullYear();
  const calMonth = isNaN(wd.getTime()) ? 1 : wd.getMonth() + 1;
  const calDay = isNaN(wd.getTime()) ? 1 : wd.getDate();
  const DOW_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
  const shortDate = !isNaN(wd.getTime())
    ? `${calYear}.${String(calMonth).padStart(2, '0')}.${String(calDay).padStart(2, '0')}`
    : '';
  const posterDate = !isNaN(wd.getTime())
    ? `${MONTH_NAMES[wd.getMonth()]} ${calDay}, ${calYear}`.toUpperCase()
    : '';
  const showtimeDate = !isNaN(wd.getTime())
    ? `${calYear}. ${String(calMonth).padStart(2, '0')}. ${String(calDay).padStart(2, '0')}  ${DOW_EN[wd.getDay()]}`
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

  // ── 라이브 카운트다운 ──
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    if (isNaN(wd.getTime())) return;
    let target = new Date(wd);
    if (timeStr && typeof timeStr === 'string' && timeStr.includes(':')) {
      const [h, m] = timeStr.split(':').map((x) => parseInt(x, 10));
      if (!isNaN(h)) target.setHours(h, isNaN(m) ? 0 : m, 0, 0);
    } else {
      target.setHours(14, 0, 0, 0);
    }
    const tick = () => {
      const diffMs = target.getTime() - Date.now();
      if (diffMs <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      const seconds = Math.floor((diffMs / 1000) % 60);
      setTimeLeft({ days, hours, minutes, seconds });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [weddingDate, timeStr]);

  const locName = eventData.hallName || eventData.hall_name || eventData.location || '웨딩홀';
  const locAddr = eventData.detailedAddress || eventData.detailed_address || eventData.address || '';

  const transportInfo = ai.transport || eventData.transport || null;

  const namesText = `${groomName} × ${brideName}`;
  const clapDate = shortDate || '— . — . —';

  const customMessage = eventData.customMessage || eventData.custom_message || '';

  // ── 이미지 ──
  const defaultImages = useMemo(() => ({
    main: ['https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&h=1400&fit=crop'],
    gallery: [
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&h=600&fit=crop',
    ],
  }), []);

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
  const mainImage = getImageSrc(safeImages.main[0]);
  const galleryImages = (safeImages.gallery || []).map(getImageSrc).filter(Boolean);

  // ── 계좌 그룹 ──
  const groomAccounts = [
    (ai.groom_account_number || groomContact) && { label: `감독 (신랑) ${groomName}`.trim(), bank: ai.groom_bank_name || '', account: ai.groom_account_number || '', name: groomName, contact: groomContact },
    (ai.groom_father_account_number || groomFatherContact) && { label: groomFather ? `${groomFather} 아버님` : '신랑 아버님', bank: ai.groom_father_bank_name || '', account: ai.groom_father_account_number || '', name: groomFather || '아버님', contact: groomFatherContact },
    (ai.groom_mother_account_number || groomMotherContact) && { label: groomMother ? `${groomMother} 어머님` : '신랑 어머님', bank: ai.groom_mother_bank_name || '', account: ai.groom_mother_account_number || '', name: groomMother || '어머님', contact: groomMotherContact },
  ].filter(Boolean);
  const brideAccounts = [
    (ai.bride_account_number || brideContact) && { label: `주연 (신부) ${brideName}`.trim(), bank: ai.bride_bank_name || '', account: ai.bride_account_number || '', name: brideName, contact: brideContact },
    (ai.bride_father_account_number || brideFatherContact) && { label: brideFather ? `${brideFather} 아버님` : '신부 아버님', bank: ai.bride_father_bank_name || '', account: ai.bride_father_account_number || '', name: brideFather || '아버님', contact: brideFatherContact },
    (ai.bride_mother_account_number || brideMotherContact) && { label: brideMother ? `${brideMother} 어머님` : '신부 어머님', bank: ai.bride_mother_bank_name || '', account: ai.bride_mother_account_number || '', name: brideMother || '어머님', contact: brideMotherContact },
  ].filter(Boolean);
  const hasAnyAccount = groomAccounts.length > 0 || brideAccounts.length > 0;

  const copyAccount = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('계좌번호가 복사되었어요');
    } catch {
      showToast('복사에 실패했습니다');
    }
  };
  const callPhone = (phone) => {
    const clean = (phone || '').replace(/\D/g, '');
    if (!clean) return;
    window.location.href = `tel:${clean}`;
  };

  // ── 공유 ──
  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = `${groomName} & ${brideName} 결혼식 초대장`;
    const text = `${groomName} & ${brideName}의 결혼식에 초대합니다.${timeStr ? '\n' + timeStr : ''}\n${locName}`;
    if (navigator.share) {
      try { await navigator.share({ title, text, url }); return; }
      catch (err) { if (err?.name === 'AbortError') return; }
    }
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(url);
        showToast('초대장 링크가 복사됐어요 📋');
        return;
      }
    } catch {}
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

  // ── 클래퍼보드 탭 ──
  const handleClap = () => {
    if (clapping || introGone) return;
    setClapping(true);
    setTimeout(() => setFlashing(true), 150);
    setTimeout(() => setFlashing(false), 650);
    setTimeout(() => setCurtainOpen(true), 300);
    setTimeout(() => setContentVisible(true), 1200);
    setTimeout(() => setIntroGone(true), 2400);
  };

  // ═══════════════════════════════════════════════════════
  // Supabase 연동 (방명록)
  // ═══════════════════════════════════════════════════════
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
          .channel('cinema-guestbook')
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

  const handleGuestbookSubmit = async (g) => {
    const newMsg = {
      id: `temp-${Date.now()}`,
      from: g.name || '익명',
      phone: g.phone,
      date: new Date().toLocaleDateString('ko-KR'),
      content: g.message || '',
      __pending: true,
    };
    setGuestMessages((prev) => [newMsg, ...prev]);
    setShowGuestbookModal(false);
    showToast('관람평이 등록되었어요 🎬');
    try {
      const r = await fetch('/api/submit-guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: eventData.id,
          name: g.name,
          phone: g.phone,
          password: g.password,
          message: g.message,
        }),
      });
      const result = await r.json();
      if (result.success) {
        fetchGuestbook();
      } else {
        setGuestMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
        showToast(result.error || '등록에 실패했어요');
      }
    } catch {
      setGuestMessages((prev) => prev.filter((m) => m.id !== newMsg.id));
      showToast('네트워크 오류가 발생했어요');
    }
  };

  const handleEditUpdate = async (updated) => {
    setGuestMessages((prev) => prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m)));
    setShowEditModal(false);
    setEditingMessage(null);
    fetchGuestbook();
  };
  const handleEditDelete = async (id) => {
    setGuestMessages((prev) => prev.filter((m) => m.id !== id));
    setShowEditModal(false);
    setEditingMessage(null);
    fetchGuestbook();
  };

  // ══════════════════════════════════════════════════════
  return (
    <div className={styles.root}>
      {/* 커튼 */}
      {!introGone && (
        <>
          <div className={`${styles.curtain} ${styles.curtainLeft} ${curtainOpen ? styles.curtainOpenLeft : ''}`} />
          <div className={`${styles.curtain} ${styles.curtainRight} ${curtainOpen ? styles.curtainOpenRight : ''}`} />
        </>
      )}

      {/* 플래시 */}
      {flashing && <div className={styles.flash} />}

      {/* 인트로 레이어 */}
      {!introGone && (
        <div className={`${styles.introLayer} ${curtainOpen ? styles.introFading : ''}`}>
          <Clapperboard
            onClap={handleClap}
            namesText={namesText}
            dateText={clapDate}
            clapping={clapping}
          />
          <div className={styles.tapHint}>초대장 열기</div>
        </div>
      )}

      {/* 본문 */}
      <div className={`${styles.content} ${contentVisible ? styles.contentIn : ''}`}>
        {/* 메인 포스터 */}
        <div className={styles.poster}>
          {mainImage && (
            <img
              src={mainImage}
              alt=""
              className={styles.posterImg}
              onClick={() => setViewerImage(mainImage)}
            />
          )}
        </div>

        {/* 타이틀 카드 */}
        <section className={styles.section}>
          <div className={styles.titleCard}>
            <div className={styles.creditsDividerRow}>
              <div className={styles.creditsLine} />
              <span className={styles.creditsStar}>★</span>
              <div className={styles.creditsLine} />
            </div>
            <div className={styles.creditsLabel}>A ROMANTIC FILM BY</div>
            <div className={styles.creditsNames}>
              {groomName.toUpperCase()}<span className={styles.creditsAmp}>&nbsp;&nbsp;&amp;&nbsp;&nbsp;</span>{brideName.toUpperCase()}
            </div>
            <div className={styles.creditsDividerRow}>
              <div className={styles.creditsLine} />
              <span className={styles.creditsStar}>★</span>
              <div className={styles.creditsLine} />
            </div>

            <h1 className={styles.titleMain}>THE<br/>WEDDING</h1>
            <div className={styles.titleSubtitle}>우리들의 가장 빛나는 순간</div>
            {posterDate && (
              <div className={styles.titleDateBadge}>
                <span className={styles.titleDate}>{posterDate}</span>
              </div>
            )}
            {dDayText && <div className={styles.titleDDay}>{dDayText}</div>}
          </div>
        </section>

        {/* 시놉시스 */}
        <section className={`${styles.section} ${styles.sectionAlt}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Synopsis</h2>
            <div className={styles.sectionSubtitle}>시놉시스</div>
          </div>
          <p className={styles.synopsisText}>
            {customMessage || (
              <>
                각자의 장르에서 주인공으로 살던 두 사람이<br />
                서로를 만나 <span className={styles.synopGold}>단 하나의 로맨스 영화</span>를<br />
                완성하게 되었습니다.<br /><br />
                때로는 코미디처럼 유쾌하게,<br />
                때로는 멜로처럼 따뜻하게<br />
                아름다운 이야기를 써 내려가려 합니다.<br /><br />
                저희 영화의 <span className={styles.synopGold}>첫 시사회</span>에<br />
                VIP 관객으로 모시고 싶습니다.<br />
                부디 참석하시어 자리를 빛내주세요.
              </>
            )}
          </p>

          {(groomFather || groomMother || brideFather || brideMother) && (
            <div className={styles.parentsWrap}>
              {(groomFather || groomMother) && (
                <div className={styles.parentsText}>
                  {groomFather}{groomFather && groomMother ? ' · ' : ''}{groomMother}
                  <span className={styles.parentsRole}>  의 아들  </span>
                  <span className={styles.parentsChild}>{groomName}</span>
                </div>
              )}
              {(brideFather || brideMother) && (
                <div className={styles.parentsText}>
                  {brideFather}{brideFather && brideMother ? ' · ' : ''}{brideMother}
                  <span className={styles.parentsRole}>  의 딸  </span>
                  <span className={styles.parentsChild}>{brideName}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* 상영 안내 */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Showtime</h2>
            <div className={styles.sectionSubtitle}>상영 안내</div>
          </div>
          <div className={styles.showtimeCard}>
            {showtimeDate && <div className={styles.stDate}>{showtimeDate}</div>}
            {timeStr && <div className={styles.stTime}>{timeStr}</div>}
            {locName && <div className={styles.stVenue}>{locName}</div>}
            {locAddr && <div className={styles.stAddress}>{locAddr}</div>}
          </div>
        </section>

        {/* 달력 + 카운트다운 */}
        {!isNaN(wd.getTime()) && (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Calendar</h2>
              <div className={styles.sectionSubtitle}>달력</div>
            </div>
            <CalendarView year={calYear} month={calMonth} day={calDay} />

            {dDayText.startsWith('D-') && dDayText !== 'D-DAY' && (
              <div className={styles.countdownBox}>
                <div className={styles.countdownLabel}>결혼식까지 남은 시간</div>
                <div className={styles.countdownRow}>
                  <div className={styles.countCell}>
                    <div className={styles.countNum}>{String(timeLeft.days).padStart(2, '0')}</div>
                    <div className={styles.countUnit}>DAYS</div>
                  </div>
                  <div className={styles.countColon}>:</div>
                  <div className={styles.countCell}>
                    <div className={styles.countNum}>{String(timeLeft.hours).padStart(2, '0')}</div>
                    <div className={styles.countUnit}>HRS</div>
                  </div>
                  <div className={styles.countColon}>:</div>
                  <div className={styles.countCell}>
                    <div className={styles.countNum}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                    <div className={styles.countUnit}>MIN</div>
                  </div>
                  <div className={styles.countColon}>:</div>
                  <div className={styles.countCell}>
                    <div className={styles.countNum}>{String(timeLeft.seconds).padStart(2, '0')}</div>
                    <div className={styles.countUnit}>SEC</div>
                  </div>
                </div>
              </div>
            )}

            {dDayText && (
              <div className={styles.dDayLine}>
                {groomName} ♥ {brideName}의 결혼식이{' '}
                <span className={styles.dDayAccent}>{dDayText}</span> 남았습니다
              </div>
            )}
          </section>
        )}

        {/* 스틸컷 */}
        {galleryImages.length > 0 && (
          <section className={styles.sectionNoPad}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Still Cuts</h2>
              <div className={styles.sectionSubtitle}>스틸컷</div>
            </div>
            <div className={styles.filmStripScroll}>
              <div className={styles.filmStrip}>
                <div className={styles.filmHolesRow}>
                  {Array.from({ length: Math.max(galleryImages.length * 3, 8) }, (_, i) => (
                    <div key={`t${i}`} className={styles.filmHole} />
                  ))}
                </div>
                <div className={styles.filmFrames}>
                  {galleryImages.map((src, i) => (
                    <div key={i} className={styles.filmFrame} onClick={() => setViewerImage(src)}>
                      <img src={src} alt="" />
                    </div>
                  ))}
                </div>
                <div className={styles.filmHolesRow}>
                  {Array.from({ length: Math.max(galleryImages.length * 3, 8) }, (_, i) => (
                    <div key={`b${i}`} className={styles.filmHole} />
                  ))}
                </div>
              </div>
            </div>
            {galleryImages.length > 1 && (
              <div className={styles.galleryHint}>◀ 옆으로 밀어 총 {galleryImages.length}장의 스틸컷 보기 ▶</div>
            )}
          </section>
        )}

        {/* 오시는 길 */}
        {(locName || locAddr) && (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Direction</h2>
              <div className={styles.sectionSubtitle}>오시는 길</div>
            </div>
            {locName && <div className={styles.locName}>{locName}</div>}
            {locAddr && <div className={styles.locAddr}>{locAddr}</div>}
            <div className={styles.mapBox}>
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
            <div className={styles.navRow}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => {
                  const q = encodeURIComponent(locAddr || locName);
                  window.open(`https://map.naver.com/v5/search/${q}`, '_blank');
                }}
              >
                🧭 네이버지도
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => {
                  const q = encodeURIComponent(locAddr || locName);
                  window.open(`https://map.kakao.com/?q=${q}`, '_blank');
                }}
              >
                🧭 카카오맵
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() => {
                  const q = encodeURIComponent(locAddr || locName);
                  window.open(`https://tmap.life/search?query=${q}`, '_blank');
                }}
              >
                🧭 티맵
              </button>
            </div>

            {transportInfo && (transportInfo.subway || transportInfo.bus || transportInfo.parking) && (
              <div className={styles.transportWrap}>
                {transportInfo.subway && (
                  <div className={styles.transportItem}>
                    <div className={styles.transportDot} />
                    <div>
                      <div className={styles.transportTitle}>지하철</div>
                      <div className={styles.transportDesc}>{transportInfo.subway}</div>
                    </div>
                  </div>
                )}
                {transportInfo.bus && (
                  <div className={styles.transportItem}>
                    <div className={styles.transportDot} />
                    <div>
                      <div className={styles.transportTitle}>버스</div>
                      <div className={styles.transportDesc}>{transportInfo.bus}</div>
                    </div>
                  </div>
                )}
                {transportInfo.parking && (
                  <div className={styles.transportItem}>
                    <div className={styles.transportDot} />
                    <div>
                      <div className={styles.transportTitle}>주차</div>
                      <div className={styles.transportDesc}>{transportInfo.parking}</div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* 제작 지원 */}
        {hasAnyAccount && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Sponsorship</h2>
              <div className={styles.sectionSubtitle}>제작 지원 (마음 전하실 곳)</div>
            </div>
            <div className={styles.accDesc}>계좌번호는 탭하면 복사되고,<br />연락처는 탭하면 전화가 연결됩니다.</div>
            {groomAccounts.length > 0 && (
              <>
                <div className={styles.accGroupLabel}>신랑측</div>
                {groomAccounts.map((a, i) => (
                  <AccountItem key={`g${i}`} {...a} onCopy={copyAccount} onCall={callPhone} />
                ))}
              </>
            )}
            {brideAccounts.length > 0 && (
              <>
                <div className={styles.accGroupLabel} style={{ marginTop: 20 }}>신부측</div>
                {brideAccounts.map((a, i) => (
                  <AccountItem key={`b${i}`} {...a} onCopy={copyAccount} onCall={callPhone} />
                ))}
              </>
            )}
          </section>
        )}

        {/* 관람평 */}
        {shouldShowReviews && (
          <section className={`${styles.section} ${styles.sectionAlt}`}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>Reviews</h2>
              <div className={styles.sectionSubtitle}>관람평 남기기</div>
            </div>
            {displayMessages.length > 0 ? (
              displayMessages.map((m) => (
                <div key={m.id} className={styles.reviewItem}>
                  <div className={styles.reviewStars}>★★★★★</div>
                  <div className={styles.reviewText}>{m.content}</div>
                  <div className={styles.reviewBottom}>
                    <span className={styles.reviewAuthor}>관객 {m.from}</span>
                    <span className={styles.reviewDate}>{m.date}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.reviewEmpty}>아직 등록된 관람평이 없어요. 첫 관람평을 남겨주세요 🎬</div>
            )}
            <button
              type="button"
              className={styles.gbWriteBtn}
              onClick={() => {
                if (hasWrittenGuestbook) {
                  const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
                  const mine = guestMessages.find((m) => m.phone === verifiedPhone);
                  if (mine) {
                    setEditingMessage(mine);
                    setShowEditModal(true);
                    return;
                  }
                }
                setShowGuestbookModal(true);
              }}
            >
              ✏️ {hasWrittenGuestbook ? '내 관람평 수정' : '관람평 작성하기'}
            </button>
          </section>
        )}

        {/* 푸터 */}
        <footer className={styles.footer}>
          <div className={styles.footerThankYou}>Thank You</div>
          <div className={styles.footerNames}>{groomName} & {brideName}</div>
          <div className={styles.footerBtns}>
            <button type="button" className={styles.footerBtn} onClick={handleShare}>
              카카오톡 공유
            </button>
            <button type="button" className={`${styles.footerBtn} ${styles.footerBtnPrimary}`} onClick={handleShare}>
              링크 복사
            </button>
          </div>
          <div className={styles.footerCopy}>
            Copyright {calYear}. {groomName} &amp; {brideName} All rights reserved.
          </div>
        </footer>
      </div>

      {/* 토스트 */}
      {toast.visible && <div className={styles.toast}>{toast.message}</div>}

      {/* 이미지 뷰어 */}
      {viewerImage && (
        <div className={styles.viewerBg} onClick={() => setViewerImage(null)}>
          <button type="button" className={styles.viewerClose} onClick={() => setViewerImage(null)}>✕</button>
          <img src={viewerImage} alt="" className={styles.viewerImage} onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      {/* 방명록 모달 */}
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
    </div>
  );
};

export default CinemaTemplate;
