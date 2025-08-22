// components/ContributionModal.js - 축의금 입력 모달
import React, { useState, useEffect } from 'react';
import styles from './ContributionModal.module.css';

const ContributionModal = ({ isOpen, onClose, onSubmit, eventData }) => {
  const [formData, setFormData] = useState({
    guestName: '',
    contributionAmount: '',
    relationship: '',
    side: '' // 'groom' 또는 'bride'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showBook, setShowBook] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [showText, setShowText] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [showBookText, setShowBookText] = useState(false);
  const [showWelcomeText, setShowWelcomeText] = useState(false);
  const [touchFading, setTouchFading] = useState(false);
  const [bookAnimationComplete, setBookAnimationComplete] = useState(false);

  // 관계 옵션들
  const relationshipOptions = [
    { value: 'family', label: '가족' },
    { value: 'relative', label: '친척' },
    { value: 'friend', label: '지인' },
    { value: 'colleague', label: '직장동료' },
    { value: 'senior', label: '선배' },
    { value: 'junior', label: '후배' },
    { value: 'neighbor', label: '이웃' },
    { value: 'other', label: '기타' }
  ];

  useEffect(() => {
    if (isOpen) {
      // 모달이 열리면 잠시 후 책과 책자 텍스트를 동시에 페이드인
      const bookTimer = setTimeout(() => {
        setShowBook(true);
        setShowBookText(true); // 책자와 함께 "축의금을 전달해주세요" 텍스트 동시 표시
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
      setFormData({
        guestName: '',
        contributionAmount: '',
        relationship: '',
        side: ''
      });
      setError('');
      setIsLoading(false);
      setShowBook(false);
      setShowContent(false);
      setShowText(false);
      setCurrentPage(0);
      setIsFlipping(false);
      setCoverOpen(false);
      setShowBookText(false);
      setShowWelcomeText(false);
      setTouchFading(false);
      setBookAnimationComplete(false);
    }
  }, [isOpen]);

  const startContinuousFlip = () => {
    setIsFlipping(true);
    
    // 연속 페이지 플립 효과 - 여러 페이지가 자연스럽게 후루룩 넘어감
    const flipSequence = [1, 2, 3, 4, 5]; // 5장의 페이지가 연속으로 넘어감
    
    // 각 페이지를 순차적으로 자연스럽게 넘김
    flipSequence.forEach((pageNum, index) => {
      setTimeout(() => {
        setCurrentPage(pageNum);
        
        // 마지막 페이지가 넘어간 후 첫 페이지로 돌아가기
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
              setBookAnimationComplete(true);
            }, 1000);
          }, 500); // 마지막 페이지가 넘어간 후 조금 더 기다림
        }
      }, index * 350); // 350ms 간격으로 자연스럽게 넘김
    });
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

  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 축의금 제출
  const handleSubmit = async () => {
    if (!formData.guestName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.contributionAmount.replace(/[^\d]/g, '')) {
      setError('축의금 금액을 입력해주세요.');
      return;
    }
    if (!formData.side) {
      setError('신랑측/신부측을 선택해주세요.');
      return;
    }
    if (!formData.relationship) {
      setError('관계를 선택해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verifiedPhone = localStorage.getItem('verifiedPhone');
      if (!verifiedPhone) {
        setError('인증된 전화번호 정보가 없습니다.');
        return;
      }

      const submitData = {
        guestName: formData.guestName.trim(),
        contributionAmount: parseInt(formData.contributionAmount.replace(/[^\d]/g, '')),
        relationship: formData.relationship,
        side: formData.side,
        phone: verifiedPhone,
        eventId: eventData?.id
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('축의금 등록 오류:', error);
      setError('축의금 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
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
                축의금을<br />
                전달해주세요
              </h2>
              <p className={styles.bookSubtext}>
                간편하게 기록하고<br />
                전달할 수 있어요
              </p>
            </div>
            
            {/* 웰컴 메시지 (책자 펼쳐진 후) */}
            <div className={`${styles.welcomeContainer} ${showWelcomeText ? styles.fadeIn : styles.fadeOut}`}>
              <h2 className={styles.welcomeMainTitle}>
                토스처럼 간편하게<br />
                축의금을 전달하세요
              </h2>
              <p className={styles.subtitle}>
                빠르고 안전한<br />
                디지털 축의금 💝
              </p>
            </div>
          </div>

          {/* 책자 애니메이션 */}
          <div className={`${styles.bookContainer} ${showBook ? styles.showBook : ''}`}>
            <div className={`${styles.book} ${isFlipping ? styles.flipping : ''}`}>
              {/* 책 덮개 */}
              <div className={`${styles.bookCover} ${coverOpen ? styles.coverOpen : ''}`}>
                <div className={styles.coverFront}>
                  <div className={styles.coverContent}>
                    <div className={styles.coverTitle}>
                      <span className={styles.coverIcon}>💝</span>
                      <h3>축의금</h3>
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

              {/* 왼쪽 고정 페이지 - 1-1 (첫 번째 장의 왼쪽) */}
              <div className={styles.fixedLeftPage} style={{display: currentPage === 0 ? 'flex' : 'none', zIndex: currentPage === 0 ? 2 : 0}}>
                <div className={styles.pageContent}>
                  {showText && (
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
                </div>
              </div>

              {/* 오른쪽 고정 페이지 - 2-2 (두 번째 장의 오른쪽) */}
              <div className={styles.fixedRightPage} style={{display: currentPage === 1 ? 'flex' : 'none', zIndex: 1}}>
                <div className={styles.pageContent}>
                  {showText && currentPage === 1 && (
                    <>
                      <h3>토스처럼<br />간편하게</h3>
                      <p>빠른 축의금<br />전달 서비스</p>
                    </>
                  )}
                </div>
              </div>

              {/* 연속으로 넘어가는 여러 페이지들 - 후루룩 효과를 위한 빈 페이지들 */}
              
              {/* 페이지 1 */}
              <div 
                className={`${styles.page} ${currentPage >= 1 ? styles.flipped : ''}`}
                style={{ zIndex: 10 }}
              >
                <div className={styles.front}>
                  <div className={styles.pageContent}>
                    {showText && (
                      <>
                        <h3>축의금,<br />이제 간편하게</h3>
                        <p>종이 봉투는 이제 안녕</p>
                      </>
                    )}
                  </div>
                </div>
                <div className={styles.back}>
                  <div className={styles.pageContent}>
                    {/* 빈 페이지 */}
                  </div>
                </div>
              </div>

              {/* 페이지 2 */}
              <div 
                className={`${styles.page} ${currentPage >= 2 ? styles.flipped : ''}`}
                style={{ zIndex: 9 }}
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

              {/* 페이지 4 */}
              <div 
                className={`${styles.page} ${currentPage >= 4 ? styles.flipped : ''}`}
                style={{ zIndex: 7 }}
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
                style={{ zIndex: 6 }}
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
                style={{ zIndex: 5 }}
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
                style={{ zIndex: 4 }}
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
                style={{ zIndex: 3 }}
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

          {/* 폼 섹션 */}
          <div className={`${styles.formSection} ${showContent ? styles.showContent : ''}`}>
            {/* 이름 입력 */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                className={styles.input}
                placeholder="이름을 입력해주세요"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              />
            </div>

            {/* 축의금 금액 */}
            <div className={styles.inputGroup}>
              <div className={styles.amountInputWrapper}>
                <input
                  type="text"
                  className={styles.amountInput}
                  placeholder="금액을 입력해주세요"
                  value={formData.contributionAmount ? `${formData.contributionAmount}원` : ''}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    const formatted = formatAmount(value);
                    setFormData({ ...formData, contributionAmount: formatted });
                  }}
                />
              </div>
            </div>

            {/* 신랑측/신부측 선택 */}
            <div className={styles.sideButtonGroup}>
              <button
                type="button"
                className={`${styles.sideButton} ${formData.side === 'groom' ? styles.active : ''}`}
                onClick={() => setFormData({ ...formData, side: 'groom' })}
              >
                신랑측
              </button>
              <button
                type="button"
                className={`${styles.sideButton} ${formData.side === 'bride' ? styles.active : ''}`}
                onClick={() => setFormData({ ...formData, side: 'bride' })}
              >
                신부측
              </button>
            </div>

            {/* 관계 선택 */}
            <div className={styles.relationshipGroup}>
              {relationshipOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.relationshipChip} ${formData.relationship === option.value ? styles.active : ''}`}
                  onClick={() => setFormData({ ...formData, relationship: option.value })}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          {/* 제출 버튼 */}
          <button
            className={`${styles.submitButton} ${showContent ? styles.show : ''}`}
            onClick={handleSubmit}
            disabled={isLoading || !formData.guestName.trim() || !formData.contributionAmount || !formData.side || !formData.relationship}
          >
            {isLoading ? (
              <>
                <span className={styles.spinner}></span>
                전달 중...
              </>
            ) : (
              '축의금 전달하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;