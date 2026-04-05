// components/templates/RomanticPinkTemplate.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './RomanticPinkTemplate.module.css';

// ─── 랜덤 인사말 목록 (앱과 동일) ─────────────────────────────────────────
const RANDOM_GREETINGS = [
  `두 사람이 만나 하나의 길을 걷습니다.
서로 다른 빛깔이 어우러져
더 아름다운 무지개가 되듯이
두 분의 사랑이 영원히 빛나길 바랍니다.

봄날 아침이슬처럼 맑고 투명한 마음으로
서로를 아끼고 보살피며
매일매일 새로운 행복을 만들어가는
아름다운 부부가 되시길 기원합니다.

저희 두 사람이 함께하는 새로운 시작에
귀한 발걸음으로 축복해 주시면 감사하겠습니다.`,

  `봄날의 꽃처럼 피어난 사랑이
여름의 태양처럼 뜨겁게 타오르고
가을의 결실처럼 풍성하며
겨울의 눈처럼 순수하길 바랍니다.

계절이 바뀌어도 변치 않는 사랑으로
서로에게 든든한 버팀목이 되어주며
평생 함께 걸어갈 동반자로서
아름다운 동행을 이어가시길 기도합니다.

소중한 날, 함께해 주시는 모든 분들께
진심으로 감사드립니다.`,

  `오랜 기다림 끝에 만난 인연
이제 서로의 영원한 동반자가 되어
기쁨은 두 배로, 슬픔은 반으로
나누며 살아가겠습니다.

햇살처럼 따스한 미소로 서로를 바라보며
별빛처럼 영롱한 추억들을 쌓아가고
무지개처럼 희망찬 내일을 꿈꾸며
한평생 아름다운 사랑을 키워가겠습니다.

저희의 첫걸음을 축복해 주세요.`,

  `서로를 향한 믿음과 사랑으로
평생을 함께하기로 약속했습니다.
따뜻한 격려와 축복 속에서
더욱 단단한 가정을 이루겠습니다.

아침 햇살처럼 포근하게 서로를 감싸주고
저녁 노을처럼 아름답게 물들어가며
밤하늘 별처럼 반짝이는 사랑으로
영원토록 함께하는 부부가 되겠습니다.

귀한 시간 내어 축하해 주시면
큰 기쁨이 되겠습니다.`,

  `첫 만남의 설렘을 간직한 채
이제 평생의 동반자가 되려 합니다.
서로 존중하고 배려하며
아름다운 가정을 만들어가겠습니다.

맑은 샘물처럼 순수한 마음으로
푸른 나무처럼 굳건한 신뢰로
향기로운 꽃처럼 아름다운 사랑으로
세상에서 가장 행복한 가정을 꾸려가겠습니다.

저희 두 사람의 새 출발을
함께 축복해 주시기 바랍니다.`,

  `운명처럼 만난 두 사람
이제 하나의 가정을 이루려 합니다.
변치 않는 사랑과 신뢰로
행복한 미래를 그려가겠습니다.

새벽 이슬처럼 청초한 마음으로 시작하여
한낮의 태양처럼 열정적으로 사랑하고
황혼의 노을처럼 아름답게 물들어가는
평생의 반려자가 되겠습니다.

소중한 분들과 함께
이 기쁨을 나누고 싶습니다.`,

  `사랑하는 마음 하나로 시작하여
서로를 이해하는 지혜를 배우고
함께 성장하는 기쁨을 누리며
영원히 함께하겠습니다.

봄바람처럼 부드럽게 어루만지고
여름비처럼 시원하게 위로하며
가을 하늘처럼 높고 깊은 사랑으로
겨울 눈처럼 포근하게 덮어주는
그런 사랑을 하며 살겠습니다.`,

  `긴 여정 끝에 찾은 서로에게
이제 영원을 약속하려 합니다.
매일이 감사하고 행복한 날들로
채워지길 소망합니다.

아침마다 서로의 얼굴을 보며 미소 짓고
저녁마다 서로의 손을 잡고 감사하며
매순간 서로를 향한 사랑을 확인하는
그런 아름다운 부부가 되겠습니다.

함께해 주시는 모든 분들께
깊은 감사의 마음을 전합니다.`,

  `서로의 부족함을 채워주고
장점은 더욱 빛나게 해주는
최고의 파트너를 만났습니다.
평생 서로를 아끼며 살겠습니다.

산들바람처럼 상쾌한 아침을 열어주고
따스한 햇살처럼 온기를 나누며
맑은 하늘처럼 투명한 사랑으로
영원히 함께할 것을 약속합니다.

새로운 시작을 축복해 주신다면
더없는 기쁨이 되겠습니다.`,

  `따뜻한 봄날에 시작된 사랑이
이제 결실을 맺으려 합니다.
언제나 처음 그 마음 그대로
서로를 사랑하며 살아가겠습니다.

꽃잎처럼 여린 마음으로 서로를 아끼고
나무처럼 든든하게 서로를 지켜주며
바다처럼 넓은 마음으로 서로를 품어주는
아름답고 행복한 가정을 만들어가겠습니다.

귀한 발걸음 해주시는 모든 분들께
진심으로 감사드립니다.`
];

// ─── 한글 → 영문 이름 변환 ──────────────────────────────────────────────
const koreanToEnglish = (koreanName) => {
  const nameMap = {
    '김': 'Kim', '이': 'Lee', '박': 'Park', '최': 'Choi', '정': 'Jung',
    '강': 'Kang', '조': 'Jo', '윤': 'Yoon', '장': 'Jang', '임': 'Lim',
    '한': 'Han', '오': 'Oh', '서': 'Seo', '신': 'Shin', '권': 'Kwon',
    '황': 'Hwang', '안': 'Ahn', '송': 'Song', '전': 'Jeon', '홍': 'Hong',
    '유': 'Yoo', '고': 'Ko', '문': 'Moon', '배': 'Bae', '백': 'Baek',
    '허': 'Heo', '남': 'Nam', '심': 'Sim', '노': 'Noh', '하': 'Ha',
    '곽': 'Kwak', '성': 'Sung', '차': 'Cha', '주': 'Joo', '우': 'Woo',
    '구': 'Koo', '민': 'Min', '진': 'Jin', '나': 'Na', '지': 'Ji',
    '변': 'Byun', '방': 'Bang', '양': 'Yang',
    '수': 'Soo', '현': 'Hyun', '준': 'Jun', '영': 'Young', '호': 'Ho',
    '연': 'Yeon', '은': 'Eun', '혜': 'Hye', '미': 'Mi', '선': 'Sun',
    '희': 'Hee', '경': 'Kyung', '아': 'Ah', '리': 'Ri', '라': 'Ra',
    '빈': 'Bin', '원': 'Won', '태': 'Tae', '규': 'Kyu', '재': 'Jae',
    '동': 'Dong', '훈': 'Hoon', '상': 'Sang', '철': 'Chul', '병': 'Byung',
    '인': 'In', '기': 'Ki', '석': 'Seok', '광': 'Kwang', '용': 'Yong',
    '솔': 'Sol', '린': 'Rin', '율': 'Yul', '별': 'Byul',
  };
  if (!koreanName) return '';
  let result = [];
  for (let i = 0; i < koreanName.length; i++) {
    const ch = koreanName[i];
    result.push(nameMap[ch] || ch);
  }
  if (result.length > 1) {
    const surname = result[0];
    const given = result.slice(1).join('').toLowerCase();
    return `${surname} ${given.charAt(0).toUpperCase() + given.slice(1)}`;
  }
  return result.join('');
};

// ─── 오프닝 오버레이 ─────────────────────────────────────────────────────
const CustomOpeningOverlay = ({ visible, onComplete }) => {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (visible) {
      const t1 = setTimeout(() => setShowText(true), 500);
      const t2 = setTimeout(() => setFadeOut(true), 2500);
      const t3 = setTimeout(() => { if (onComplete) onComplete(); }, 3500);
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={styles.openingOverlay}
      style={{ opacity: fadeOut ? 0 : 1, transition: 'opacity 1s ease-out', pointerEvents: fadeOut ? 'none' : 'auto' }}
    >
      {showText && (
        <div className={styles.openingText}>
          <div className={styles.animatedSvgText}>Happy Wedding</div>
        </div>
      )}
    </div>
  );
};

