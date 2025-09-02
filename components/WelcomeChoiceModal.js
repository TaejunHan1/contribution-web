// components/WelcomeChoiceModal.js - 초기 선택 모달
import React from 'react';
import styles from './WelcomeChoiceModal.module.css';

const WelcomeChoiceModal = ({ isOpen, onClose, onSelectGuestbook, onSelectContribution, eventData }) => {
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
          {/* 웰컴 메시지 */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeIcon}>💕</div>
            <h2 className={styles.title}>
              {brideName}님과 {groomName}님의<br />
              결혼식에 오신 것을 환영합니다!
            </h2>
            <p className={styles.subtitle}>
              어떤 방식으로 축하를 전하시겠어요?
            </p>
          </div>

          {/* 선택 옵션들 */}
          <div className={styles.optionGroup}>
            <button 
              className={styles.optionButton}
              onClick={onSelectGuestbook}
            >
              <div className={styles.optionIcon}>✍️</div>
              <div className={styles.optionContent}>
                <h3 className={styles.optionTitle}>방명록도 쓰고 축의금도 낼래요</h3>
                <p className={styles.optionDescription}>
                  따뜻한 축하 메시지와 함께 축의금을 전달해요
                </p>
              </div>
              <div className={styles.optionArrow}>→</div>
            </button>

            <button 
              className={styles.optionButton}
              onClick={onSelectContribution}
            >
              <div className={styles.optionIcon}>💰</div>
              <div className={styles.optionContent}>
                <h3 className={styles.optionTitle}>축의금만 낼래요</h3>
                <p className={styles.optionDescription}>
                  간편하게 축의금만 전달하고 싶어요
                </p>
              </div>
              <div className={styles.optionArrow}>→</div>
            </button>
          </div>

          {/* 안내 메시지 */}
          <div className={styles.noticeBox}>
            <div className={styles.noticeIcon}>ℹ️</div>
            <p className={styles.noticeText}>
              두 경우 모두 간단한 본인 확인이 필요해요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeChoiceModal;