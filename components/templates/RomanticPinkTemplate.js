// components/templates/RomanticPinkTemplate.js
import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleMapEmbed from '../MapComponent';
import GuestbookModal from '../GuestbookModal';
import EditGuestbookModal from '../EditGuestbookModal';
import ArrivalConfirmModal from '../ArrivalConfirmModal';
import ContributionModal from '../ContributionModal';
import CompletionModal from '../CompletionModal';
import styles from './RomanticPinkTemplate.module.css';

// 떨어지는 꽃잎 애니메이션 컴포넌트 (모바일과 동일)
const FallingPetals = () => {
  const [petalsSet1] = useState(() => 
    [...Array(30)].map((_, index) => ({ 
      id: `petals1-${index}`,
      left: Math.random() * 100,
      delay: index * 1000,
      size: 10,
      type: '🌸',
      duration: 10000 + (index * 300),
    }))
  );

  return (
    <div className={styles.fallingPetalsContainer}>
      {petalsSet1.map((petal) => (
        <div
          key={petal.id}
          className={styles.fallingPetal}
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}ms`,
            animationDuration: `${petal.duration}ms`,
            fontSize: `${petal.size}px`,
            animationFillMode: 'both'
          }}
        >
          {petal.type}
        </div>
      ))}
    </div>
  );
};

// 랜덤 인사말 목록 (모바일과 동일)
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

// 한글 이름을 영어로 변환하는 함수 (모바일과 동일)
const koreanToEnglish = (koreanName) => {
  const nameMap = {
    // 성씨
    '김': 'Kim', '이': 'Lee', '박': 'Park', '최': 'Choi', '정': 'Jung',
    '강': 'Kang', '조': 'Jo', '윤': 'Yoon', '장': 'Jang', '임': 'Lim',
    '한': 'Han', '오': 'Oh', '서': 'Seo', '신': 'Shin', '권': 'Kwon',
    '황': 'Hwang', '안': 'Ahn', '송': 'Song', '전': 'Jeon', '홍': 'Hong',
    '유': 'Yoo', '고': 'Ko', '문': 'Moon', '배': 'Bae', '백': 'Baek',
    
    // 이름 음절들
    '민': 'Min', '지': 'Ji', '수': 'Soo', '현': 'Hyun', '준': 'Jun',
    '영': 'Young', '정': 'Jung', '진': 'Jin', '성': 'Sung', '호': 'Ho',
    '연': 'Yeon', '은': 'Eun', '혜': 'Hye', '미': 'Mi', '선': 'Sun',
    '희': 'Hee', '경': 'Kyung', '윤': 'Yoon', '서': 'Seo', '아': 'Ah',
    '나': 'Na', '리': 'Ri', '라': 'Ra', '빈': 'Bin', '원': 'Won',
    '태': 'Tae', '규': 'Kyu', '재': 'Jae', '한': 'Han', '우': 'Woo',
    '동': 'Dong', '훈': 'Hoon', '상': 'Sang', '철': 'Chul', '병': 'Byung',
    '인': 'In', '기': 'Ki', '석': 'Seok', '광': 'Kwang', '용': 'Yong',
  };

  if (!koreanName) return '';
  
  let result = [];
  for (let i = 0; i < koreanName.length; i++) {
    const char = koreanName[i];
    if (nameMap[char]) {
      result.push(nameMap[char]);
    } else {
      result.push(char);
    }
  }
  
  if (result.length > 1) {
    const surname = result[0];
    const givenName = result.slice(1).join('').toLowerCase();
    return `${surname} ${givenName.charAt(0).toUpperCase() + givenName.slice(1)}`;
  }
  
  return result.join('');
};

// 커스텀 오프닝 오버레이 (모바일과 동일한 개념)
const CustomOpeningOverlay = ({ visible, onComplete }) => {
  const [showText, setShowText] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  
  useEffect(() => {
    if (visible) {
      // 텍스트 나타내기
      setTimeout(() => setShowText(true), 500);
      
      // 페이드아웃 시작
      setTimeout(() => {
        setFadeOut(true);
      }, 2500);
      
      // 완전히 사라진 후 onComplete 호출
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 3500);
    }
  }, [visible, onComplete]);
  
  if (!visible) return null;
  
  return (
    <div 
      className={styles.openingOverlay} 
      style={{ 
        opacity: fadeOut ? 0 : 1,
        transition: 'opacity 1s ease-out'
      }}
    >
      {showText && (
        <div className={styles.openingText}>
          <div className={styles.animatedSvgText}>Happy Wedding</div>
        </div>
      )}
    </div>
  );
};

// 메인 사진 슬라이드쇼 컴포넌트
const MainPhotoSlideshow = ({ images, onImagePress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    if (images && images.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [images?.length]);
  
  const handleImageClick = () => {
    if (onImagePress) onImagePress(currentIndex);
  };

  // 이미지 URL 처리 함수 - EventDisplayScreen과 동일한 방식
  const getImageSrc = (image) => {
    if (!image) return null;
    
    
    // 문자열인 경우 그대로 반환
    if (typeof image === 'string') {
      return image;
    }
    
    // 객체인 경우 publicUrl 우선, 그 다음 uri (EventDisplayScreen과 동일한 순서)
    return image.publicUrl || image.uri || image.url || image.src || null;
  };
  
  return (
    <div className={styles.mainPhotoContainer} onClick={handleImageClick}>
      {images && images.length > 0 ? (
        images.map((image, index) => {
          const imageSrc = getImageSrc(image);
          return imageSrc ? (
            <img
              key={index}
              src={imageSrc}
              alt="Wedding"
              className={`${styles.mainPhoto} ${index === currentIndex ? styles.active : ''}`}
              onError={(e) => {
                console.error('이미지 로딩 실패:', imageSrc);
                e.target.style.display = 'none';
              }}
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

// 로맨틱 핑크 달력 컴포넌트
const RomanticPinkCalendar = ({ targetDate }) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  const calendarDays = [];
  
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: '', isCurrentMonth: false, isTargetDate: false });
  }
  
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isTargetDate: i === day,
    });
  }

  return (
    <div className={styles.romanticCalendar}>
      <h3 className={styles.calendarMonth}>{months[month]} {year}</h3>
      
      <div className={styles.calendarWeekDays}>
        {weekDays.map((weekDay, index) => (
          <span key={index} className={`${styles.calendarWeekDay} ${index === 0 ? styles.sunday : ''}`}>
            {weekDay}
          </span>
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

// 카운트다운 디스플레이 컴포넌트
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
      <div className={styles.countdownCard}>
        <div className={styles.countdownNumber}>{timeLeft.days}</div>
        <div className={styles.countdownLabel}>일</div>
      </div>
      <div className={styles.countdownCard}>
        <div className={styles.countdownNumber}>{timeLeft.hours}</div>
        <div className={styles.countdownLabel}>시간</div>
      </div>
      <div className={styles.countdownCard}>
        <div className={styles.countdownNumber}>{timeLeft.minutes}</div>
        <div className={styles.countdownLabel}>분</div>
      </div>
      <div className={styles.countdownCard}>
        <div className={styles.countdownNumber}>{timeLeft.seconds || 0}</div>
        <div className={styles.countdownLabel}>초</div>
      </div>
    </div>
  );
};

// 방명록 메시지 컴포넌트
const GuestBookMessages = ({ messages, onAddMessage }) => {
  return (
    <div className={styles.guestBookSection}>
      <button className={styles.addMessageButton} onClick={onAddMessage}>
        💌 메시지 남기기
      </button>
      
      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div key={index} className={styles.messageCard}>
            <div className={styles.messageHeader}>
              <span className={styles.messageName}>{message.from}</span>
              <span className={styles.messageDate}>{message.date}</span>
            </div>
            <p className={styles.messageContent}>{message.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const RomanticPinkTemplate = ({ eventData = {}, categorizedImages = {}, allowMessages = false, messageSettings = {} }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [randomGreeting, setRandomGreeting] = useState(null);
  const [showOpening, setShowOpening] = useState(true);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [galleryScrollIndex, setGalleryScrollIndex] = useState(0);
  const [galleryPairIndex, setGalleryPairIndex] = useState(0); // 갤러리 페어 인덱스 추가
  const [showDateAnimation, setShowDateAnimation] = useState(false);
  const [showGuestbookModal, setShowGuestbookModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  
  // 결혼식장 도착 및 축의금 모달 상태
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [contributionData, setContributionData] = useState(null);
  const [arrivalDismissed, setArrivalDismissed] = useState(false); // 도착 확인 모달 닫음 여부
  const [guestMessages, setGuestMessages] = useState([]);
  
  // 이미지 URL 처리 함수 - EventDisplayScreen과 동일한 방식
  const getImageSrc = (image) => {
    if (!image) return null;
    
    
    // 문자열인 경우 그대로 반환
    if (typeof image === 'string') {
      return image;
    }
    
    // 객체인 경우 publicUrl 우선, 그 다음 uri (EventDisplayScreen과 동일한 순서)
    return image.publicUrl || image.uri || image.url || image.src || null;
  };
  
  // 기본 이미지 URL들 (Supabase 이미지가 없을 때만 사용)
  const defaultImages = {
    main: [
      'https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=650&fit=crop',
      'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?w=400&h=650&fit=crop',
      'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=650&fit=crop'
    ],
    gallery: [
      'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=300&h=350&fit=crop',
      'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=300&h=350&fit=crop'
    ],
    groom: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'],
    bride: ['https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face']
  };

  // Supabase Storage에서 실제 이미지 가져오기
  const processImageData = () => {
    // 1순위: categorizedImages (외부에서 전달된 경우)
    if (categorizedImages && Object.keys(categorizedImages).length > 0) {
      return categorizedImages;
    }
    
    // 2순위: Supabase에서 처리된 이미지 (getEventDetails 결과)
    if (eventData?.processedImages && eventData.processedImages.length > 0) {
      const categorized = {
        main: [],
        gallery: [],
        groom: [],
        bride: [],
        all: []
      };
      
      eventData.processedImages.forEach(img => {
        const imageObj = {
          uri: img.primaryUrl || img.publicUrl || img.uri,
          publicUrl: img.publicUrl,
          category: img.category,
          id: img.id
        };
        
        if (img.category && categorized[img.category]) {
          categorized[img.category].push(imageObj);
        }
        categorized.all.push(imageObj);
      });
      
      return categorized;
    }
    
    // 3순위: EventDisplayScreen과 동일한 처리 로직 (image_urls)
    if (eventData?.image_urls && eventData.image_urls.length > 0) {
      const normalizedImages = eventData.image_urls.map(img => {
        if (typeof img === 'string') {
          return { uri: img, category: 'main' };
        }
        return {
          uri: img.publicUrl || img.uri || img,
          category: img.category || 'main'
        };
      });
      
      const processedImages = {
        main: normalizedImages.filter(img => img.category === 'main'),
        gallery: normalizedImages.filter(img => img.category === 'gallery'),
        groom: normalizedImages.filter(img => img.category === 'groom'),
        bride: normalizedImages.filter(img => img.category === 'bride'),
        all: normalizedImages
      };
      
      return processedImages;
    }
    
    return defaultImages;
  };

  const processedImages = processImageData();
  const safeImages = {
    main: processedImages?.main?.length > 0 ? processedImages.main : defaultImages.main,
    gallery: processedImages?.gallery?.length > 0 ? processedImages.gallery : defaultImages.gallery,
    groom: processedImages?.groom?.length > 0 ? processedImages.groom : defaultImages.groom,
    bride: processedImages?.bride?.length > 0 ? processedImages.bride : defaultImages.bride,
  };

  // 랜덤 인사말 선택
  useEffect(() => {
    if (!eventData.custom_message || eventData.custom_message.trim() === '') {
      const randomIndex = Math.floor(Math.random() * RANDOM_GREETINGS.length);
      setRandomGreeting(RANDOM_GREETINGS[randomIndex]);
    }
  }, [eventData.custom_message]);

  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return { full: '2025년 10월 4일 토요일' };
    const d = new Date(date);
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const dayOfWeek = days[d.getDay()];
    
    return {
      year: year.toString(),
      month: month.toString(),
      day: day.toString(),
      dayOfWeek,
      full: `${year}년 ${month}월 ${day}일 ${dayOfWeek}`
    };
  };

  const dateInfo = formatDate(eventData.date || eventData.event_date || '2025-10-04');
  const ceremonyTime = eventData.ceremony_time || '오후 2시';
  const receptionTime = eventData.reception_time || '오후 3시';

  // 영문 날짜 포맷팅
  const getEnglishDate = () => {
    const date = new Date(eventData.date || eventData.event_date || '2025-10-04');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  // 카운트다운 계산
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
        isExpired: false
      };
    }
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [eventData]);

  // 영문 이름 생성
  const groomEnglishName = koreanToEnglish(eventData.groom_name || '이민호');
  const brideEnglishName = koreanToEnglish(eventData.bride_name || '배하윤');

  // 모든 이미지 배열 (메인 + 갤러리 + 신랑신부)
  const allImages = [
    ...safeImages.main,
    ...safeImages.gallery,
    ...safeImages.groom,
    ...safeImages.bride
  ];

  // 방명록 메시지 데이터
  const defaultMessages = [
    {
      from: "민나",
      date: "2025.04.24 18:52",
      content: `${eventData.bride_name || '하윤'}아❤️ 결혼을 진심으로 축하한다!\n${eventData.groom_name || '민호'} 오빠랑 둘이 지금처럼 행복하게 백년해로 하기\n항상 웃음 가득한 하루하루 보내길 바랄게!\nHappy Wedding💜`
    },
    {
      from: "sooyeon",
      date: "2025.04.23 09:41",
      content: "결혼을 진심으로 축하드립니다💕\n사진도 청첩장도 너무 이쁘요!\n항상 서로를 응원하고 아껴주는 모습이 참 이쁜 커플입니다😊\n행복한 결혼 생활 되길 바래요"
    },
    {
      from: "지현",
      date: "2025.04.22 14:23",
      content: `${eventData.bride_name || '하윤'}아 결혼 진심으로 축하해!\n웨딩스냅, 청첩장 모두 너무 예쁘다!💚\n남은 결혼식 준비도 잘 마무리하고!\n행복한 결혼생활 되기를 바래✨`
    },
    {
      from: "유진",
      date: "2025.04.21 16:35",
      content: `두 분의 아름다운 사랑이 결실을 맺게 되어 정말 축하드려요🎉\n서로를 아끼고 사랑하는 마음으로\n평생 함께하는 행복한 부부가 되시길 바랍니다\n새로운 시작을 진심으로 응원합니다!`
    }
  ];
  
  // 페이지 로드 시 방명록 데이터 불러오기 및 실시간 구독
  useEffect(() => {
    const fetchGuestbook = async () => {
      if (!eventData?.id) return;
      
      try {
        const response = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
        const result = await response.json();
        
        if (result.success && result.messages) {
          setGuestMessages(result.messages);
        }
      } catch (error) {
        console.error('방명록 로드 오류:', error);
      }
    };
    
    // 초기 데이터 로드
    fetchGuestbook();
    
    // Supabase 실시간 구독 설정
    let subscription = null;
    if (eventData?.id) {
      // Supabase 클라이언트 생성
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      
      if (supabaseUrl && supabaseAnonKey) {
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        // guest_book 테이블의 실시간 변경 사항 구독
        subscription = supabase
          .channel('guestbook-changes')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'guest_book',
              filter: `event_id=eq.${eventData.id}`
            },
            (payload) => {
              // 새 방명록 등록됨
              
              // 새로운 메시지를 state에 추가
              const newMessage = {
                id: payload.new.id,
                from: payload.new.guest_name || '익명',
                phone: payload.new.guest_phone,
                date: new Date(payload.new.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).replace(/\./g, '.').replace(/\s/g, ' '),
                content: payload.new.message || ''
              };
              
              setGuestMessages(prevMessages => [newMessage, ...prevMessages]);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'guest_book',
              filter: `event_id=eq.${eventData.id}`
            },
            (payload) => {
              // 방명록 수정됨
              
              // 수정된 메시지로 업데이트
              const updatedMessage = {
                id: payload.new.id,
                from: payload.new.guest_name || '익명',
                phone: payload.new.guest_phone,
                date: new Date(payload.new.created_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                }).replace(/\./g, '.').replace(/\s/g, ' '),
                content: payload.new.message || ''
              };
              
              setGuestMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.id === payload.new.id ? updatedMessage : msg
                )
              );
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'guest_book',
              filter: `event_id=eq.${eventData.id}`
            },
            (payload) => {
              // 방명록 삭제됨
              
              // 삭제된 메시지 제거
              setGuestMessages(prevMessages => 
                prevMessages.filter(msg => msg.id !== payload.old.id)
              );
            }
          )
          .subscribe();
      }
    }
    
    // 클린업 함수
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [eventData?.id]);
  
  // 실제 메시지 또는 기본 메시지 선택 (state와 통합)
  const hasRealMessages = (eventData.guestMessages && eventData.guestMessages.length > 0) || guestMessages.length > 0;
  const displayMessages = hasRealMessages ? [...(eventData.guestMessages || []), ...guestMessages] : defaultMessages;
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(0);
  const messagesPerPage = 3;
  const totalPages = Math.ceil(displayMessages.length / messagesPerPage);
  const currentMessages = displayMessages.slice(currentPage * messagesPerPage, (currentPage + 1) * messagesPerPage);

  // 인사말 결정
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

  const handleShare = async () => {
    const shareData = {
      title: `${eventData.groom_name || '신랑'} ♡ ${eventData.bride_name || '신부'} 결혼식 초대장`,
      text: `${eventData.groom_name || '신랑'} ♡ ${eventData.bride_name || '신부'}\n${dateInfo.full} ${ceremonyTime}\n${eventData.location || '웨딩홀'}\n\n우리의 특별한 날에 초대합니다 🌸`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
      }
    } catch (error) {
      // Share error (조용히 처리)
    }
  };

  const handleImagePress = (index) => {
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const openMessageModal = () => {
    alert('메시지 작성 기능은 준비 중입니다.');
  };

  // 모달 상태 관리를 위한 ref 추가
  const modalOpeningRef = useRef(false);
  const modalClosingRef = useRef(false);

  // 방명록 모달 열기 (중복 방지)
  const handleGuestbookModalOpen = () => {
    console.log('🟢 모달 열기 시도:', { modalOpeningRef: modalOpeningRef.current, showGuestbookModal });
    
    if (modalOpeningRef.current || showGuestbookModal) {
      console.log('🟢 모달 열기 차단됨');
      return;
    }
    
    modalOpeningRef.current = true;
    console.log('🟢 모달 열기 실행');
    setShowGuestbookModal(true);
    
    setTimeout(() => {
      modalOpeningRef.current = false;
    }, 500);
  };

  // 방명록 모달 닫기 (안전한 닫기)
  const handleGuestbookModalClose = () => {
    console.log('🔴 템플릿에서 모달 닫기 호출됨:', { modalClosingRef: modalClosingRef.current, showGuestbookModal });
    
    if (modalClosingRef.current) {
      console.log('🔴 템플릿 모달 닫기 차단됨');
      return;
    }
    
    modalClosingRef.current = true;
    console.log('🔴 템플릿 모달 닫기 실행');
    setShowGuestbookModal(false);
    
    setTimeout(() => {
      modalClosingRef.current = false;
      console.log('🔴 템플릿 모달 닫기 상태 해제');
    }, 300);
  };

  // 방명록 제출 핸들러
  const handleGuestbookSubmit = async (guestbookData) => {
    try {
      // 실시간 구독으로 자동 추가되므로 여기서는 첫 페이지로만 이동
      setCurrentPage(0);

      // 서버 저장은 이미 GuestbookModal에서 처리됨
      // 추가 처리 필요 없음

    } catch (error) {
      console.error('방명록 제출 오류:', error);
      throw error; // 모달에서 에러 처리
    }
  };

  // 방명록 수정 모달 열기
  const handleEditMessage = (message) => {
    setEditingMessage(message);
    setShowEditModal(true);
  };

  // 방명록 수정 완료 핸들러
  const handleEditUpdate = async () => {
    // 실시간 구독으로 자동 업데이트됨
    await fetchGuestbook();
  };

  // 방명록 삭제 완료 핸들러  
  const handleEditDelete = async () => {
    // 실시간 구독으로 자동 업데이트됨
    await fetchGuestbook();
  };

  // 수정 권한 확인 (본인 전화번호와 일치하는지 체크)
  const canEditMessage = (message) => {
    const verifiedPhone = localStorage.getItem('verifiedPhone');
    // 편집 권한 체크
    return verifiedPhone && message.phone === verifiedPhone;
  };

  // 방명록 데이터 새로고침 함수
  const fetchGuestbook = async () => {
    if (!eventData?.id) return;
    
    try {
      const response = await fetch(`/api/get-guestbook?eventId=${eventData.id}`);
      const result = await response.json();
      
      if (result.success && result.messages) {
        setGuestMessages(result.messages);
      }
    } catch (error) {
      console.error('방명록 로드 오류:', error);
    }
  };

  // 도착 확인 모달 상태 관리를 위한 ref
  const arrivalTimersRef = useRef([]);
  const arrivalModalOpeningRef = useRef(false);
  const arrivalModalCheckedRef = useRef(false); // 이미 체크했는지 추적

  // 도착 확인 모달 타이머 정리 함수
  const clearArrivalTimers = () => {
    arrivalTimersRef.current.forEach(timer => clearTimeout(timer));
    arrivalTimersRef.current = [];
  };

  // 통합된 도착 확인 모달 체크 함수
  const checkAndShowArrivalModal = () => {
    // 이미 체크했거나 모달이 열려있으면 즉시 종료
    if (arrivalModalCheckedRef.current || arrivalModalOpeningRef.current || showArrivalModal) {
      console.log('🟡 도착 모달 이미 처리됨');
      return false;
    }
    
    const verifiedPhone = localStorage.getItem('verifiedPhone');
    
    if (!verifiedPhone || arrivalDismissed) {
      return false;
    }
    
    // 체크 완료 표시
    arrivalModalCheckedRef.current = true;
    arrivalModalOpeningRef.current = true;
    
    console.log('🟡 도착 모달 조건 만족 - 트리거됨');
    setShowArrivalModal(true);
    
    setTimeout(() => {
      arrivalModalOpeningRef.current = false;
    }, 1000);
    
    return true;
  };

  // 도착 확인 모달 트리거 핸들러 (방명록 완료 후 호출용)
  const handleTriggerArrival = () => {
    if (arrivalModalOpeningRef.current || showArrivalModal) {
      console.log('🟡 도착 모달 중복 트리거 차단됨 (방명록 후)');
      return;
    }
    
    console.log('🟡 도착 모달 트리거됨 (방명록 후)');
    arrivalModalOpeningRef.current = true;
    setShowArrivalModal(true);
    
    setTimeout(() => {
      arrivalModalOpeningRef.current = false;
    }, 1000);
  };

  // 도착 확인 핸들러
  const handleArrivalConfirm = async () => {
    clearArrivalTimers(); // 모든 대기 중인 타이머 정리
    setShowArrivalModal(false);
    // 잠시 후 축의금 모달 표시
    setTimeout(() => {
      setShowContributionModal(true);
    }, 300);
  };

  // 안전한 도착 모달 닫기
  const handleArrivalModalClose = () => {
    clearArrivalTimers(); // 모든 대기 중인 타이머 정리
    arrivalModalCheckedRef.current = true; // 다시 체크하지 않도록 표시
    setShowArrivalModal(false);
    setArrivalDismissed(true);
  };

  // 축의금 제출 핸들러
  const handleContributionSubmit = async (contributionFormData) => {
    try {
      const response = await fetch('/api/submit-contribution', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(contributionFormData),
      });

      const result = await response.json();

      if (result.success) {
        setContributionData(contributionFormData);
        setShowContributionModal(false);
        
        // 잠시 후 완료 모달 표시
        setTimeout(() => {
          setShowCompletionModal(true);
        }, 300);
      } else {
        throw new Error(result.error || '축의금 등록에 실패했습니다.');
      }
    } catch (error) {
      console.error('축의금 제출 오류:', error);
      throw error;
    }
  };

  const handleOpeningComplete = () => {
    setShowOpening(false);
    
    // 0.5초 후 도착 확인 모달 체크
    const timer = setTimeout(() => {
      checkAndShowArrivalModal();
    }, 500);
    arrivalTimersRef.current.push(timer);
  };

  // 통합된 도착 모달 체크 useEffect
  useEffect(() => {
    // 이미 체크했거나 dismissed 상태면 실행하지 않음
    if (arrivalModalCheckedRef.current || arrivalDismissed) {
      return;
    }
    
    let checkTimer;
    
    if (!showOpening) {
      // 오프닝이 이미 false인 경우 (새로고침 등) 1초 후 체크
      checkTimer = setTimeout(() => {
        checkAndShowArrivalModal();
      }, 1000);
    } else {
      // 오프닝이 진행 중인 경우 4초 후 체크
      checkTimer = setTimeout(() => {
        if (showOpening) {
          setShowOpening(false);
          setTimeout(() => {
            checkAndShowArrivalModal();
          }, 500);
        }
      }, 4000);
    }
    
    arrivalTimersRef.current.push(checkTimer);
    
    return () => {
      clearTimeout(checkTimer);
    };
  }, [showOpening, arrivalDismissed]);

  // 컴포넌트 언마운트 시 모든 도착 타이머 정리
  useEffect(() => {
    return () => {
      clearArrivalTimers();
    };
  }, []);

  // additional_info JSON 파싱
  const additionalInfo = (() => {
    if (!eventData.additional_info) return {};
    
    if (typeof eventData.additional_info === 'string') {
      try {
        return JSON.parse(eventData.additional_info);
      } catch (e) {
        return {};
      }
    }
    
    if (typeof eventData.additional_info === 'object') {
      return eventData.additional_info;
    }
    
    return {};
  })();

  // 계좌 정보 토글 상태
  const [activeAccountToggle, setActiveAccountToggle] = useState('groom');

  // 계좌 토글 핸들러
  const handleAccountToggle = (type) => {
    setActiveAccountToggle(type);
  };

  // 계좌번호 복사 함수
  const copyAccount = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      alert('계좌번호가 복사되었습니다.');
    } catch (error) {
      console.error('계좌번호 복사 실패:', error);
      alert('계좌번호 복사에 실패했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      {/* 커스텀 오프닝 오버레이 */}
      <CustomOpeningOverlay visible={showOpening} onComplete={handleOpeningComplete} />
      
      {/* 떨어지는 꽃잎 애니메이션 */}
      <FallingPetals />
      
      {/* 인트로 섹션 */}
      <section className={styles.introSection}>
        <div className={styles.introContent}>
          <p className={styles.subtitle}>WEDDING INVITATION</p>
          <h1 className={styles.loveText}>With Love</h1>
          
          <div className={styles.mainImageContainer}>
            <MainPhotoSlideshow 
              images={safeImages.main}
              onImagePress={handleImagePress}
            />
          </div>
        </div>
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.greetingSection}>
        <div className={styles.greetingSectionTitle}>
          <h2 className={styles.greetingTitle}>Greeting</h2>
          <p className={styles.greetingSubtitle}>인사말</p>
        </div>
        
        {greetingMessage && (
          <p className={styles.poem}>
            {greetingMessage}
          </p>
        )}
        
        <div className={styles.divider}></div>
        
        {/* 신랑/신부 이름 */}
        <div className={styles.coupleNamesSection}>
          <div className={styles.coupleNames}>
            <div className={styles.groomInfo}>
              <span className={styles.roleLabel}>GROOM</span>
              <span className={styles.nameKorean}>{eventData.groom_name || '이민호'}</span>
            </div>
            
            <span className={styles.heartBeat}>♥</span>
            
            <div className={styles.brideInfo}>
              <span className={styles.roleLabel}>BRIDE</span>
              <span className={styles.nameKorean}>{eventData.bride_name || '배하윤'}</span>
            </div>
          </div>
          
          <div className={styles.coupleSubtext}>
            <span>두 사람이 하나되어 새로운 시작을 합니다</span>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <h2 className={styles.galleryTitle}>Our Gallery</h2>
          <p className={styles.gallerySubtitle}>우리의 특별한 순간들</p>
          
          <div className={styles.galleryContainer}>
            <div 
              className={styles.gallerySlider}
              onScroll={(e) => {
                const scrollLeft = e.target.scrollLeft;
                const itemWidth = e.target.scrollWidth / safeImages.gallery.length;
                const newIndex = Math.round(scrollLeft / itemWidth);
                setGalleryScrollIndex(newIndex);
                
                // 페어 인덱스 계산 (2개씩 묶어서)
                const pairIndex = Math.floor(newIndex / 2);
                setGalleryPairIndex(pairIndex);
              }}
            >
              {safeImages.gallery.map((image, index) => {
                const imageSrc = getImageSrc(image);
                return imageSrc ? (
                  <div key={index} className={styles.galleryItem} onClick={() => handleImagePress(safeImages.main.length + index)}>
                    <img 
                      src={imageSrc} 
                      alt={`Gallery ${index + 1}`}
                      onError={(e) => {
                        console.error('갤러리 이미지 로딩 실패:', imageSrc);
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                ) : null;
              })}
            </div>
            
            {/* 페이지 인디케이터 */}
            <div className={styles.galleryIndicator}>
              <span className={styles.currentPage}>
                {galleryScrollIndex + 1} / {safeImages.gallery.length}
              </span>
            </div>
            
            {/* 도트 인디케이터 */}
            <div className={styles.galleryDots}>
              {safeImages.gallery.map((_, index) => (
                <div 
                  key={index}
                  className={`${styles.dot} ${galleryScrollIndex === index ? styles.dotActive : ''}`}
                  onClick={() => {
                    const slider = document.querySelector(`.${styles.gallerySlider}`);
                    if (slider) {
                      const itemWidth = slider.scrollWidth / safeImages.gallery.length;
                      slider.scrollTo({
                        left: itemWidth * index,
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 날짜 섹션 */}
      <section className={styles.dateSection}>
        <div className={styles.animatedDate}>
          {getEnglishDate()}
        </div>
      </section>

      {/* Wedding Day 섹션 */}
      <section className={styles.weddingDaySection}>
        <h2 className={styles.weddingDayTitle}>Wedding Day</h2>
        
        <div className={styles.dateInfo}>
          <p className={styles.dateMain}>{dateInfo.full}</p>
          <p className={styles.dateSub}>{getEnglishDate()}</p>
        </div>
        
        <RomanticPinkCalendar targetDate={eventData.date || eventData.event_date || '2025-10-04'} />
        
        <div className={styles.countdown}>
          <CountdownDisplay timeLeft={timeLeft} isExpired={timeLeft.isExpired} />
        </div>
        
        <p className={styles.countdownMessage}>
          {eventData.groom_name || '민호'} 
          <span className={styles.heartText}> ♥ </span>
          {eventData.bride_name || '하윤'}의 결혼식이{' '}
          <span className={styles.countdownDays}>{timeLeft.days}일</span> 남았습니다
        </p>
      </section>

      {/* 신랑신부 카드 */}
      <section className={styles.coupleSection}>
        <h2 className={styles.coupleTitle}>Meet the Couple</h2>
        
        <div className={styles.coupleCards}>
          {/* 신부 카드 */}
          <div className={styles.coupleCard}>
            <div className={styles.couplePhoto}>
              {safeImages.bride[0] ? (
                <img 
                  src={getImageSrc(safeImages.bride[0])} 
                  alt="신부"
                  onError={(e) => {
                    console.error('신부 이미지 로딩 실패:', getImageSrc(safeImages.bride[0]));
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.photoPlaceholder}>👰</div>
              )}
            </div>
            <span className={styles.coupleRole}>신부</span>
            <h3 className={styles.coupleName}>{eventData.bride_name || '배하윤'}</h3>
            <p className={styles.coupleEngName}>{brideEnglishName}</p>
            <p className={styles.coupleParents}>
              {eventData.bride_father_name || '배종영'} · {eventData.bride_mother_name || '유미연'}의 딸
            </p>
          </div>
          
          {/* 신랑 카드 */}
          <div className={styles.coupleCard}>
            <div className={styles.couplePhoto}>
              {safeImages.groom[0] ? (
                <img 
                  src={getImageSrc(safeImages.groom[0])} 
                  alt="신랑"
                  onError={(e) => {
                    console.error('신랑 이미지 로딩 실패:', getImageSrc(safeImages.groom[0]));
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                <div className={styles.photoPlaceholder}>🤵</div>
              )}
            </div>
            <span className={styles.coupleRole}>신랑</span>
            <h3 className={styles.coupleName}>{eventData.groom_name || '이민호'}</h3>
            <p className={styles.coupleEngName}>{groomEnglishName}</p>
            <p className={styles.coupleParents}>
              {eventData.groom_father_name || '이상현'} · {eventData.groom_mother_name || '김미정'}의 아들
            </p>
          </div>
        </div>
      </section>

      {/* 축의금 전달 섹션 */}
      <section className={styles.giftSection}>
        <div className={styles.giftHeader}>
          <h2 className={styles.giftTitle}>축의금 전달</h2>
          <p className={styles.giftSubtitle}>따뜻한 마음을 함께 나누어주세요</p>
        </div>
        
        <div className={styles.giftDescription}>
          <p className={styles.giftDescriptionText}>
            축복의 마음을 담은 소중한 마음,<br />
            이렇게 전할 수 있어요
          </p>
        </div>

        {/* 토글 버튼 */}
        <div className={styles.toggleContainer}>
          <div className={styles.toggleButtons}>
            <button 
              className={`${styles.toggleButton} ${activeAccountToggle === 'groom' ? styles.toggleButtonActive : ''}`}
              onClick={() => handleAccountToggle('groom')}
            >
              신랑측
            </button>
            <button 
              className={`${styles.toggleButton} ${activeAccountToggle === 'bride' ? styles.toggleButtonActive : ''}`}
              onClick={() => handleAccountToggle('bride')}
            >
              신부측
            </button>
          </div>
        </div>
        
        <div className={styles.accountsContainer}>
          {/* 신랑측 계좌 */}
          {activeAccountToggle === 'groom' && (additionalInfo?.groom_account_number || 
            additionalInfo?.groom_father_account_number || 
            additionalInfo?.groom_mother_account_number) && (
            <div className={styles.accountGroup}>
              <div className={styles.accountCards}>
                {additionalInfo?.groom_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.groom_name || '신랑'}</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
                
                {additionalInfo?.groom_father_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_father_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.groom_father_name || '신랑'} 아버님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_father_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_father_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
                
                {additionalInfo?.groom_mother_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.groom_mother_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.groom_mother_name || '신랑'} 어머님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.groom_mother_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.groom_mother_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* 신부측 계좌 */}
          {activeAccountToggle === 'bride' && (additionalInfo?.bride_account_number || 
            additionalInfo?.bride_father_account_number || 
            additionalInfo?.bride_mother_account_number) && (
            <div className={styles.accountGroup}>
              <div className={styles.accountCards}>
                {additionalInfo?.bride_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.bride_name || '신부'}</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
                
                {additionalInfo?.bride_father_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_father_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.bride_father_name || '신부'} 아버님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_father_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_father_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
                
                {additionalInfo?.bride_mother_account_number && (
                  <div className={styles.accountCard} onClick={() => copyAccount(additionalInfo.bride_mother_account_number)}>
                    <div className={styles.accountInfo}>
                      <div className={styles.accountName}>{eventData.bride_mother_name || '신부'} 어머님</div>
                      <div className={styles.bankInfo}>
                        <span className={styles.bankName}>{additionalInfo.bride_mother_bank_name || '은행'}</span>
                        <span className={styles.accountNumber}>{additionalInfo.bride_mother_account_number}</span>
                      </div>
                    </div>
                    <div className={styles.copyButton}>
                      <span className={styles.copyIcon}>복사</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 방명록 섹션 */}
      <section className={styles.messagesSection}>
        <h2 className={styles.locationTitle}>Messages</h2>
        
        {/* 방명록 메시지 목록 */}
        <div className={styles.messagesList}>
          {(!hasRealMessages && guestMessages?.length === 0) ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '40px 20px',
              backgroundColor: 'white',
              borderRadius: '15px',
              marginBottom: '20px'
            }}>
              <div style={{ fontSize: '48px', color: '#DDD', marginBottom: '12px' }}>💬</div>
              <p style={{ fontSize: '16px', color: '#999', margin: '0 0 8px 0' }}>
                아직 축하 메시지가 없습니다
              </p>
            </div>
          ) : (
            currentMessages.map((message, index) => (
              <div key={index} style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '25px',
                marginBottom: '20px',
                boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <span style={{ color: '#999', fontSize: '13px' }}>
                    From. {message.from}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {canEditMessage(message) && (
                      <button
                        onClick={() => handleEditMessage(message)}
                        style={{
                          backgroundColor: '#3182f6',
                          color: 'white',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          padding: '4px 12px',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#2563eb';
                          e.target.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#3182f6';
                          e.target.style.transform = 'translateY(0)';
                        }}
                      >
                        수정
                      </button>
                    )}
                    <span style={{ color: '#DDD', fontSize: '12px' }}>
                      {message.date}
                    </span>
                  </div>
                </div>
                <div style={{
                  lineHeight: '24px',
                  color: '#555',
                  fontSize: '14px'
                }}>
                  {message.content ? message.content.split('\n').map((line, lineIndex) => (
                    <span key={lineIndex}>
                      {line}
                      {lineIndex < message.content.split('\n').length - 1 && <br />}
                    </span>
                  )) : ''}
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* 페이지네이션 */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '20px',
            margin: '30px 0'
          }}>
            <button 
              onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
              disabled={currentPage === 0}
              style={{
                backgroundColor: 'transparent',
                color: currentPage === 0 ? '#DDD' : '#9B8D82',
                border: 'none',
                fontSize: '20px',
                cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: currentPage === 0 ? 0.3 : 1
              }}
            >
              ‹
            </button>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  style={{
                    width: currentPage === i ? '24px' : '8px',
                    height: '8px',
                    backgroundColor: currentPage === i ? '#9B8D82' : '#E0D5D1',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    padding: 0
                  }}
                  aria-label={`페이지 ${i + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
              disabled={currentPage === totalPages - 1}
              style={{
                backgroundColor: 'transparent',
                color: currentPage === totalPages - 1 ? '#DDD' : '#9B8D82',
                border: 'none',
                fontSize: '20px',
                cursor: currentPage === totalPages - 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                opacity: currentPage === totalPages - 1 ? 0.3 : 1
              }}
            >
              ›
            </button>
          </div>
        )}
        
        {/* 방명록 작성 버튼 */}
        <button 
          className={styles.navigationButton} 
          onClick={handleGuestbookModalOpen}
          disabled={showGuestbookModal}
        >
          방명록 남기기
        </button>
      </section>

      {/* 오시는 길 */}
      <section className={styles.locationSection}>
        <h2 className={styles.locationTitle}>Location</h2>
        
        <div className={styles.venueInfo}>
          <p className={styles.venueName}>
            {eventData.location || '더 플라자 지스텀하우스 22층'}
          </p>
          <p className={styles.venueAddress}>
            {eventData.detailed_address || eventData.detailedAddress || '서울시 중구 소공로 119'}
          </p>
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
          <div className={styles.transportIcon}>
            <span>🅿️</span>
          </div>
          <div className={styles.transportContent}>
            <h4 className={styles.transportTitle}>주차 안내</h4>
            <p className={styles.transportText}>
              {eventData.parking_info || eventData.parkingInfo || 
               '더 플라자 호텔 주차장 이용\n하객 3시간 무료 주차\n주차 요원의 안내를 받아주세요'}
            </p>
          </div>
        </div>
        
      </section>

      {/* 공유 섹션 */}
      <section className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          <div className={styles.shareButtonGradient}>
            <span className={styles.shareIcon}>💌</span>
            <span className={styles.shareButtonText}>청첩장 공유하기</span>
          </div>
        </button>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <h3 className={styles.footerTitle}>Thank You</h3>
          <div className={styles.footerDivider}></div>
          <p className={styles.footerMessage}>
            저희의 새로운 시작을 축복해주셔서<br />
            진심으로 감사드립니다
          </p>
        </div>
      </footer>

      {/* 이미지 뷰어 모달 */}
      {showImageViewer && (
        <div className={styles.imageViewerModal} onClick={() => setShowImageViewer(false)}>
          <div className={styles.imageViewerContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.closeButton}
              onClick={() => setShowImageViewer(false)}
            >
              ×
            </button>
            <div className={styles.imageViewerSlider}>
              {allImages[currentImageIndex] && (
                <img 
                  src={getImageSrc(allImages[currentImageIndex])} 
                  alt={`이미지 ${currentImageIndex + 1}`}
                  className={styles.viewerImage}
                />
              )}
            </div>
            <div className={styles.imageViewerNavigation}>
              <button 
                className={styles.navButton}
                onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : allImages.length - 1)}
              >
                ‹
              </button>
              <span className={styles.imageCounter}>
                {currentImageIndex + 1} / {allImages.length}
              </span>
              <button 
                className={styles.navButton}
                onClick={() => setCurrentImageIndex(prev => prev < allImages.length - 1 ? prev + 1 : 0)}
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 방명록 작성 모달 */}
      <GuestbookModal
        isOpen={showGuestbookModal}
        onClose={handleGuestbookModalClose}
        onSubmit={handleGuestbookSubmit}
        eventData={eventData}
        onTriggerArrival={handleTriggerArrival}
      />

      {/* 방명록 수정 모달 */}
      <EditGuestbookModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingMessage(null);
        }}
        message={editingMessage}
        eventData={eventData}
        onUpdate={handleEditUpdate}
        onDelete={handleEditDelete}
      />

      {/* 결혼식장 도착 확인 모달 */}
      <ArrivalConfirmModal
        isOpen={showArrivalModal}
        onClose={handleArrivalModalClose}
        onConfirm={handleArrivalConfirm}
        eventData={eventData}
      />

      {/* 축의금 입력 모달 */}
      <ContributionModal
        isOpen={showContributionModal}
        onClose={() => setShowContributionModal(false)}
        onSubmit={handleContributionSubmit}
        eventData={eventData}
      />

      {/* 축의금 완료 모달 */}
      <CompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          setContributionData(null);
        }}
        contributionData={contributionData}
        eventData={eventData}
      />
    </div>
  );
};

export default RomanticPinkTemplate;