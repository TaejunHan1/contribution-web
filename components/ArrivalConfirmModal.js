// components/ArrivalConfirmModal.js - 결혼식장 도착 확인 모달
import React, { useState } from 'react';
import styles from './ArrivalConfirmModal.module.css';

const ArrivalConfirmModal = ({ isOpen, onClose, onConfirm, eventData }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
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
          {/* 웰컴 메시지 */}
          <div className={styles.welcomeSection}>
            <div className={styles.iconContainer}>
              <span className={styles.locationIcon}>📍</span>
            </div>
            <h2 className={styles.title}>
              {brideName}님과 {groomName}님의<br />
              결혼식장에 도착하셨나요?
            </h2>
            <p className={styles.subtitle}>
              축하해주시기 위해 오셨군요!<br />
              감사드립니다 💕
            </p>
          </div>

          {/* 책자 안내 */}
          <div className={styles.infoSection}>
            <div className={styles.bookIcon}>📖</div>
            <div className={styles.infoContent}>
              <p className={styles.modernText}>
                <strong>요즘 누가 책자에 이름을 쓰나요?</strong><br />
                여기에 이름과 금액을 기입하면<br />
                알아서 주최자에게 저장됩니다.
              </p>
            </div>
          </div>

          {/* 사전 방문 안내 */}
          <div className={styles.preVisitNotice}>
            <div className={styles.noticeIcon}>ℹ️</div>
            <p className={styles.noticeText}>
              지금은 결혼식장 봉투 넣기 전이에요!<br />
              그냥 방문 기록만 쓰고 결혼식장에 가게 되면<br />
              다시 열게요.
            </p>
          </div>

          {/* 액션 버튼들 */}
          <div className={styles.buttonGroup}>
            <button
              className={styles.secondaryButton}
              onClick={onClose}
              disabled={isLoading}
            >
              아직 도착 전이에요
            </button>
            <button
              className={styles.primaryButton}
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className={styles.spinner}></span>
                  확인 중...
                </>
              ) : (
                <>
                  <span className={styles.buttonIcon}>🎉</span>
                  네, 도착했어요!
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArrivalConfirmModal;