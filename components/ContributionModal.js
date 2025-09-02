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
    }
  }, [isOpen, editData]);

  // 축의금 폼 단계에서 책자 애니메이션 시작
  useEffect(() => {
    if (step === 'form' && !editData) {
      const timer = setTimeout(() => {
        setShowBook(true);
        
        // 책자 페이지 플립 애니메이션
        const flipTimer = setTimeout(() => {
          setIsFlipping(true);
          const flipSequence = [1, 2, 3, 4, 5];
          
          flipSequence.forEach((pageNum, index) => {
            setTimeout(() => {
              setCurrentPage(pageNum);
              if (index === flipSequence.length - 1) {
                setTimeout(() => {
                  setCurrentPage(0);
                  setIsFlipping(false);
                }, 200);
              }
            }, index * 150);
          });
        }, 800);
      }, 300);
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
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 폰 인증 단계 */}
          {step === 'phone' && (
            <div className={styles.formSection}>
              <h2 className={styles.title}>축의금 전달</h2>
              <p className={styles.subtitle}>간편한 본인 확인이 필요해요</p>
              
              <div className={styles.inputGroup}>
                <label className={styles.label}>휴대폰 번호</label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                />
              </div>
              
              {/* 개인정보 보호 안내 - 토스 스타일 */}
              <div className={styles.tossSecurity}>
                <div className={styles.lockAnimation}>
                  <span className={styles.lockIcon}>🔒</span>
                </div>
                
                <label className={styles.tossCheckbox}>
                  <input
                    type="checkbox"
                    checked={privacyAgreed}
                    onChange={(e) => setPrivacyAgreed(e.target.checked)}
                    className={styles.checkbox}
                  />
                  <span className={styles.checkboxLabel}>개인정보 수집 동의</span>
                </label>
                
                <p className={styles.tossPrivacyText}>
                  수집된 휴대폰 번호는 <strong>오직 본인 확인 목적으로만</strong> 사용됩니다
                </p>
              </div>
              
              {error && <p className={styles.error}>{error}</p>}
              
              <button
                className={styles.submitButton}
                onClick={sendVerificationCode}
                disabled={isLoading || !formData.phone || !privacyAgreed}
              >
                {isLoading ? '발송 중...' : '인증번호 받기'}
              </button>
            </div>
          )}

          {/* 인증번호 확인 단계 */}
          {step === 'verification' && (
            <div className={styles.formSection}>
              <h2 className={styles.title}>인증번호 확인</h2>
              <p className={styles.subtitle}>
                {formData.phone}로 발송된<br />
                6자리 인증번호를 입력해주세요
              </p>
              
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="123456"
                  value={formData.verificationCode}
                  onChange={(e) => {
                    const code = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                    setFormData({ ...formData, verificationCode: code });
                  }}
                  maxLength={6}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonGroup}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setStep('phone')}
                  disabled={isLoading}
                >
                  이전
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={verifyCode}
                  disabled={isLoading || formData.verificationCode.length !== 6}
                >
                  {isLoading ? '확인 중...' : '인증완료'}
                </button>
              </div>

              <button
                className={styles.resendButton}
                onClick={sendVerificationCode}
                disabled={isLoading || timer > 0}
              >
                {timer > 0 ? `재전송 (${formatTimer(timer)})` : '인증번호 재전송'}
              </button>
            </div>
          )}

          {/* 축의금 입력 폼 */}
          {step === 'form' && (
            <div className={styles.formSection}>
              <h2 className={styles.title}>{editData ? '축의금 수정' : '축의금 정보'}</h2>
              <p className={styles.subtitle}>
                {editData ? '축의금 정보를 수정해주세요' : `${brideName}님과 ${groomName}님께 축의금을 전달해주세요`}
              </p>

              {/* 책자 애니메이션 (편집 모드가 아닐 때만) */}
              {!editData && (
                <div className={`${styles.bookContainer} ${showBook ? styles.showBook : ''}`}>
                  <div className={styles.book}>
                    {/* 책 페이지들 */}
                    <div className={styles.bookPages}>
                      {[...Array(8)].map((_, pageIndex) => (
                        <div
                          key={pageIndex}
                          className={`${styles.bookPage} ${currentPage >= pageIndex ? styles.pageFlipped : ''} ${isFlipping ? styles.flipping : ''}`}
                          style={{
                            zIndex: 20 - pageIndex,
                            transformOrigin: 'left center'
                          }}
                        >
                          {/* 왼쪽 페이지 (뒤집힌 상태에서 보이는 부분) */}
                          <div className={styles.pageBack}>
                            <div className={styles.guestNames}>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>홍</span>
                                <span className={styles.guestName}>길</span>
                                <span className={styles.guestName}>동</span>
                              </div>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>강</span>
                                <span className={styles.guestName}>수</span>
                                <span className={styles.guestName}>지</span>
                              </div>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>오</span>
                                <span className={styles.guestName}>정</span>
                                <span className={styles.guestName}>민</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* 오른쪽 페이지 (기본 상태에서 보이는 부분) */}
                          <div className={styles.pageContent}>
                            <div className={styles.guestNames}>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>김</span>
                                <span className={styles.guestName}>민</span>
                                <span className={styles.guestName}>수</span>
                              </div>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>이</span>
                                <span className={styles.guestName}>영</span>
                                <span className={styles.guestName}>희</span>
                              </div>
                              <div className={styles.nameColumn}>
                                <span className={styles.guestName}>박</span>
                                <span className={styles.guestName}>철</span>
                                <span className={styles.guestName}>수</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
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