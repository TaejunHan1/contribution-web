import React, { useEffect, useMemo, useRef, useState } from 'react';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import styles from './FuneralNoticeTemplate.module.css';

const ASSET = '/funeral';
const DEFAULT_PHOTO = '/funeral/templates/oldface.png';

const PHOTO_FRAMES = {
  'funeral-template-modern-card': `${ASSET}/templates/funeral-template-modern-card.png`,
  'funeral-template-editorial-timeline': `${ASSET}/templates/funeral-template-editorial-timeline.png`,
  'funeral-template-paper-letter': `${ASSET}/templates/funeral-template-paper-letter.png`,
  'funeral-template-certificate': `${ASSET}/templates/funeral-template-certificate.png`,
  'funeral-template-classic-flower': `${ASSET}/templates/funeral-template-classic-flower.png`,
};

const FRAME_ASPECTS = {
  'funeral-template-modern-card': 1024 / 1535,
  'funeral-template-editorial-timeline': 941 / 1672,
  'funeral-template-paper-letter': 941 / 1672,
  'funeral-template-certificate': 941 / 1672,
  'funeral-template-classic-flower': 1024 / 1535,
};

const getAdditionalInfo = eventData => {
  const value = eventData?.additional_info || eventData?.additionalInfo || {};
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch { return {}; }
  }
  return value || {};
};

const getImageSrc = image => {
  if (!image) return null;
  if (typeof image === 'string') return image;
  return image.publicUrl || image.primaryUrl || image.uri || image.url || image.src || null;
};

const normalizeImages = (eventData, categorizedImages) => {
  if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;

  const grouped = { main: [], gallery: [], all: [] };
  const push = image => {
    const item = typeof image === 'string'
      ? { uri: image, category: 'main' }
      : { ...image, uri: getImageSrc(image), category: image?.category || 'main' };
    if (!item.uri) return;
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
    grouped.all.push(item);
  };

  if (Array.isArray(eventData?.processedImages)) eventData.processedImages.forEach(push);
  if (grouped.all.length === 0 && Array.isArray(eventData?.image_urls)) eventData.image_urls.forEach(push);
  if (grouped.all.length === 0) {
    const ai = getAdditionalInfo(eventData);
    Object.values(ai.categorized_images || {}).flat().forEach(push);
  }

  return grouped;
};

const toDate = value => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = value => {
  const date = toDate(value);
  if (!date) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(date);
};

const formatDateShort = value => {
  const date = toDate(value);
  if (!date) return '';
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
};

const formatTime = value => {
  const raw = String(value || '').trim();
  const match = raw.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (!match) return raw;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = hour < 12 ? '오전' : '오후';
  return `${period} ${hour % 12 || 12}시${minute ? ` ${minute}분` : ''}`;
};

const formatPhone = phone => {
  const d = (phone || '').replace(/\D/g, '');
  if (d.length === 11) return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return phone || '';
};

const formatGuestbookDateTime = dateValue => {
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
  }).format(date).replace(/\.\s?/g, '. ').replace(/\s+/g, ' ').trim();
};

const getPhotoFrame = ai => {
  const frame = ai.photo_frame || ai.photoFrame || {};
  const key = frame.key || frame.id || 'funeral-template-modern-card';
  return {
    key,
    src: PHOTO_FRAMES[key] || PHOTO_FRAMES['funeral-template-modern-card'],
    aspect: FRAME_ASPECTS[key] || FRAME_ASPECTS['funeral-template-modern-card'],
  };
};

const getPreviewWidth = renderWidth => {
  const width = Number(renderWidth);
  if (Number.isFinite(width) && width > 0) return width;
  return typeof window !== 'undefined' ? Math.min(window.innerWidth, 430) : 390;
};

const getPhotoTransform = (ai, renderWidth) => {
  const layout = ai.main_photo_layout || ai.mainPhotoLayout || {};
  const scale = Number(layout.scale);
  const x = Number(layout.translateX);
  const y = Number(layout.translateY);
  const baseWidth = Number(layout.baseWidth);
  const displayWidth = getPreviewWidth(renderWidth);
  const fallbackBaseWidth = displayWidth * 0.88;
  const positionScale = displayWidth / (Number.isFinite(baseWidth) && baseWidth > 0 ? baseWidth : fallbackBaseWidth);
  return {
    transform: `translate(${Number.isFinite(x) ? x * positionScale : 0}px, ${Number.isFinite(y) ? y * positionScale : 0}px) scale(${Number.isFinite(scale) ? scale : 1})`,
  };
};

const getMemorialTextMetrics = (ai, key, renderWidth) => {
  const layout = key === 'date'
    ? ai.memorial_date_layout || ai.memorialDateLayout || {}
    : ai.memorial_name_layout || ai.memorialNameLayout || {};
  const scale = Number(layout.scale);
  const x = Number(layout.translateX);
  const y = Number(layout.translateY);
  const baseWidth = Number(layout.baseWidth);
  const displayWidth = getPreviewWidth(renderWidth);
  const mainLayout = ai.main_photo_layout || ai.mainPhotoLayout || {};
  const mainBaseWidth = Number(mainLayout.baseWidth);
  const fallbackBaseWidth = Number.isFinite(mainBaseWidth) && mainBaseWidth > 0 ? mainBaseWidth : displayWidth * 0.88;
  const textBaseWidth = Number.isFinite(baseWidth) && baseWidth > 0 ? baseWidth : fallbackBaseWidth;
  const positionScale = displayWidth / textBaseWidth;
  const sizeScale = Math.min(1.35, Math.max(0.55, positionScale || 1));
  return {
    transform: `translate(${Number.isFinite(x) ? x * positionScale : 0}px, ${Number.isFinite(y) ? y * positionScale : 0}px) scale(${Number.isFinite(scale) ? scale : 1})`,
    fontSize: key === 'date' ? 13 * sizeScale : 28 * sizeScale,
    lineHeight: key === 'date' ? 18 * sizeScale : 34 * sizeScale,
    marginTop: key === 'date' ? 6 * sizeScale : undefined,
  };
};

const getFamilyMembers = eventData => {
  const ai = getAdditionalInfo(eventData);
  const list = eventData.familyMembers || eventData.family_members || ai.family_members || [];
  return Array.isArray(list) ? list.filter(member => member?.names) : [];
};

const getAccounts = eventData => {
  const ai = getAdditionalInfo(eventData);
  const list = eventData.condolenceAccounts || eventData.condolence_accounts || ai.condolence_accounts || [];
  return Array.isArray(list)
    ? list.map(account => ({
      bank: account.bank_name || account.bankName || '',
      number: account.account_number || account.accountNumber || '',
      owner: account.owner_name || account.ownerName || '',
    })).filter(account => account.bank || account.number || account.owner)
    : [];
};

function Section({ icon, label, title, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        {icon ? <img src={`${ASSET}/icons/${icon}`} alt="" /> : null}
        <div>
          <span>{label}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <img className={styles.divider} src={`${ASSET}/elements/funeral-divider-flower.png`} alt="" />
      {children}
    </section>
  );
}

function PhotoFrame({ image, eventData, ai }) {
  const frame = getPhotoFrame(ai);
  return (
    <button type="button" className={styles.photoFrame} style={{ aspectRatio: frame.aspect }} aria-label="고인 사진">
      <img className={styles.memorialPhoto} src={image || DEFAULT_PHOTO} alt="" style={getPhotoTransform(ai)} />
      <img className={styles.photoFrameImage} src={frame.src} alt="" />
      <div className={styles.photoCaption}>
        <strong>故 {eventData.main_person_name || eventData.deceasedName || '고인'}</strong>
        <span>{getMemorialPeriod(eventData)}</span>
      </div>
    </button>
  );
}

function ModernSection({ label, title, children, className = '' }) {
  return (
    <section className={`${styles.modernSection} ${className}`}>
      <div className={styles.modernSectionHead}>
        <span>{label}</span>
        <h2>{title}</h2>
        <img src="/studio/elements/18-divider-flower-horizontal.png" alt="" />
      </div>
      {children}
    </section>
  );
}

function ModernInfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className={styles.modernInfoRow}>
      <div className={styles.modernInfoIcon}>{icon}</div>
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function LineIcon({ type = 'info' }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  };

  if (type === 'business') {
    return (
      <svg {...common}>
        <path d="M4 21V6.8c0-.9.7-1.6 1.6-1.6h8.8c.9 0 1.6.7 1.6 1.6V21" />
        <path d="M16 10h2.4c.9 0 1.6.7 1.6 1.6V21" />
        <path d="M8 9h4M8 13h4M8 17h4" />
      </svg>
    );
  }

  if (type === 'location') {
    return (
      <svg {...common}>
        <path d="M12 21s6-5.1 6-11a6 6 0 0 0-12 0c0 5.9 6 11 6 11Z" />
        <circle cx="12" cy="10" r="2.2" />
      </svg>
    );
  }

  if (type === 'call') {
    return (
      <svg {...common}>
        <path d="M7.2 4.8 9.4 7c.6.6.7 1.4.2 2.1l-.8 1.2a12.7 12.7 0 0 0 5 5l1.2-.8c.7-.5 1.5-.4 2.1.2l2.1 2.1c.5.5.6 1.3.2 1.9-.9 1.3-2.5 2-4 1.6C9.7 18.9 5.1 14.3 3.7 8.6c-.4-1.5.3-3.1 1.6-4 .6-.4 1.4-.3 1.9.2Z" />
      </svg>
    );
  }

  if (type === 'calendar') {
    return (
      <svg {...common}>
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    );
  }

  if (type === 'flower') {
    return (
      <svg {...common}>
        <path d="M12 12c-2.8-1.6-2.7-5 .1-6.4 2.7 1.5 2.7 4.8-.1 6.4Z" />
        <path d="M12 12c2.8-1.6 5.6.2 5.4 3.3-2.8 1.3-5.5-.4-5.4-3.3Z" />
        <path d="M12 12c0 3.2-2.8 4.8-5.4 3.3-.2-3.1 2.6-4.9 5.4-3.3Z" />
        <path d="M12 12v8" />
      </svg>
    );
  }

  if (type === 'car') {
    return (
      <svg {...common}>
        <path d="m6 15 1.4-4.2A2.6 2.6 0 0 1 9.9 9h4.2c1.1 0 2.1.7 2.5 1.8L18 15" />
        <path d="M5 15h14v4H5zM7 19v1.5M17 19v1.5" />
        <circle cx="8" cy="17" r=".8" />
        <circle cx="16" cy="17" r=".8" />
      </svg>
    );
  }

  if (type === 'wallet') {
    return (
      <svg {...common}>
        <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v11.5a1.5 1.5 0 0 1-1.5 1.5h-12A2.5 2.5 0 0 1 4 17.5v-10Z" />
        <path d="M4 8h14.5A1.5 1.5 0 0 1 20 9.5V12h-4.2a2.2 2.2 0 0 0 0 4.4H20" />
        <path d="M16 14.2h.1" />
      </svg>
    );
  }

  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 11.5v4.5M12 8h.1" />
    </svg>
  );
}

const getLineIconType = (label = '') => {
  if (label.includes('빈소') || label.includes('장례식장')) return 'business';
  if (label.includes('주소') || label.includes('위치') || label.includes('지도')) return 'location';
  if (label.includes('연락') || label.includes('전화')) return 'call';
  if (label.includes('주차') || label.includes('교통')) return 'car';
  if (label.includes('조문')) return 'flower';
  if (label.includes('예식') || label.includes('일정') || label.includes('시간') || label.includes('장례 방식')) return 'calendar';
  if (label.includes('계좌') || label.includes('부의')) return 'wallet';
  return 'info';
}

function TimelineSectionHead({ kicker, title }) {
  return (
    <div className={styles.timelineSectionHead}>
      <span>{kicker}</span>
      <h2>{title}</h2>
      <img src={`${ASSET}/elements/generated/funeral-timeline-divider-modern.png`} alt="" />
    </div>
  );
}

function TimelineBgArt() {
  return <img className={styles.timelineBgArt} src={`${ASSET}/elements/generated/funeral-timeline-bg-modern.png`} alt="" />;
}

const PAPER_DECOR = {
  message: `${ASSET}/elements/funeral-message-pen-clean.png`,
  family: `${ASSET}/elements/funeral-host-branch-clean.png`,
  schedule: `${ASSET}/elements/funeral-schedule-candle-clean.png`,
  info: `${ASSET}/elements/funeral-info-flower-clean.png`,
  account: `${ASSET}/elements/funeral-account-flower-clean.png`,
  guestbook: `${ASSET}/elements/funeral-guestbook-flower-clean.png`,
};

function PaperSection({ subtitle, title, decor = 'message', children }) {
  return (
    <section className={styles.paperLetterSection}>
      <img className={styles.paperLetterSectionTexture} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
      {PAPER_DECOR[decor] ? <img className={`${styles.paperLetterSectionDecor} ${styles[`paperLetterDecor_${decor}`] || ''}`} src={PAPER_DECOR[decor]} alt="" /> : null}
      <div className={styles.paperLetterSectionHeader}>
        {subtitle ? <span>{subtitle}</span> : null}
        <h2>{title}</h2>
      </div>
      <div className={styles.paperLetterSectionDivider} aria-hidden="true">
        <i />
        <b />
        <i />
      </div>
      <div className={styles.paperLetterSectionContent}>
        {children}
      </div>
    </section>
  );
}

function ModernPhoto({ image, eventData, ai }) {
  const photoRef = useRef(null);
  const [renderWidth, setRenderWidth] = useState(null);
  const frame = getPhotoFrame(ai);
  const deceasedName = eventData.main_person_name || eventData.deceasedName || eventData.deceased_name || '고인';
  const periodText = getMemorialPeriod(eventData);
  const showName = ai.memorial_name_visible !== false && eventData.memorialNameVisible !== false;
  const showDate = ai.memorial_date_visible !== false && eventData.memorialDateVisible !== false && Boolean(periodText);
  const nameColor = eventData.memorialNameColor || ai.memorial_name_color || '#222222';
  const dateColor = eventData.memorialDateColor || ai.memorial_date_color || '#555555';
  const nameMetrics = getMemorialTextMetrics(ai, 'name', renderWidth);
  const dateMetrics = getMemorialTextMetrics(ai, 'date', renderWidth);

  useEffect(() => {
    if (!photoRef.current || typeof ResizeObserver === 'undefined') return undefined;

    const observer = new ResizeObserver(entries => {
      const width = entries[0]?.contentRect?.width;
      if (Number.isFinite(width) && width > 0) {
        setRenderWidth(width);
      }
    });
    observer.observe(photoRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <button ref={photoRef} type="button" className={styles.modernPhotoHero} style={{ aspectRatio: frame.aspect }} aria-label="고인 사진">
      <img className={styles.modernPhotoImage} src={image || DEFAULT_PHOTO} alt="" style={getPhotoTransform(ai, renderWidth)} />
      <img className={styles.modernPhotoFrameImage} src={frame.src} alt="" />
      {showName ? (
        <div className={styles.modernPhotoNameOverlay} style={{ transform: nameMetrics.transform }}>
          <strong style={{ color: nameColor, fontSize: nameMetrics.fontSize, lineHeight: `${nameMetrics.lineHeight}px` }}>故 {deceasedName}</strong>
        </div>
      ) : null}
      {showDate ? (
        <div className={styles.modernPhotoDateOverlay} style={{ transform: dateMetrics.transform }}>
          <span style={{ color: dateColor, marginTop: dateMetrics.marginTop, fontSize: dateMetrics.fontSize, lineHeight: `${dateMetrics.lineHeight}px` }}>{periodText}</span>
        </div>
      ) : null}
    </button>
  );
}

const getMemorialPeriod = eventData => {
  const birth = formatDateShort(eventData.birth_date || eventData.birthDate);
  const death = formatDateShort(eventData.death_date || eventData.deathDate);
  if (birth && death) return `${birth} - ${death}`;
  return death || birth || '';
};

const getAgeText = value => {
  if (!value) return '미입력';
  const text = String(value);
  return text.includes('세') || text.includes('향년') ? text : `${text}세`;
};

const getFuneralStep = eventData => {
  const now = new Date();
  const casket = toDate(eventData.casket_date || eventData.casketDate);
  const burial = toDate(eventData.burial_date || eventData.burialDate);
  if (casket && burial && now >= casket && now < burial) return '입관';
  if (burial && now >= burial) return '발인';
  return null;
};

export default function FuneralNoticeTemplate({ eventData = {}, categorizedImages = {}, allowMessages, messageSettings = {} }) {
  const [guestMessages, setGuestMessages] = useState([]);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [toast, setToast] = useState('');
  const toastTimerRef = useRef(null);

  const ai = useMemo(() => getAdditionalInfo(eventData), [eventData]);
  const images = useMemo(() => normalizeImages(eventData, categorizedImages), [categorizedImages, eventData]);
  const mainImage = getImageSrc(images.main?.[0]) || getImageSrc(images.all?.[0]);
  const deceasedName = eventData.main_person_name || eventData.deceasedName || '고인';
  const deceasedAge = eventData.deceased_age || eventData.deceasedAge;
  const familyMembers = getFamilyMembers(eventData);
  const accounts = getAccounts(eventData);
  const shouldShowMessages = allowMessages !== undefined ? allowMessages !== false : eventData.allow_messages !== false;
  const templateStyle = eventData.template_style || 'modern-card';
  const variantClass = styles[`variant_${templateStyle.replace(/-/g, '_')}`] || styles.variant_modern_card;
  const funeralHome = eventData.funeral_home || eventData.funeralHome || ai.funeral_home || eventData.location || '';
  const funeralAddress = eventData.location || eventData.funeralAddress || ai.funeral_address || '';
  const detailedAddress = eventData.detailed_address || eventData.detailedAddress || '';
  const customMessage = eventData.custom_message || eventData.customMessage || ai.custom_message ||
    '황망한 마음으로 삼가 알려드립니다.\n고인의 마지막 길에 따뜻한 위로와 마음을 전해주시면 감사하겠습니다.';

  const scheduleItems = [
    { label: '별세', date: eventData.death_date || eventData.deathDate, time: eventData.death_time || eventData.deathTime, icon: 'icon-schedule.png' },
    { label: '입관', date: eventData.casket_date || eventData.casketDate || ai.casket_date, time: eventData.casket_time || eventData.casketTime || ai.casket_time, icon: 'icon-casket.png' },
    { label: '발인', date: eventData.burial_date || eventData.burialDate, time: eventData.burial_time || eventData.burialTime, icon: 'icon-procession.png' },
    { label: '장지', text: eventData.burial_location || eventData.burialLocation || ai.burial_location, icon: 'icon-burial.png' },
  ].filter(item => item.date || item.time || item.text);

  const guideItems = [
    eventData.religious_rite || ai.religious_rite,
    eventData.funeral_method || ai.funeral_method,
    eventData.visitation_note || ai.visitation_note,
    eventData.parking_transport_info || ai.parking_transport_info,
  ].filter(Boolean);
  const paperGuideItems = [
    {
      label: '예식',
      value: eventData.religious_rite || ai.religious_rite,
      icon: 'calendar',
    },
    {
      label: '조문',
      value: eventData.visitation_note || ai.visitation_note,
      icon: 'flower',
    },
    {
      label: '주차/교통',
      value: eventData.parking_transport_info || ai.parking_transport_info,
      icon: 'car',
    },
    {
      label: '장례 방식',
      value: eventData.funeral_method || ai.funeral_method,
      icon: 'calendar',
    },
  ].filter(item => item.value);
  const timelineGuideItems = [
    {
      label: '예식',
      value: eventData.religious_rite || ai.religious_rite,
      icon: 'calendar',
    },
    {
      label: '조문',
      value: eventData.visitation_note || ai.visitation_note,
      icon: 'flower',
    },
    {
      label: '주차/교통',
      value: eventData.parking_transport_info || ai.parking_transport_info,
      icon: 'car',
    },
    {
      label: '장례 방식',
      value: eventData.funeral_method || ai.funeral_method,
      icon: 'calendar',
    },
  ].filter(item => item.value);
  const isModernCard = templateStyle === 'modern-card' || templateStyle === 'funeral-template-modern-card';
  const isTimeline = templateStyle === 'editorial-timeline' || templateStyle === 'funeral-template-editorial-timeline';
  const isPaperLetter = templateStyle === 'paper-letter' || templateStyle === 'funeral-template-paper-letter';
  const isCertificate = templateStyle === 'certificate' || templateStyle === 'funeral-template-certificate';
  const modernStep = getFuneralStep(eventData);
  const modernSchedules = [
    {
      label: '입관',
      symbol: '入',
      date: formatDate(eventData.casket_date || eventData.casketDate || ai.casket_date),
      time: formatTime(eventData.casket_time || eventData.casketTime || ai.casket_time),
      active: modernStep === '입관',
    },
    {
      label: '발인',
      symbol: '發',
      date: formatDate(eventData.burial_date || eventData.burialDate),
      time: formatTime(eventData.burial_time || eventData.burialTime),
      active: modernStep === '발인',
    },
    {
      label: '장지',
      symbol: '地',
      date: eventData.burial_location || eventData.burialLocation || ai.burial_location || '미입력',
      time: '',
      active: modernStep === '장지',
    },
  ];
  const mapQuery = encodeURIComponent([funeralHome, detailedAddress, funeralAddress].filter(Boolean).join(' '));
  const timelineItems = [
    {
      day: '입관',
      label: '입관식',
      value: [formatDate(eventData.casket_date || eventData.casketDate || ai.casket_date), formatTime(eventData.casket_time || eventData.casketTime || ai.casket_time)].filter(Boolean).join(' '),
      detail: eventData.visitation_note || ai.visitation_note || '별도 안내를 확인해주세요.',
      active: modernStep === '입관',
    },
    {
      day: '발인',
      label: '발인식',
      value: [formatDate(eventData.burial_date || eventData.burialDate), formatTime(eventData.burial_time || eventData.burialTime)].filter(Boolean).join(' '),
      detail: '장례 절차 진행',
      active: modernStep === '발인',
    },
    {
      day: '장지',
      label: '안치',
      value: eventData.burial_location || eventData.burialLocation || ai.burial_location || '미입력',
      detail: '화장장 또는 봉안 장소 안내',
      active: modernStep === '장지',
    },
  ];
  const paperSchedules = [
    {
      label: '입관',
      icon: 'icon-casket.png',
      value: [formatDate(eventData.casket_date || eventData.casketDate || ai.casket_date), formatTime(eventData.casket_time || eventData.casketTime || ai.casket_time)].filter(Boolean).join(' ') || '일정 미입력',
      active: modernStep === '입관',
    },
    {
      label: '발인',
      icon: 'icon-procession.png',
      value: [formatDate(eventData.burial_date || eventData.burialDate), formatTime(eventData.burial_time || eventData.burialTime)].filter(Boolean).join(' ') || '일정 미입력',
      active: modernStep === '발인',
    },
    {
      label: '장지',
      icon: 'icon-burial.png',
      value: eventData.burial_location || eventData.burialLocation || ai.burial_location || '미입력',
      active: modernStep === '장지',
    },
  ];

  const showToast = message => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(''), 1800);
  };

  const copyAccount = async value => {
    try {
      await navigator.clipboard.writeText((value || '').replace(/-/g, ''));
      showToast('계좌번호가 복사되었습니다');
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    try {
      if (navigator.share && url) {
        await navigator.share({ url });
        return;
      }
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
        showToast('부고장 링크가 복사되었습니다');
        return;
      }
      showToast('공유 링크를 복사할 수 없습니다');
    } catch (error) {
      if (error?.name === 'AbortError') return;
      showToast('공유에 실패했습니다');
    }
  };

  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    try {
      const response = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await response.json();
      if (result.success && result.messages) setGuestMessages(result.messages);
    } catch {}
  };

  useEffect(() => { fetchGuestbook(); }, [eventData?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGuestbookSubmit = async guestbook => {
    const newMessage = {
      id: `temp-${Date.now()}`,
      from: guestbook.name || '익명',
      phone: guestbook.phone,
      date: formatGuestbookDateTime(new Date()),
      content: guestbook.message || '',
    };
    setGuestMessages(prev => [newMessage, ...prev]);
    setTimeout(fetchGuestbook, 500);
  };

  const displayMessages = guestMessages.filter(message => (message.content || message.message || '').trim());
  const certificateDateText = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  if (isCertificate) {
    const casketScheduleText = [
      formatDate(eventData.casket_date || eventData.casketDate || ai.casket_date),
      formatTime(eventData.casket_time || eventData.casketTime || ai.casket_time),
    ].filter(Boolean).join(' ');
    const burialScheduleText = [
      formatDate(eventData.burial_date || eventData.burialDate),
      formatTime(eventData.burial_time || eventData.burialTime),
    ].filter(Boolean).join(' ');
    const burialLocation = eventData.burial_location || eventData.burialLocation || ai.burial_location;
    const certificateSchedules = [
      { label: '입관', value: casketScheduleText, active: modernStep === '입관' },
      { label: '발인', value: burialScheduleText, active: modernStep === '발인' },
      { label: '장지', value: burialLocation, active: modernStep === '장지' },
    ].filter(item => item.value);
    const hasPlaceInfo = Boolean(funeralHome || detailedAddress || funeralAddress || eventData.primary_contact || eventData.primaryContact);

    return (
      <div className={`${styles.root} ${styles.variant_certificate}`}>
        <main className={styles.certificatePage}>
          <section className={styles.certificateDocument}>
            <img className={styles.certificateBackgroundTexture} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
            <img className={styles.certificateCornerTop} src={`${ASSET}/elements/funeral-corner-ornament-clean.png`} alt="" />
            <img className={styles.certificateCornerBottom} src={`${ASSET}/elements/funeral-corner-ornament-clean.png`} alt="" />

            <div className={styles.certificateContent}>
              <section className={styles.certificateDeceasedSection}>
                <div className={styles.certificatePhotoWrapper}>
                  <ModernPhoto image={mainImage} eventData={eventData} ai={ai} />
                </div>
                <div className={styles.certificateDeceasedInfo}>
                  <span className={styles.certificateDeceasedLabel}>고인</span>
                  <h1>故 {deceasedName}</h1>
                  <div className={styles.certificateDetailGrid}>
                    <div>
                      <span>향년</span>
                      <strong>{getAgeText(deceasedAge)}</strong>
                    </div>
                    <div>
                      <span>별세일</span>
                      <strong>{formatDate(eventData.death_date || eventData.deathDate) || '미입력'}</strong>
                    </div>
                  </div>
                </div>
              </section>

              {customMessage ? (
                <section className={styles.certificateSection}>
                  <h2>상주의 말</h2>
                  <img className={styles.certificateSectionDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
                  <div className={styles.certificateMessageBox}>
                    <p>{customMessage}</p>
                  </div>
                </section>
              ) : null}

              {familyMembers.length > 0 && (
                <section className={styles.certificateSection}>
                  <h2>상 주</h2>
                  <img className={styles.certificateSectionDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
                  <div className={styles.certificateFamilyGrid}>
                    {familyMembers.map((member, index) => (
                      <div className={styles.certificateFamilyItem} key={`${member.relation}-${member.names}-${index}`}>
                        <span>{member.relation}</span>
                        <strong>{member.names}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {certificateSchedules.length > 0 && (
                <section className={styles.certificateSection}>
                  <h2>장례 일정</h2>
                  <img className={styles.certificateSectionDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
                  <div className={styles.certificateScheduleList}>
                    {certificateSchedules.map(item => (
                      <div className={`${styles.certificateScheduleItem} ${item.active ? styles.certificateScheduleItemActive : ''}`} key={item.label}>
                        <div>
                          <i />
                          <span>{item.label}</span>
                        </div>
                        <strong>{item.value}</strong>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {hasPlaceInfo && (
                <section className={styles.certificateInfoSection}>
                  {(funeralHome || detailedAddress || funeralAddress) && (
                    <div className={styles.certificateInfoBox}>
                      <h2>빈소</h2>
                      <div className={styles.certificateInfoContent}>
                        {funeralHome ? <strong>{funeralHome}</strong> : null}
                        {detailedAddress ? <span>{detailedAddress}</span> : null}
                        {funeralAddress ? <p>{funeralAddress}</p> : null}
                      </div>
                    </div>
                  )}

                  {(eventData.primary_contact || eventData.primaryContact || eventData.secondary_contact || eventData.secondaryContact || eventData.funeral_director || eventData.funeralDirector) && (
                    <div className={styles.certificateInfoBox}>
                      <h2>연락처</h2>
                      <div className={styles.certificateInfoContent}>
                        {(eventData.primary_contact || eventData.primaryContact) ? (
                          <div className={styles.certificateContactItem}>
                            <span>상주</span>
                            <strong>{formatPhone(eventData.primary_contact || eventData.primaryContact)}</strong>
                          </div>
                        ) : null}
                        {(eventData.secondary_contact || eventData.secondaryContact) ? (
                          <div className={styles.certificateContactItem}>
                            <span>상주</span>
                            <strong>{formatPhone(eventData.secondary_contact || eventData.secondaryContact)}</strong>
                          </div>
                        ) : null}
                        {(eventData.funeral_director || eventData.funeralDirector) ? (
                          <div className={styles.certificateContactItem}>
                            <span>장례지도사</span>
                            <strong>{eventData.funeral_director || eventData.funeralDirector}</strong>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                </section>
              )}

              {paperGuideItems.length > 0 && (
                <section className={styles.certificateSection}>
                  <h2>안내</h2>
                  <img className={styles.certificateSectionDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
                  <div className={styles.certificateGuideList}>
                    {paperGuideItems.map((item, index) => (
                      <ModernInfoRow key={`${item.label}-${index}`} icon={<LineIcon type={item.icon || getLineIconType(item.label)} />} label={item.label} value={item.value} />
                    ))}
                  </div>
                </section>
              )}

              {shouldShowMessages && (
                <section className={styles.certificateSection}>
                  <h2>조문 메시지</h2>
                  <img className={styles.certificateSectionDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
                  <div className={styles.modernMessageList}>
                    {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                      <article key={message.id || index}>
                        <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                        <p>{message.content || message.message}</p>
                      </article>
                    )) : (
                      <p>아직 남겨진 조문 메시지가 없습니다.</p>
                    )}
                  </div>
                </section>
              )}
            </div>

            <footer className={styles.certificateFooter}>
              <strong>故人의 명복을 빕니다</strong>
              <span>{certificateDateText}</span>
            </footer>

            <section className={styles.certificateButtons}>
              {shouldShowMessages ? (
                <button type="button" onClick={() => setShowGuestbookModal(true)}>조문 메시지</button>
              ) : null}
              <button type="button" onClick={handleShare}>공유하기</button>
            </section>
          </section>
        </main>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
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
          onUpdate={fetchGuestbook}
          onDelete={fetchGuestbook}
        />
      </div>
    );
  }

  if (isPaperLetter) {
    return (
      <div className={`${styles.root} ${styles.variant_paper_letter}`}>
        <main className={styles.paperLetterPage}>
          <div className={styles.paperLetterCard}>
            <div className={styles.paperLetterDecorLayer} aria-hidden="true">
              <img className={styles.paperLetterHanjiTexture} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
              <img className={styles.paperLetterCornerTop} src={`${ASSET}/elements/funeral-corner-ornament-clean.png`} alt="" />
              <img className={styles.paperLetterCornerBottom} src={`${ASSET}/elements/funeral-corner-ornament-clean.png`} alt="" />
              <img className={styles.paperLetterBottomCloud} src={`${ASSET}/elements/funeral-bottom-ink-cloud-clean.png`} alt="" />
            </div>

            <section className={styles.paperLetterPhotoPanel}>
              <ModernPhoto image={mainImage} eventData={eventData} ai={ai} />
            </section>

            <section className={styles.paperLetterHeroBlock}>
              <img className={styles.paperLetterHeroLeafLeft} src={`${ASSET}/elements/funeral-host-branch-clean.png`} alt="" />
              <img className={styles.paperLetterHeroFlowerRight} src={`${ASSET}/elements/funeral-account-flower-clean.png`} alt="" />
              <p>삼가 고인의 명복을 빕니다</p>
              <div className={styles.paperLetterNameRow}>
                <span>故</span>
                <h1>{deceasedName}</h1>
              </div>
              <em>
                {eventData.birth_date || eventData.birthDate ? `${formatDate(eventData.birth_date || eventData.birthDate)} ~ ` : ''}
                {formatDate(eventData.death_date || eventData.deathDate) || '사망일 미입력'} · 향년 {getAgeText(deceasedAge)}
              </em>
              <img className={styles.paperLetterHeroDivider} src={`${ASSET}/elements/funeral-divider-flower-clean.png`} alt="" />
            </section>

            <div className={styles.paperLetterBody}>
              <PaperSection icon="icon-family-message.png" subtitle="가족이 전하는 말씀" title="상주의 말" decor="message">
                <div className={styles.paperLetterIntroBox}>
                  <p>{customMessage}</p>
                </div>
              </PaperSection>

              {familyMembers.length > 0 && (
                <PaperSection icon="icon-host.png" subtitle="고인을 모시는 가족" title="상주" decor="family">
                  <div className={styles.paperLetterHostGrid}>
                    {familyMembers.map((member, index) => (
                      <div className={styles.paperLetterHostPill} key={`${member.relation}-${member.names}-${index}`}>
                        <span>{member.relation}</span>
                        <strong>{member.names}</strong>
                      </div>
                    ))}
                  </div>
                </PaperSection>
              )}

              <PaperSection icon="icon-schedule.png" subtitle="입관부터 장지까지" title="조문 일정" decor="schedule">
                <div className={styles.paperLetterScheduleOverview}>
                  <div className={styles.paperLetterScheduleLineArt} />
                  {paperSchedules.map(item => (
                    <article className={`${styles.paperLetterScheduleMiniCard} ${item.active ? styles.paperLetterScheduleMiniCardActive : ''}`} key={item.label}>
                      <div className={styles.paperLetterMiniIcon}>
                        <img src={`${ASSET}/icons/${item.icon}`} alt="" />
                      </div>
                      <strong>{item.label}</strong>
                      <p>{item.value}</p>
                      {item.active ? <em>진행중</em> : null}
                    </article>
                  ))}
                </div>
              </PaperSection>

              <PaperSection icon="icon-funeral-info.png" subtitle="빈소와 연락처" title="장례 안내" decor="info">
                <div className={styles.paperLetterInfoList}>
                  {[
                    ['business', '빈소', funeralHome || '장례식장'],
                    ['location', '주소', [detailedAddress, funeralAddress].filter(Boolean).join(' ')],
                    ['call', '연락처', formatPhone(eventData.primary_contact || eventData.primaryContact)],
                  ].map(([iconType, label, value]) => (
                    value ? (
                      <div className={styles.paperLetterInfoRow} key={label}>
                        <div className={styles.paperLetterInfoIcon}><LineIcon type={iconType} /></div>
                        <section>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </section>
                      </div>
                    ) : null
                  ))}
                  {funeralAddress ? (
                    <>
                      <div className={styles.paperLetterMapWrap}>
                        <GoogleMapEmbed address={funeralAddress} venueName={funeralHome} height="100%" />
                      </div>
                      <div className={styles.paperLetterMapButtonRow}>
                        <a href={`https://map.naver.com/v5/search/${mapQuery}`}>네이버지도</a>
                        <a href={`https://map.kakao.com/link/search/${mapQuery}`}>카카오맵</a>
                        <a href={`https://tmap.life/search?query=${mapQuery}`}>티맵</a>
                      </div>
                    </>
                  ) : null}
                </div>
              </PaperSection>

              {paperGuideItems.length > 0 && (
                <PaperSection icon="icon-guidance.png" subtitle="조문 전 확인 사항" title="안내" decor="family">
                  <div className={styles.paperLetterInfoList}>
                    {paperGuideItems.map((item, index) => (
                      <div className={styles.paperLetterInfoRow} key={`${item.label}-${index}`}>
                        <div className={styles.paperLetterInfoIcon}><LineIcon type={item.icon || getLineIconType(item.label)} /></div>
                        <section>
                          <span>{item.label}</span>
                          <strong>{item.value}</strong>
                        </section>
                      </div>
                    ))}
                  </div>
                </PaperSection>
              )}

              {accounts.length > 0 && (
                <PaperSection icon="icon-condolence-account.png" subtitle="마음을 전하실 곳" title="부의금 계좌" decor="account">
                  <div className={styles.paperLetterInfoList}>
                    {accounts.map((account, index) => (
                      <button type="button" className={styles.paperLetterInfoRow} key={`${account.number}-${index}`} onClick={() => copyAccount(account.number)}>
                        <div className={styles.paperLetterInfoIcon}><LineIcon type="wallet" /></div>
                        <section>
                          <span>{account.bank || '은행'}</span>
                          <strong>{`${account.number} ${account.owner}`.trim() || '계좌 미입력'}</strong>
                        </section>
                      </button>
                    ))}
                  </div>
                </PaperSection>
              )}
            </div>
          </div>

          {shouldShowMessages && (
            <section className={`${styles.paperLetterSection} ${styles.paperLetterMessage}`}>
              <img className={styles.paperLetterSectionTexture} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
              <img className={`${styles.paperLetterSectionDecor} ${styles.paperLetterDecor_guestbook}`} src={PAPER_DECOR.guestbook} alt="" />
              <div className={styles.paperLetterSectionHeader}>
                <span>남겨주신 마음</span>
                <h2>조문 메시지</h2>
              </div>
              <div className={styles.paperLetterSectionDivider} aria-hidden="true">
                <i />
                <b />
                <i />
              </div>
              <div className={styles.modernMessageList}>
                {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                  <article key={message.id || index}>
                    <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                    <p>{message.content || message.message}</p>
                  </article>
                )) : (
                  <p>아직 남겨진 조문 메시지가 없습니다.</p>
                )}
              </div>
            </section>
          )}

          <section className={styles.paperLetterActionRow}>
            {shouldShowMessages ? (
              <button type="button" className={styles.paperLetterButton} onClick={() => setShowGuestbookModal(true)}>조문 메시지 남기기</button>
            ) : null}
            <button type="button" className={styles.paperLetterShareButton} onClick={handleShare}>공유하기</button>
          </section>
        </main>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
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
          onUpdate={fetchGuestbook}
          onDelete={fetchGuestbook}
        />
      </div>
    );
  }

  if (isTimeline) {
    return (
      <div className={`${styles.root} ${styles.variant_editorial_timeline}`}>
        <main className={styles.timelinePage}>
          <section className={styles.timelineVisual}>
            <ModernPhoto image={mainImage} eventData={eventData} ai={ai} />
          </section>

          <section className={styles.timelineHeader}>
            <TimelineBgArt />
            <div className={styles.timelineHeaderTop}>
              <span>FUNERAL TIMELINE</span>
              <button type="button" onClick={handleShare}>공유</button>
            </div>
            <h1>故 {deceasedName}</h1>
            <div className={styles.timelineHeaderMetaRow}>
              <span>향년 {getAgeText(deceasedAge)}</span>
              <i />
              <span>{formatDate(eventData.death_date || eventData.deathDate) ? `${formatDate(eventData.death_date || eventData.deathDate)} 별세` : '사망일 미입력'}</span>
            </div>
          </section>

          <section className={styles.timelineBox}>
            <TimelineBgArt />
            <TimelineSectionHead kicker="MESSAGE" title="상주의 말" />
            <p className={styles.timelineMessageText}>{customMessage}</p>
          </section>

          {familyMembers.length > 0 && (
            <section className={styles.timelineBox}>
              <TimelineBgArt />
              <TimelineSectionHead kicker="FAMILY" title="상주" />
              <div className={styles.timelineFamilyList}>
                {familyMembers.map((member, index) => (
                  <div className={styles.timelineFamilyItem} key={`${member.relation}-${member.names}-${index}`}>
                    <span>{member.relation}</span>
                    <strong>{member.names}</strong>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className={styles.timelineBox}>
            <TimelineBgArt />
            <TimelineSectionHead kicker="SCHEDULE" title="조문 일정" />
            <div className={styles.timelineSimpleList}>
              {timelineItems.map((item, index) => (
                <article className={`${styles.timelineSimpleItem} ${item.active ? styles.timelineSimpleItemActive : ''}`} key={item.day}>
                  <div className={styles.timelineSimpleMarkerWrap}>
                    <div className={`${styles.timelineSimpleMarker} ${item.active ? styles.timelineSimpleMarkerActive : ''}`}>
                      {index + 1}
                    </div>
                    {index < timelineItems.length - 1 ? <div className={styles.timelineSimpleLine} /> : null}
                  </div>
                  <div className={styles.timelineSimpleBody}>
                    <div className={styles.timelineSimpleTitleRow}>
                      <div>
                        <span>{item.day}</span>
                        <strong>{item.label}</strong>
                      </div>
                      {item.active ? <em>현재 진행</em> : null}
                    </div>
                    <p>{item.value || '미입력'}</p>
                    <small>{item.detail}</small>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.timelineBox}>
            <TimelineBgArt />
            <TimelineSectionHead kicker="LOCATION" title="장례 안내" />
            <div className={styles.timelineInfoList}>
              <ModernInfoRow icon={<LineIcon type="business" />} label="빈소" value={funeralHome || '장례식장'} />
              <ModernInfoRow icon={<LineIcon type="location" />} label="주소" value={[detailedAddress, funeralAddress].filter(Boolean).join(' ')} />
              <ModernInfoRow icon={<LineIcon type="call" />} label="연락처" value={formatPhone(eventData.primary_contact || eventData.primaryContact)} />
            </div>
            {funeralAddress ? (
              <>
                <div className={styles.timelineMapWrap}>
                  <GoogleMapEmbed address={funeralAddress} venueName={funeralHome} height="192px" />
                </div>
                <div className={styles.timelineMapButtonRow}>
                  <a href={`https://map.naver.com/v5/search/${mapQuery}`}>네이버지도</a>
                  <a href={`https://map.kakao.com/link/search/${mapQuery}`}>카카오맵</a>
                  <a href={`https://tmap.life/search?query=${mapQuery}`}>티맵</a>
                </div>
              </>
            ) : null}
          </section>

          {timelineGuideItems.length > 0 && (
            <section className={styles.timelineBox}>
              <TimelineBgArt />
              <TimelineSectionHead kicker="GUIDE" title="조문 안내" />
              <div className={styles.timelineInfoList}>
                {timelineGuideItems.map((item, index) => (
                  <ModernInfoRow
                    key={`${item.label}-${index}`}
                    icon={<LineIcon type={item.icon || getLineIconType(item.label)} />}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </section>
          )}

          {accounts.length > 0 && (
            <section className={styles.timelineBox}>
              <TimelineBgArt />
              <TimelineSectionHead kicker="ACCOUNT" title="부의금 계좌" />
              <div className={styles.timelineInfoList}>
                {accounts.map((account, index) => (
                  <button type="button" className={`${styles.modernAccountRow} ${styles.timelineAccountRow}`} key={`${account.number}-${index}`} onClick={() => copyAccount(account.number)}>
                    <div className={styles.modernInfoIcon}><LineIcon type="wallet" /></div>
                    <span>{account.bank || '은행'}</span>
                    <strong>{`${account.number} ${account.owner}`.trim()}</strong>
                    <em>복사</em>
                  </button>
                ))}
              </div>
            </section>
          )}

          {shouldShowMessages && (
            <section className={styles.timelineBox}>
              <TimelineBgArt />
              <TimelineSectionHead kicker="GUESTBOOK" title="조문 메시지" />
              <div className={styles.modernMessageList}>
                {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                  <article key={message.id || index}>
                    <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                    <p>{message.content || message.message}</p>
                  </article>
                )) : (
                  <p>아직 남겨진 조문 메시지가 없습니다.</p>
                )}
              </div>
            </section>
          )}

          <section className={`${styles.modernActionRow} ${styles.timelineActionRow}`}>
            {shouldShowMessages ? (
              <button type="button" onClick={() => setShowGuestbookModal(true)}>조문 메시지 남기기</button>
            ) : null}
            <button type="button" onClick={handleShare}>부고장 공유하기</button>
          </section>
        </main>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
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
          onUpdate={fetchGuestbook}
          onDelete={fetchGuestbook}
        />
      </div>
    );
  }

  if (isModernCard) {
    return (
      <div className={`${styles.root} ${styles.variant_modern_card}`}>
        <main className={styles.modernPage}>
          <section className={styles.modernProfile}>
            <div className={styles.modernBadgeRow}>
              <span>부고</span>
              <span>{formatDate(eventData.death_date || eventData.deathDate) || '사망일자 미입력'}</span>
            </div>
            <ModernPhoto image={mainImage} eventData={eventData} ai={ai} />
          </section>

          <section className={styles.modernHeroCard}>
            <img className={styles.modernCorner} src={`${ASSET}/elements/funeral-corner-ornament.png`} alt="" />
            <img className={styles.modernCloud} src={`${ASSET}/elements/funeral-bottom-ink-cloud.png`} alt="" />
            <img className={styles.modernHeroOlive} src="/studio/elements/7-olive-branch.png" alt="" />
            <img className={styles.modernHeroPetals} src="/studio/elements/12-magnolia-petals.png" alt="" />
            <img className={styles.modernHeroDivider} src="/studio/elements/18-divider-flower-horizontal.png" alt="" />
            <p>삼가 고인의 명복을 빕니다</p>
            <div className={styles.modernNamePlate}>
              <span>故</span>
              <h1>{deceasedName}</h1>
            </div>
            <div className={styles.modernDetailGrid}>
              <div>
                <span>향년</span>
                <strong>{getAgeText(deceasedAge)}</strong>
              </div>
              <div>
                <span>별세일</span>
                <strong>{formatDate(eventData.death_date || eventData.deathDate) || '미입력'}</strong>
              </div>
            </div>
          </section>

          <ModernSection label="MESSAGE" title="상주의 말" className={styles.modernGreetingSection}>
            <img className={styles.modernGreetingPen} src={`${ASSET}/elements/funeral-message-pen.png`} alt="" />
            <img className={styles.modernGreetingFlower} src={`${ASSET}/elements/funeral-info-flower.png`} alt="" />
            <p className={styles.modernGreetingText}>{customMessage}</p>
          </ModernSection>

          {familyMembers.length > 0 && (
            <ModernSection label="FAMILY" title="상주">
              <img className={styles.modernHostBranch} src={`${ASSET}/elements/funeral-host-branch.png`} alt="" />
              <div className={styles.modernFamilyGrid}>
                {familyMembers.map((member, index) => (
                  <div className={styles.modernFamilyItem} key={`${member.relation}-${member.names}-${index}`}>
                    <span>{member.relation}</span>
                    <strong>{member.names}</strong>
                  </div>
                ))}
              </div>
            </ModernSection>
          )}

          <ModernSection label="SCHEDULE" title="조문 일정">
            <img className={styles.modernScheduleCandle} src={`${ASSET}/elements/funeral-schedule-candle.png`} alt="" />
            <div className={styles.modernScheduleGrid}>
              {modernSchedules.map((item, index) => (
                <article className={`${styles.modernScheduleCard} ${item.active ? styles.modernScheduleActive : ''}`} key={item.label}>
                  <img src={index === 1 ? '/studio/elements/12-magnolia-petals.png' : '/studio/elements/10-single-leaf-small.png'} alt="" />
                  <div className={styles.modernScheduleSymbol}>{item.symbol}</div>
                  <div className={styles.modernScheduleLabel}>
                    <em>{String(index + 1).padStart(2, '0')}</em>
                    <strong>{item.label}</strong>
                    {item.active ? <span>진행중</span> : null}
                  </div>
                  <p>{[item.date, item.time].filter(Boolean).join('\n') || '미입력'}</p>
                </article>
              ))}
            </div>
          </ModernSection>

          <ModernSection label="LOCATION" title="장례 안내">
            <img className={styles.modernInfoFlower} src={`${ASSET}/elements/funeral-info-flower.png`} alt="" />
            <div className={styles.modernInfoList}>
              <ModernInfoRow icon={<LineIcon type="business" />} label="장례식장" value={funeralHome || '장례식장'} />
              <ModernInfoRow icon={<LineIcon type="location" />} label="주소" value={[detailedAddress, funeralAddress].filter(Boolean).join(' ')} />
              <ModernInfoRow icon={<LineIcon type="call" />} label="연락처" value={formatPhone(eventData.primary_contact || eventData.primaryContact)} />
            </div>
            {funeralAddress ? (
              <>
                <div className={styles.modernMapWrap}>
                  <GoogleMapEmbed address={funeralAddress} venueName={funeralHome} height="210px" />
                </div>
                <div className={styles.modernMapButtons}>
                  <a href={`https://map.naver.com/v5/search/${mapQuery}`}>네이버지도</a>
                  <a href={`https://map.kakao.com/link/search/${mapQuery}`}>카카오맵</a>
                  <a href={`https://tmap.life/search?query=${mapQuery}`}>티맵</a>
                </div>
              </>
            ) : null}
          </ModernSection>

          {guideItems.length > 0 && (
            <ModernSection label="GUIDE" title="안내">
              <div className={styles.modernInfoList}>
                {guideItems.map((item, index) => (
                  <ModernInfoRow key={`${item}-${index}`} icon={<LineIcon type={getLineIconType(item)} />} label={`안내 ${index + 1}`} value={item} />
                ))}
              </div>
            </ModernSection>
          )}

          {accounts.length > 0 && (
            <ModernSection label="ACCOUNT" title="부의금 계좌">
              <img className={styles.modernAccountFlower} src={`${ASSET}/elements/funeral-account-flower.png`} alt="" />
              <div className={styles.modernInfoList}>
                {accounts.map((account, index) => (
                  <button type="button" className={`${styles.modernAccountRow} ${styles.modernAccountRowWithIcon}`} key={`${account.number}-${index}`} onClick={() => copyAccount(account.number)}>
                    <div className={styles.modernInfoIcon}><LineIcon type="wallet" /></div>
                    <span>{account.bank || '은행'}</span>
                    <strong>{`${account.number} ${account.owner}`.trim()}</strong>
                    <em>복사</em>
                  </button>
                ))}
              </div>
            </ModernSection>
          )}

          {shouldShowMessages && (
            <ModernSection label="GUESTBOOK" title="조문 메시지">
              <img className={styles.modernGuestbookFlower} src={`${ASSET}/elements/funeral-guestbook-flower.png`} alt="" />
              <div className={styles.modernMessageList}>
                {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                  <article key={message.id || index}>
                    <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                    <p>{message.content || message.message}</p>
                  </article>
                )) : (
                  <p>아직 남겨진 조문 메시지가 없습니다.</p>
                )}
              </div>
            </ModernSection>
          )}

          {shouldShowMessages ? (
            <section className={styles.modernActionRow}>
              <button type="button" onClick={() => setShowGuestbookModal(true)}>조문 메시지 남기기</button>
            </section>
          ) : null}
        </main>

        {toast ? <div className={styles.toast}>{toast}</div> : null}
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
          onUpdate={fetchGuestbook}
          onDelete={fetchGuestbook}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.root} ${variantClass}`}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <img className={styles.hanjiBg} src={`${ASSET}/elements/funeral-bg-hanji.png`} alt="" />
          <img className={styles.heroBranch} src={`${ASSET}/elements/funeral-host-branch.png`} alt="" />
          <img className={styles.heroFlower} src={`${ASSET}/elements/funeral-account-flower.png`} alt="" />
          <p className={styles.eyebrow}>삼가 고인의 명복을 빕니다</p>
          <PhotoFrame image={mainImage} eventData={eventData} ai={ai} />
          <div className={styles.heroText}>
            <span>訃告</span>
            <h1>故 {deceasedName}</h1>
            {deceasedAge ? <p>향년 {deceasedAge}세</p> : null}
            <em>{formatDate(eventData.death_date || eventData.deathDate)}</em>
          </div>
        </section>

        <Section icon="icon-family-message.png" label="MESSAGE" title="상주의 말">
          <p className={styles.messageText}>{customMessage}</p>
        </Section>

        {familyMembers.length > 0 && (
          <Section icon="icon-host.png" label="HOST" title="상주">
            <div className={styles.familyGrid}>
              {familyMembers.map((member, index) => (
                <div className={styles.familyItem} key={`${member.relation}-${member.names}-${index}`}>
                  <span>{member.relation}</span>
                  <strong>{member.names}</strong>
                </div>
              ))}
            </div>
          </Section>
        )}

        {scheduleItems.length > 0 && (
          <Section icon="icon-schedule.png" label="SCHEDULE" title="장례 일정">
            <div className={styles.scheduleList}>
              {scheduleItems.map((item, index) => (
                <div className={styles.scheduleItem} key={`${item.label}-${index}`}>
                  <div className={styles.scheduleIcon}><img src={`${ASSET}/icons/${item.icon}`} alt="" /></div>
                  <div>
                    <span>{item.label}</span>
                    <strong>{item.text || [formatDate(item.date), formatTime(item.time)].filter(Boolean).join(' ')}</strong>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        <Section icon="icon-location.png" label="PLACE" title="빈소 안내">
          <div className={styles.placeCard}>
            <strong>{funeralHome || '장례식장'}</strong>
            {detailedAddress ? <span>{detailedAddress}</span> : null}
            {funeralAddress ? <p>{funeralAddress}</p> : null}
            {eventData.primary_contact ? (
              <a href={`tel:${String(eventData.primary_contact).replace(/\D/g, '')}`}>상주 연락처 {formatPhone(eventData.primary_contact)}</a>
            ) : null}
          </div>
          {funeralAddress ? (
            <div className={styles.mapWrap}>
              <GoogleMapEmbed address={funeralAddress} venueName={funeralHome} height="240px" />
            </div>
          ) : null}
        </Section>

        {guideItems.length > 0 && (
          <Section icon="icon-guidance.png" label="GUIDE" title="조문 안내">
            <div className={styles.guideList}>
              {guideItems.map((item, index) => <p key={`${item}-${index}`}>{item}</p>)}
            </div>
          </Section>
        )}

        {accounts.length > 0 && (
          <Section icon="icon-condolence-account.png" label="ACCOUNT" title="부의금 계좌">
            <div className={styles.accountList}>
              {accounts.map((account, index) => (
                <button type="button" className={styles.accountItem} key={`${account.number}-${index}`} onClick={() => copyAccount(account.number)}>
                  <span>{account.owner}</span>
                  <strong>{account.bank} {account.number}</strong>
                  <em>복사</em>
                </button>
              ))}
            </div>
          </Section>
        )}

        {shouldShowMessages && (
          <Section icon="icon-guestbook.png" label="GUESTBOOK" title="조문 메시지">
            <div className={styles.messageList}>
              {displayMessages.length > 0 ? displayMessages.slice(0, 8).map((message, index) => (
                <article key={message.id || index}>
                  <strong>{message.from || message.sender_name || message.guest_name || '익명'}</strong>
                  <p>{message.content || message.message}</p>
                </article>
              )) : (
                <p className={styles.emptyText}>아직 남겨진 조문 메시지가 없습니다.</p>
              )}
            </div>
            <button type="button" className={styles.primaryButton} onClick={() => setShowGuestbookModal(true)}>
              조문 메시지 남기기
            </button>
          </Section>
        )}

        {shouldShowMessages ? (
          <section className={styles.actionSection}>
            <button type="button" onClick={() => setShowGuestbookModal(true)}>조문 메시지</button>
          </section>
        ) : null}
      </main>

      {toast ? <div className={styles.toast}>{toast}</div> : null}

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
        onUpdate={fetchGuestbook}
        onDelete={fetchGuestbook}
      />
    </div>
  );
}
