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

  // 모달 닫힐 때 초기화
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        guestName: '',
        contributionAmount: '',
        relationship: '',
        side: ''
      });
      setError('');
      setIsLoading(false);
    }
  }, [isOpen]);

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
          <h3 className={styles.title}>축의금 기입</h3>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/* 안내 메시지 */}
          <div className={styles.infoBox}>
            <div className={styles.bookAnimation}>
              <span className={styles.bookIcon}>📖</span>
              <div className={styles.pages}>
                <div className={styles.page}></div>
                <div className={styles.page}></div>
                <div className={styles.page}></div>
              </div>
            </div>
            <p className={styles.infoText}>
              디지털 방명록에 축의금을<br />
              기록해주세요
            </p>
          </div>

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
            <label className={styles.label}>축의금</label>
            <div className={styles.amountContainer}>
              <input
                type="text"
                className={styles.input}
                placeholder="금액을 입력해주세요"
                value={formData.contributionAmount}
                onChange={(e) => {
                  const formatted = formatAmount(e.target.value);
                  setFormData({ ...formData, contributionAmount: formatted });
                }}
              />
              <span className={styles.currency}>원</span>
            </div>
          </div>

          {/* 신랑측/신부측 선택 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>구분</label>
            <div className={styles.sideSelection}>
              <button
                type="button"
                className={`${styles.sideButton} ${formData.side === 'groom' ? styles.active : ''}`}
                onClick={() => setFormData({ ...formData, side: 'groom' })}
              >
                신랑측 ({groomName}님)
              </button>
              <button
                type="button"
                className={`${styles.sideButton} ${formData.side === 'bride' ? styles.active : ''}`}
                onClick={() => setFormData({ ...formData, side: 'bride' })}
              >
                신부측 ({brideName}님)
              </button>
            </div>
          </div>

          {/* 관계 선택 */}
          <div className={styles.inputGroup}>
            <label className={styles.label}>관계</label>
            <div className={styles.relationshipGrid}>
              {relationshipOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`${styles.relationshipButton} ${formData.relationship === option.value ? styles.active : ''}`}
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
                등록 중...
              </>
            ) : (
              <>
                <span className={styles.buttonIcon}>🎁</span>
                축의하기
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContributionModal;