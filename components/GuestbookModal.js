// components/GuestbookModal.js - 방명록 작성 모달 (인증 시스템 포함)
import React, { useState, useRef, useEffect } from 'react';
import styles from './GuestbookModal.module.css';

const GuestbookModal = ({ isOpen, onClose, onSubmit, eventData, onTriggerArrival }) => {
  // 모달 고유 ID 생성 (디버깅용)
  const modalId = useRef(Math.random().toString(36).substr(2, 9));
  
  const [step, setStep] = useState('info'); // 'info', 'verification', 'message'
  const [mode, setMode] = useState('create'); // 'create' 또는 'edit'
  const [existingGuestbook, setExistingGuestbook] = useState(null);
  const [formData, setFormData] = useState({
    phone: '',
    verificationCode: '',
    guestName: '',
    message: '',
    contributionAmount: '',
    relationship: '',
    agreed: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState('');
  
  const timerRef = useRef(null);
  
  // 모달 닫기 상태 관리 (hooks를 조건문 위로 이동)
  const [isClosing, setIsClosing] = useState(false);
  const closeTimeoutRef = useRef(null);

  // 타이머 관리
  useEffect(() => {
    if (timer > 0) {
      timerRef.current = setTimeout(() => setTimer(timer - 1), 1000);
    } else if (timer === 0 && verificationSent) {
      setVerificationSent(false);
    }
    return () => clearTimeout(timerRef.current);
  }, [timer, verificationSent]);

  // 모달 열릴 때 verifiedPhone 체크 및 기존 방명록 로드
  useEffect(() => {
    if (isOpen) {
      const verifiedPhone = localStorage.getItem('verifiedPhone');
      if (verifiedPhone && eventData?.id) {
        // 인증된 번호가 있으면 기존 방명록 확인
        checkExistingGuestbook(verifiedPhone);
      }
    } else {
      // 모달 닫힐 때 초기화
      setStep('info');
      setMode('create');
      setExistingGuestbook(null);
      setFormData({ phone: '', verificationCode: '', guestName: '', message: '', contributionAmount: '', relationship: '', agreed: false });
      setVerificationSent(false);
      setTimer(0);
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

  // 기존 방명록 확인 함수
  const checkExistingGuestbook = async (phone) => {
    try {
      const response = await fetch('/api/check-guestbook-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone,
          eventId: eventData.id
        }),
      });

      const result = await response.json();

      if (result.exists && result.existingEntry) {
        // 기존 방명록이 있으면 수정 모드로
        setMode('edit');
        setExistingGuestbook(result.existingEntry);
        setFormData(prev => ({
          ...prev,
          phone: formatPhoneNumberFromE164(phone),
          guestName: result.existingEntry.guest_name || '',
          message: result.existingEntry.message || '',
          agreed: true
        }));
        setStep('message'); // 바로 메시지 수정 단계로
      } else {
        // 기존 방명록이 없으면 작성 모드로
        setMode('create');
        setFormData(prev => ({
          ...prev,
          phone: formatPhoneNumberFromE164(phone),
          agreed: true
        }));
        setStep('message'); // 바로 메시지 작성 단계로
      }
    } catch (error) {
      console.error('기존 방명록 확인 오류:', error);
      // 오류 발생시 일반 모드로 진행
    }
  };

  // E.164 형식에서 일반 형식으로 변환
  const formatPhoneNumberFromE164 = (phone) => {
    if (phone.startsWith('+82')) {
      const numbers = '0' + phone.slice(3);
      if (numbers.length <= 3) return numbers;
      if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
    }
    return phone;
  };

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // 전화번호 포맷팅
  const formatPhoneNumber = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    if (numbers.length > 11) return formData.phone;
    if (numbers.length <= 3) return numbers;
    if (numbers.length <= 7) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  };

  // 인증번호 발송
  const sendVerificationCode = async () => {
    const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
    if (phoneNumbers.length !== 11) {
      setError('올바른 휴대폰 번호를 입력해주세요.');
      return;
    }

    if (!formData.agreed) {
      setError('개인정보 수집 및 이용에 동의해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const verifiedPhone = `+82${phoneNumbers.slice(1)}`;

      // 먼저 중복 방명록 확인
      const duplicateCheckResponse = await fetch('/api/check-guestbook-duplicate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: verifiedPhone,
          eventId: eventData?.id
        }),
      });

      const duplicateResult = await duplicateCheckResponse.json();

      if (!duplicateResult.success) {
        setError(duplicateResult.error || '중복 확인 중 오류가 발생했습니다.');
        return;
      }

      // 이미 방명록을 작성한 경우
      if (duplicateResult.isDuplicate) {
        const existingEntry = duplicateResult.existingEntry;
        const sessionPhone = localStorage.getItem('verifiedPhone');
        
        // 세션이 있는 경우 (브라우저가 안 꺼진 경우)
        if (sessionPhone === verifiedPhone) {
          const createdDate = new Date(existingEntry.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          setError(`이미 이 번호로 "${existingEntry.name}"님이 ${createdDate}에 방명록을 작성하셨습니다.\n\n기존 방명록을 수정하시려면 목록에서 수정 버튼을 눌러주세요.`);
          return;
        } else {
          // 세션이 없는 경우 (브라우저를 껐다 켠 경우) - 수정 모드로 인증번호 발송
          setMode('edit');
          setExistingGuestbook(existingEntry);
          console.log('Debug - 수정 모드로 설정됨:', existingEntry);
        }
      } else {
        // 중복이 없는 경우 - 새 방명록 작성 모드
        setMode('create');
        setExistingGuestbook(null);
      }

      // 중복이 없으면 인증번호 발송
      const response = await fetch('/api/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: verifiedPhone
        }),
      });

      const result = await response.json();

      if (result.success) {
        setVerificationSent(true);
        setTimer(300); // 5분
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
        // 인증 성공 시 세션 스토리지에 전화번호 저장
        const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
        const verifiedPhone = `+82${phoneNumbers.slice(1)}`;
        localStorage.setItem('verifiedPhone', verifiedPhone);
        console.log('Debug - Original phone:', formData.phone);
        console.log('Debug - Phone numbers only:', phoneNumbers);
        console.log('Debug - Saved to session:', verifiedPhone);
        console.log('Debug - Mode:', mode);
        
        // 수정 모드인 경우 기존 데이터로 폼 채우기
        if (mode === 'edit' && existingGuestbook) {
          // 기존 방명록 전체 데이터 가져오기
          const fetchMyGuestbook = async () => {
            try {
              const response = await fetch('/api/get-my-guestbook', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  phone: verifiedPhone,
                  eventId: eventData?.id
                }),
              });

              const result = await response.json();
              
              if (result.success) {
                setFormData(prev => ({
                  ...prev,
                  guestName: result.guestbook.name || '',
                  message: result.guestbook.message || ''
                }));
                setExistingGuestbook(result.guestbook);
              }
            } catch (error) {
              console.error('기존 방명록 조회 오류:', error);
            }
          };
          
          fetchMyGuestbook();
        }
        
        setStep('message');
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

  // 방명록 제출
  const submitGuestbook = async () => {
    if (!formData.guestName.trim()) {
      setError('이름을 입력해주세요.');
      return;
    }
    if (!formData.message.trim()) {
      setError('방명록 내용을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneNumbers = formData.phone.replace(/[^\d]/g, '');
      const verifiedPhone = `+82${phoneNumbers.slice(1)}`;
      
      if (mode === 'edit' && existingGuestbook) {
        // 수정 모드 - 기존 방명록 수정
        const response = await fetch('/api/update-guestbook', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: existingGuestbook.id,
            guestName: formData.guestName.trim(),
            message: formData.message.trim(),
            phone: verifiedPhone
          }),
        });

        const result = await response.json();

        if (result.success) {
          // 기존 onSubmit 콜백도 호출 (템플릿 업데이트용)
          await onSubmit({
            name: formData.guestName.trim(),
            phone: verifiedPhone,
            message: formData.message.trim()
          });
          onClose();
          
          // 방명록 수정 완료 후 도착 확인 모달 트리거
          if (onTriggerArrival) {
            setTimeout(() => onTriggerArrival(), 500);
          }
        } else {
          setError(result.error || '방명록 수정에 실패했습니다.');
        }
      } else {
        // 새 작성 모드 - 새로운 방명록 작성
        const response = await fetch('/api/submit-guestbook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: verifiedPhone,
            guestName: formData.guestName.trim(),
            message: formData.message.trim(),
            eventId: eventData?.id || null
          }),
        });

        const result = await response.json();

        if (result.success) {
          // 기존 onSubmit 콜백도 호출 (템플릿 업데이트용)
          await onSubmit({
            name: formData.guestName.trim(),
            phone: verifiedPhone,
            message: formData.message.trim()
          });
          onClose();
          
          // 방명록 작성 완료 후 도착 확인 모달 트리거
          if (onTriggerArrival) {
            setTimeout(() => onTriggerArrival(), 500);
          }
        } else {
          setError(result.error || '방명록 저장에 실패했습니다.');
        }
      }
    } catch (error) {
      console.error('방명록 제출 오류:', error);
      setError('방명록 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  // 타이머 포맷
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  console.log('🔵 GuestbookModal 렌더링됨:', { modalId: modalId.current, isOpen, step, mode });

  // 모달 닫기 핸들러 (중복 실행 방지)
  const handleClose = (e) => {
    console.log('🔴 모달 닫기 시도:', { modalId: modalId.current, isLoading, isClosing, event: e?.type });
    
    e?.preventDefault();
    e?.stopPropagation();
    
    if (isLoading || isClosing) {
      console.log('🔴 모달 닫기 차단됨:', { modalId: modalId.current, isLoading, isClosing });
      return;
    }
    
    console.log('🔴 모달 닫기 실행:', { modalId: modalId.current });
    setIsClosing(true);
    
    // 즉시 닫기 실행
    onClose();
    
    // 300ms 후에 닫기 상태 해제 (다음 열기를 위해)
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsClosing(false);
      console.log('🔴 모달 닫기 상태 해제:', { modalId: modalId.current });
    }, 300);
  };

  return (
    <div 
      className={styles.overlay} 
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose(e);
        }
      }}
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>
            {step === 'info' && '안전한 방명록 작성'}
            {step === 'verification' && '인증번호 확인'}
            {step === 'message' && (mode === 'edit' ? '방명록 수정하기' : '방명록 남기기')}
          </h3>
          <button 
            className={styles.closeButton} 
            onClick={handleClose}
            disabled={isLoading || isClosing}
            type="button"
          >
            ×
          </button>
        </div>

        <div className={styles.content}>
          {step === 'info' && (
            <>
              <div className={styles.welcomeSection}>
                <p className={styles.welcomeDescription}>
                  스팸이나 부적절한 내용 방지를 위해<br />
                  간단한 본인인증을 진행해주세요
                </p>
              </div>

              <div className={styles.safetyBox}>
                <div className={styles.safetyHeader}>
                  <span className={styles.safetyIcon}>🛡️</span>
                  <span className={styles.safetyTitle}>개인정보 보호 약속</span>
                </div>
                <div className={styles.safetyContent}>
                  <div className={styles.safetyItem}>
                    <span className={styles.checkmark}>✓</span>
                    <span>광고나 마케팅 목적으로 절대 사용하지 않습니다</span>
                  </div>
                  <div className={styles.safetyItem}>
                    <span className={styles.checkmark}>✓</span>
                    <span>오직 스팸 방지 및 본인인증 목적으로만 사용</span>
                  </div>
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  <span className={styles.labelIcon}>📱</span>
                  휴대폰 번호
                </label>
                <input
                  type="tel"
                  className={styles.input}
                  placeholder="010-1234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })}
                  maxLength={13}
                />
              </div>

              <div className={styles.checkboxGroup}>
                <label className={styles.modernCheckboxLabel}>
                  <div className={styles.modernCheckbox}>
                    <input
                      type="checkbox"
                      className={styles.hiddenCheckbox}
                      checked={formData.agreed}
                      onChange={(e) => setFormData({ ...formData, agreed: e.target.checked })}
                    />
                    <div className={styles.customCheckbox}>
                      {formData.agreed && <span className={styles.checkIcon}>✓</span>}
                    </div>
                  </div>
                  <div className={styles.checkboxContent}>
                    <span className={styles.checkboxMainText}>
                      개인정보 수집 및 이용에 동의합니다
                    </span>
                    <span className={styles.checkboxSubText}>
                      스팸 방지 목적으로만 사용되며, 광고 등 다른 용도로는 절대 사용되지 않습니다
                    </span>
                  </div>
                </label>
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <button
                className={styles.primaryButton}
                onClick={sendVerificationCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    발송 중...
                  </>
                ) : (
                  <>
                    <span className={styles.buttonIcon}>🚀</span>
                    인증번호 받기
                  </>
                )}
              </button>
            </>
          )}

          {step === 'verification' && (
            <>
              <div className={styles.verificationInfo}>
                <p className={styles.phoneDisplay}>{formData.phone}</p>
                <p className={styles.verificationText}>
                  위 번호로 발송된 6자리 인증번호를 입력해주세요
                </p>
                {timer > 0 && (
                  <p className={styles.timer}>
                    인증번호 유효시간: {formatTimer(timer)}
                  </p>
                )}
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>인증번호</label>
                <input
                  type="text"
                  className={`${styles.input} ${styles.verificationInput}`}
                  placeholder="123456"
                  value={formData.verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^\d]/g, '');
                    if (value.length <= 6) {
                      setFormData({ ...formData, verificationCode: value });
                    }
                  }}
                  maxLength={6}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonGroup}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => setStep('info')}
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
            </>
          )}

          {step === 'message' && (
            <>
              <div className={styles.inputGroup}>
                <label className={styles.label}>이름</label>
                <input
                  type="text"
                  className={styles.input}
                  placeholder="이름을 입력해주세요"
                  value={formData.guestName}
                  onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                />
              </div>

              <div className={styles.inputGroup}>
                <label className={styles.label}>
                  {mode === 'edit' ? '방명록 수정' : `${eventData.bride_name || '하윤'}님과 ${eventData.groom_name || '민호'}님에게 전하는 마음`}
                </label>
                <textarea
                  className={styles.textarea}
                  placeholder={mode === 'edit' ? '방명록을 수정해주세요' : '축하 메시지를 남겨주세요'}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                />
              </div>

              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.buttonGroup}>
                <button
                  className={styles.secondaryButton}
                  onClick={() => {
                    // verifiedPhone으로 바로 온 경우는 모달을 닫고, 인증 과정을 거친 경우는 이전 단계로
                    if (localStorage.getItem('verifiedPhone') && !verificationSent) {
                      onClose();
                    } else {
                      setStep('verification');
                    }
                  }}
                  disabled={isLoading}
                >
                  {localStorage.getItem('verifiedPhone') && !verificationSent ? '취소' : '이전'}
                </button>
                <button
                  className={styles.primaryButton}
                  onClick={submitGuestbook}
                  disabled={isLoading || !formData.guestName.trim() || !formData.message.trim()}
                >
                  {isLoading ? (mode === 'edit' ? '수정 중...' : '등록 중...') : (mode === 'edit' ? '방명록 수정' : '방명록 등록')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GuestbookModal;