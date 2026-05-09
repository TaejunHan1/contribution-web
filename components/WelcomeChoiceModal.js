// components/WelcomeChoiceModal.js - 초기 선택 모달
import React, { useState } from 'react';
import styles from './WelcomeChoiceModal.module.css';

const HIDDEN_WELCOME_EVENT_IDS = new Set([
  '640a5d7e-059d-46f5-bef2-7bae63ce93e1',
  '65e2dd46-65c7-447d-9113-d57e712eac02',
]);

const WelcomeChoiceModal = ({ isOpen, onClose, onSelectGuestbook, onSelectContribution, eventData }) => {
  const [selectedOption, setSelectedOption] = useState('guestbook');

  if (!isOpen) return null;
  if (HIDDEN_WELCOME_EVENT_IDS.has(eventData?.id || eventData?.event_id)) return null;

  const brideName = eventData?.bride_name || '하윤';
  const groomName = eventData?.groom_name || '민호';

  const handleSubmit = () => {
    window.__gyeongjo_play?.();
    if (selectedOption === 'guestbook') {
      onSelectGuestbook();
    } else {
      onSelectContribution();
    }
  };

  return (
    <div className={styles.overlay} onClick={() => { window.__gyeongjo_play?.(); onClose(); }}>
      <div className={styles.modal} onClick={(e) => { window.__gyeongjo_play?.(); e.stopPropagation(); }}>
        {/* 드래그 핸들 */}
        <div className={styles.dragHandle} />

        {/* 닫기 버튼 */}
        <button className={styles.closeButton} onClick={() => { window.__gyeongjo_play?.(); onClose(); }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M1 1L17 17M17 1L1 17" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        <div className={styles.content}>
          {/* 타이틀 */}
          <div className={styles.titleSection}>
            <h2 className={styles.mainTitle}>
              {brideName}님과 {groomName}님의 결혼을 위한{'\n'}축하 방식을 선택해주세요
            </h2>
          </div>

          {/* 옵션 카드들 */}
          <div className={styles.optionList}>
            <div
              className={`${styles.optionCard} ${selectedOption === 'guestbook' ? styles.optionCardSelected : ''}`}
              onClick={() => { window.__gyeongjo_play?.(); setSelectedOption('guestbook'); }}
            >
              <div className={`${styles.radioCircle} ${selectedOption === 'guestbook' ? styles.radioCircleSelected : ''}`}>
                {selectedOption === 'guestbook' && <div className={styles.radioInner} />}
              </div>
              <span className={styles.optionLabel}>📝 방명록 작성 + 축의금</span>
            </div>

            <div
              className={`${styles.optionCard} ${selectedOption === 'contribution' ? styles.optionCardSelected : ''}`}
              onClick={() => { window.__gyeongjo_play?.(); setSelectedOption('contribution'); }}
            >
              <div className={`${styles.radioCircle} ${selectedOption === 'contribution' ? styles.radioCircleSelected : ''}`}>
                {selectedOption === 'contribution' && <div className={styles.radioInner} />}
              </div>
              <span className={styles.optionLabel}>💸 축의금만 전달</span>
            </div>
          </div>

          {/* 안내 박스 */}
          <div className={styles.infoBox}>
            <span className={styles.infoIcon}>ℹ️</span>
            <p className={styles.infoText}>
              안전한 방명록 및 축의금 전달을 위해 모든 방식에서 간단한 본인확인이 필요합니다.
            </p>
          </div>

          {/* 다음 버튼 */}
          <button className={styles.submitButton} onClick={handleSubmit}>
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChoiceModal;