// ─── 떨어지는 꽃잎 ───────────────────────────────────────────────────────
const FallingPetals = () => {
  const [petals] = useState(() =>
    [...Array(30)].map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: i * 1000,
      size: 10 + Math.random() * 6,
      duration: 10000 + i * 300,
    }))
  );

  return (
    <div className={styles.fallingPetalsContainer}>
      {petals.map((p) => (
        <div
          key={p.id}
          className={styles.fallingPetal}
          style={{
            left: `${p.left}%`,
            animationDelay: `${p.delay}ms`,
            animationDuration: `${p.duration}ms`,
            fontSize: `${p.size}px`,
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

// ─── 메인 사진 슬라이드쇼 ────────────────────────────────────────────────
const MainPhotoSlideshow = ({ images, onImagePress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (images && images.length > 1) {
      const iv = setInterval(() => setCurrentIndex((p) => (p + 1) % images.length), 4000);
      return () => clearInterval(iv);
    }
  }, [images?.length]);

  const getImageSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.publicUrl || img.uri || img.url || img.src || null;
  };

  return (
    <div className={styles.mainPhotoContainer} onClick={() => onImagePress && onImagePress(currentIndex)}>
      {images && images.length > 0 ? (
        images.map((image, index) => {
          const src = getImageSrc(image);
          return src ? (
            <img
              key={index}
              src={src}
              alt="Wedding"
              className={`${styles.mainPhoto} ${index === currentIndex ? styles.active : ''}`}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          ) : null;
        })
      ) : (
        <div className={styles.photoPlaceholder}>
          <span>💖</span>
        </div>
      )}
    </div>
  );
};

// ─── 로맨틱 핑크 달력 ────────────────────────────────────────────────────
const RomanticPinkCalendar = ({ targetDate }) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const weekDays = ['S','M','T','W','T','F','S'];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) calendarDays.push({ day: '', isTarget: false });
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push({ day: i, isTarget: i === day });

  return (
    <div className={styles.romanticCalendar}>
      <h3 className={styles.calendarMonth}>{months[month]} {year}</h3>
      <div className={styles.calendarWeekDays}>
        {weekDays.map((wd, i) => (
          <span key={i} className={`${styles.calendarWeekDay} ${i === 0 ? styles.sunday : ''}`}>{wd}</span>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {calendarDays.map((d, i) => (
          <div key={i} className={styles.calendarDayWrapper}>
            {d.isTarget ? (
              <div className={styles.calendarTargetDay}>
                <span className={styles.calendarTargetDayText}>{d.day}</span>
              </div>
            ) : (
              <span className={`${styles.calendarDay} ${!d.day ? styles.inactive : ''} ${i % 7 === 0 && d.day ? styles.sunday : ''}`}>
                {d.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── 카운트다운 ──────────────────────────────────────────────────────────
const CountdownDisplay = ({ timeLeft, isExpired }) => {
  if (isExpired) {
    return (
      <div className={styles.weddingComplete}>
        <div className={styles.completeIcon}>💐</div>
        <p className={styles.completeMessage}>D-Day! 축하합니다! 🎉</p>
      </div>
    );
  }
  return (
    <div className={styles.countdownCards}>
      {[
        { value: timeLeft.days, label: '일' },
        { value: timeLeft.hours, label: '시간' },
        { value: timeLeft.minutes, label: '분' },
        { value: timeLeft.seconds || 0, label: '초' },
      ].map(({ value, label }) => (
        <div key={label} className={styles.countdownCard}>
          <div className={styles.countdownNumber}>{value}</div>
          <div className={styles.countdownLabel}>{label}</div>
        </div>
      ))}
    </div>
  );
};

// ─── 내 축의금 섹션 (하단 고정) ──────────────────────────────────────────
const MyContributionSection = ({ myContribution, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;

  if (!verifiedPhone || !myContribution) return null;

  const relationLabel = {
    family: '가족', relative: '친척', friend: '지인',
    colleague: '직장동료', senior: '선배', junior: '후배',
    neighbor: '이웃', other: '기타',
  }[myContribution.relationship] || myContribution.relationship;

  return (
    <div className={styles.myContributionSection}>
      <button className={styles.toggleButton} onClick={() => setIsExpanded(!isExpanded)}>
        <span className={styles.toggleText}>내가 축의한 금액</span>
        <span className={styles.toggleIcon}>{isExpanded ? '▼' : '▲'}</span>
      </button>
      {isExpanded && (
        <div className={styles.contributionContent}>
          <p className={styles.contributionSubtitle}>본인에게만 보이는 정보입니다</p>
          <div className={styles.contributionSummary}>
            <div className={styles.summaryInfo}>
              <span className={styles.summaryName}>{myContribution.guestName}</span>
              <span className={styles.summaryAmount}>
                {(myContribution.contributionAmount || myContribution.amount)?.toLocaleString()}원
              </span>
            </div>
            <div className={styles.summaryDetails}>
              <span className={styles.summaryRelation}>{relationLabel}</span>
              <span className={styles.summarySide}>
                {myContribution.side === 'groom' ? '신랑측' : '신부측'}
              </span>
            </div>
            <button className={styles.editButton} onClick={onEdit}>수정</button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────
const RomanticPinkTemplate = ({ eventData = {}, categorizedImages = {}, allowMessages = false, messageSettings = {} }) => {
  // additional_info JSON 파싱
  const additionalInfo = (() => {
    if (!eventData.additional_info) return {};
    if (typeof eventData.additional_info === 'string') {
      try { return JSON.parse(eventData.additional_info); } catch { return {}; }
    }
    return typeof eventData.additional_info === 'object' ? eventData.additional_info : {};
  })();

  // ─ state ──────────────────────────────────────────────────────────────
  const [randomGreeting, setRandomGreeting] = useState(null);
  const [showOpening, setShowOpening] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryScrollIndex, setGalleryScrollIndex] = useState(0);
  const [activeAccountToggle, setActiveAccountToggle] = useState('groom');
  const [guestMessages, setGuestMessages] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);

  // 모달 상태
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionData, setCompletionData] = useState(null);
  const [myContribution, setMyContribution] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [contributionKey, setContributionKey] = useState(0);
  const [, forceUpdate] = useState({});
  const [userChoice, setUserChoice] = useState(null);
  const [hasWrittenGuestbook, setHasWrittenGuestbook] = useState(false);

  const modalOpeningRef = useRef(false);
  const modalClosingRef = useRef(false);
  const arrivalModalCheckedRef = useRef(false);

  // ─ 이미지 처리 ──────────────────────────────────────────────────────
  const getImageSrc = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img;
    return img.publicUrl || img.uri || img.url || img.src || null;
  };

  const defaultImages = {
    main: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=650&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=650&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=650&fit=crop',
    ],
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=350&fit=crop',
    ],
    groom: [],
    bride: [],
  };

  const processImageData = () => {
    if (categorizedImages && Object.keys(categorizedImages).length > 0) return categorizedImages;
    if (eventData?.processedImages?.length > 0) {
      const cat = { main: [], gallery: [], groom: [], bride: [], all: [] };
      eventData.processedImages.forEach(img => {
        const obj = { uri: img.primaryUrl || img.publicUrl || img.uri, publicUrl: img.publicUrl, category: img.category, id: img.id };
        if (img.category && cat[img.category]) cat[img.category].push(obj);
        cat.all.push(obj);
      });
      return cat;
    }
    if (eventData?.image_urls?.length > 0) {
      const normalized = eventData.image_urls.map(img =>
        typeof img === 'string' ? { uri: img, category: 'main' } : { uri: img.publicUrl || img.uri || img, category: img.category || 'main' }
      );
      return {
        main: normalized.filter(i => i.category === 'main'),
        gallery: normalized.filter(i => i.category === 'gallery'),
        groom: normalized.filter(i => i.category === 'groom'),
        bride: normalized.filter(i => i.category === 'bride'),
        all: normalized,
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

  const allImages = [...safeImages.main, ...safeImages.gallery, ...safeImages.groom, ...safeImages.bride];

  // ─ 날짜/시간 포맷 ──────────────────────────────────────────────────
  const formatDate = (date) => {
    if (!date) return { full: '' };
    const d = new Date(date);
    const days = ['일요일','월요일','화요일','수요일','목요일','금요일','토요일'];
    const y = d.getFullYear(), m = d.getMonth() + 1, day = d.getDate();
    return { year: y, month: m, day, dayOfWeek: days[d.getDay()], full: `${y}년 ${m}월 ${day}일 ${days[d.getDay()]}` };
  };

  const dateInfo = formatDate(eventData.date || eventData.event_date);

  const formatKoreanTime = (t) => {
    if (!t) return '';
    const parts = t.split(':');
    if (parts.length < 2) return t;
    const h = parseInt(parts[0]);
    const min = parts[1];
    const period = h >= 12 ? '오후' : '오전';
    const h12 = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${period} ${h12}:${min}`;
  };

  const ceremonyTimeRaw = eventData.ceremony_time || eventData.ceremonyTime || '';
  const ceremonyTimeDisplay = formatKoreanTime(typeof ceremonyTimeRaw === 'string' ? ceremonyTimeRaw : '');

  const getEnglishDate = () => {
    const d = new Date(eventData.date || eventData.event_date || '');
    if (isNaN(d)) return '';
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  };

  // ─ 카운트다운 ────────────────────────────────────────────────────────
  const calculateTimeLeft = () => {
    const dateStr = eventData.date || eventData.event_date || '';
    const timeStr = eventData.ceremony_time || eventData.ceremonyTime || '14:00';

    let eventDate;
    if (dateStr) {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);
        const rawTime = typeof timeStr === 'string' ? timeStr : '14:00';
        const timeParts = rawTime.split(':');
        const hours = parseInt(timeParts[0]) || 14;
        const minutes = parseInt(timeParts[1]) || 0;
        // 로컬 시간 기준으로 생성 (UTC 파싱 방지)
        eventDate = new Date(year, month, day, hours, minutes, 0, 0);
      } else {
        eventDate = new Date(dateStr);
      }
    } else {
      eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + 30);
    }

    const diff = eventDate - new Date();
    if (diff > 0) {
      return {
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        minutes: Math.floor((diff / 60000) % 60),
        seconds: Math.floor((diff / 1000) % 60),
        isExpired: false,
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  useEffect(() => {
    const t = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(t);
  }, [eventData]);

  // ─ 랜덤 인사말 ────────────────────────────────────────────────────
  useEffect(() => {
    const msg = eventData.custom_message || eventData.customMessage;
    if (!msg || (typeof msg === 'string' && msg.trim() === '')) {
      setRandomGreeting(RANDOM_GREETINGS[Math.floor(Math.random() * RANDOM_GREETINGS.length)]);
    }
  }, [eventData.custom_message, eventData.customMessage]);

  const rawMsg = eventData.custom_message || eventData.customMessage;
  let greetingMessage = '';
  if (rawMsg) {
    if (typeof rawMsg === 'object') greetingMessage = rawMsg.poem || '';
    else if (typeof rawMsg === 'string' && rawMsg.trim() !== '') greetingMessage = rawMsg;
    else greetingMessage = randomGreeting;
  } else {
    greetingMessage = randomGreeting;
  }

  // ─ 방명록 데이터 불러오기 & 실시간 구독 ─────────────────────────
  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    try {
      const res = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await res.json();
      if (result.success && result.messages) setGuestMessages(result.messages);
    } catch { /* 조용히 */ }
  };

  useEffect(() => {
    fetchGuestbook();
    let subscription = null;
    if (eventData?.id) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        const fmt = (ts) => new Date(ts).toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' });
        subscription = supabase
          .channel(`guestbook-${eventData.id}`)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (payload) => {
            const msg = { id: payload.new.id, from: payload.new.guest_name || '익명', phone: payload.new.guest_phone, date: fmt(payload.new.created_at), content: payload.new.message || '' };
            setGuestMessages(prev => [msg, ...prev]);
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (payload) => {
            const msg = { id: payload.new.id, from: payload.new.guest_name || '익명', phone: payload.new.guest_phone, date: fmt(payload.new.created_at), content: payload.new.message || '' };
            setGuestMessages(prev => prev.map(m => m.id === payload.new.id ? msg : m));
          })
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (payload) => {
            setGuestMessages(prev => prev.filter(m => m.id !== payload.old.id));
          })
          .subscribe();
      }
    }
    return () => { if (subscription) subscription.unsubscribe(); };
  }, [eventData?.id]);

  // hasWrittenGuestbook 감지
  useEffect(() => {
    const phone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (phone && guestMessages.length > 0) {
      setHasWrittenGuestbook(guestMessages.some(m => m.phone === phone && m.content?.trim()));
    } else {
      setHasWrittenGuestbook(false);
    }
  }, [guestMessages]);

  // 내 축의금 실시간 구독
  useEffect(() => {
    const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    if (!verifiedPhone || !eventData?.id) return;
    let isSubscribed = true;
    const loadMine = async () => {
      try {
        const res = await fetch(`/api/get-my-contribution?eventId=${eventData.id}&phone=${encodeURIComponent(verifiedPhone)}`);
        const result = await res.json();
        if (result.success && result.contribution && isSubscribed) {
          setMyContribution({ ...result.contribution, amount: result.contribution.contributionAmount || result.contribution.amount });
        }
      } catch { /* 조용히 */ }
    };
    loadMine();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const sub = supabase
      .channel(`guest_book_mine_${eventData.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` }, (payload) => {
        if (payload.new?.guest_phone === verifiedPhone) {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const c = { id: payload.new.id, guestName: payload.new.guest_name, contributionAmount: payload.new.amount, amount: payload.new.amount, relationship: payload.new.relation_detail, side: payload.new.relation_category, phone: payload.new.guest_phone };
            setMyContribution(c);
            setContributionKey(p => p + 1);
            forceUpdate({});
          }
        } else if (payload.old?.guest_phone === verifiedPhone && payload.eventType === 'DELETE') {
          setMyContribution(null);
        }
      })
      .subscribe();

    return () => { isSubscribed = false; sub.unsubscribe(); };
  }, [eventData?.id]);

  // 메시지 병합 및 페이지네이션
  const messagesWithContent = useMemo(() => {
    const stateIds = new Set(guestMessages.map(m => m.id));
    const propsMessages = (eventData.guestMessages || []).filter(m => !stateIds.has(m.id));
    return [...guestMessages, ...propsMessages].filter(m => m.content?.trim());
  }, [guestMessages, eventData.guestMessages]);

  const messagesPerPage = 3;
  const totalPages = Math.ceil(messagesWithContent.length / messagesPerPage);
  const currentMessages = messagesWithContent.slice(currentPage * messagesPerPage, (currentPage + 1) * messagesPerPage);

  // ─ 모달 핸들러 ──────────────────────────────────────────────────────
  const checkAndShowWelcomeChoice = () => {
    if (arrivalModalCheckedRef.current || showWelcomeChoice) return false;
    const arrivalKey = `arrival_checked_${eventData?.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(arrivalKey)) return false;
    arrivalModalCheckedRef.current = true;
    setShowWelcomeChoice(true);
    return true;
  };

  const handleOpeningComplete = () => {
    setShowOpening(false);
    setTimeout(() => checkAndShowWelcomeChoice(), 500);
  };

  useEffect(() => {
    if (arrivalModalCheckedRef.current) return;
    let t;
    if (!showOpening) {
      t = setTimeout(() => checkAndShowWelcomeChoice(), 1000);
    } else {
      t = setTimeout(() => { setShowOpening(false); setTimeout(() => checkAndShowWelcomeChoice(), 500); }, 4000);
    }
    return () => clearTimeout(t);
  }, [showOpening]);

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

  const handleGuestbookSubmit = async (data) => {
    const newMsg = {
      id: `temp-${Date.now()}`, from: data.name || '익명', phone: data.phone,
      date: new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit' }),
      content: data.message || '',
    };
    setGuestMessages(prev => [newMsg, ...prev]);
    setHasWrittenGuestbook(true);
    setCurrentPage(0);
    setTimeout(fetchGuestbook, 500);
  };

  const handleEditMessage = (msg) => { setEditingMessage(msg); setShowEditModal(true); };

  const handleEditUpdate = async () => { await fetchGuestbook(); };

  const handleEditDelete = async () => {
    if (editingMessage?.id) {
      setGuestMessages(prev => prev.map(m => m.id === editingMessage.id ? { ...m, content: '' } : m));
    }
    setHasWrittenGuestbook(false);
    setShowEditModal(false);
    setEditingMessage(null);
  };

  const canEditMessage = (msg) => {
    const phone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
    return phone && msg.phone === phone;
  };

  const handleSelectGuestbook = () => { setUserChoice('guestbook'); setShowWelcomeChoice(false); setShowGuestbookModal(true); };
  const handleSelectContribution = () => { setUserChoice('contribution'); setShowWelcomeChoice(false); setTimeout(() => setShowContributionModal(true), 100); };

  const handleTriggerArrival = () => {
    const existing = myContribution?.amount || myContribution?.contributionAmount;
    if (existing) return;
    setTimeout(() => setShowContributionModal(true), 300);
  };

  const handleContributionSubmit = async (formData) => {
    const res = await fetch('/api/submit-contribution', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formData) });
    const result = await res.json();
    if (result.success) {
      if (typeof window !== 'undefined') localStorage.setItem(`arrival_checked_${eventData?.id}`, 'true');
      arrivalModalCheckedRef.current = true;
      setCompletionData(formData);
      setShowContributionModal(false);
      setIsEditMode(false);
      if (isEditMode && myContribution) {
        setMyContribution({ ...myContribution, ...formData, amount: formData.contributionAmount });
        setContributionKey(p => p + 1);
      }
      await fetchGuestbook();
      setTimeout(() => setShowCompletionModal(true), 300);
    } else {
      throw new Error(result.error || '축의금 등록에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    const groomName = eventData.groom_name || eventData.groomName || '';
    const brideName = eventData.bride_name || eventData.brideName || '';
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const shareData = {
      title: `${groomName} ♡ ${brideName} 결혼식 초대장`,
      text: `${groomName} ♡ ${brideName}\n${dateInfo.full} ${ceremonyTimeDisplay}\n${eventData.location || ''}\n\n우리의 특별한 날에 초대합니다 🌸`,
      url,
    };

    const copyToClipboard = async (text) => {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyToClipboard(url);
        alert('링크가 복사되었습니다.');
      }
    } catch (err) {
      if (err?.name === 'AbortError') return; // 사용자가 공유 취소한 경우
      try {
        await copyToClipboard(url);
        alert('링크가 복사되었습니다.');
      } catch {
        alert(`링크를 복사해주세요:\n${url}`);
      }
    }
  };

  const handleImagePress = (idx) => { setCurrentImageIndex(idx); setShowImageViewer(true); };
  const handleAccountToggle = (type) => setActiveAccountToggle(type);
  const copyAccount = async (num) => {
    try { await navigator.clipboard.writeText(num); alert('계좌번호가 복사되었습니다.'); }
    catch { alert('계좌번호 복사에 실패했습니다.'); }
  };

  const groomName = eventData.groom_name || eventData.groomName || '';
  const brideName = eventData.bride_name || eventData.brideName || '';

  // ─ 렌더 ──────────────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      {/* 1. 오프닝 오버레이 */}
      <CustomOpeningOverlay visible={showOpening} onComplete={handleOpeningComplete} />

      {/* 2. 떨어지는 꽃잎 */}
      <FallingPetals />

      {/* 3. 히어로: 메인 사진 슬라이드쇼 + WEDDING INVITATION */}
      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <p className={styles.subtitle}>WEDDING INVITATION</p>
          <h1 className={styles.loveText}>With Love</h1>
          <div className={styles.mainImageContainer}>
            <MainPhotoSlideshow images={safeImages.main} onImagePress={handleImagePress} />
          </div>
        </div>
      </section>

      {/* 4. 인사말 + 이름 섹션 */}
      <section className={styles.greetingSection}>
        <div className={styles.greetingSectionTitle}>
          <h2 className={styles.greetingTitle}>Greeting</h2>
          <p className={styles.greetingSubtitle}>인사말</p>
        </div>

        {greetingMessage && (
          <p className={styles.poem}>{greetingMessage}</p>
        )}

        <div className={styles.divider}></div>

        {/* 신랑/신부 이름 */}
        <div className={styles.coupleNamesSection}>
          <div className={styles.coupleNames}>
            <div className={styles.groomInfo}>
              <span className={styles.roleLabel}>GROOM</span>
              <span className={styles.nameKorean}>{groomName}</span>
            </div>
            <span className={styles.heartBeat}>♥</span>
            <div className={styles.brideInfo}>
              <span className={styles.roleLabel}>BRIDE</span>
              <span className={styles.nameKorean}>{brideName}</span>
            </div>
          </div>
          <div className={styles.coupleSubtext}>
            <span>두 사람이 하나되어 새로운 시작을 합니다</span>
          </div>
        </div>
      </section>

      {/* 5. 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>Our Gallery</h2>
          <p className={styles.gallerySubtitle}>우리의 특별한 순간들</p>

          <div className={styles.galleryContainer}>
            <div
              className={styles.gallerySlider}
              onScroll={(e) => {
                const el = e.target;
                const itemW = el.scrollWidth / safeImages.gallery.length;
                setGalleryScrollIndex(Math.round(el.scrollLeft / itemW));
              }}
            >
              {safeImages.gallery.map((img, i) => {
                const src = getImageSrc(img);
                return src ? (
                  <div key={i} className={styles.galleryItem} onClick={() => handleImagePress(safeImages.main.length + i)}>
                    <img src={src} alt={`Gallery ${i + 1}`} onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : null;
              })}
            </div>

            <div className={styles.galleryIndicator}>
              <span className={styles.currentPage}>{galleryScrollIndex + 1} / {safeImages.gallery.length}</span>
            </div>

            <div className={styles.galleryDots}>
              {safeImages.gallery.map((_, i) => (
                <div
                  key={i}
                  className={`${styles.dot} ${galleryScrollIndex === i ? styles.dotActive : ''}`}
                  onClick={() => {
                    const slider = document.querySelector(`.${styles.gallerySlider}`);
                    if (slider) {
                      const iW = slider.scrollWidth / safeImages.gallery.length;
                      slider.scrollTo({ left: iW * i, behavior: 'smooth' });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 6. 영문 날짜 배너 */}
      <section className={styles.dateSection}>
        <div className={styles.animatedDate}>{getEnglishDate()}</div>
      </section>

      {/* 7. Wedding Day – 날짜 + 달력 + 카운트다운 */}
      <section className={styles.weddingDaySection}>
        <h2 className={styles.weddingDayTitle}>Wedding Day</h2>

        <div className={styles.dateInfo}>
          <p className={styles.dateMain}>{dateInfo.full}</p>
          {ceremonyTimeDisplay && <p className={styles.dateSub}>{ceremonyTimeDisplay}</p>}
        </div>

        <RomanticPinkCalendar targetDate={eventData.date || eventData.event_date || ''} />

        <div className={styles.countdown}>
          <CountdownDisplay timeLeft={timeLeft} isExpired={timeLeft.isExpired} />
        </div>

        {(groomName || brideName) && (
          <p className={styles.countdownMessage}>
            {groomName}
            <span className={styles.heartText}> ♥ </span>
            {brideName}의 결혼식이{' '}
            <span className={styles.countdownDays}>{timeLeft.days}일</span> 남았습니다
          </p>
        )}
      </section>

      {/* 8. 축의금 전달 (계좌 정보) */}
      <section className={styles.giftSection}>
        <div className={styles.giftHeader}>
          <h2 className={styles.giftTitle}>축의금 전달</h2>
          <p className={styles.giftSubtitle}>따뜻한 마음을 함께 나누어주세요</p>
        </div>
        <div className={styles.giftDescription}>
          <p className={styles.giftDescriptionText}>
            축복의 마음을 담은 소중한 마음,<br />이렇게 전할 수 있어요
          </p>
        </div>

        <div className={styles.toggleContainer}>
          <div className={styles.toggleButtons}>
            <button
              className={`${styles.accountToggleButton} ${activeAccountToggle === 'groom' ? styles.accountToggleActive : ''}`}
              onClick={() => handleAccountToggle('groom')}
            >신랑측</button>
            <button
              className={`${styles.accountToggleButton} ${activeAccountToggle === 'bride' ? styles.accountToggleActive : ''}`}
              onClick={() => handleAccountToggle('bride')}
            >신부측</button>
          </div>
        </div>

        <div className={styles.accountsContainer}>
          {activeAccountToggle === 'groom' && (additionalInfo?.groom_account_number || additionalInfo?.groom_father_account_number || additionalInfo?.groom_mother_account_number) && (
            <div className={styles.accountGroup}>
              <div className={styles.accountCards}>
                {additionalInfo?.groom_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{groomName || '신랑'}</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
                {additionalInfo?.groom_father_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_father_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.groom_father_name || eventData.groomFatherName || '신랑'} 아버님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_father_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_father_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
                {additionalInfo?.groom_mother_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_mother_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.groom_mother_name || eventData.groomMotherName || '신랑'} 어머님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_mother_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_mother_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeAccountToggle === 'bride' && (additionalInfo?.bride_account_number || additionalInfo?.bride_father_account_number || additionalInfo?.bride_mother_account_number) && (
            <div className={styles.accountGroup}>
              <div className={styles.accountCards}>
                {additionalInfo?.bride_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{brideName || '신부'}</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
                {additionalInfo?.bride_father_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_father_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.bride_father_name || eventData.brideFatherName || '신부'} 아버님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_father_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_father_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
                {additionalInfo?.bride_mother_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_mother_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.bride_mother_name || eventData.brideMotherName || '신부'} 어머님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_mother_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_mother_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}><span className={styles.copyIcon}>복사</span></div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. 오시는 길 */}
      <section className={styles.locationSection}>
        <h2 className={styles.locationTitle}>Location</h2>
        <div className={styles.venueInfo}>
          <p className={styles.venueName}>{eventData.location || ''}</p>
          <p className={styles.venueAddress}>{eventData.detailed_address || eventData.detailedAddress || ''}</p>
        </div>

        <div className={styles.mapContainer}>
          <GoogleMapEmbed
            address={`${eventData?.location || ''} ${eventData?.detailed_address || eventData?.detailedAddress || ''}`.trim()}
            venueName={eventData?.venue_name || eventData?.venueName}
            width="100%"
            height="300px"
          />
        </div>

        <div className={styles.transportCard}>
          <div className={styles.transportIcon}><span>🅿️</span></div>
          <div className={styles.transportContent}>
            <h4 className={styles.transportTitle}>주차 안내</h4>
            <p className={styles.transportText}>{eventData.parking_info || eventData.parkingInfo || ''}</p>
          </div>
        </div>
      </section>

      {/* 10. 방명록 섹션 */}
      <section className={styles.messagesSection}>
        <h2 className={styles.messagesTitle}>Messages</h2>
        <p className={styles.messagesSubtitle}>{messageSettings?.placeholder || '저희 둘에게 따뜻한 방명록을 남겨주세요'}</p>

        <div className={styles.messagesList}>
          {messagesWithContent.length === 0 ? (
            <div className={styles.emptyMessages}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyText}>아직 축하 메시지가 없습니다</p>
            </div>
          ) : (
            currentMessages.map((msg, i) => (
              <div key={msg.id || i} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageFrom}>From. {msg.from}</span>
                  <div className={styles.messageHeaderRight}>
                    {canEditMessage(msg) && (
                      <button className={styles.messageEditButton} onClick={() => handleEditMessage(msg)}>수정</button>
                    )}
                    <span className={styles.messageDate}>{msg.date}</span>
                  </div>
                </div>
                <div className={styles.messageContent}>
                  {msg.content?.split('\n').map((line, li) => (
                    <span key={li}>{line}{li < msg.content.split('\n').length - 1 && <br />}</span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageNavButton} onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0}>‹</button>
            <div className={styles.pageDots}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pageDot} ${currentPage === i ? styles.pageDotActive : ''}`}
                  onClick={() => setCurrentPage(i)}
                  aria-label={`페이지 ${i + 1}`}
                />
              ))}
            </div>
            <button className={styles.pageNavButton} onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage === totalPages - 1}>›</button>
          </div>
        )}

        {!hasWrittenGuestbook && (
          <button className={styles.guestbookButton} onClick={handleGuestbookModalOpen} disabled={showGuestbookModal}>
            축하메시지 남기기
          </button>
        )}
      </section>

      {/* 11. 공유 섹션 */}
      <section className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          <div className={styles.shareButtonGradient}>
            <span className={styles.shareIcon}>💌</span>
            <span className={styles.shareButtonText}>청첩장 공유하기</span>
          </div>
        </button>
      </section>

      {/* 12. 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <h3 className={styles.footerTitle}>Thank You</h3>
          <div className={styles.footerDivider}></div>
          <p className={styles.footerMessage}>
            저희의 새로운 시작을 축복해주셔서<br />진심으로 감사드립니다
          </p>
        </div>
      </footer>

      {/* 부조 참여하기 플로팅 버튼 */}
      {!myContribution && !showContributionModal && !showGuestbookModal && !showWelcomeChoice && (
        <button className={styles.floatingContributeButton} onClick={() => { setUserChoice('contribution'); setShowContributionModal(true); }}>
          💝 부조 참여하기
        </button>
      )}

      {/* 이미지 뷰어 모달 */}
      {showImageViewer && (
        <div className={styles.imageViewerModal} onClick={() => setShowImageViewer(false)}>
          <div className={styles.imageViewerContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowImageViewer(false)}>×</button>
            <div className={styles.imageViewerSlider}>
              {allImages[currentImageIndex] && (
                <img src={getImageSrc(allImages[currentImageIndex])} alt={`이미지 ${currentImageIndex + 1}`} className={styles.viewerImage} />
              )}
            </div>
            <div className={styles.imageViewerNavigation}>
              <button className={styles.navButton} onClick={() => setCurrentImageIndex(p => p > 0 ? p - 1 : allImages.length - 1)}>‹</button>
              <span className={styles.imageCounter}>{currentImageIndex + 1} / {allImages.length}</span>
              <button className={styles.navButton} onClick={() => setCurrentImageIndex(p => p < allImages.length - 1 ? p + 1 : 0)}>›</button>
            </div>
          </div>
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
        onClose={handleGuestbookModalClose}
        onSubmit={handleGuestbookSubmit}
        eventData={eventData}
        onTriggerArrival={handleTriggerArrival}
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
      />

      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => { setShowCompletionModal(false); setCompletionData(null); }}
        contributionData={completionData}
        eventData={eventData}
      />

      {/* 내 축의금 (하단 고정) */}
      {myContribution && (
        <MyContributionSection
          key={`mc-${contributionKey}-${myContribution?.contributionAmount || myContribution?.amount}`}
          myContribution={myContribution}
          onEdit={() => { setIsEditMode(true); setShowContributionModal(true); }}
        />
      )}
    </div>
  );
};

export default RomanticPinkTemplate;
