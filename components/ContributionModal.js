// components/ContributionModal.js - 축의금 입력 모달 (폰 인증 포함)
import React, { useState, useEffect } from 'react';
import styles from './ContributionModal.module.css';

const ContributionModal = ({ isOpen, onClose, onSubmit, eventData, editData = null }) => {
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    guestName: '',
    contributionAmount: '',
    relationship: '',
    side: ''
  });
  const [step, setStep] = useState('phone');
  const [verificationSent, setVerificationSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  
  // 책자 애니메이션 상태
  const [showBook, setShowBook] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);
  const [coverOpen, setCoverOpen] = useState(false);
  const [showText, setShowText] = useState(false);

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

  // 타이머 관련
  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 모달이 열릴 때 editData 또는 verifiedPhone 체크
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        // 편집 모드: 기존 데이터로 폼 채우기
        setFormData({
          phone: '',
          verificationCode: '',
          guestName: editData.guestName || '',
          contributionAmount: editData.contributionAmount ? editData.contributionAmount.toLocaleString() : '',
          relationship: editData.relationship || '',
          side: editData.side || ''
        });
        setStep('form');
        setShowBook(false); // 편집 모드에서는 책자 애니메이션 스킵
      } else {
        const verifiedPhone = localStorage.getItem('verifiedPhone');
        if (verifiedPhone) {
          setStep('form');
          setShowBook(false); // 이미 인증된 경우 책자 애니메이션 스킵
        } else {
          setStep('phone');
        }
      }
    } else {
      // 모달 닫을 때 초기화
      setFormData({
        phone: '',
        verificationCode: '',
        guestName: '',
        contributionAmount: '',
        relationship: '',
        side: ''
      });
      setStep('phone');
      setError('');
      setIsLoading(false);
      setVerificationSent(false);
      setTimer(0);
      setPrivacyAgreed(false);
      setShowBook(false);
      setCurrentPage(0);
      setIsFlipping(false);
      setCoverOpen(false);
      setShowText(false);
    }
  }, [isOpen, editData]);

  // 축의금 폼 단계에서 책자 애니메이션 시작
  useEffect(() => {
    if (step === 'form' && !editData) {
      const timer = setTimeout(() => {
        setShowBook(true);
        
        // 책이 나타난 후 덮개 열기
        const coverTimer = setTimeout(() => {
          setCoverOpen(true);
        }, 700);
        
        // 덮개가 열린 후 잠깐 기다렸다가 페이지 넘김 시작
        const flipTimer = setTimeout(() => {
          setIsFlipping(true);
          const flipSequence = [1, 2, 3, 4, 5, 6, 7, 8];
          
          flipSequence.forEach((pageNum, index) => {
            setTimeout(() => {
              setCurrentPage(pageNum);
              if (index === flipSequence.length - 1) {
                setTimeout(() => {
                  setCurrentPage(0);
                  setIsFlipping(false);
                  setShowText(true);
                }, 300);
              }
            }, index * 200);
          });
        }, 1500);
      }, 500);
    }
  }, [step, editData]);

  // 타이머 포맷팅
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 전화번호 포맷팅
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length > 11) return formData.phone;
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  // 금액 포맷팅
  const formatAmount = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 기존 축의금 확인 함수
  const checkExistingContribution = async (phone) => {
    try {
      const response = await fetch(`/api/get-my-contribution?eventId=${eventData.id}&phone=${encodeURIComponent(phone)}`);
      const result = await response.json();
      
      if (result.success && result.contribution) {
        return { exists: true, contribution: result.contribution };
      }
      
      return { exists: false };
    } catch (error) {
      console.error('축의금 중복 확인 오류:', error);
      return { exists: false };
    }
  };

  // 인증번호 발송
  const sendVerificationCode = async () => {
    const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
    if (phoneNumbers.length !== 11) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    // 중복 검사 먼저 수행
    const duplicateCheck = await checkExistingContribution(`+82${phoneNumbers.slice(1)}`);
    if (duplicateCheck.exists) {
      setError('이미 이 전화번호로 축의금을 전달하셨습니다.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+82${phoneNumbers.slice(1)}`
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationSent(true);
        setTimer(300);
        setStep('verification');
      } else {
        setError(result.error || '인증번호 발송에 실패했습니다.');
      }
    } catch (error) {
      console.error('인증번호 발송 오류:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 인증번호 확인
  const verifyCode = async () => {
    if (formData.verificationCode.length !== 6) {
      setError('6자리 인증번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
      const response = await fetch('/api/verify-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: `+82${phoneNumbers.slice(1)}`,
          code: formData.verificationCode
        }),
      });

      const result = await response.json();

      if (result.success) {
        const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
        const verifiedPhone = `+82${phoneNumbers.slice(1)}`;
        localStorage.setItem('verifiedPhone', verifiedPhone);
        setStep('form');
      } else {
        setError(result.error || '인증번호가 올바르지 않습니다.');
      }
    } catch (error) {
      console.error('인증번호 확인 오류:', error);
      setError('네트워크 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
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
        eventId: eventData?.id || null
      };

      await onSubmit(submitData);
      
      // 폼 초기화
      setFormData({
        phone: '',
        verificationCode: '',
        guestName: '',
        contributionAmount: '',
        relationship: '',
        side: ''
      });
      setStep('phone');
      setError('');
      
      onClose();
    } catch (error) {
      setError(error.message || '축의금 등록에 실패했습니다. 다시 시도해주세요.');
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
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <span className={styles.headerTitle}>
            {step === 'phone' ? '휴대폰 인증' : step === 'verification' ? '인증번호 입력' : '축의금 전달'}
          </span>
        </div>

        <div className={styles.content}>
          {/* 폰 인증 단계 */}
          {step === 'phone' && (
            <>
              {/* 상단 섹션 */}
              <div className={styles.topSection}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconBackground}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <path d="M14 6C12.9 6 12 6.9 12 8V36C12 37.1 12.9 38 14 38H30C31.1 38 32 37.1 32 36V8C32 6.9 31.1 6 30 6H14Z" fill="#4A90E2"/>
                      <rect x="15" y="9" width="14" height="20" rx="1" fill="white"/>
                      <circle cx="22" cy="33" r="2" fill="white"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className={styles.mainTitle}>휴대폰 인증</h2>
                <p className={styles.mainDescription}>
                  안전한 축의금 전달을 위해<br />
                  간단한 본인 확인이 필요해요
                </p>
              </div>

              {/* 개인정보 동의 */}
              <div className={styles.agreementSection}>
                <div className={styles.agreementItem} onClick={() => setPrivacyAgreed(!privacyAgreed)}>
                  <div className={styles.agreementLeft}>
                    <span className={styles.agreementLabel}>개인정보 수집 동의</span>
                  </div>
                  <div className={`${styles.checkbox} ${privacyAgreed ? styles.checked : ''}`}>
                    {privacyAgreed && (
                      <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                        <path d="M1 5L5 9L13 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                </div>
                
                <p className={styles.privacyText}>
                  수집된 휴대폰번호는 오직 본인 확인 목적으로만 사용됩니다
                </p>
              </div>

              {/* 입력 폼 섹션 */}
              <div className={styles.formList}>
                <div className={styles.inputSection}>
                  <label className={styles.inputLabel}>휴대폰 번호</label>
                  <input
                    type="tel"
                    className={styles.phoneInput}
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  />
                </div>
              </div>
              
              {error && <div className={styles.errorMessage}>{error}</div>}
              
              <div className={styles.buttonStack}>
                <button
                  className={styles.submitButton}
                  onClick={sendVerificationCode}
                  disabled={isLoading || !formData.phone || !privacyAgreed}
                >
                  {isLoading ? '발송 중...' : '인증번호 받기'}
                </button>
              </div>
            </>
          )}

          {/* 인증번호 확인 단계 */}
          {step === 'verification' && (
            <>
              {/* 상단 섹션 */}
              <div className={styles.topSection}>
                <div className={styles.iconContainer}>
                  <div className={styles.iconBackground}>
                    <svg width="44" height="44" viewBox="0 0 44 44" fill="none">
                      <path d="M12 8C12 6.9 12.9 6 14 6H30C31.1 6 32 6.9 32 8V36C32 37.1 31.1 38 30 38H14C12.9 38 12 37.1 12 36V8Z" fill="#4A90E2"/>
                      <rect x="15" y="10" width="14" height="18" rx="1" fill="white"/>
                      <path d="M18 16H26M18 19H26M18 22H24" stroke="#4A90E2" strokeWidth="1.5"/>
                      <circle cx="22" cy="33" r="2" fill="white"/>
                    </svg>
                  </div>
                </div>
                
                <h2 className={styles.mainTitle}>인증번호 입력</h2>
                <p className={styles.mainDescription}>
                  {formData.phone}로 발송된<br />
                  6자리 인증번호를 입력해주세요
                </p>
              </div>

              {/* 입력 폼 섹션 */}
              <div className={styles.formList}>
                <div className={styles.inputSection}>
                  <label className={styles.inputLabel}>인증번호</label>
                  <input
                    type="text"
                    className={styles.codeInput}
                    placeholder="123456"
                    value={formData.verificationCode}
                    onChange={(e) => {
                      const code = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                      setFormData({ ...formData, verificationCode: code });
                    }}
                    maxLength={6}
                  />
                  {timer > 0 && (
                    <div className={styles.timerText}>
                      {formatTimer(timer)} 후 재발송 가능
                    </div>
                  )}
                </div>
              </div>

              {error && <div className={styles.errorMessage}>{error}</div>}

              <div className={styles.buttonStack}>
                <button
                  className={styles.submitButton}
                  onClick={verifyCode}
                  disabled={isLoading || formData.verificationCode.length !== 6}
                >
                  {isLoading ? '확인 중...' : '인증완료'}
                </button>
                
                <button
                  className={styles.secondaryButton}
                  onClick={() => setStep('phone')}
                  disabled={isLoading}
                >
                  이전
                </button>
                
                <button
                  className={styles.resendButton}
                  onClick={sendVerificationCode}
                  disabled={isLoading || timer > 0}
                >
                  {timer > 0 ? `재전송 (${formatTimer(timer)})` : '인증번호 재전송'}
                </button>
              </div>
            </>
          )}

          {/* 축의금 입력 폼 */}
          {step === 'form' && (
            <div className={styles.formSection}>
              <p className={styles.subtitle}>
                {editData ? '축의금 정보를 수정해주세요' : `${brideName}님과 ${groomName}님께 축의금을 전달해주세요`}
              </p>

              {/* 책자 애니메이션 (편집 모드가 아닐 때만) */}
              {!editData && (
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
                    <div className={styles.fixedRightPage} style={{display: currentPage === 1 && !isFlipping ? 'flex' : 'none', zIndex: 25}}>
                      <div className={styles.pageContent}>
                        <h3 style={{color: '#333', fontSize: '16px', lineHeight: '1.4', marginBottom: '10px'}}>QR 찍고<br />바로 축하하기</h3>
                        <p style={{color: '#666', fontSize: '14px', lineHeight: '1.5'}}>모든 축하가<br />하나의 링크에</p>
                      </div>
                    </div>

                    {/* 연속으로 넘어가는 여러 페이지들 - 후루룩 효과! */}
                    
                    {/* 페이지 1 */}
                    <div 
                      className={`${styles.page} ${currentPage >= 1 ? styles.flipped : ''}`}
                      style={{ zIndex: 15 }}
                    >
                      <div className={styles.front}>
                        <div className={styles.pageContent}>
                          {showText && (
                            <>
                              <h3>방명록,<br />이제 간편하게</h3>
                              <p>종이와 펜은 이제 안녕</p>
                            </>
                          )}
                        </div>
                      </div>
                      <div className={styles.back}>
                        <div className={styles.pageContent}>
                          {/* 2-1: 두 번째 장의 왼쪽 */}
                          {showText && currentPage === 1 && (
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
                </div>
              )}

              {/* 이름 입력 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>성함</label>
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
                <label className={styles.label}>축의금 금액</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="100,000"
                  value={formData.contributionAmount}
                  onChange={(e) => setFormData({ ...formData, contributionAmount: formatAmount(e.target.value) })}
                />
              </div>

              {/* 신랑측/신부측 선택 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>구분</label>
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
              </div>

              {/* 관계 선택 */}
              <div className={styles.inputGroup}>
                <label className={styles.label}>관계</label>
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
                className={styles.submitButton}
                onClick={handleSubmit}
                disabled={isLoading || !formData.guestName.trim() || !formData.contributionAmount || !formData.side || !formData.relationship}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    {editData ? '수정 중...' : '전달 중...'}
                  </>
                ) : (
                  editData ? '축의금 수정하기' : '축의금 전달하기'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;