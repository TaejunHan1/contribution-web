// components/templates/ModernMinimalTemplate.js
import React, { useState, useEffect } from 'react';
import styles from './ModernMinimalTemplate.module.css';

const ModernMinimalTemplate = ({ eventData = {}, categorizedImages = {} }) => {
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
    const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    return {
      year: d.getFullYear(),
      month: months[d.getMonth()],
      day: String(d.getDate()).padStart(2, '0'),
      dayOfWeek: days[d.getDay()],
      full: `${d.getFullYear()}.${months[d.getMonth()]}.${String(d.getDate()).padStart(2, '0')}`
    };
  };

  const dateInfo = formatDate(eventData.event_date || eventData.date);
  const ceremonyTime = eventData.ceremony_time || '14:00';
  const receptionTime = eventData.reception_time || '15:00';

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
        isExpired: false
      };
    }
    return { days: 0, hours: 0, minutes: 0, isExpired: true };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // 1분마다 업데이트

    return () => clearTimeout(timer);
  }, [timeLeft]);

  // 슬라이드쇼
  useEffect(() => {
    if (safeImages.main.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % safeImages.main.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [safeImages.main.length]);

  const handleShare = async () => {
    const shareData = {
      title: 'Wedding Invitation',
      text: `${eventData.groom_name} & ${eventData.bride_name}\n${dateInfo.full}\n${eventData.location}`,
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
      console.log('Share error:', error);
    }
  };

  return (
    <div className={styles.container}>
      {/* 헤더 네비게이션 */}
      <nav className={styles.navigation}>
        <div className={styles.navItem}>HOME</div>
        <div className={styles.navDivider}>|</div>
        <div className={styles.navItem}>GALLERY</div>
        <div className={styles.navDivider}>|</div>
        <div className={styles.navItem}>LOCATION</div>
      </nav>

      {/* 메인 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroOverlay}></div>
        
        {/* 메인 이미지 배경 */}
        {safeImages.main.length > 0 && (
          <div className={styles.heroBackground}>
            {safeImages.main.map((image, index) => (
              <div
                key={index}
                className={`${styles.heroImage} ${index === currentSlideIndex ? styles.active : ''}`}
                style={{ backgroundImage: `url(${image.uri || image})` }}
              />
            ))}
          </div>
        )}

        <div className={styles.heroContent}>
          <div className={styles.heroDate}>
            {dateInfo.year} | {dateInfo.month} | {dateInfo.day}
          </div>
          <h1 className={styles.heroNames}>
            <span className={styles.groomName}>{eventData.groom_name || 'GROOM'}</span>
            <span className={styles.ampersand}>&</span>
            <span className={styles.brideName}>{eventData.bride_name || 'BRIDE'}</span>
          </h1>
          <div className={styles.heroSubtitle}>WE ARE GETTING MARRIED</div>
        </div>

        <div className={styles.scrollIndicator}>
          <div className={styles.scrollLine}></div>
          <div className={styles.scrollText}>SCROLL</div>
        </div>
      </section>

      {/* 카운트다운 섹션 */}
      <section className={styles.countdownSection}>
        <div className={styles.countdownContent}>
          {!timeLeft.isExpired ? (
            <>
              <h2 className={styles.countdownTitle}>SAVE THE DATE</h2>
              <div className={styles.countdownGrid}>
                <div className={styles.countdownBlock}>
                  <div className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>DAYS</div>
                </div>
                <div className={styles.countdownBlock}>
                  <div className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>HOURS</div>
                </div>
                <div className={styles.countdownBlock}>
                  <div className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>MINUTES</div>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.marriedMessage}>
              <h2 className={styles.countdownTitle}>JUST MARRIED</h2>
              <p className={styles.marriedText}>Thank you for celebrating with us</p>
            </div>
          )}
        </div>
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.messageSection}>
        <div className={styles.messageContent}>
          <div className={styles.quoteMark}>"</div>
          <p className={styles.message}>
            {eventData.custom_message || 
             'Two souls, one heart.\nJoin us as we begin our journey together.'}
          </p>
          <div className={styles.quoteMark}>"</div>
        </div>
      </section>

      {/* 이벤트 정보 그리드 */}
      <section className={styles.infoSection}>
        <div className={styles.infoGrid}>
          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📅</div>
            <h3 className={styles.infoTitle}>WHEN</h3>
            <p className={styles.infoMain}>{dateInfo.full}</p>
            <p className={styles.infoSub}>{dateInfo.dayOfWeek}</p>
            <p className={styles.infoDetail}>
              Ceremony {ceremonyTime}<br />
              Reception {receptionTime}
            </p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>📍</div>
            <h3 className={styles.infoTitle}>WHERE</h3>
            <p className={styles.infoMain}>{eventData.location || 'Wedding Hall'}</p>
            <p className={styles.infoSub}>{eventData.detailed_address || ''}</p>
          </div>

          <div className={styles.infoCard}>
            <div className={styles.infoIcon}>🚗</div>
            <h3 className={styles.infoTitle}>PARKING</h3>
            <p className={styles.infoMain}>{eventData.parking_info || 'Available'}</p>
          </div>
        </div>
      </section>

      {/* 신랑신부 소개 */}
      <section className={styles.coupleSection}>
        <h2 className={styles.sectionTitle}>MEET THE COUPLE</h2>
        <div className={styles.coupleGrid}>
          <div className={styles.personCard}>
            <div className={styles.personImageContainer}>
              {safeImages.groom[0] ? (
                <img src={safeImages.groom[0].uri || safeImages.groom[0]} alt="Groom" className={styles.personImage} />
              ) : (
                <div className={styles.personPlaceholder}>👔</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.groom_name || 'GROOM'}</h3>
            <p className={styles.personParents}>
              Son of {eventData.groom_father_name || 'Mr.'} & {eventData.groom_mother_name || 'Mrs.'}
            </p>
          </div>

          <div className={styles.coupleAnd}>&</div>

          <div className={styles.personCard}>
            <div className={styles.personImageContainer}>
              {safeImages.bride[0] ? (
                <img src={safeImages.bride[0].uri || safeImages.bride[0]} alt="Bride" className={styles.personImage} />
              ) : (
                <div className={styles.personPlaceholder}>👗</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.bride_name || 'BRIDE'}</h3>
            <p className={styles.personParents}>
              Daughter of {eventData.bride_father_name || 'Mr.'} & {eventData.bride_mother_name || 'Mrs.'}
            </p>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <h2 className={styles.sectionTitle}>OUR MOMENTS</h2>
          <div className={styles.galleryGrid}>
            {safeImages.gallery.slice(0, 6).map((image, index) => (
              <div key={index} className={styles.galleryItem}>
                <img src={image.uri || image} alt={`Gallery ${index + 1}`} />
                <div className={styles.galleryOverlay}>
                  <span className={styles.galleryNumber}>{String(index + 1).padStart(2, '0')}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 지도 섹션 */}
      <section className={styles.locationSection}>
        <h2 className={styles.sectionTitle}>LOCATION</h2>
        <div className={styles.mapContainer}>
          <div className={styles.mapPlaceholder}>
            <div className={styles.mapIcon}>📍</div>
            <p className={styles.mapLocation}>{eventData.location}</p>
            <p className={styles.mapAddress}>{eventData.detailed_address}</p>
          </div>
          <div className={styles.mapButtons}>
            <button className={styles.mapButton}>GET DIRECTIONS</button>
            <button className={styles.mapButtonOutline}>COPY ADDRESS</button>
          </div>
        </div>
      </section>

      {/* RSVP 섹션 */}
      <section className={styles.rsvpSection}>
        <div className={styles.rsvpContent}>
          <h2 className={styles.rsvpTitle}>RSVP</h2>
          <p className={styles.rsvpText}>
            Your presence is the greatest gift of all
          </p>
          <button className={styles.shareButton} onClick={handleShare}>
            SHARE INVITATION
          </button>
        </div>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerNames}>
            {eventData.groom_name || 'GROOM'} & {eventData.bride_name || 'BRIDE'}
          </div>
          <div className={styles.footerDate}>{dateInfo.full}</div>
          <div className={styles.footerDivider}>―</div>
          <div className={styles.footerMessage}>SEE YOU THERE</div>
        </div>
      </footer>
    </div>
  );
};

export default ModernMinimalTemplate;