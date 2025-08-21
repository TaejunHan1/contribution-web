// components/templates/VintageTemplate.js
import React, { useState, useEffect } from 'react';
import styles from './VintageTemplate.module.css';

const VintageTemplate = ({ eventData = {}, categorizedImages = {} }) => {
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
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    return {
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      day: d.getDate(),
      dayOfWeek: days[d.getDay()],
      monthName: months[d.getMonth()],
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
      {/* 빈티지 패턴 오버레이 */}
      <div className={styles.vintagePattern}></div>
      
      {/* 빈티지 프레임 */}
      <div className={styles.vintageFrame}>
        <div className={styles.frameCorner} data-position="top-left">✦</div>
        <div className={styles.frameCorner} data-position="top-right">✦</div>
        <div className={styles.frameCorner} data-position="bottom-left">✦</div>
        <div className={styles.frameCorner} data-position="bottom-right">✦</div>
      </div>

      {/* 메인 헤더 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.ornamentalHeader}>
          <div className={styles.ornament}>❦</div>
          <h1 className={styles.weddingTitle}>Wedding Invitation</h1>
          <div className={styles.ornament}>❦</div>
        </div>

        {/* 메인 사진 */}
        <div className={styles.mainPhotoContainer}>
          <div className={styles.photoFrame}>
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
                <span>💐</span>
              </div>
            )}
          </div>
          <div className={styles.photoCaption}>
            ~ Est. {dateInfo.year} ~
          </div>
        </div>

        {/* 신랑신부 이름 */}
        <div className={styles.namesSection}>
          <div className={styles.coupleNames}>
            <span className={styles.groomName}>{eventData.groom_name || '신랑'}</span>
            <span className={styles.ampersand}>&</span>
            <span className={styles.brideName}>{eventData.bride_name || '신부'}</span>
          </div>
          <div className={styles.subtitle}>invite you to celebrate their wedding</div>
        </div>

        {/* 날짜 정보 */}
        <div className={styles.dateSection}>
          <div className={styles.dateDivider}>♦ ♦ ♦</div>
          <div className={styles.dateDisplay}>
            <div className={styles.monthName}>{dateInfo.monthName}</div>
            <div className={styles.dayNumber}>{dateInfo.day}</div>
            <div className={styles.yearText}>{dateInfo.year}</div>
          </div>
          <div className={styles.timeText}>{ceremonyTime}</div>
          <div className={styles.dateDivider}>♦ ♦ ♦</div>
        </div>
      </section>

      {/* 카운트다운 섹션 */}
      <section className={styles.countdownSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.vintageLine}></div>
          <h2 className={styles.sectionTitle}>Save the Date</h2>
          <div className={styles.vintageLine}></div>
        </div>

        {!timeLeft.isExpired ? (
          <div className={styles.countdownContainer}>
            <div className={styles.countdownItem}>
              <div className={styles.countdownCircle}>
                <span className={styles.countdownNumber}>{timeLeft.days}</span>
              </div>
              <span className={styles.countdownLabel}>Days</span>
            </div>
            <div className={styles.countdownSeparator}>:</div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownCircle}>
                <span className={styles.countdownNumber}>{timeLeft.hours}</span>
              </div>
              <span className={styles.countdownLabel}>Hours</span>
            </div>
            <div className={styles.countdownSeparator}>:</div>
            <div className={styles.countdownItem}>
              <div className={styles.countdownCircle}>
                <span className={styles.countdownNumber}>{timeLeft.minutes}</span>
              </div>
              <span className={styles.countdownLabel}>Minutes</span>
            </div>
          </div>
        ) : (
          <div className={styles.celebrationMessage}>
            ✨ Celebrating Love ✨
          </div>
        )}
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.messageSection}>
        <div className={styles.quoteMark}>"</div>
        <p className={styles.customMessage}>
          {eventData.custom_message || 
           'Two souls with but a single thought,\nTwo hearts that beat as one.'}
        </p>
        <div className={styles.quoteMark}>"</div>
      </section>

      {/* 신랑신부 소개 */}
      <section className={styles.coupleSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.vintageLine}></div>
          <h2 className={styles.sectionTitle}>The Couple</h2>
          <div className={styles.vintageLine}></div>
        </div>

        <div className={styles.coupleCards}>
          {/* 신랑 카드 */}
          <div className={styles.personCard}>
            <div className={styles.personPhotoFrame}>
              {safeImages.groom[0] ? (
                <img src={safeImages.groom[0].uri || safeImages.groom[0]} alt="신랑" className={styles.personPhoto} />
              ) : (
                <div className={styles.personPhotoPlaceholder}>🤵</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.groom_name || '신랑'}</h3>
            <p className={styles.personTitle}>The Groom</p>
            <p className={styles.parentNames}>
              Son of {eventData.groom_father_name || 'Mr.'} & {eventData.groom_mother_name || 'Mrs.'}
            </p>
            <button className={styles.vintageButton} onClick={() => handleCall(eventData.groom_contact)}>
              Contact
            </button>
          </div>

          <div className={styles.coupleConnector}>
            <div className={styles.heartIcon}>♥</div>
          </div>

          {/* 신부 카드 */}
          <div className={styles.personCard}>
            <div className={styles.personPhotoFrame}>
              {safeImages.bride[0] ? (
                <img src={safeImages.bride[0].uri || safeImages.bride[0]} alt="신부" className={styles.personPhoto} />
              ) : (
                <div className={styles.personPhotoPlaceholder}>👰</div>
              )}
            </div>
            <h3 className={styles.personName}>{eventData.bride_name || '신부'}</h3>
            <p className={styles.personTitle}>The Bride</p>
            <p className={styles.parentNames}>
              Daughter of {eventData.bride_father_name || 'Mr.'} & {eventData.bride_mother_name || 'Mrs.'}
            </p>
            <button className={styles.vintageButton} onClick={() => handleCall(eventData.bride_contact)}>
              Contact
            </button>
          </div>
        </div>
      </section>

      {/* 예식 정보 */}
      <section className={styles.ceremonySection}>
        <div className={styles.sectionHeader}>
          <div className={styles.vintageLine}></div>
          <h2 className={styles.sectionTitle}>Ceremony Details</h2>
          <div className={styles.vintageLine}></div>
        </div>

        <div className={styles.ceremonyCard}>
          <div className={styles.ceremonyDetail}>
            <div className={styles.detailIcon}>⛪</div>
            <div className={styles.detailContent}>
              <h4>Venue</h4>
              <p className={styles.detailMain}>{eventData.location || '웨딩홀'}</p>
              <p className={styles.detailSub}>{eventData.detailed_address || ''}</p>
            </div>
          </div>

          <div className={styles.ceremonyDetail}>
            <div className={styles.detailIcon}>🕐</div>
            <div className={styles.detailContent}>
              <h4>Time</h4>
              <p className={styles.detailMain}>Ceremony: {ceremonyTime}</p>
              <p className={styles.detailSub}>Reception: {receptionTime}</p>
            </div>
          </div>

          <div className={styles.ceremonyDetail}>
            <div className={styles.detailIcon}>🚗</div>
            <div className={styles.detailContent}>
              <h4>Parking</h4>
              <p className={styles.detailMain}>{eventData.parking_info || 'Available'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <div className={styles.sectionHeader}>
            <div className={styles.vintageLine}></div>
            <h2 className={styles.sectionTitle}>Our Moments</h2>
            <div className={styles.vintageLine}></div>
          </div>

          <div className={styles.galleryGrid}>
            {safeImages.gallery.map((image, index) => (
              <div key={index} className={styles.galleryFrame}>
                <img src={image.uri || image} alt={`Gallery ${index + 1}`} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 지도 섹션 */}
      <section className={styles.mapSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.vintageLine}></div>
          <h2 className={styles.sectionTitle}>Location</h2>
          <div className={styles.vintageLine}></div>
        </div>

        <div className={styles.mapFrame}>
          <div className={styles.mapPlaceholder}>
            <span>📍</span>
            <p>{eventData.location}</p>
            <p className={styles.mapAddress}>{eventData.detailed_address}</p>
          </div>
        </div>

        <div className={styles.mapButtons}>
          <button className={styles.vintageButton}>
            View Map
          </button>
          <button className={styles.vintageButtonOutline}>
            Copy Address
          </button>
        </div>
      </section>

      {/* 공유 섹션 */}
      <section className={styles.shareSection}>
        <button className={styles.shareButton} onClick={handleShare}>
          <span className={styles.shareIcon}>💌</span>
          <span>Share Our Joy</span>
        </button>
      </section>

      {/* 푸터 */}
      <footer className={styles.footer}>
        <div className={styles.footerOrnament}>❦ ❦ ❦</div>
        <p className={styles.footerMessage}>
          We look forward to celebrating with you
        </p>
        <div className={styles.footerNames}>
          {eventData.groom_name || '신랑'} & {eventData.bride_name || '신부'}
        </div>
        <div className={styles.footerDate}>
          {dateInfo.full}
        </div>
        <div className={styles.footerOrnament}>❦ ❦ ❦</div>
      </footer>
    </div>
  );
};

export default VintageTemplate;