// components/templates/ModernDarkTemplate.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import WelcomeChoiceModal from '../WelcomeChoiceModal';
import styles from './ModernDarkTemplate.module.css';

// 랜덤 인사말
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
];

// 한글 이름 영어 변환
const koreanToEnglish = (koreanName) => {
  const nameMap = {
    '김': 'Kim', '이': 'Lee', '박': 'Park', '최': 'Choi', '정': 'Jung',
    '강': 'Kang', '조': 'Jo', '윤': 'Yoon', '장': 'Jang', '임': 'Lim',
    '한': 'Han', '오': 'Oh', '서': 'Seo', '신': 'Shin', '권': 'Kwon',
    '황': 'Hwang', '안': 'Ahn', '송': 'Song', '전': 'Jeon', '홍': 'Hong',
    '유': 'Yoo', '고': 'Ko', '문': 'Moon', '배': 'Bae', '백': 'Baek',
    '민': 'Min', '지': 'Ji', '수': 'Soo', '현': 'Hyun', '준': 'Jun',
    '영': 'Young', '진': 'Jin', '성': 'Sung', '호': 'Ho',
    '연': 'Yeon', '은': 'Eun', '혜': 'Hye', '미': 'Mi', '선': 'Sun',
    '희': 'Hee', '경': 'Kyung', '아': 'Ah', '나': 'Na', '리': 'Ri',
    '라': 'Ra', '빈': 'Bin', '원': 'Won', '태': 'Tae', '규': 'Kyu',
    '재': 'Jae', '우': 'Woo', '동': 'Dong', '훈': 'Hoon', '상': 'Sang',
    '철': 'Chul', '병': 'Byung', '인': 'In', '기': 'Ki', '석': 'Seok',
    '광': 'Kwang', '용': 'Yong',
  };

  if (!koreanName) return '';
  let result = [];
  for (let i = 0; i < koreanName.length; i++) {
    const char = koreanName[i];
    result.push(nameMap[char] || char);
  }
  if (result.length > 1) {
    const surname = result[0];
    const givenName = result.slice(1).join('').toLowerCase();
    return `${surname} ${givenName.charAt(0).toUpperCase() + givenName.slice(1)}`;
  }
  return result.join('');
};


// 메인 사진 슬라이드쇼
const MainPhotoSlideshow = ({ images, onImagePress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedSet, setLoadedSet] = useState(new Set());

  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    // publicUrl 우선, uri(Supabase public URL일 수 있음), 로컬 파일 URI는 웹에서 사용 불가
    const src = image.publicUrl || image.uri || image.url || image.src || null;
    if (!src) return null;
    if (src.startsWith('file://') || src.startsWith('/var/') || src.startsWith('ph://')) return null;
    return src;
  };

  // 유효한 URL만 필터링
  const validImages = (images || []).filter(img => !!getImageSrc(img));

  useEffect(() => {
    if (validImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % validImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [validImages.length]);

  return (
    <div className={styles.mainPhotoContainer} onClick={() => onImagePress && onImagePress(currentIndex)}>
      {validImages.length > 0 ? (
        validImages.map((image, index) => {
          const src = getImageSrc(image);
          const isActive = index === currentIndex;
          const isLoaded = loadedSet.has(index);
          return (
            <img
              key={index}
              src={src}
              alt="Wedding"
              className={`${styles.mainPhoto} ${isActive ? styles.active : ''} ${isLoaded ? styles.loaded : ''}`}
              onLoad={() => { setLoadedSet(prev => new Set([...prev, index])); }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          );
        })
      ) : (
        <div className={styles.photoPlaceholder}>
          <span>💍</span>
        </div>
      )}
      <div className={styles.photoGradient} />
    </div>
  );
};

// 달력 컴포넌트
const DarkCalendar = ({ targetDate }) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const calendarDays = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: '', isCurrentMonth: false, isTargetDate: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, isTargetDate: i === day });
  }

  return (
    <div className={styles.darkCalendar}>
      <h3 className={styles.calendarMonth}>{months[month]} {year}</h3>
      <div className={styles.calendarWeekDays}>
        {weekDays.map((wd, i) => (
          <span key={i} className={`${styles.calendarWeekDay} ${i === 0 ? styles.sunday : ''}`}>{wd}</span>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => (
          <div key={index} className={styles.calendarDayWrapper}>
            {dayData.isTargetDate ? (
              <div className={styles.calendarTargetDay}>
                <span className={styles.calendarTargetDayText}>{dayData.day}</span>
              </div>
            ) : (
              <span className={`${styles.calendarDay} ${!dayData.isCurrentMonth ? styles.inactive : ''} ${index % 7 === 0 ? styles.sunday : ''}`}>
                {dayData.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 앱과 동일한 6주 풀 달력 (이전/다음 달 날짜 포함)
const FullCalendar = ({ targetDate }) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  const weekDays = ['S','M','T','W','T','F','S'];

  const calendarDays = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    calendarDays.push({ day: prevMonthLastDay - i, isCurrentMonth: false, isTarget: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({ day: i, isCurrentMonth: true, isTarget: i === day });
  }
  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false, isTarget: false });
  }

  return (
    <div className={styles.fullCalendar}>
      <p className={styles.fullCalendarMonth}>{months[month]} {year}</p>
      <div className={styles.fullCalendarWeekDays}>
        {weekDays.map((wd, i) => (
          <span key={i} className={`${styles.fullCalendarWeekDay} ${i === 0 ? styles.sundayText : ''}`}>{wd}</span>
        ))}
      </div>
      <div className={styles.fullCalendarGrid}>
        {calendarDays.map((d, i) => (
          <div key={i} className={styles.fullCalendarCell}>
            {d.isTarget ? (
              <div className={styles.fullCalendarTarget}>
                <span>{d.day}</span>
              </div>
            ) : (
              <span className={`
                ${styles.fullCalendarDay}
                ${!d.isCurrentMonth ? styles.dimDay : ''}
                ${i % 7 === 0 && d.isCurrentMonth ? styles.sundayText : ''}
              `}>{d.day}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 카운트다운
const CountdownDisplay = ({ timeLeft, isExpired }) => {
  if (isExpired) {
    return (
      <div className={styles.weddingComplete}>
        <div className={styles.completeIcon}>💐</div>
        <p className={styles.completeMessage}>D-Day! 축하합니다!</p>
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

// 내 축의금 섹션
const MyContributionSection = ({ eventData, myContribution, onEdit, setMyContribution }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const verifiedPhone = typeof window !== 'undefined' ? localStorage.getItem('verifiedPhone') : null;
  if (!verifiedPhone || !myContribution) return null;

  const relationMap = {
    family: '가족', relative: '친척', friend: '지인',
    colleague: '직장동료', senior: '선배', junior: '후배',
    neighbor: '이웃', other: '기타',
  };

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
              <span className={styles.summaryRelation}>
                {relationMap[myContribution.relationship] || myContribution.relationship}
              </span>
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

// 메인 컴포넌트
const ModernDarkTemplate = ({ eventData = {}, categorizedImages = {}, allowMessages = false, messageSettings = {} }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [randomGreeting, setRandomGreeting] = useState(null);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryScrollIndex, setGalleryScrollIndex] = useState(0);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [showWelcomeChoice, setShowWelcomeChoice] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [contributionData, setContributionData] = useState(null);
  const [completionData, setCompletionData] = useState(null);
  const [myContribution, setMyContribution] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [, forceUpdate] = useState({});
  const [contributionKey, setContributionKey] = useState(0);
  const [guestMessages, setGuestMessages] = useState([]);
  const [userChoice, setUserChoice] = useState(null);
  const [hasWrittenGuestbook, setHasWrittenGuestbook] = useState(false);
  const [activeAccountToggle, setActiveAccountToggle] = useState('groom');
  const [currentPage, setCurrentPage] = useState(0);

  const modalOpeningRef = useRef(false);
  const modalClosingRef = useRef(false);
  const arrivalModalCheckedRef = useRef(false);

  const getImageSrc = (image) => {
    if (!image) return null;
    if (typeof image === 'string') {
      if (image.startsWith('file://') || image.startsWith('/var/') || image.startsWith('ph://')) return null;
      return image;
    }
    const src = image.publicUrl || image.uri || image.url || image.src || null;
    if (!src) return null;
    if (src.startsWith('file://') || src.startsWith('/var/') || src.startsWith('ph://')) return null;
    return src;
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
    groom: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'],
    bride: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'],
  };

  const processImageData = () => {
    const result = { main: [], gallery: [], groom: [], bride: [], all: [] };

    // 1순위: eventData.processedImages
    if (eventData?.processedImages && eventData.processedImages.length > 0) {
      eventData.processedImages.forEach(img => {
        const imageObj = { uri: img.primaryUrl || img.publicUrl || img.uri, publicUrl: img.publicUrl || img.primaryUrl || img.uri, category: img.category, id: img.id };
        if (img.category && result[img.category]) result[img.category].push(imageObj);
        result.all.push(imageObj);
      });
    }

    // 누락된 카테고리는 categorizedImages(additional_info)로 보완
    const ci = categorizedImages || {};
    ['main', 'gallery', 'groom', 'bride'].forEach(cat => {
      if (result[cat].length === 0 && ci[cat]?.length > 0) {
        result[cat] = ci[cat];
        result.all.push(...ci[cat]);
      }
    });

    if (result.all.length > 0) return result;

    // 2순위: image_urls 필드
    if (eventData?.image_urls && eventData.image_urls.length > 0) {
      const normalizedImages = eventData.image_urls.map(img => {
        if (typeof img === 'string') return { uri: img, publicUrl: img, category: 'main' };
        const src = img.publicUrl || img.uri || img;
        return { uri: src, publicUrl: src, category: img.category || 'main' };
      });
      return {
        main: normalizedImages.filter(img => img.category === 'main'),
        gallery: normalizedImages.filter(img => img.category === 'gallery'),
        groom: normalizedImages.filter(img => img.category === 'groom'),
        bride: normalizedImages.filter(img => img.category === 'bride'),
        all: normalizedImages,
      };
    }
    return defaultImages;
  };

  const processedImages = processImageData();
  const safeImages = {
    main: processedImages?.main?.length > 0 ? processedImages.main : defaultImages.main,
    gallery: processedImages?.gallery?.length > 0 ? processedImages.gallery : [],
    groom: processedImages?.groom?.length > 0 ? processedImages.groom : [],
    bride: processedImages?.bride?.length > 0 ? processedImages.bride : [],
  };
  useEffect(() => {
    if (!eventData.custom_message || eventData.custom_message.trim() === '') {
      const randomIndex = Math.floor(Math.random() * RANDOM_GREETINGS.length);
      setRandomGreeting(RANDOM_GREETINGS[randomIndex]);
    }
  }, [eventData.custom_message]);

  const formatDate = (date) => {
    if (!date) return { full: '2025년 10월 4일 토요일' };
    const d = new Date(date);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = days[d.getDay()];
    return { year: year.toString(), month: month.toString(), day: day.toString(), dayOfWeek, full: `${year}년 ${month}월 ${day}일 ${dayOfWeek}` };
  };

  const formatKoreanTime = (timeString) => {
    if (!timeString) return '오후 2시';
    if (typeof timeString === 'string' && timeString.includes(':')) {
      const [h, m] = timeString.split(':').map(Number);
      if (!isNaN(h) && !isNaN(m) && h >= 0 && h <= 23 && m >= 0 && m <= 59) {
        const ampm = h >= 12 ? '오후' : '오전';
        const displayH = h > 12 ? h - 12 : (h === 0 ? 12 : h);
        return `${ampm} ${displayH}시${m !== 0 ? ` ${m}분` : ''}`;
      }
    }
    return timeString;
  };

  const dateInfo = formatDate(eventData.date || eventData.event_date || '2025-10-04');
  const ceremonyTime = formatKoreanTime(eventData.ceremony_time);

  const getEnglishDate = () => {
    const date = new Date(eventData.date || eventData.event_date || '2025-10-04');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const calculateTimeLeft = () => {
    const eventDate = new Date(eventData.date || eventData.event_date || '2025-10-04');
    const now = new Date();
    const difference = eventDate - now;
    if (difference > 0) {
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, [eventData]);

  // 내 축의금 데이터 및 realtime 구독
  useEffect(() => {
    const verifiedPhone = localStorage.getItem('verifiedPhone');
    if (!verifiedPhone || !eventData?.id) return;

    let isSubscribed = true;

    const fetchMyContribution = async () => {
      if (!isSubscribed) return;
      try {
        const response = await fetch(`/api/get-my-contribution?eventId=${eventData.id}&phone=${encodeURIComponent(verifiedPhone)}`);
        const result = await response.json();
        if (result.success && result.contribution && isSubscribed) {
          setMyContribution({ ...result.contribution, amount: result.contribution.contributionAmount || result.contribution.amount });
        }
      } catch (error) {
        console.error('내 축의금 조회 오류:', error);
      }
    };

    fetchMyContribution();

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const subscription = supabase
      .channel(`modern_dark_guest_book_${eventData.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` },
        (payload) => {
          if (payload.new && payload.new.guest_phone === verifiedPhone) {
            if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
              const newContribution = {
                id: payload.new.id,
                guestName: payload.new.guest_name,
                contributionAmount: payload.new.amount,
                amount: payload.new.amount,
                relationship: payload.new.relation_detail,
                side: payload.new.relation_category,
                phone: payload.new.guest_phone,
                createdAt: payload.new.created_at,
                updatedAt: payload.new.updated_at,
              };
              setMyContribution(newContribution);
              setContributionKey(prev => prev + 1);
              forceUpdate({});
            }
          } else if (payload.old && payload.old.guest_phone === verifiedPhone && payload.eventType === 'DELETE') {
            setMyContribution(null);
          }
        }
      )
      .subscribe();

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, [eventData?.id]);

  const groomEnglishName = koreanToEnglish(eventData.groom_name || '이민호');
  const brideEnglishName = koreanToEnglish(eventData.bride_name || '배하윤');

  const allImages = [
    ...safeImages.main,
    ...safeImages.gallery,
    ...safeImages.groom,
    ...safeImages.bride,
  ];

  const defaultMessages = [
    { from: '민나', date: '2025.04.24 18:52', content: '결혼을 진심으로 축하합니다!\n항상 웃음 가득한 하루하루 보내길 바랄게요!\nHappy Wedding 💍' },
    { from: 'sooyeon', date: '2025.04.23 09:41', content: '결혼을 진심으로 축하드립니다💕\n항상 서로를 응원하고 아껴주는 모습이 참 이쁜 커플입니다😊\n행복한 결혼 생활 되길 바래요' },
    { from: '지현', date: '2025.04.22 14:23', content: '결혼 진심으로 축하해!\n남은 결혼식 준비도 잘 마무리하고!\n행복한 결혼생활 되기를 바래✨' },
  ];

  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    try {
      const response = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await response.json();
      if (result.success && result.messages) setGuestMessages(result.messages);
    } catch (error) {
      console.error('방명록 로드 오류:', error);
    }
  };

  useEffect(() => {
    fetchGuestbook();

    if (!eventData?.id) return;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return;

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const formatDate = (created_at) =>
      new Date(created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, '.').replace(/\s/g, ' ');

    const subscription = supabase
      .channel('modern-dark-guestbook-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` },
        (payload) => {
          const newMessage = { id: payload.new.id, from: payload.new.guest_name || '익명', phone: payload.new.guest_phone, date: formatDate(payload.new.created_at), content: payload.new.message || '' };
          setGuestMessages(prev => [newMessage, ...prev]);
        }
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` },
        (payload) => {
          const updatedMessage = { id: payload.new.id, from: payload.new.guest_name || '익명', phone: payload.new.guest_phone, date: formatDate(payload.new.created_at), content: payload.new.message || '' };
          setGuestMessages(prev => prev.map(msg => msg.id === payload.new.id ? updatedMessage : msg));
        }
      )
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'guest_book', filter: `event_id=eq.${eventData.id}` },
        (payload) => { setGuestMessages(prev => prev.filter(msg => msg.id !== payload.old.id)); }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, [eventData?.id]);

  useEffect(() => {
    const verifiedPhone = localStorage.getItem('verifiedPhone');
    if (verifiedPhone && guestMessages.length > 0) {
      const hasWritten = guestMessages.some(msg => msg.phone === verifiedPhone && msg.content && msg.content.trim() !== '');
      setHasWrittenGuestbook(hasWritten);
    } else {
      setHasWrittenGuestbook(false);
    }
  }, [guestMessages]);

  // 이미 축의금이 있으면 WelcomeChoiceModal 닫고 arrival_checked 저장
  useEffect(() => {
    if (myContribution && eventData?.id) {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`arrival_checked_${eventData.id}`, 'true');
      }
      arrivalModalCheckedRef.current = true;
      if (showWelcomeChoice) setShowWelcomeChoice(false);
    }
  }, [myContribution]);

  const mergedMessages = useMemo(() => {
    const stateMessageIds = new Set(guestMessages.map(msg => msg.id));
    const propsMessages = (eventData.guestMessages || []).filter(msg => !stateMessageIds.has(msg.id));
    return [...guestMessages, ...propsMessages];
  }, [guestMessages, eventData.guestMessages]);

  const messagesWithContent = mergedMessages.filter(msg => msg.content && msg.content.trim() !== '');
  const hasRealMessages = messagesWithContent.length > 0;
  const displayMessages = hasRealMessages ? messagesWithContent : defaultMessages;
  const messagesPerPage = 3;
  const totalPages = Math.ceil(displayMessages.length / messagesPerPage);
  const currentMessages = displayMessages.slice(currentPage * messagesPerPage, (currentPage + 1) * messagesPerPage);

  let greetingMessage = '';
  if (eventData.custom_message) {
    if (typeof eventData.custom_message === 'object') {
      greetingMessage = eventData.custom_message.poem || '';
    } else if (typeof eventData.custom_message === 'string' && eventData.custom_message.trim() !== '') {
      greetingMessage = eventData.custom_message;
    } else {
      greetingMessage = randomGreeting;
    }
  } else {
    greetingMessage = randomGreeting;
  }

  const additionalInfo = (() => {
    if (!eventData.additional_info) return {};
    if (typeof eventData.additional_info === 'string') {
      try { return JSON.parse(eventData.additional_info); } catch (e) { return {}; }
    }
    if (typeof eventData.additional_info === 'object') return eventData.additional_info;
    return {};
  })();

  const copyAccount = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      alert('계좌번호가 복사되었습니다.');
    } catch (error) {
      alert('계좌번호 복사에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${eventData.groom_name || '신랑'} ♡ ${eventData.bride_name || '신부'} 결혼식 초대장`,
      text: `${eventData.groom_name || '신랑'} ♡ ${eventData.bride_name || '신부'}\n${dateInfo.full} ${ceremonyTime}\n${eventData.location || '웨딩홀'}\n\n우리의 특별한 날에 초대합니다 🌸`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(window.location.href); alert('링크가 복사되었습니다.'); }
    } catch (error) {}
  };

  const checkAndShowWelcomeChoice = () => {
    if (arrivalModalCheckedRef.current || showWelcomeChoice) return false;
    const arrivalKey = `arrival_checked_${eventData?.id}`;
    if (typeof window !== 'undefined' && localStorage.getItem(arrivalKey)) return false;
    arrivalModalCheckedRef.current = true;
    setShowWelcomeChoice(true);
    return true;
  };

  const handleSelectGuestbook = () => {
    setUserChoice('guestbook');
    setShowWelcomeChoice(false);
    setShowGuestbookModal(true);
  };

  const handleSelectContribution = () => {
    setUserChoice('contribution');
    setShowWelcomeChoice(false);
    setTimeout(() => setShowContributionModal(true), 100);
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

  const handleGuestbookSubmit = async (guestbookData) => {
    try {
      const newMessage = {
        id: `temp-${Date.now()}`,
        from: guestbookData.name || '익명',
        phone: guestbookData.phone,
        date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\./g, '.').replace(/\s/g, ' '),
        content: guestbookData.message || '',
      };
      setGuestMessages(prev => [newMessage, ...prev]);
      setHasWrittenGuestbook(true);
      setCurrentPage(0);
      setTimeout(async () => { await fetchGuestbook(); }, 500);
    } catch (error) {
      console.error('방명록 제출 오류:', error);
      throw error;
    }
  };

  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setShowEditModal(true);
  };

  const handleEditUpdate = async () => { await fetchGuestbook(); };

  const handleEditDelete = async () => {
    if (editingMessage?.id) {
      setGuestMessages(prev => prev.map(msg => msg.id === editingMessage.id ? { ...msg, content: '' } : msg));
    }
    setHasWrittenGuestbook(false);
    setShowEditModal(false);
    setEditingMessage(null);
  };

  const canEditMessage = (message) => {
    const verifiedPhone = localStorage.getItem('verifiedPhone');
    return verifiedPhone && message.phone === verifiedPhone;
  };

  const handleContributionSubmit = async (contributionFormData) => {
    try {
      const response = await fetch('/api/submit-contribution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contributionFormData),
      });
      const result = await response.json();
      if (result.success) {
        if (typeof window !== 'undefined') localStorage.setItem(`arrival_checked_${eventData?.id}`, 'true');
        arrivalModalCheckedRef.current = true;
        setCompletionData(contributionFormData);
        setShowContributionModal(false);
        setIsEditMode(false);
        if (isEditMode && myContribution) {
          setMyContribution({ ...myContribution, ...contributionFormData, amount: contributionFormData.contributionAmount });
          setContributionKey(prev => prev + 1);
        }
        try {
          const r = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
          const d = await r.json();
          if (d.success && d.messages) setGuestMessages(d.messages);
        } catch {}
        setTimeout(() => setShowCompletionModal(true), 300);
      } else {
        throw new Error(result.error || '축의금 등록에 실패했습니다.');
      }
    } catch (error) {
      alert(`축의금 등록 중 오류가 발생했습니다:\n${error.message}`);
      throw error;
    }
  };

  useEffect(() => {
    if (arrivalModalCheckedRef.current) return;
    const t = setTimeout(() => checkAndShowWelcomeChoice(), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.container}>
      {/* 히어로 섹션 */}
      <section className={styles.heroSection}>
        <MainPhotoSlideshow images={safeImages.main} onImagePress={(i) => { setCurrentImageIndex(i); setShowImageViewer(true); }} />
        <div className={styles.heroOverlay}>
          <div className={styles.heroContent}>
            <p className={styles.heroLabel}>WEDDING INVITATION</p>
            <div className={styles.heroNames}>
              <span className={styles.heroGroomName}>{eventData.groom_name || '이민호'}</span>
              <span className={styles.heroAmpersand}>&amp;</span>
              <span className={styles.heroBrideName}>{eventData.bride_name || '배하윤'}</span>
            </div>
            <p className={styles.heroDate}>{getEnglishDate()}</p>
          </div>
        </div>
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.greetingSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEn}>Greeting</p>
          <h2 className={styles.sectionKo}>인사말</h2>
          <div className={styles.sectionLine} />
        </div>
        {greetingMessage && <p className={styles.greetingPoem}>{greetingMessage}</p>}
        <div className={styles.coupleNamesBlock}>
          <div className={styles.coupleNameItem}>
            <span className={styles.nameRole}>GROOM</span>
            <span className={styles.namePrimary}>{eventData.groom_name || '이민호'}</span>
          </div>
          <span className={styles.nameHeart}>♥</span>
          <div className={styles.coupleNameItem}>
            <span className={styles.nameRole}>BRIDE</span>
            <span className={styles.namePrimary}>{eventData.bride_name || '배하윤'}</span>
          </div>
        </div>
        <p className={styles.coupleSubtext}>두 사람이 하나되어 새로운 시작을 합니다</p>
      </section>

      {/* Wedding Day 섹션 */}
      <section className={styles.weddingDaySection}>
        <p className={styles.weddingDayTitle}>WEDDING DAY</p>

        {/* 6주 달력 */}
        <FullCalendar targetDate={eventData.date || eventData.event_date || '2025-10-04'} />

        {/* 카운트다운 */}
        <div className={styles.weddingCountdown}>
          {!timeLeft.isExpired ? (
            <>
              <p className={styles.countdownTitle}>THE BIG DAY</p>
              <div className={styles.countdownGrid}>
                {[
                  { value: timeLeft.days, label: 'DAYS' },
                  { value: timeLeft.hours, label: 'HOURS' },
                  { value: timeLeft.minutes, label: 'MINS' },
                  { value: timeLeft.seconds || 0, label: 'SECS' },
                ].map(({ value, label }) => (
                  <div key={label} className={styles.countdownItem}>
                    <span className={styles.countdownNumber}>{value}</span>
                    <span className={styles.countdownLabel}>{label}</span>
                  </div>
                ))}
              </div>
              <p className={styles.countdownMessage}>
                우리의 결혼식이 <span className={styles.countdownDays}>{timeLeft.days}일</span> 남았습니다
              </p>
            </>
          ) : (
            <p className={styles.countdownExpired}>💍 TODAY IS THE DAY 💍</p>
          )}
        </div>

        {/* CEREMONY 정보 */}
        <div className={styles.ceremonyInfo}>
          <p className={styles.ceremonyLabel}>CEREMONY</p>
          <p className={styles.ceremonyDate}>{dateInfo.full}</p>
          <p className={styles.ceremonyTime}>{ceremonyTime}</p>
        </div>
      </section>

      {/* 갤러리 섹션 - gallery 이미지 우선, 없으면 main */}
      {(() => {
        const hasGallery = safeImages.gallery.length > 0;
        const galleryImgs = hasGallery ? safeImages.gallery : safeImages.main.length > 0 ? safeImages.main : [];
        if (galleryImgs.length === 0) return null;
        const galleryIndexOffset = hasGallery ? safeImages.main.length : 0;
        return (
          <section className={styles.gallerySection}>
            <div className={styles.sectionHeader}>
              <p className={styles.sectionEn}>Gallery</p>
              <h2 className={styles.sectionKo}>우리의 순간</h2>
              <div className={styles.sectionLine} />
            </div>
            <div className={styles.galleryContainer}>
              <div
                className={styles.gallerySlider}
                onScroll={(e) => {
                  const scrollLeft = e.target.scrollLeft;
                  const itemWidth = e.target.scrollWidth / galleryImgs.length;
                  setGalleryScrollIndex(Math.round(scrollLeft / itemWidth));
                }}
              >
                {galleryImgs.map((image, index) => {
                  const src = getImageSrc(image);
                  return src ? (
                    <div key={index} className={styles.galleryItem} onClick={() => { setCurrentImageIndex(galleryIndexOffset + index); setShowImageViewer(true); }}>
                      <img src={src} alt={`Gallery ${index + 1}`} loading="eager" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className={styles.galleryItemOverlay} />
                    </div>
                  ) : null;
                })}
              </div>
              <div className={styles.galleryDots}>
                {galleryImgs.map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.dot} ${galleryScrollIndex === index ? styles.dotActive : ''}`}
                    onClick={() => {
                      const slider = document.querySelector(`.${styles.gallerySlider}`);
                      if (slider) {
                        const itemWidth = slider.scrollWidth / galleryImgs.length;
                        slider.scrollTo({ left: itemWidth * index, behavior: 'smooth' });
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </section>
        );
      })()}


      {/* 오시는 길 */}
      <section className={styles.locationSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEn}>Location</p>
          <h2 className={styles.sectionKo}>오시는 길</h2>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.venueInfo}>
          <p className={styles.venueName}>{eventData.location || '더 플라자 지스텀하우스 22층'}</p>
          <p className={styles.venueAddress}>{eventData.detailed_address || eventData.detailedAddress || '서울시 중구 소공로 119'}</p>
        </div>
        <div className={styles.mapContainer}>
          <GoogleMapEmbed
            address={`${eventData?.location || '서울시 중구 소공로 119'} ${eventData?.detailed_address || eventData?.detailedAddress || ''}`.trim()}
            venueName={eventData?.venue_name || eventData?.venueName}
            width="100%"
            height="300px"
          />
        </div>
        <div className={styles.transportCard}>
          <span className={styles.transportIcon}>🅿️</span>
          <div className={styles.transportContent}>
            <h4 className={styles.transportTitle}>주차 안내</h4>
            <p className={styles.transportText}>{eventData.parking_info || eventData.parkingInfo || '하객 3시간 무료 주차\n주차 요원의 안내를 받아주세요'}</p>
          </div>
        </div>
      </section>

      {/* 축의금 섹션 */}
      <section className={styles.giftSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEn}>Contribution</p>
          <h2 className={styles.sectionKo}>축의금 전달</h2>
          <div className={styles.sectionLine} />
        </div>
        <p className={styles.giftSubtitle}>따뜻한 마음을 함께 나누어주세요</p>
        <div className={styles.toggleContainer}>
          <div className={styles.toggleButtons}>
            <button className={`${styles.toggleBtn} ${activeAccountToggle === 'groom' ? styles.toggleBtnActive : ''}`} onClick={() => setActiveAccountToggle('groom')}>신랑측</button>
            <button className={`${styles.toggleBtn} ${activeAccountToggle === 'bride' ? styles.toggleBtnActive : ''}`} onClick={() => setActiveAccountToggle('bride')}>신부측</button>
          </div>
        </div>
        <div className={styles.accountsContainer}>
          {activeAccountToggle === 'groom' && (additionalInfo?.groom_account_number || additionalInfo?.groom_father_account_number || additionalInfo?.groom_mother_account_number) && (
            <div className={styles.accountGroup}>
              {additionalInfo?.groom_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.groom_name || '신랑'}</div>
                    <div className={styles.bankName}>{additionalInfo.groom_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.groom_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
              {additionalInfo?.groom_father_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_father_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.groom_father_name || '신랑'} 아버님</div>
                    <div className={styles.bankName}>{additionalInfo.groom_father_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.groom_father_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
              {additionalInfo?.groom_mother_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_mother_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.groom_mother_name || '신랑'} 어머님</div>
                    <div className={styles.bankName}>{additionalInfo.groom_mother_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.groom_mother_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
            </div>
          )}
          {activeAccountToggle === 'bride' && (additionalInfo?.bride_account_number || additionalInfo?.bride_father_account_number || additionalInfo?.bride_mother_account_number) && (
            <div className={styles.accountGroup}>
              {additionalInfo?.bride_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.bride_name || '신부'}</div>
                    <div className={styles.bankName}>{additionalInfo.bride_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.bride_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
              {additionalInfo?.bride_father_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_father_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.bride_father_name || '신부'} 아버님</div>
                    <div className={styles.bankName}>{additionalInfo.bride_father_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.bride_father_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
              {additionalInfo?.bride_mother_account_number && (
                <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_mother_account_number)}>
                  <div className={styles.accountInfo}>
                    <div className={styles.accountName}>{eventData.bride_mother_name || '신부'} 어머님</div>
                    <div className={styles.bankName}>{additionalInfo.bride_mother_bank_name || '은행'}</div>
                    <div className={styles.accountNumber}>{additionalInfo.bride_mother_account_number}</div>
                  </div>
                  <div className={styles.copyButton}><span>복사</span></div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 방명록 섹션 */}
      <section className={styles.messagesSection}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionEn}>Messages</p>
          <h2 className={styles.sectionKo}>방명록</h2>
          <div className={styles.sectionLine} />
        </div>
        <div className={styles.messagesList}>
          {(!hasRealMessages && guestMessages?.length === 0) ? (
            <div className={styles.emptyMessages}>
              <div className={styles.emptyIcon}>💬</div>
              <p className={styles.emptyText}>아직 축하 메시지가 없습니다</p>
            </div>
          ) : (
            currentMessages.map((message, index) => (
              <div key={index} className={styles.messageCard}>
                <div className={styles.messageHeader}>
                  <span className={styles.messageFrom}>From. {message.from}</span>
                  <div className={styles.messageActions}>
                    {canEditMessage(message) && (
                      <button className={styles.editBtn} onClick={() => handleEditMessage(message)}>수정</button>
                    )}
                    <span className={styles.messageDate}>{message.date}</span>
                  </div>
                </div>
                <div className={styles.messageContent}>
                  {message.content ? message.content.split('\n').map((line, lineIndex) => (
                    <span key={lineIndex}>{line}{lineIndex < message.content.split('\n').length - 1 && <br />}</span>
                  )) : ''}
                </div>
              </div>
            ))
          )}
        </div>
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => setCurrentPage(Math.max(0, currentPage - 1))} disabled={currentPage === 0} className={styles.pageBtn}>‹</button>
            <div className={styles.pageDots}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setCurrentPage(i)} className={`${styles.pageDot} ${currentPage === i ? styles.pageDotActive : ''}`} />
              ))}
            </div>
            <button onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))} disabled={currentPage === totalPages - 1} className={styles.pageBtn}>›</button>
          </div>
        )}
        {!hasWrittenGuestbook && (
          <button className={styles.writeGuestbookBtn} onClick={handleGuestbookModalOpen} disabled={showGuestbookModal}>
            방명록 남기기
          </button>
        )}
      </section>

      {/* 공유 버튼 */}
      <section className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          <span>💌</span>
          <span>청첩장 공유하기</span>
        </button>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <h3 className={styles.footerTitle}>Thank You</h3>
          <div className={styles.footerDivider} />
          <p className={styles.footerMessage}>저희의 새로운 시작을 축복해주셔서<br />진심으로 감사드립니다</p>
        </div>
      </footer>

      {/* 이미지 뷰어 */}
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
              <button className={styles.navButton} onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}>‹</button>
              <span className={styles.imageCounter}>{currentImageIndex + 1} / {allImages.length}</span>
              <button className={styles.navButton} onClick={() => setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}>›</button>
            </div>
          </div>
        </div>
      )}

      {/* 모달들 */}
      <WelcomeChoiceModal isOpen={showWelcomeChoice} onClose={() => setShowWelcomeChoice(false)} onSelectGuestbook={handleSelectGuestbook} onSelectContribution={handleSelectContribution} eventData={eventData} />
      <GuestbookModal isOpen={showGuestbookModal} onClose={handleGuestbookModalClose} onSubmit={handleGuestbookSubmit} eventData={eventData} onTriggerArrival={handleTriggerArrival} onBack={() => { setShowGuestbookModal(false); setShowWelcomeChoice(true); }} />
      <EditGuestbookModal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingMessage(null); }} message={editingMessage} eventData={eventData} onUpdate={handleEditUpdate} onDelete={handleEditDelete} />
<ContributionModal isOpen={showContributionModal} onClose={() => { setShowContributionModal(false); setIsEditMode(false); }} onBack={!isEditMode ? () => { setShowContributionModal(false); setShowWelcomeChoice(true); } : undefined} onSubmit={handleContributionSubmit} eventData={eventData} editData={isEditMode ? myContribution : null} onVerifiedExisting={(c) => setMyContribution({ ...c, amount: c.contributionAmount })} />
      <CompletionModal isOpen={showCompletionModal} onClose={() => { setShowCompletionModal(false); setCompletionData(null); }} contributionData={completionData} eventData={eventData} />

      {/* 내 축의금 고정 섹션 */}
      {myContribution && !showGuestbookModal && !showWelcomeChoice && !showCompletionModal && (
        <MyContributionSection
          key={`contribution-${contributionKey}-${myContribution?.contributionAmount || myContribution?.amount}`}
          eventData={eventData}
          myContribution={myContribution}
          onEdit={() => { setIsEditMode(true); setShowContributionModal(true); }}
          setMyContribution={setMyContribution}
        />
      )}
    </div>
  );
};

export default ModernDarkTemplate;
