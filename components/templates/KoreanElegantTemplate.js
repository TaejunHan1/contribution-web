// components/templates/KoreanElegantTemplate.js
import React, { useState, useRef, useEffect } from 'react';
import styles from './KoreanElegantTemplate.module.css';

const KoreanElegantTemplate = ({ eventData = {}, categorizedImages = {} }) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  
  // 이미지 안전하게 가져오기
  const safeImages = {
    main: categorizedImages?.main || [],
    gallery: categorizedImages?.gallery || [],
    groom: categorizedImages?.groom || [],
    bride: categorizedImages?.bride || [],
  };

  // 날짜 포맷팅
  const formatDate = (date) => {
    if (!date) return {};
    const d = new Date(date);
    return {
      year: d.getFullYear() + '년',
      month: (d.getMonth() + 1) + '월',
      day: d.getDate() + '일',
      dayOfWeek: ['일', '월', '화', '수', '목', '금', '토'][d.getDay()],
      full: `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
    };
  };

  const dateInfo = formatDate(eventData.event_date || eventData.date);
  const ceremonyTime = eventData.ceremony_time || '오후 2시';
  const receptionTime = eventData.reception_time || '오후 3시';

  // 카운트다운 계산
  const calculateTimeLeft = () => {
    const eventDate = new Date(eventData.event_date || eventData.date);
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
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  // 슬라이드쇼
  useEffect(() => {
    if (safeImages.main.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % safeImages.main.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [safeImages.main.length]);

  const handleCall = (phoneNumber) => {
    if (phoneNumber) {
      window.location.href = `tel:${phoneNumber}`;
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: '모바일 청첩장',
      text: `${eventData.groom_name} ♥ ${eventData.bride_name} 결혼식에 초대합니다!\n${dateInfo.full} ${ceremonyTime}\n${eventData.location}`,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('링크가 클립보드에 복사되었습니다.');
      }
    } catch (error) {
      console.log('Share error:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* 꽃잎 애니메이션 */}
      <div className={styles.petalsContainer}>
        {[...Array(15)].map((_, i) => (
          <div 
            key={i} 
            className={styles.petal}
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${8 + i}s`
            }}
          >
            🌸
          </div>
        ))}
      </div>

      {/* 메인 헤더 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          {/* 메인 사진 슬라이드쇼 */}
          <div className={styles.mainPhotoContainer}>
            {safeImages.main.length > 0 ? (
              <div className={styles.slideshow}>
                {safeImages.main.map((image, index) => (
                  <img
                    key={index}
                    src={image.uri || image}
                    alt="Wedding"
                    className={`${styles.slideshowImage} ${index === currentSlideIndex ? styles.active : ''}`}
                  />
                ))}
              </div>
            ) : (
              <div className={styles.placeholderImage}>
                <span>👰🤵</span>
              </div>
            )}
          </div>

          {/* 신랑신부 이름 */}
          <div className={styles.namesContainer}>
            <span className={styles.groomName}>{eventData.groom_name || '신랑'}</span>
            <span className={styles.heartIcon}>💕</span>
            <span className={styles.brideName}>{eventData.bride_name || '신부'}</span>
          </div>

          {/* 날짜 정보 */}
          <div className={styles.dateContainer}>
            <div className={styles.dateYear}>{dateInfo.year}</div>
            <div className={styles.dateMonthDay}>{dateInfo.month} {dateInfo.day}</div>
            <div className={styles.dateDayOfWeek}>{dateInfo.dayOfWeek}요일</div>
            <div className={styles.dateTime}>{ceremonyTime}</div>
          </div>
        </div>
      </section>

      {/* 카운트다운 섹션 */}
      <section className={styles.countdownSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.decorativeLine}></div>
          <h2 className={styles.sectionTitle}>D-Day</h2>
          <div className={styles.decorativeLine}></div>
        </div>

        {!timeLeft.isExpired ? (
          <div className={styles.countdownGrid}>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber}>{timeLeft.days}</span>
              <span className={styles.countdownLabel}>일</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber}>{timeLeft.hours}</span>
              <span className={styles.countdownLabel}>시간</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber}>{timeLeft.minutes}</span>
              <span className={styles.countdownLabel}>분</span>
            </div>
            <div className={styles.countdownItem}>
              <span className={styles.countdownNumber}>{timeLeft.seconds}</span>
              <span className={styles.countdownLabel}>초</span>
            </div>
          </div>
        ) : (
          <div className={styles.expiredMessage}>
            💕 행복한 결혼식이 되었기를 바랍니다 💕
          </div>
        )}

        {/* 달력 */}
        <div className={styles.calendarSection}>
          <div className={styles.calendar}>
            <div className={styles.calendarHeader}>
              {dateInfo.year} {dateInfo.month}
            </div>
            <div className={styles.calendarBody}>
              {/* 간단한 달력 표시 */}
              <div className={styles.weddingDate}>
                <span className={styles.weddingDateDay}>{dateInfo.day}</span>
                <span className={styles.weddingDateLabel}>Wedding Day</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.messageSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.decorativeLine}></div>
          <h2 className={styles.sectionTitle}>인사말</h2>
          <div className={styles.decorativeLine}></div>
        </div>
        
        <p className={styles.customMessage}>
          {eventData.custom_message || 
           '두 사람이 하나 되어 새로운 인생을 시작하려 합니다.\n저희의 소중한 첫걸음에 함께해 주시면 더없는 기쁨이겠습니다.'}
        </p>
      </section>

      {/* 신랑신부 소개 */}
      <section className={styles.coupleSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.decorativeLine}></div>
          <h2 className={styles.sectionTitle}>신랑 · 신부</h2>
          <div className={styles.decorativeLine}></div>
        </div>

        <div className={styles.coupleGrid}>
          {/* 신랑 정보 */}
          <div className={styles.personCard}>
            <div className={styles.personPhotoContainer}>
              {safeImages.groom[0] ? (
                <img src={safeImages.groom[0].uri || safeImages.groom[0]} alt="신랑" className={styles.personPhoto} />
              ) : (
                <div className={styles.personPhotoPlaceholder}>🤵</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.groom_name || '신랑'}</h3>
            <p className={styles.personRole}>신랑</p>
            <p className={styles.parentNames}>
              {eventData.groom_father_name || '○○○'} · {eventData.groom_mother_name || '○○○'}의 장남
            </p>
            <button className={styles.contactButton} onClick={() => handleCall(eventData.groom_contact)}>
              📞 연락하기
            </button>
          </div>

          {/* 신부 정보 */}
          <div className={styles.personCard}>
            <div className={styles.personPhotoContainer}>
              {safeImages.bride[0] ? (
                <img src={safeImages.bride[0].uri || safeImages.bride[0]} alt="신부" className={styles.personPhoto} />
              ) : (
                <div className={styles.personPhotoPlaceholder}>👰</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.bride_name || '신부'}</h3>
            <p className={styles.personRole}>신부</p>
            <p className={styles.parentNames}>
              {eventData.bride_father_name || '○○○'} · {eventData.bride_mother_name || '○○○'}의 장녀
            </p>
            <button className={styles.contactButton} onClick={() => handleCall(eventData.bride_contact)}>
              📞 연락하기
            </button>
          </div>
        </div>
      </section>

      {/* 예식 정보 */}
      <section className={styles.weddingInfoSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.decorativeLine}></div>
          <h2 className={styles.sectionTitle}>예식 정보</h2>
          <div className={styles.decorativeLine}></div>
        </div>

        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>📅</div>
            <div className={styles.infoContent}>
              <p className={styles.infoLabel}>예식일시</p>
              <p className={styles.infoValue}>{dateInfo.full}</p>
              <p className={styles.infoSubValue}>
                예식 {ceremonyTime} | 피로연 {receptionTime}
              </p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>📍</div>
            <div className={styles.infoContent}>
              <p className={styles.infoLabel}>예식장소</p>
              <p className={styles.infoValue}>{eventData.location || '웨딩홀'}</p>
              <p className={styles.infoSubValue}>{eventData.detailed_address || '상세 주소'}</p>
            </div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoIcon}>🚗</div>
            <div className={styles.infoContent}>
              <p className={styles.infoLabel}>주차안내</p>
              <p className={styles.infoValue}>{eventData.parking_info || '주차 가능'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.decorativeLine}></div>
            <h2 className={styles.sectionTitle}>Gallery</h2>
            <div className={styles.decorativeLine}></div>
          </div>

          <div className={styles.galleryGrid}>
            {safeImages.gallery.map((image, index) => (
              <div key={index} className={styles.galleryItem}>
                <img src={image.uri || image} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 오시는 길 */}
      <section className={styles.locationSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.decorativeLine}></div>
          <h2 className={styles.sectionTitle}>오시는 길</h2>
          <div className={styles.decorativeLine}></div>
        </div>

        <div className={styles.mapContainer}>
          <div className={styles.mapPlaceholder}>
            🗺️ 지도 영역
            <p>{eventData.location}</p>
            <p>{eventData.detailed_address}</p>
          </div>
        </div>

        <div className={styles.locationButtons}>
          <button className={styles.locationButton}>
            📍 길찾기
          </button>
          <button className={styles.locationButtonSecondary}>
            📋 주소복사
          </button>
        </div>
      </section>

      {/* 공유 섹션 */}
      <section className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          <span>💌</span>
          <span>청첩장 공유하기</span>
        </button>
      </section>

      {/* 마무리 메시지 */}
      <footer className={styles.footerSection}>
        <p className={styles.footerMessage}>
          소중한 분들과 함께하는<br />
          행복한 시간이 되길 바랍니다.
        </p>
        <p className={styles.footerNames}>
          {eventData.groom_name || '신랑'} ♥ {eventData.bride_name || '신부'}
        </p>
        <p className={styles.footerDate}>{dateInfo.full}</p>
      </footer>
    </div>
  );
};

export default KoreanElegantTemplate;