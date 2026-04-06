// components/CompletionModal.js - 축의금 완료 영수증
import React, { useEffect, useState } from 'react';
import styles from './CompletionModal.module.css';

const CompletionModal = ({ isOpen, onClose, contributionData, eventData }) => {
  const [shared, setShared] = useState(false);
  const [showAppBanner, setShowAppBanner] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShared(false);
      const t = setTimeout(() => setShowAppBanner(true), 800);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const groomName = eventData?.groom_name || '신랑';
  const brideName = eventData?.bride_name || '신부';

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return Number(String(amount).replace(/,/g, '')).toLocaleString();
  };

  // 축의금 전달 시각 (한국 시간)
  const contributionDateTime = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(contributionData?.created_at ? new Date(contributionData.created_at) : new Date());

  const RELATION_MAP = {
    family: '가족', relative: '친척', friend: '지인·친구',
    colleague: '직장동료', senior: '선배', junior: '후배',
    neighbor: '이웃', other: '기타',
  };
  const relationText = RELATION_MAP[contributionData?.relationship] || contributionData?.relationship || '';
  const sideText = contributionData?.side === 'groom' ? `신랑측 (${groomName})` : `신부측 (${brideName})`;

  const handleShare = async () => {
    const text = [
      `[정담] 축의금 전달 완료`,
      ``,
      `${contributionData?.guestName}님이 ${groomName}·${brideName} 결혼식에`,
      `${formatAmount(contributionData?.contributionAmount)}원을 축의하셨습니다 🎊`,
      ``,
      `- 일시: ${contributionDateTime}`,
      eventData?.location ? `- 장소: ${eventData.location}` : '',
    ].filter(Boolean).join('\n');

    if (navigator.share) {
      try {
        await navigator.share({ title: '[정담] 축의금 전달 완료', text });
        setShared(true);
        return;
      } catch (e) {
        // AbortError: 사용자가 공유 취소 → 그냥 반환
        if (e && e.name === 'AbortError') return;
        // 기타 오류 → 클립보드 fallback으로 이어짐
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setShared(true);
    } catch (_) {
      // clipboard 미지원 환경 → 텍스트 선택 가능한 prompt 표시
      window.prompt('아래 텍스트를 복사해서 카카오톡으로 보내주세요:', text);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* 닫기 버튼 */}
        <button className={styles.closeBtn} onClick={onClose}>✕</button>

        <div className={styles.content}>

          {/* 성공 아이콘 */}
          <div className={styles.successIcon}>
            <div className={styles.checkmarkContainer}>
              <div className={styles.checkmark}>✓</div>
            </div>
          </div>

          {/* 제목 */}
          <h2 className={styles.title}>전달 완료!</h2>
          <p className={styles.subtitle}>
            {groomName} · {brideName} 결혼식에<br />축의금이 전달되었습니다
          </p>

          {/* 영수증 카드 */}
          <div className={styles.receiptCard}>
            <div className={styles.receiptHeader}>
              <span className={styles.receiptLabel}>축의금 영수증</span>
              <span className={styles.receiptDot} />
            </div>

            <div className={styles.amountRow}>
              <span className={styles.amountValue}>
                {formatAmount(contributionData?.contributionAmount)}
                <span className={styles.amountUnit}>원</span>
              </span>
            </div>

            <div className={styles.divider} />

            <div className={styles.infoList}>
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>성함</span>
                <span className={styles.infoValue}>{contributionData?.guestName}</span>
              </div>
              {sideText && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>구분</span>
                  <span className={styles.infoValue}>{sideText}</span>
                </div>
              )}
              {relationText && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>관계</span>
                  <span className={styles.infoValue}>{relationText}</span>
                </div>
              )}
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>일시</span>
                <span className={styles.infoValue}>{contributionDateTime}</span>
              </div>
              {eventData?.location && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>장소</span>
                  <span className={styles.infoValue}>{eventData.location}</span>
                </div>
              )}
            </div>

            <div className={styles.receiptFooter}>
              <span>정담 · 디지털 경조사</span>
            </div>
          </div>

          {/* 공유 버튼 */}
          <button className={styles.shareBtn} onClick={handleShare}>
            <span className={styles.shareBtnIcon}>
              {shared ? '✓' : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                  <polyline points="16 6 12 2 8 6" />
                  <line x1="12" y1="2" x2="12" y2="15" />
                </svg>
              )}
            </span>
            {shared ? '복사 완료!' : '카카오톡으로 공유'}
          </button>

          {/* 앱 다운로드 배너 */}
          {showAppBanner && (
            <div className={styles.appBanner}>
              <div className={styles.appBannerText}>
                <strong>내 축의 히스토리를 앱에서 확인하세요</strong>
                <span>정담 앱에서 평생 내역 보관</span>
              </div>
              <button className={styles.appBannerBtn} onClick={() => {}}>
                앱 받기
              </button>
            </div>
          )}

          {/* 확인 버튼 */}
          <button className={styles.confirmButton} onClick={onClose}>
            확인
          </button>

        </div>
      </div>
    </div>
  );
};

export default CompletionModal;
