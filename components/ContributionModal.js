// components/ContributionModal.js - 축의금 입력 모달 (폰 인증 포함)
import React, { useState, useEffect, useMemo } from 'react';
import styles from './ContributionModal.module.css';

const ContributionModal = ({ isOpen, onClose, onBack, onSubmit, eventData, editData = null }) => {
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

  // 폼 멀티스텝 상태
  const [formStep, setFormStep] = useState('book');

  // 책자 페이지 랜덤 이름 (마운트 시 1회 생성) - 18면 × 9명 = 162슬롯, 중복 없음
  const pageNames = useMemo(() => {
    const pool = [
      '김민준', '이서준', '박예준', '최도윤', '정시우', '강주원', '조하준', '윤지호', '장준서', '임준혁',
      '오현우', '한지훈', '신민재', '서유준', '권건우', '황민성', '안준영', '송승현', '류시현', '전정우',
      '홍지우', '고민규', '문현준', '양우진', '손서연', '배수빈', '백지민', '허지유', '유지현', '남지윤',
      '심하은', '노수아', '하지아', '곽나은', '성하린', '차주아', '주예은', '우채원', '구소연', '민아름',
      '김서윤', '이지민', '박지유', '최현서', '정채은', '강예린', '조나연', '윤유진', '장지수', '임하늘',
      '오도현', '한승민', '신태양', '서민호', '권진우', '황지훈', '안상현', '송재원', '류민아', '전하윤',
      '홍성준', '고지원', '문예진', '양소희', '손수민', '배민준', '백서윤', '허주연', '유선우', '남도현',
      '심채린', '노예원', '하도훈', '곽재민', '성예나', '차수연', '주민지', '우예진', '구나래', '민승호',
      '김지호', '이현우', '박성민', '최지은', '정하린', '강민서', '조예슬', '윤성재', '장하윤', '임채원',
      '오지우', '한예린', '신민서', '서정우', '권민준', '황서연', '안유진', '송하은', '류지수', '전민재',
      '홍예나', '고성준', '문서연', '양민준', '손예린', '배지호', '백하은', '허성민', '유예슬', '남채은',
      '심도현', '노민서', '하지민', '곽서준', '성민준', '차하늘', '주지호', '우민서', '구성현', '민예진',
      '김하은', '이채원', '박민지', '최지호', '정민준', '강하린', '조서준', '윤예진', '장성민', '임도현',
      '오채원', '한민서', '신예나', '서지민', '권하은', '황도현', '안채원', '송도현', '류예진', '전성민',
      '홍하린', '고민서', '문지호', '양하은', '손민준', '배예진', '백도현', '허채원', '유하린', '남민서',
      '심예나', '노지호', '하채운', '곽민준', '성하은', '차예진', '주도현', '우하린', '구민서', '민채원',
      '김준서', '이하린', '박채원'
    ];
    // Fisher-Yates 셔플
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    // 18 그룹 × 9명 — pool이 162개 이상이므로 순환 없음
    return Array.from({ length: 18 }, (_, gi) =>
      Array.from({ length: 9 }, (__, ni) => pool[gi * 9 + ni])
    );
  }, []);

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

  // 모달 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

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
        setFormStep('name'); // 편집 모드에서는 책자 애니메이션 스킵
        setShowBook(false);
      } else {
        const verifiedPhone = localStorage.getItem('verifiedPhone');
        if (verifiedPhone) {
          setStep('form');
          setFormStep('name'); // 이미 인증된 경우 책자 애니메이션 스킵
          setShowBook(false);
        } else {
          setStep('phone');
          setFormStep('book');
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
      setFormStep('book');
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

  // 축의금 폼 단계에서 책자 애니메이션 시작 (덮개만 자동, 페이지는 인터랙티브)
  useEffect(() => {
    if (step === 'form' && formStep === 'book' && !editData) {
      const bookTimer = setTimeout(() => {
        setShowBook(true);

        // 책이 나타난 후 덮개 열기
        const coverTimer = setTimeout(() => {
          setCoverOpen(true);
          // 덮개 열리고 나면 텍스트/다음 버튼 활성화
          setTimeout(() => setShowText(true), 500);
        }, 700);

        return () => clearTimeout(coverTimer);
      }, 500);

      return () => clearTimeout(bookTimer);
    }
  }, [step, formStep, editData]);

  // 책 페이지 인터랙티브 넘기기
  const handleBookFlipRight = () => {
    if (coverOpen && currentPage < 8) {
      setCurrentPage(p => p + 1);
    }
  };

  const handleBookFlipLeft = () => {
    if (coverOpen && currentPage > 0) {
      setCurrentPage(p => p - 1);
    }
  };

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
        setFormStep('book');
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
      setFormStep('book');
      setError('');

      onClose();
    } catch (error) {
      setError(error.message || '축의금 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 멀티스텝 폼 네비게이션
  const formSteps = editData ? ['name', 'amount', 'side', 'relation'] : ['book', 'name', 'amount', 'side', 'relation'];
  const currentFormStepIndex = formSteps.indexOf(formStep);

  const goFormNext = () => {
    if (currentFormStepIndex < formSteps.length - 1) {
      setFormStep(formSteps[currentFormStepIndex + 1]);
      setError('');
    }
  };

  const goFormBack = () => {
    if (currentFormStepIndex > 0) {
      setFormStep(formSteps[currentFormStepIndex - 1]);
      setError('');
    }
  };

  if (!isOpen) return null;

  const brideName = eventData?.bride_name || '하윤';
  const groomName = eventData?.groom_name || '민호';

  // 페이지 이름 3열 렌더링 헬퍼
  const renderNameColumns = (names) => (
    <div className={styles.guestNames}>
      {[0, 1, 2].map(col => (
        <div key={col} className={styles.nameColumn}>
          {[0, 1, 2].map(row => (
            <span key={row} className={styles.guestName}>{names[col * 3 + row]}</span>
          ))}
        </div>
      ))}
    </div>
  );

  // SVG 아이콘 재사용
  const BackIcon = () => (
    <svg width="10" height="18" viewBox="0 0 10 18" fill="none">
      <path d="M9 1L1 9L9 17" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
  const CloseIcon = () => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M1 1L17 17M17 1L1 17" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* 드래그 핸들 */}
        <div className={styles.dragHandle} />

        <div className={styles.content}>
          {/* 폰 인증 단계 */}
          {step === 'phone' && (
            <>
              <div className={styles.sheetHeader}>
                <button className={styles.backButton} onClick={onBack || onClose}>
                  <BackIcon />
                </button>
                <button className={styles.closeButton} onClick={onClose}>
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.sheetTitleSection}>
                <h2 className={styles.sheetTitle}>안전한 축의금 전달을 위해{'\n'}휴대폰 번호를 인증해주세요</h2>
              </div>

              <div className={styles.sheetForm}>
                <div className={styles.sheetInputGroup}>
                  <label className={styles.sheetLabel}>휴대폰 번호</label>
                  <input
                    type="tel"
                    className={styles.sheetInput}
                    placeholder="010-0000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  />
                </div>

                <div className={styles.sheetAgreement} onClick={() => setPrivacyAgreed(!privacyAgreed)}>
                  <div className={`${styles.sheetCheckbox} ${privacyAgreed ? styles.sheetChecked : ''}`}>
                    {privacyAgreed && (
                      <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                        <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span className={styles.sheetAgreementText}>[필수] 개인정보 수집 및 이용 동의</span>
                  <span className={styles.sheetAgreementLink}>보기</span>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <button
                  className={styles.sheetSubmitButton}
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
              <div className={styles.sheetHeader}>
                <button className={styles.backButton} onClick={() => setStep('phone')}>
                  <BackIcon />
                </button>
                <button className={styles.closeButton} onClick={onClose}>
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.sheetTitleSection}>
                <h2 className={styles.sheetTitle}>휴대폰으로 전송된{'\n'}인증번호를 입력해주세요</h2>
                <p className={styles.verificationPhone}>{formData.phone}</p>
              </div>

              <div className={styles.sheetForm}>
                <div className={styles.verificationInputWrapper}>
                  <input
                    type="text"
                    className={styles.verificationCodeInput}
                    placeholder="인증번호 6자리"
                    value={formData.verificationCode}
                    onChange={(e) => {
                      const code = e.target.value.replace(/[^\d]/g, '').slice(0, 6);
                      setFormData({ ...formData, verificationCode: code });
                    }}
                    maxLength={6}
                    autoFocus
                  />
                  {timer > 0 && (
                    <span className={styles.verificationTimer}>{formatTimer(timer)}</span>
                  )}
                </div>

                <div className={styles.verificationResendRow}>
                  <button
                    className={styles.resendTextButton}
                    onClick={sendVerificationCode}
                    disabled={isLoading || timer > 0}
                  >
                    인증번호 재전송
                  </button>
                </div>

                {error && <div className={styles.errorMessage}>{error}</div>}

                <div className={styles.verificationButtonRow}>
                  <button
                    className={styles.prevButton}
                    onClick={() => setStep('phone')}
                    disabled={isLoading}
                  >
                    이전
                  </button>
                  <button
                    className={styles.verifyButton}
                    onClick={verifyCode}
                    disabled={isLoading || formData.verificationCode.length !== 6}
                  >
                    {isLoading ? '확인 중...' : '인증완료'}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* 축의금 입력 폼 - 멀티스텝 */}
          {step === 'form' && (
            <>
              {/* ── 스텝 1: 책자 애니메이션 ── */}
              {formStep === 'book' && (
                <>
                  <div className={styles.formBookHeader}>
                    <button className={styles.closeButton} onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    {formSteps.map((s, i) => (
                      <div
                        key={s}
                        className={`${styles.progressStep} ${currentFormStepIndex >= i ? styles.progressStepActive : ''}`}
                      />
                    ))}
                  </div>
                  <div className={styles.bookStepContent}>
                    <p className={styles.subtitle}>
                      {brideName}님과 {groomName}님께{'\n'}축의금을 전달해주세요
                    </p>

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
                            <div className={styles.coverBackContent} />
                          </div>
                        </div>

                        {/* 왼쪽 고정 페이지 (currentPage=0 일 때의 왼쪽 베이스) */}
                        <div className={styles.fixedLeftPage} style={{display: currentPage === 0 ? 'flex' : 'none', zIndex: 2}}>
                          <div className={styles.pageContent}>
                            {coverOpen && renderNameColumns(pageNames[0])}
                          </div>
                        </div>

                        {/* 오른쪽 고정 페이지 (currentPage=8, 모든 페이지 넘긴 후 오른쪽 베이스) */}
                        <div className={styles.fixedRightPage} style={{display: currentPage >= 8 ? 'flex' : 'none', zIndex: 1}}>
                          <div className={styles.pageContent}>
                            {renderNameColumns(pageNames[1])}
                          </div>
                        </div>

                        {/*
                          z-index 전략:
                          - 미뒤집힘(오른쪽 스택): 낮은 번호가 앞 → zIndex = 16 - N
                          - 뒤집힘(왼쪽 스택): 높은 번호가 앞(가장 최근 뒤집힌 것이 위) → zIndex = N
                          이렇게 해야 왼쪽에 현재 펼친 페이지 뒷면이 정확히 보임
                        */}

                        {/* 페이지 1 */}
                        <div className={`${styles.page} ${currentPage >= 1 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 1 ? 1 : 15 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[2])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[3])}</div>
                          </div>
                        </div>

                        {/* 페이지 2 */}
                        <div className={`${styles.page} ${currentPage >= 2 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 2 ? 2 : 14 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[4])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[5])}</div>
                          </div>
                        </div>

                        {/* 페이지 3 */}
                        <div className={`${styles.page} ${currentPage >= 3 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 3 ? 3 : 13 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[6])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[7])}</div>
                          </div>
                        </div>

                        {/* 페이지 4 */}
                        <div className={`${styles.page} ${currentPage >= 4 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 4 ? 4 : 12 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[8])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[9])}</div>
                          </div>
                        </div>

                        {/* 페이지 5 */}
                        <div className={`${styles.page} ${currentPage >= 5 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 5 ? 5 : 11 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[10])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[11])}</div>
                          </div>
                        </div>

                        {/* 페이지 6 */}
                        <div className={`${styles.page} ${currentPage >= 6 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 6 ? 6 : 10 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[12])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[13])}</div>
                          </div>
                        </div>

                        {/* 페이지 7 */}
                        <div className={`${styles.page} ${currentPage >= 7 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 7 ? 7 : 9 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[14])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[15])}</div>
                          </div>
                        </div>

                        {/* 페이지 8 */}
                        <div className={`${styles.page} ${currentPage >= 8 ? styles.flipped : ''}`} style={{ zIndex: currentPage >= 8 ? 8 : 8 }}>
                          <div className={styles.front}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[16])}</div>
                          </div>
                          <div className={styles.back}>
                            <div className={styles.pageContent}>{renderNameColumns(pageNames[17])}</div>
                          </div>
                        </div>

                        {/* 인터랙티브 터치 영역 - 덮개가 열린 후 표시 */}
                        {coverOpen && (
                          <>
                            {currentPage > 0 && (
                              <div className={styles.bookTapLeft} onClick={handleBookFlipLeft}>
                                <span className={styles.bookTapArrow}>‹</span>
                              </div>
                            )}
                            {currentPage < 8 && (
                              <div className={styles.bookTapRight} onClick={handleBookFlipRight}>
                                <span className={styles.bookTapArrow}>›</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* 페이지 인디케이터 */}
                    {coverOpen && (
                      <div className={styles.bookPageIndicator}>
                        {currentPage === 0
                          ? '오른쪽을 눌러 책장을 넘겨보세요'
                          : currentPage === 8
                          ? '마지막 페이지예요'
                          : `${currentPage} / 8`
                        }
                      </div>
                    )}

                    {error && <p className={styles.error}>{error}</p>}

                    <button
                      className={styles.sheetSubmitButton}
                      onClick={goFormNext}
                      disabled={!showText}
                    >
                      다음
                    </button>
                  </div>
                </>
              )}

              {/* ── 스텝 2: 성함 ── */}
              {formStep === 'name' && (
                <>
                  <div className={styles.sheetHeader}>
                    {!editData ? (
                      <button className={styles.backButton} onClick={goFormBack}>
                        <BackIcon />
                      </button>
                    ) : <div />}
                    <button className={styles.closeButton} onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    {formSteps.map((s, i) => (
                      <div key={s} className={`${styles.progressStep} ${currentFormStepIndex >= i ? styles.progressStepActive : ''}`} />
                    ))}
                  </div>
                  <div className={styles.sheetTitleSection}>
                    <h2 className={styles.sheetTitle}>성함을 입력해주세요</h2>
                  </div>
                  <div className={styles.sheetForm}>
                    <div className={styles.sheetInputGroup}>
                      <label className={styles.sheetLabel}>성함</label>
                      <input
                        type="text"
                        className={styles.sheetInput}
                        placeholder="이름을 입력해주세요"
                        value={formData.guestName}
                        onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                        autoFocus
                      />
                    </div>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <button
                      className={styles.sheetSubmitButton}
                      onClick={goFormNext}
                      disabled={!formData.guestName.trim()}
                    >
                      다음
                    </button>
                  </div>
                </>
              )}

              {/* ── 스텝 3: 축의금 금액 ── */}
              {formStep === 'amount' && (
                <>
                  <div className={styles.sheetHeader}>
                    <button className={styles.backButton} onClick={goFormBack}>
                      <BackIcon />
                    </button>
                    <button className={styles.closeButton} onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    {formSteps.map((s, i) => (
                      <div key={s} className={`${styles.progressStep} ${currentFormStepIndex >= i ? styles.progressStepActive : ''}`} />
                    ))}
                  </div>
                  <div className={styles.sheetTitleSection}>
                    <h2 className={styles.sheetTitle}>축의금 금액을 입력해주세요</h2>
                  </div>
                  <div className={styles.sheetForm}>
                    <div className={styles.sheetInputGroup}>
                      <label className={styles.sheetLabel}>금액</label>
                      <input
                        type="text"
                        className={styles.sheetInput}
                        placeholder="100,000"
                        value={formData.contributionAmount}
                        onChange={(e) => setFormData({ ...formData, contributionAmount: formatAmount(e.target.value) })}
                        autoFocus
                      />
                    </div>
                    <div className={styles.quickAmountGroup}>
                      {['30,000', '50,000', '100,000', '200,000'].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          className={`${styles.quickAmountButton} ${formData.contributionAmount === amt ? styles.quickAmountActive : ''}`}
                          onClick={() => setFormData({ ...formData, contributionAmount: amt })}
                        >
                          {amt}원
                        </button>
                      ))}
                    </div>
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <button
                      className={styles.sheetSubmitButton}
                      onClick={goFormNext}
                      disabled={!formData.contributionAmount.replace(/[^\d]/g, '')}
                    >
                      다음
                    </button>
                  </div>
                </>
              )}

              {/* ── 스텝 4: 구분 ── */}
              {formStep === 'side' && (
                <>
                  <div className={styles.sheetHeader}>
                    <button className={styles.backButton} onClick={goFormBack}>
                      <BackIcon />
                    </button>
                    <button className={styles.closeButton} onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    {formSteps.map((s, i) => (
                      <div key={s} className={`${styles.progressStep} ${currentFormStepIndex >= i ? styles.progressStepActive : ''}`} />
                    ))}
                  </div>
                  <div className={styles.sheetTitleSection}>
                    <h2 className={styles.sheetTitle}>어느 측으로 전달할까요?</h2>
                  </div>
                  <div className={styles.sheetForm}>
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
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <button
                      className={styles.sheetSubmitButton}
                      onClick={goFormNext}
                      disabled={!formData.side}
                    >
                      다음
                    </button>
                  </div>
                </>
              )}

              {/* ── 스텝 5: 관계 ── */}
              {formStep === 'relation' && (
                <>
                  <div className={styles.sheetHeader}>
                    <button className={styles.backButton} onClick={goFormBack}>
                      <BackIcon />
                    </button>
                    <button className={styles.closeButton} onClick={onClose}>
                      <CloseIcon />
                    </button>
                  </div>
                  <div className={styles.progressBarWrapper}>
                    {formSteps.map((s, i) => (
                      <div key={s} className={`${styles.progressStep} ${currentFormStepIndex >= i ? styles.progressStepActive : ''}`} />
                    ))}
                  </div>
                  <div className={styles.sheetTitleSection}>
                    <h2 className={styles.sheetTitle}>관계를 선택해주세요</h2>
                  </div>
                  <div className={styles.sheetForm}>
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
                    {error && <div className={styles.errorMessage}>{error}</div>}
                    <button
                      className={styles.sheetSubmitButton}
                      onClick={handleSubmit}
                      disabled={isLoading || !formData.relationship}
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;
