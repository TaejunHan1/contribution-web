// components/CompletionModal.js - 축의금 완료 안내 모달
import React from 'react';
import styles from './CompletionModal.module.css';

const CompletionModal = ({ isOpen, onClose, contributionData, eventData }) => {
  if (!isOpen) return null;

  const brideName = eventData?.bride_name || '하윤';
  const groomName = eventData?.groom_name || '민호';
  
  // 금액 포맷팅 (천 단위 콤마)
  const formatAmount = (amount) => {
    return amount?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // 관계 텍스트 변환
  const getRelationshipText = (relationship) => {
    const relationshipMap = {
      'family': '가족',
      'relative': '친척',
      'friend': '지인',
      'colleague': '직장동료',
      'senior': '선배',
      'junior': '후배',
      'neighbor': '이웃',
      'other': '기타'
    };
    return relationshipMap[relationship] || relationship;
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          {/* 성공 아이콘 */}
          <div className={styles.successIcon}>
            <div className={styles.checkmarkContainer}>
              <div className={styles.checkmark}>✓</div>
            </div>
          </div>

          {/* 제목 */}
          <h2 className={styles.title}>축의금 기입 완료!</h2>
          
          {/* 완료 정보 */}
          <div className={styles.completionInfo}>
            <div className={styles.infoRow}>
              <span className={styles.label}>성함</span>
              <span className={styles.value}>{contributionData?.guestName}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>축의금</span>
              <span className={styles.amount}>{formatAmount(contributionData?.contributionAmount)}원</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>구분</span>
              <span className={styles.value}>
                {contributionData?.side === 'groom' ? `신랑측 (${groomName}님)` : `신부측 (${brideName}님)`}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>관계</span>
              <span className={styles.value}>{getRelationshipText(contributionData?.relationship)}</span>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className={styles.instructionBox}>
            <div className={styles.envelopeIcon}>💌</div>
            <div className={styles.instructionText}>
              <p className={styles.mainInstruction}>
                <strong>봉투는 축의함에 넣어주시고<br />바로 입장하시면 됩니다</strong>
              </p>
              <p className={styles.subInstruction}>
                축의금 정보가 주최자에게 자동으로 전달되었습니다
              </p>
            </div>
          </div>

          {/* 감사 메시지 */}
          <div className={styles.thankYouSection}>
            <p className={styles.thankYouText}>
              {brideName}님과 {groomName}님의<br />
              소중한 날을 축하해주셔서 감사합니다 💕
            </p>
          </div>

          {/* 확인 버튼 */}
          <button className={styles.confirmButton} onClick={onClose}>
            <span className={styles.buttonIcon}>🎉</span>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompletionModal;