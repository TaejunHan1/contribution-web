// components/templates/ElegantGardenTemplate.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './ElegantGardenTemplate.module.css';

// 꽃잎 떨어지는 애니메이션 컴포넌트 (모바일과 동일)
const FallingFlowers = () => {
  const [flowersSet1] = useState(() => 
    [...Array(12)].map((_, index) => ({ 
      id: `set1-${index}`,
      left: Math.random() * 100,
      delay: index * 300,
      size: Math.random() * 40 + 35,
      type: ['🌸', '🌺', '🌻', '🌷'][index % 4],
      duration: 7000 + Math.random() * 2000,
    }))
  );

  const [flowersSet2] = useState(() => 
    [...Array(12)].map((_, index) => ({ 
      id: `set2-${index}`,
      left: Math.random() * 100,
      delay: 3500 + (index * 300),
      size: Math.random() * 40 + 35,
      type: ['🌸', '🌺', '🌻', '🌷'][index % 4],
      duration: 7000 + Math.random() * 2000,
    }))
  );

  return (
    <div className={styles.fallingFlowersContainer}>
      {flowersSet1.map((flower) => (
        <div
          key={flower.id}
          className={styles.fallingFlower}
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.delay}ms`,
            animationDuration: `${flower.duration}ms`,
            fontSize: `${flower.size}px`
          }}
        >
          {flower.type}
        </div>
      ))}
      {flowersSet2.map((flower) => (
        <div
          key={flower.id}
          className={styles.fallingFlower}
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.delay}ms`,
            animationDuration: `${flower.duration}ms`,
            fontSize: `${flower.size}px`
          }}
        >
          {flower.type}
        </div>
      ))}
    </div>
  );
};

// 섹션 타이틀 꽃 배경 컴포넌트
const FlowerSectionTitle = ({ title, subtitle }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // 배경 이미지들 (실제로는 꽃 이미지 경로를 사용)
  const backgroundImages = [
    '/images/flowers/invitation1.png',
    '/images/flowers/invitation2.png', 
    '/images/flowers/invitation3.png',
    '/images/flowers/invitation4.png'
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % backgroundImages.length);
    }, 4000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.sectionTitleContainer}>
      {backgroundImages.map((image, index) => (
        <div
          key={index}
          className={`${styles.sectionTitleBg} ${index === currentImageIndex ? styles.active : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        />
      ))}
      <div className={styles.sectionTitleOverlay}>
        <h2 className={styles.sectionTitle}>{title}</h2>
        <p className={styles.sectionSubtitle}>{subtitle}</p>
      </div>
    </div>
  );
};

// 엘레강트 달력 컴포넌트
const ElegantCalendar = ({ targetDate }) => {
  const date = new Date(targetDate);
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const firstDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                  'July', 'August', 'September', 'October', 'November', 'December'];
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
    <div className={styles.calendarContainer}>
      <h3 className={styles.calendarMonth}>{months[month]} {year}</h3>
      
      <div className={styles.calendarWeekDays}>
        {weekDays.map((weekDay, index) => (
          <span key={index} className={`${styles.calendarWeekDay} ${index === 0 ? styles.calendarSunday : ''}`}>
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
              <span className={`${styles.calendarDay} ${!dayData.isCurrentMonth ? styles.calendarDayInactive : ''} ${index % 7 === 0 ? styles.calendarSundayText : ''}`}>
                {dayData.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ElegantGardenTemplate = ({ eventData = {}, categorizedImages = {} }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);
  const [showAccountDetails, setShowAccountDetails] = useState({});
  
  // 이미지 안전하게 가져오기
  const safeImages = {
    main: categorizedImages?.main || [],
    gallery: categorizedImages?.gallery || [],
    groom: categorizedImages?.groom || [],
    bride: categorizedImages?.bride || [],
  };

  // 인사말 문구 목록 (모바일과 동일)
  const GREETING_MESSAGES = [
    `두 사람이 사랑으로 만나
진실과 이해로 하나를 이루고
미래를 약속하게 되었습니다.

저희의 새로운 시작을
축복해 주시면 감사하겠습니다.`,

    `서로 다른 길을 걸어온 두 사람이
이제 하나의 길을 함께 걷고자 합니다.

따뜻한 격려와 축복 속에서
더욱 행복한 가정을 이루겠습니다.`,

    `사랑하는 마음 하나로 시작하여
서로를 이해하는 지혜를 배우고
함께 성장하는 기쁨을 누리며
영원히 함께하겠습니다.`
  ];

  const [selectedGreeting] = useState(() => Math.floor(Math.random() * GREETING_MESSAGES.length));

  // 날짜 포맷팅 함수들 (모바일과 동일)
  const formatKoreanDate = (dateStr) => {
    if (!dateStr) return { full: '2025년 6월 14일 토요일' };
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return { full: '2025년 6월 14일 토요일' };
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const days = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayOfWeek = days[date.getDay()];
    
    return {
      year: year.toString(),
      month: month.toString(),
      day: day.toString(),
      dayOfWeek,
      full: `${year}년 ${month}월 ${day}일 ${dayOfWeek}`
    };
  };

  const formatKoreanTime = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return '오후 3:00';
    
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours) || 15;
    const min = minutes || '00';
    const ampm = hour >= 12 ? '오후' : '오전';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${ampm} ${hour12}:${min}`;
  };

  const formatDateDisplay = () => {
    const dateStr = eventData.date || eventData.event_date || '2025-06-14';
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) {
      return '2025. 06. 14 FRI';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const dayOfWeek = days[date.getDay()];
    return `${year}. ${month}. ${day} ${dayOfWeek}`;
  };

  const formatTimeDisplay = () => {
    const timeStr = eventData.ceremonyTime || eventData.ceremony_time || '15:00';
    
    if (typeof timeStr !== 'string') {
      return '3:00 PM';
    }
    
    const timeParts = timeStr.split(':');
    if (timeParts.length < 2) {
      return '3:00 PM';
    }
    
    const [hours, minutes] = timeParts;
    const hour = parseInt(hours) || 15;
    const min = minutes || '00';
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
    return `${hour12}:${min} ${ampm}`;
  };

  const dateInfo = formatKoreanDate(eventData.date || eventData.event_date || '2025-06-14');
  const ceremonyTime = formatKoreanTime(eventData.ceremonyTime || eventData.ceremony_time || '15:00');

  // 카운트다운 계산
  const calculateTimeLeft = () => {
    const dateStr = eventData.date || eventData.event_date || '2025-06-14';
    const timeStr = eventData.ceremonyTime || eventData.ceremony_time || '15:00';
    
    const eventDate = new Date(dateStr + 'T' + timeStr);
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

  // 메인 이미지 슬라이드쇼
  useEffect(() => {
    if (safeImages.main.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % safeImages.main.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [safeImages.main.length]);

  // 갤러리 스크롤 핸들러
  const handleGalleryScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const itemWidth = e.target.offsetWidth * 0.75;
    const index = Math.round(scrollLeft / itemWidth);
    setCurrentGalleryIndex(index);
  };

  // 계좌 정보 토글
  const toggleAccount = (type) => {
    setShowAccountDetails(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // 클립보드 복사
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${type} 계좌번호가 복사되었습니다.`);
    }).catch(() => {
      alert('복사에 실패했습니다.');
    });
  };

  // 공유하기 함수
  const handleShare = async () => {
    try {
      const shareData = {
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 복사되었습니다.');
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* 꽃잎 떨어지는 애니메이션 */}
      <FallingFlowers />
      
      {/* 메인 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          {/* 메인 사진 슬라이드쇼 */}
          <div className={styles.mainPhotoSlideshow}>
            {safeImages.main.length > 0 ? (
              safeImages.main.map((image, index) => (
                <img
                  key={index}
                  src={image.uri || image}
                  alt="Wedding"
                  className={`${styles.heroImage} ${index === currentSlideIndex ? styles.active : ''}`}
                />
              ))
            ) : (
              <div className={styles.heroImagePlaceholder}>
                <span className={styles.placeholderIcon}>🌸</span>
              </div>
            )}
          </div>
          
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <div className={styles.heroTopInfo}>
                <span className={styles.heroDate}>{formatDateDisplay()}</span>
                <span className={styles.heroTime}>{formatTimeDisplay()}</span>
              </div>
              
              <h1 className={styles.heroMainText}>We're Getting Married</h1>
              
              <div className={styles.heroNamesContainer}>
                <span className={styles.heroName}>{eventData.groomName || eventData.groom_name || '신랑'}</span>
                <span className={styles.heroName}>{eventData.brideName || eventData.bride_name || '신부'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Invitation 섹션 */}
      <section className={styles.invitationSection}>
        <div className={styles.sectionWrapper}>
          <FlowerSectionTitle title="Invitation" subtitle="초대합니다" />
        </div>
        
        <div className={styles.invitationContent}>
          <p className={styles.invitationText}>
            {eventData.customMessage || eventData.custom_message || GREETING_MESSAGES[selectedGreeting]}
          </p>
        </div>
        
        <div className={styles.parentsInfo}>
          <div className={styles.parentRow}>
            <span className={styles.parentNames}>
              {eventData.groomFatherName || eventData.groom_father_name || '아버지'} · {eventData.groomMotherName || eventData.groom_mother_name || '어머니'}
            </span>
            <span className={styles.parentRelation}>의 아들</span>
            <span className={styles.parentChild}>{eventData.groomName || eventData.groom_name || '신랑'}</span>
          </div>
          <div className={styles.parentRow}>
            <span className={styles.parentNames}>
              {eventData.brideFatherName || eventData.bride_father_name || '아버지'} · {eventData.brideMotherName || eventData.bride_mother_name || '어머니'}
            </span>
            <span className={styles.parentRelation}>의 딸</span>
            <span className={styles.parentChild}>{eventData.brideName || eventData.bride_name || '신부'}</span>
          </div>
        </div>
      </section>

      {/* Gallery 섹션 */}
      <section className={styles.gallerySection}>
        <div className={styles.gallerySectionWrapper}>
          <FlowerSectionTitle title="Gallery" subtitle="우리의 순간들" />
        </div>
        
        <div className={styles.galleryContainer}>
          <div className={styles.galleryScroll} onScroll={handleGalleryScroll}>
            {safeImages.gallery.map((image, index) => (
              <div key={index} className={styles.galleryItem}>
                <img
                  src={image.uri || image}
                  alt={`Gallery ${index + 1}`}
                  className={styles.galleryImage}
                />
              </div>
            ))}
          </div>
          
          {/* 페이지네이션 인디케이터 */}
          <div className={styles.galleryPagination}>
            {safeImages.gallery.map((_, index) => (
              <div
                key={index}
                className={`${styles.galleryDot} ${currentGalleryIndex === index ? styles.galleryDotActive : ''}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Wedding Day 섹션 */}
      <section className={styles.weddingDaySection}>
        <div className={styles.sectionWrapper}>
          <FlowerSectionTitle title="Wedding Day" subtitle="예식 일시" />
        </div>
        
        <ElegantCalendar targetDate={eventData.date || eventData.event_date || '2025-06-14'} />
        
        {/* D-Day 카운트다운 */}
        <div className={styles.countdownContainer}>
          {!timeLeft.isExpired ? (
            <>
              <h3 className={styles.countdownTitle}>D-{timeLeft.days}</h3>
              <div className={styles.countdownBoxes}>
                <div className={styles.countdownBox}>
                  <div className={styles.countdownValueWrapper}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.days).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={styles.countdownLabel}>Days</span>
                </div>
                <div className={styles.countdownBox}>
                  <div className={styles.countdownValueWrapper}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.hours).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={styles.countdownLabel}>Hours</span>
                </div>
                <div className={styles.countdownBox}>
                  <div className={styles.countdownValueWrapper}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.minutes).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={styles.countdownLabel}>Min</span>
                </div>
                <div className={styles.countdownBox}>
                  <div className={styles.countdownValueWrapper}>
                    <span className={styles.countdownValue}>
                      {String(timeLeft.seconds).padStart(2, '0')}
                    </span>
                  </div>
                  <span className={styles.countdownLabel}>Sec</span>
                </div>
              </div>
            </>
          ) : (
            <p className={styles.countdownExpired}>💐 Today is the Day 💐</p>
          )}
        </div>
      </section>

      {/* Location 섹션 */}
      <section className={styles.locationSection}>
        <div className={styles.sectionWrapper}>
          <FlowerSectionTitle title="Location" subtitle="오시는 길" />
        </div>
        
        <div className={styles.locationCard}>
          <h3 className={styles.locationName}>
            {eventData.location || '더 그린하우스 가든홀'}
          </h3>
          <p className={styles.locationAddress}>
            {eventData.detailedAddress || eventData.detailed_address || '서울시 강남구 영동대로 513'}
          </p>
          
          <button className={styles.mapButton}>
            <span className={styles.mapIcon}>🗺️</span>
            <span className={styles.mapButtonText}>지도 보기</span>
          </button>
          
          {eventData.parkingInfo && (
            <div className={styles.parkingInfo}>
              <span className={styles.parkingIcon}>🚗</span>
              <span className={styles.parkingText}>{eventData.parkingInfo}</span>
            </div>
          )}
        </div>
      </section>

      {/* Gift 섹션 */}
      <section className={styles.accountSection}>
        <div className={styles.sectionWrapper}>
          <FlowerSectionTitle title="Gift" subtitle="마음 전하실 곳" />
        </div>
        
        <div className={styles.accountCards}>
          <div className={styles.accountCard} onClick={() => toggleAccount('groom')}>
            <div className={styles.accountHeader}>
              <span className={styles.accountRole}>신랑측 계좌번호</span>
              <span className={styles.accountChevron}>
                {showAccountDetails.groom ? '▲' : '▼'}
              </span>
            </div>
            {showAccountDetails.groom && (
              <div className={styles.accountDetails}>
                <p className={styles.accountBank}>
                  {eventData.groomBank || eventData.groom_bank || '국민은행'}
                </p>
                <p className={styles.accountNumber}>
                  {eventData.groomAccount || eventData.groom_account || '123-456-789012'}
                </p>
                <p className={styles.accountHolder}>
                  예금주: {eventData.groomName || eventData.groom_name || '신랑'}
                </p>
                <button 
                  className={styles.copyButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(eventData.groomAccount || eventData.groom_account || '123-456-789012', '신랑측');
                  }}
                >
                  복사하기
                </button>
              </div>
            )}
          </div>
          
          <div className={styles.accountCard} onClick={() => toggleAccount('bride')}>
            <div className={styles.accountHeader}>
              <span className={styles.accountRole}>신부측 계좌번호</span>
              <span className={styles.accountChevron}>
                {showAccountDetails.bride ? '▲' : '▼'}
              </span>
            </div>
            {showAccountDetails.bride && (
              <div className={styles.accountDetails}>
                <p className={styles.accountBank}>
                  {eventData.brideBank || eventData.bride_bank || '신한은행'}
                </p>
                <p className={styles.accountNumber}>
                  {eventData.brideAccount || eventData.bride_account || '234-567-890123'}
                </p>
                <p className={styles.accountHolder}>
                  예금주: {eventData.brideName || eventData.bride_name || '신부'}
                </p>
                <button 
                  className={styles.copyButton}
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(eventData.brideAccount || eventData.bride_account || '234-567-890123', '신부측');
                  }}
                >
                  복사하기
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 푸터 섹션 */}
      <section className={styles.footerSection}>
        <div className={styles.footerContent}>
          <button className={styles.shareButton} onClick={handleShare}>
            <span className={styles.shareIcon}>📤</span>
            <span className={styles.shareButtonText}>청첩장 공유하기</span>
          </button>
          
          <div className={styles.footerDivider} />
          
          <h2 className={styles.footerTitle}>Thank You</h2>
          <p className={styles.footerMessage}>
            함께해 주시는 모든 분들께{'\n'}진심으로 감사드립니다
          </p>
        </div>
      </section>
    </div>
  );
};

export default ElegantGardenTemplate;
