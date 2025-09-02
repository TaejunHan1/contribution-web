// components/templates/ModernMinimalTemplate.js
import React, { useState, useEffect, useRef } from 'react';
import styles from './ModernMinimalTemplate.module.css';

// 꽃잎 떨어지는 컴포넌트
const FallingFlowers = () => {
  const [flowers, setFlowers] = useState([]);

  useEffect(() => {
    const flowersArray = [...Array(20)].map((_, index) => ({
      id: index,
      left: Math.random() * 100,
      delay: index * 250,
      duration: 6000 + Math.random() * 1000,
      size: Math.random() * 50 + 45,
    }));
    setFlowers(flowersArray);
  }, []);

  return (
    <div className={styles.fallingFlowersContainer}>
      {flowers.map((flower) => (
        <div
          key={flower.id}
          className={styles.fallingFlower}
          style={{
            left: `${flower.left}%`,
            animationDelay: `${flower.delay}ms`,
            animationDuration: `${flower.duration}ms`,
            fontSize: `${flower.size}px`,
          }}
        >
          🌸
        </div>
      ))}
    </div>
  );
};

// 미니멀 캘린더 컴포넌트
const MinimalCalendar = ({ eventDate, style = {} }) => {
  if (!eventDate) return null;
  
  const targetDate = new Date(eventDate);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();
  const date = targetDate.getDate();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  const calendarDays = [];
  
  // 이전 달 날짜들
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      isTargetDate: false,
    });
  }
  
  // 현재 달 날짜들
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isTargetDate: i === date,
    });
  }
  
  // 다음 달 날짜들
  const remainingDays = 42 - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      isTargetDate: false,
    });
  }
  
  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = ['JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE', 
                  'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'];
  
  return (
    <div className={styles.calendarContainer} style={style}>
      <div className={styles.calendarHeader}>
        {months[month]} {year}
      </div>
      
      <div className={styles.weekDaysHeader}>
        {weekDays.map((weekDay, index) => (
          <div key={index} className={styles.weekDay}>
            <span className={index === 0 ? styles.sundayText : styles.weekDayText}>
              {weekDay}
            </span>
          </div>
        ))}
      </div>
      
      <div className={styles.calendarGrid}>
        {calendarDays.map((dayData, index) => (
          <div key={index} className={styles.calendarDay}>
            {dayData.isTargetDate ? (
              <div className={styles.targetDate}>
                {dayData.day}
              </div>
            ) : (
              <span className={
                !dayData.isCurrentMonth ? styles.inactiveDate :
                index % 7 === 0 ? styles.sundayDate : 
                styles.normalDate
              }>
                {dayData.day}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ModernMinimalTemplate = ({ eventData = {}, categorizedImages = {}, allowMessages = false, messageSettings = {} }) => {
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeAccountToggle, setActiveAccountToggle] = useState(null);
  const [galleryIndex, setGalleryIndex] = useState(0);
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
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000);
    return () => clearInterval(timer);
  }, [eventData.event_date]);

  // 슬라이드쇼
  useEffect(() => {
    if (safeImages.main.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % safeImages.main.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [safeImages.main.length]);

  // 계좌 토글
  const handleAccountToggle = (type) => {
    setActiveAccountToggle(activeAccountToggle === type ? null : type);
  };

  // 계좌 복사
  const copyAccount = async (accountNumber) => {
    try {
      await navigator.clipboard.writeText(accountNumber);
      alert('계좌번호가 복사되었습니다.');
    } catch (error) {
      alert('복사에 실패했습니다.');
    }
  };

  // 공유하기
  const handleShare = async () => {
    const shareData = {
      title: '결혼식 초대장',
      text: `${eventData.groom_name || '신랑'} ♥ ${eventData.bride_name || '신부'}\\n${dateInfo.full}\\n${eventData.location || ''}`,
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

  // 이미지 뷰어 열기
  const openImageViewer = (index, imageSet = 'main') => {
    const images = safeImages[imageSet];
    setCurrentImageIndex(index);
    setShowImageViewer(true);
  };

  const additionalInfo = eventData.additional_info || {};

  return (
    <div className={styles.container}>
      <FallingFlowers />
      
      {/* 히어로 섹션 */}
      <section className={styles.heroSection}>
        <div className={styles.heroImageContainer}>
          {safeImages.main.length > 0 && (
            <div className={styles.heroSlideshow}>
              {safeImages.main.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.heroImage} ${index === currentSlideIndex ? styles.heroImageActive : ''}`}
                  style={{ backgroundImage: `url(${image.uri || image})` }}
                  onClick={() => openImageViewer(index, 'main')}
                />
              ))}
            </div>
          )}
          
          <div className={styles.heroOverlay}>
            <div className={styles.heroContent}>
              <div className={styles.heroNames}>
                <span className={styles.groomName}>{eventData.groom_name || '신랑'}</span>
                <span className={styles.ampersand}>&</span>
                <span className={styles.brideName}>{eventData.bride_name || '신부'}</span>
              </div>
              <div className={styles.heroSubtitle}>WEDDING INVITATION</div>
              <div className={styles.heroDate}>
                {dateInfo.year} · {dateInfo.month} · {dateInfo.day} · {dateInfo.dayOfWeek}요일
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 인사말 섹션 */}
      <section className={styles.greetingSection}>
        <div className={styles.greetingContent}>
          <div className={styles.dividerLine}></div>
          <h2 className={styles.greetingTitle}>
            {eventData.custom_message || '평생을 함께할 사람을 만났습니다.'}
          </h2>
          <p className={styles.greetingText}>
            서로에게 사랑으로 이어진 저희 두 사람이{`\\n`}
            인생의 새로운 출발을 시작하려 합니다.{`\\n`}
            따뜻한 마음으로 축복해 주시면{`\\n`}
            더없는 기쁨으로 간직하겠습니다.
          </p>
          <div className={styles.parentsInfo}>
            <div className={styles.parentGroup}>
              <span className={styles.parentLabel}>{eventData.groom_father_name || '아버지'} · {eventData.groom_mother_name || '어머니'}</span>
              <span className={styles.parentChild}>의 아들 {eventData.groom_name || '신랑'}</span>
            </div>
            <div className={styles.parentGroup}>
              <span className={styles.parentLabel}>{eventData.bride_father_name || '아버지'} · {eventData.bride_mother_name || '어머니'}</span>
              <span className={styles.parentChild}>의 딸 {eventData.bride_name || '신부'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 날짜 섹션 (어두운 배경) */}
      <section className={styles.dateSection}>
        <div className={styles.dateContent}>
          <h2 className={styles.dateSectionTitle}>SAVE THE DATE</h2>
          
          <MinimalCalendar 
            eventDate={eventData.event_date || eventData.date}
            style={{ marginBottom: 40 }}
          />
          
          {!timeLeft.isExpired ? (
            <div className={styles.countdownContainer}>
              <div className={styles.countdownGrid}>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownNumber}>{String(timeLeft.days).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>DAYS</div>
                </div>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownNumber}>{String(timeLeft.hours).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>HOURS</div>
                </div>
                <div className={styles.countdownItem}>
                  <div className={styles.countdownNumber}>{String(timeLeft.minutes).padStart(2, '0')}</div>
                  <div className={styles.countdownLabel}>MINUTES</div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.marriedMessage}>
              <h3 className={styles.marriedTitle}>JUST MARRIED</h3>
              <p className={styles.marriedText}>Thank you for celebrating with us</p>
            </div>
          )}
          
          <div className={styles.ceremonyInfo}>
            <div className={styles.ceremonyTime}>
              <span className={styles.timeLabel}>CEREMONY</span>
              <span className={styles.timeValue}>{ceremonyTime}</span>
            </div>
            <div className={styles.ceremonyTime}>
              <span className={styles.timeLabel}>RECEPTION</span>
              <span className={styles.timeValue}>{receptionTime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 갤러리 섹션 */}
      {safeImages.gallery.length > 0 && (
        <section className={styles.gallerySection}>
          <div className={styles.gallerySectionContent}>
            <h2 className={styles.gallerySectionTitle}>GALLERY</h2>
            <div className={styles.galleryContainer}>
              <div className={styles.galleryScroll}>
                {safeImages.gallery.map((image, index) => (
                  <div 
                    key={index} 
                    className={styles.galleryItem}
                    onClick={() => openImageViewer(index, 'gallery')}
                  >
                    <img src={image.uri || image} alt={`Gallery ${index + 1}`} />
                    <div className={styles.galleryOverlay}>
                      <span className={styles.galleryNumber}>{String(index + 1).padStart(2, '0')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles.galleryIndicators}>
                {safeImages.gallery.map((_, index) => (
                  <div 
                    key={index} 
                    className={`${styles.galleryIndicator} ${index === galleryIndex ? styles.galleryIndicatorActive : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 신랑신부 섹션 */}
      <section className={styles.coupleSection}>
        <div className={styles.coupleSectionContent}>
          <h2 className={styles.coupleSectionTitle}>COUPLE</h2>
          <div className={styles.coupleContainer}>
            <div className={styles.coupleCard}>
              <div className={styles.coupleImageContainer}>
                {safeImages.groom[0] ? (
                  <img 
                    src={safeImages.groom[0].uri || safeImages.groom[0]} 
                    alt="신랑" 
                    className={styles.coupleImage}
                    onClick={() => openImageViewer(0, 'groom')}
                  />
                ) : (
                  <div className={styles.couplePlaceholder}>
                    <span>👔</span>
                  </div>
                )}
              </div>
              <div className={styles.coupleInfo}>
                <h3 className={styles.coupleName}>{eventData.groom_name || '신랑'}</h3>
                <p className={styles.coupleParents}>
                  {eventData.groom_father_name || '아버지'} · {eventData.groom_mother_name || '어머니'}의 아들
                </p>
              </div>
            </div>
            
            <div className={styles.coupleCard}>
              <div className={styles.coupleImageContainer}>
                {safeImages.bride[0] ? (
                  <img 
                    src={safeImages.bride[0].uri || safeImages.bride[0]} 
                    alt="신부" 
                    className={styles.coupleImage}
                    onClick={() => openImageViewer(0, 'bride')}
                  />
                ) : (
                  <div className={styles.couplePlaceholder}>
                    <span>👗</span>
                  </div>
                )}
              </div>
              <div className={styles.coupleInfo}>
                <h3 className={styles.coupleName}>{eventData.bride_name || '신부'}</h3>
                <p className={styles.coupleParents}>
                  {eventData.bride_father_name || '아버지'} · {eventData.bride_mother_name || '어머니'}의 딸
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 위치 섹션 (어두운 배경) */}
      <section className={styles.locationSection}>
        <div className={styles.locationContent}>
          <h2 className={styles.locationSectionTitle}>LOCATION</h2>
          <div className={styles.locationInfo}>
            <h3 className={styles.locationName}>{eventData.location || '웨딩홀'}</h3>
            <p className={styles.locationAddress}>{eventData.detailed_address || '상세 주소'}</p>
          </div>
          <div className={styles.locationButtons}>
            <button className={styles.locationButton}>
              길찾기
            </button>
            <button className={styles.locationButtonOutline}>
              주소 복사
            </button>
          </div>
        </div>
      </section>

      {/* 축의금 섹션 */}
      {(additionalInfo?.groom_account_number || additionalInfo?.bride_account_number) && (
        <section className={styles.accountSection}>
          <div className={styles.accountSectionContent}>
            <h2 className={styles.accountSectionTitle}>마음 전하실 곳</h2>
            <p className={styles.accountSectionSubtitle}>축하의 마음을 담아 전해주세요</p>
            
            <div className={styles.accountContainer}>
              {/* 신랑측 계좌 */}
              {additionalInfo?.groom_account_number && (
                <div className={styles.accountCard}>
                  <button 
                    className={styles.accountHeader}
                    onClick={() => handleAccountToggle('groom')}
                  >
                    <span className={styles.accountTitle}>신랑측 계좌번호</span>
                    <span className={`${styles.accountChevron} ${activeAccountToggle === 'groom' ? styles.accountChevronOpen : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {activeAccountToggle === 'groom' && (
                    <div className={styles.accountDetails}>
                      <div className={styles.accountInfo}>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>은행</span>
                          <span className={styles.accountValue}>{additionalInfo.groom_bank_name || '은행명'}</span>
                        </div>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>계좌번호</span>
                          <span className={styles.accountValue}>{additionalInfo.groom_account_number}</span>
                        </div>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>예금주</span>
                          <span className={styles.accountValue}>{eventData.groom_name || '신랑'}</span>
                        </div>
                      </div>
                      <button 
                        className={styles.copyButton}
                        onClick={() => copyAccount(additionalInfo.groom_account_number)}
                      >
                        복사하기
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* 신부측 계좌 */}
              {additionalInfo?.bride_account_number && (
                <div className={styles.accountCard}>
                  <button 
                    className={styles.accountHeader}
                    onClick={() => handleAccountToggle('bride')}
                  >
                    <span className={styles.accountTitle}>신부측 계좌번호</span>
                    <span className={`${styles.accountChevron} ${activeAccountToggle === 'bride' ? styles.accountChevronOpen : ''}`}>
                      ▼
                    </span>
                  </button>
                  
                  {activeAccountToggle === 'bride' && (
                    <div className={styles.accountDetails}>
                      <div className={styles.accountInfo}>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>은행</span>
                          <span className={styles.accountValue}>{additionalInfo.bride_bank_name || '은행명'}</span>
                        </div>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>계좌번호</span>
                          <span className={styles.accountValue}>{additionalInfo.bride_account_number}</span>
                        </div>
                        <div className={styles.accountRow}>
                          <span className={styles.accountLabel}>예금주</span>
                          <span className={styles.accountValue}>{eventData.bride_name || '신부'}</span>
                        </div>
                      </div>
                      <button 
                        className={styles.copyButton}
                        onClick={() => copyAccount(additionalInfo.bride_account_number)}
                      >
                        복사하기
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 공유 섹션 (어두운 배경) */}
      <section className={styles.shareSection}>
        <div className={styles.shareSectionContent}>
          <h2 className={styles.shareSectionTitle}>SHARE</h2>
          <p className={styles.shareText}>
            소중한 분들과 함께 나누어주세요
          </p>
          <button className={styles.shareButton} onClick={handleShare}>
            초대장 공유하기
          </button>
          <div className={styles.shareFooter}>
            <div className={styles.shareNames}>
              {eventData.groom_name || '신랑'} & {eventData.bride_name || '신부'}
            </div>
            <div className={styles.shareDate}>{dateInfo.full}</div>
            <div className={styles.shareMessage}>
              진심으로 감사드립니다
            </div>
          </div>
        </div>
      </section>

      {/* 이미지 뷰어 */}
      {showImageViewer && (
        <div className={styles.imageViewer} onClick={() => setShowImageViewer(false)}>
          <div className={styles.imageViewerContent}>
            <button className={styles.imageViewerClose} onClick={() => setShowImageViewer(false)}>
              ×
            </button>
            <img 
              src={safeImages.main[currentImageIndex]?.uri || safeImages.main[currentImageIndex]} 
              alt="Preview" 
              className={styles.imageViewerImage}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernMinimalTemplate;