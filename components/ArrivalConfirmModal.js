// components/ArrivalConfirmModal.js - 결혼식장 도착 확인 모달
import React, { useState, useEffect } from 'react';
import styles from './ArrivalConfirmModal.module.css';

const ArrivalConfirmModal = ({ isOpen, onClose, onConfirm, eventData }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showBook, setShowBook] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showText, setShowText] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [showBookText, setShowBookText] = useState(false);  // "요즘 누가 책자에 이름을 쓰나요?" 
  const [showWelcomeText, setShowWelcomeText] = useState(false); // "신랑신부 결혼식장에 도착하셨나요?"
  const [touchFading, setTouchFading] = useState(false); // 터치 영역 페이드아웃 상태

  useEffect(() => {
    if (isOpen) {
      // 모달이 열리면 잠시 후 책과 책자 텍스트를 동시에 페이드인
      const bookTimer = setTimeout(() => {
        setShowBook(true);
        setShowBookText(true); // 책자와 함께 "요즘 누가 책자에 이름을 쓰나요?" 텍스트 동시 표시
      }, 500);
      
      // 책이 나타난 후 덮개 열기 (책자 텍스트와 함께 1초 정도 유지)
      const coverTimer = setTimeout(() => {
        setCoverOpen(true);
      }, 1200);
      
      // 덮개가 열린 후 잠깐 기다렸다가 페이지 넘김 시작
      const flipTimer = setTimeout(() => {
        startContinuousFlip();
      }, 2000);
      
      return () => {
        clearTimeout(bookTimer);
        clearTimeout(coverTimer);
        clearTimeout(flipTimer);
      };
    } else {
      setShowBook(false);
      setShowContent(false);
      setShowText(false);
      setCurrentPage(0);
      setIsFlipping(false);
      setCoverOpen(false);
      setShowBookText(false);
      setShowWelcomeText(false);
      setTouchFading(false);
    }
  }, [isOpen]);

  const startContinuousFlip = () => {
    setIsFlipping(true);
    
    // 더 자연스럽고 빠른 연속 페이지 플립 효과 - 후루룩!
    const flipSequence = [1, 2, 3, 4, 5, 6, 7, 8]; // 8장의 페이지가 연속으로 넘어감
    
    // 각 페이지를 빠르게 연속으로 넘김 - 후루룩 효과
    flipSequence.forEach((pageNum, index) => {
      setTimeout(() => {
        setCurrentPage(pageNum);
        
        // 마지막 페이지가 넘어간 후
        if (index === flipSequence.length - 1) {
          setTimeout(() => {
            setCurrentPage(0); // 첫 페이지로 돌아가기
            setIsFlipping(false);
            setShowText(true);
            
            // 먼저 책자 텍스트 페이드아웃
            setShowBookText(false);
            
            // 잠시 후 웰컴 텍스트 페이드인
            setTimeout(() => {
              setShowWelcomeText(true);
            }, 500);
            
            // 콘텐츠 표시
            setTimeout(() => {
              setShowContent(true);
            }, 1000);
          }, 300); // 마지막 페이지 후 잠시 기다림
        }
      }, index * 200); // 200ms 간격으로 빠르게 넘김 (후루룩!)
    });
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  const nextPage = () => {
    if (currentPage === 0 && !isFlipping) {
      setTouchFading(true); // 터치 영역 페이드아웃 시작
      setTimeout(() => {
        setCurrentPage(1); // 첫 번째 페이지 넘김
        setTouchFading(false); // 새 터치 영역 페이드인
      }, 300); // 0.3초 후 페이지 전환
    }
  };

  const prevPage = () => {
    if (currentPage === 1 && !isFlipping) {
      setTouchFading(true); // 터치 영역 페이드아웃 시작
      setTimeout(() => {
        setCurrentPage(0); // 첫 번째 페이지로 돌아가기
        setTouchFading(false); // 새 터치 영역 페이드인
      }, 300); // 0.3초 후 페이지 전환
    }
  };


  if (!isOpen) return null;

  const brideName = eventData?.bride_name || '하윤';
  const groomName = eventData?.groom_name || '민호';

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 메인 텍스트 섹션 - 책자 텍스트와 웰컴 메시지가 같은 위치에서 교체 */}
          <div className={styles.mainTextSection}>
            {/* 책자와 함께 나오는 텍스트 */}
            <div className={`${styles.bookTextContainer} ${showBookText ? styles.fadeIn : styles.fadeOut}`}>
              <h2 className={styles.bookMainTitle}>
                요즘 누가 책자에<br />
                이름을 쓰나요?
              </h2>
              <p className={styles.bookSubtext}>
                스마트폰으로 간편하게<br />
                축하 메시지를 남겨보세요
              </p>
            </div>
            
            {/* 웰컴 메시지 (책자 펼쳐진 후) */}
            <div className={`${styles.welcomeContainer} ${showWelcomeText ? styles.fadeIn : styles.fadeOut}`}>
              <h2 className={styles.welcomeMainTitle}>
                {brideName}님과 {groomName}님의<br />
                결혼식장에 도착하셨나요?
              </h2>
              <p className={styles.subtitle}>
                축하해주시기 위해 오셨군요!<br />
                감사드립니다 💕
              </p>
            </div>
          </div>

          {/* 책자 애니메이션 */}
          <div className={`${styles.bookContainer} ${showBook ? styles.showBook : ''}`}>
            <div className={styles.book}>
              {/* 책 덮개 */}
              <div className={`${styles.bookCover} ${coverOpen ? styles.coverOpen : ''}`}>
                <div className={styles.coverFront}>
                  <div className={styles.coverContent}>
                    <div className={styles.coverTitle}>
                      <span className={styles.coverIcon}>💒</span>
                      <h3>Wedding</h3>
                      <p>Guest Book</p>
                    </div>
                    <div className={styles.coverDecor}>
                      <span>◆ ◇ ◆</span>
                    </div>
                  </div>
                </div>
                <div className={styles.coverBack}>
                  <div className={styles.coverBackContent}>
                    {/* 덮개 뒷면 (비어있음) */}
                  </div>
                </div>
              </div>

              {/* 왼쪽 고정 페이지 - 페이지에 따라 다른 내용 표시 */}
              <div className={styles.fixedLeftPage} style={{zIndex: 2}}>
                <div className={styles.pageContent}>
                  {/* currentPage === 0일 때: 1-1 (첫 번째 장의 왼쪽) */}
                  {showText && currentPage === 0 && (
                    <div className={styles.guestNames}>
                      <div className={styles.nameColumn}>
                        <span className={styles.guestName}>김민수</span>
                        <span className={styles.guestName}>이지영</span>
                        <span className={styles.guestName}>박정우</span>
                      </div>
                      <div className={styles.nameColumn}>
                        <span className={styles.guestName}>최수연</span>
                        <span className={styles.guestName}>정현민</span>
                        <span className={styles.guestName}>한소희</span>
                      </div>
                      <div className={styles.nameColumn}>
                        <span className={styles.guestName}>장미영</span>
                        <span className={styles.guestName}>강동혁</span>
                        <span className={styles.guestName}>윤서정</span>
                      </div>
                    </div>
                  )}
                  
                  {/* currentPage === 1일 때: 2-1 (두 번째 장의 왼쪽) */}
                  {showText && currentPage === 1 && (
                    <>
                      <h3>특별한 날의<br />특별한 기록</h3>
                      <p className={styles.pageDescription}>
                        여러분의 따뜻한 마음이<br />
                        영원히 기억될 거예요
                      </p>
                      <div className={styles.messagePreview}>
                        <div className={styles.previewItem}>
                          <span className={styles.previewQuote}>"</span>
                          <p>두 분의 앞날에<br />행복만 가득하길</p>
                        </div>
                        <div className={styles.previewItem}>
                          <span className={styles.previewQuote}>"</span>
                          <p>아름다운 사랑<br />영원하기를</p>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 오른쪽 고정 페이지 - 2-2 (두 번째 장의 오른쪽) */}
              <div className={styles.fixedRightPage} style={{display: currentPage === 1 ? 'flex' : 'none', zIndex: 1}}>
                <div className={styles.pageContent}>
                  {showText && currentPage === 1 && (
                    <>
                      <h3>스마트한<br />축하 방법</h3>
                      <p className={styles.pageDescription}>
                        QR 코드 하나로<br />
                        모든 축하를 전달하세요
                      </p>
                      <div className={styles.featureList}>
                        <div className={styles.featureItem}>
                          <span className={styles.featureIcon}>📸</span>
                          <span>QR 스캔</span>
                        </div>
                        <div className={styles.featureItem}>
                          <span className={styles.featureIcon}>✍️</span>
                          <span>메시지 작성</span>
                        </div>
                        <div className={styles.featureItem}>
                          <span className={styles.featureIcon}>💐</span>
                          <span>축의금 전달</span>
                        </div>
                      </div>
                      <div className={styles.bottomMessage}>
                        <p>종이 없이도<br />마음을 전하세요</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 연속으로 넘어가는 여러 페이지들 - 후루룩 효과! */}
              
              {/* 페이지 1 - 1-2 (첫 번째 장의 오른쪽) */}
              <div 
                className={`${styles.page} ${currentPage >= 1 ? styles.flipped : ''}`}
                style={{ zIndex: 15 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {showText && currentPage === 0 && (
                      <>
                        <h3>디지털 방명록</h3>
                        <p className={styles.pageDescription}>
                          스마트폰으로 간편하게<br />
                          축하 메시지를 남겨주세요
                        </p>
                        <div className={styles.featureList}>
                          <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>📱</span>
                            <span>모바일로 간편하게</span>
                          </div>
                          <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>💌</span>
                            <span>마음 담은 메시지</span>
                          </div>
                          <div className={styles.featureItem}>
                            <span className={styles.featureIcon}>🎁</span>
                            <span>축의금도 함께</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {showText && currentPage === 1 && (
                      <div className={styles.guestNames}>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>송민정</span>
                          <span className={styles.guestName}>류승호</span>
                          <span className={styles.guestName}>백서윤</span>
                        </div>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>남궁진</span>
                          <span className={styles.guestName}>하은주</span>
                          <span className={styles.guestName}>도현서</span>
                        </div>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>문재원</span>
                          <span className={styles.guestName}>서유진</span>
                          <span className={styles.guestName}>안시현</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 페이지 2 */}
              <div 
                className={`${styles.page} ${currentPage >= 2 ? styles.flipped : ''}`}
                style={{ zIndex: 14 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 3 */}
              <div 
                className={`${styles.page} ${currentPage >= 3 ? styles.flipped : ''}`}
                style={{ zIndex: 13 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 4 */}
              <div 
                className={`${styles.page} ${currentPage >= 4 ? styles.flipped : ''}`}
                style={{ zIndex: 12 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 5 */}
              <div 
                className={`${styles.page} ${currentPage >= 5 ? styles.flipped : ''}`}
                style={{ zIndex: 11 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 6 */}
              <div 
                className={`${styles.page} ${currentPage >= 6 ? styles.flipped : ''}`}
                style={{ zIndex: 10 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 7 */}
              <div 
                className={`${styles.page} ${currentPage >= 7 ? styles.flipped : ''}`}
                style={{ zIndex: 9 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {showText && (
                      <div className={styles.guestNames}>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>조현우</span>
                          <span className={styles.guestName}>신예은</span>
                          <span className={styles.guestName}>김태현</span>
                        </div>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>이서현</span>
                          <span className={styles.guestName}>오민석</span>
                          <span className={styles.guestName}>황지우</span>
                        </div>
                        <div className={styles.nameColumn}>
                          <span className={styles.guestName}>전소영</span>
                          <span className={styles.guestName}>김도영</span>
                          <span className={styles.guestName}>나은하</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 페이지 8 */}
              <div 
                className={`${styles.page} ${currentPage >= 8 ? styles.flipped : ''}`}
                style={{ zIndex: 8 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>
            </div>

            {/* 책자 터치 영역과 가이드 (콘텐츠가 나타난 후에만 표시) */}
            {showContent && !isFlipping && (
              <>
                {/* 우측 끝 터치 영역 - 다음 페이지 */}
                {currentPage === 0 && (
                  <div 
                    className={`${styles.touchArea} ${styles.touchAreaRight} ${touchFading ? styles.touchFading : ''}`}
                    onClick={nextPage}
                  >
                    <div className={styles.touchGradient}></div>
                    <div className={styles.touchBadge}>터치해주세요</div>
                  </div>
                )}
                
                {/* 좌측 끝 터치 영역 - 이전 페이지 */}
                {currentPage === 1 && (
                  <div 
                    className={`${styles.touchArea} ${styles.touchAreaLeft} ${touchFading ? styles.touchFading : ''}`}
                    onClick={prevPage}
                  >
                    <div className={styles.touchGradient}></div>
                    <div className={styles.touchBadge}>터치해주세요</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* 사전 방문 안내 */}
          <div className={`${styles.preVisitNotice} ${showContent ? styles.showContent : ''}`}>
            <div className={styles.noticeIcon}>ℹ️</div>
            <p className={styles.noticeText}>
              지금은 결혼식장 봉투 넣기 전이에요!<br />
              방문 기록만 남기고 나중에 다시 열어주세요.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className={`${styles.buttonGroup} ${showContent ? styles.showContent : ''}`}>
            <button
              className={styles.secondaryButton}
              onClick={onClose}
              disabled={isLoading}
            >
              아직 도착 전이에요
            </button>
            <button
              className={styles.primaryButton}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  확인 중...
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>🎉</span>
                  네, 도착했어요!
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrivalConfirmModal;