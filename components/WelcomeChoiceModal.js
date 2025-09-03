// components/WelcomeChoiceModal.js - 초기 선택 모달
import React, { useState } from 'react';
import styles from './WelcomeChoiceModal.module.css';

const WelcomeChoiceModal = ({ isOpen, onClose, onSelectGuestbook, onSelectContribution, eventData }) => {
  const [selectedOption, setSelectedOption] = useState('guestbook');
  
  if (!isOpen) return null;

  const brideName = eventData?.bride_name || '하윤';
  const groomName = eventData?.groom_name || '민호';

  const handleSubmit = () => {
    if (selectedOption === 'guestbook') {
      onSelectGuestbook();
    } else {
      onSelectContribution();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button className={styles.closeButton} onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="#8B95A1" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
          <span className={styles.headerTitle}>선택</span>
        </div>

        <div className={styles.content}>
          {/* 상단 아이콘 및 메시지 */}
          <div className={styles.topSection}>
            <div className={styles.iconContainer}>
              <div className={styles.iconBackground}>
                <img src="/hart.png" alt="하트" className={styles.heartIcon} />
              </div>
            </div>
            
            <h2 className={styles.mainTitle}>축하 방식 선택</h2>
            <p className={styles.mainDescription}>
              {brideName}님과 {groomName}님의 결혼을 위한<br />
              축하 방식을 선택해주세요
            </p>
          </div>

          {/* 선택 옵션들 - iOS 스타일 리스트 */}
          <div className={styles.optionList}>
            <div className={styles.sectionTitle}>축하 방식</div>
            
            <div className={styles.optionItem} onClick={() => setSelectedOption('guestbook')}>
              <div className={styles.optionLeft}>
                <span className={styles.optionLabel}>방명록 작성 + 축의금</span>
              </div>
              <div className={`${styles.radioButton} ${selectedOption === 'guestbook' ? styles.selected : ''}`}>
                {selectedOption === 'guestbook' && <div className={styles.radioInner}></div>}
              </div>
            </div>

            <div className={styles.optionItem} onClick={() => setSelectedOption('contribution')}>
              <div className={styles.optionLeft}>
                <span className={styles.optionLabel}>축의금만 전달</span>
              </div>
              <div className={`${styles.radioButton} ${selectedOption === 'contribution' ? styles.selected : ''}`}>
                {selectedOption === 'contribution' && <div className={styles.radioInner}></div>}
              </div>
            </div>
          </div>

          {/* 안내 메시지 - iOS 스타일 */}
          <div className={styles.infoSection}>
            <div className={styles.infoIcon}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="#8B95A1" strokeWidth="1.5"/>
                <path d="M8 7V12" stroke="#8B95A1" strokeWidth="1.5" strokeLinecap="round"/>
                <circle cx="8" cy="4.5" r="0.75" fill="#8B95A1"/>
              </svg>
            </div>
            <p className={styles.infoText}>
              모든 방식에서 간단한 본인 확인이 필요합니다
            </p>
          </div>

          {/* 하단 버튼 */}
          <button className={styles.submitButton} onClick={handleSubmit}>
            다음
          </button>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChoiceModal;