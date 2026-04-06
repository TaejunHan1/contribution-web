// pages/history/index.js - 내 축의/조의 내역 조회 페이지
import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import styles from './history.module.css';

const RELATION_MAP = {
  family: '가족', relative: '친척', friend: '지인·친구',
  colleague: '직장동료', senior: '선배', junior: '후배',
  neighbor: '이웃', other: '기타',
};
const SIDE_MAP = { groom: '신랑측', bride: '신부측' };
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

function formatAmount(amount) {
  return Number(amount).toLocaleString('ko-KR');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

function formatCreatedAt(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(dateStr));
}

function formatPhoneDisplay(phone) {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function formatPhoneE164(raw) {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return '+82' + digits.slice(1);
  return '+82' + digits;
}

export default function HistoryPage() {
  const [step, setStep] = useState('phone'); // phone | code | history
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  // 로컬스토리지에 저장된 폰번호 자동 조회
  useEffect(() => {
    const saved = localStorage.getItem('verifiedPhone');
    if (saved) {
      setVerifiedPhone(saved);
      fetchHistory(saved);
      setStep('history');
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    timerRef.current = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  async function fetchHistory(phoneNum) {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/get-my-history?phone=${encodeURIComponent(phoneNum)}`);
      const data = await res.json();
      if (data.success) {
        setHistory(data.history);
      } else {
        setError('내역을 불러오는 중 오류가 발생했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSendCode() {
    if (!phone.trim()) return;
    setError('');
    setLoading(true);
    try {
      const e164 = formatPhoneE164(phone);
      const res = await fetch('/api/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164 }),
      });
      const data = await res.json();
      if (data.success) {
        setStep('code');
        setCountdown(180);
      } else {
        setError(data.error || 'SMS 발송에 실패했습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    if (!code.trim()) return;
    setError('');
    setLoading(true);
    try {
      const e164 = formatPhoneE164(phone);
      const res = await fetch('/api/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: e164, code }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('verifiedPhone', e164);
        setVerifiedPhone(e164);
        setStep('history');
        fetchHistory(e164);
      } else {
        setError(data.error || '인증번호가 올바르지 않습니다.');
      }
    } catch {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    localStorage.removeItem('verifiedPhone');
    setStep('phone');
    setPhone('');
    setCode('');
    setVerifiedPhone('');
    setHistory([]);
    setError('');
  }

  const totalAmount = history.reduce((sum, h) => sum + (Number(h.amount) || 0), 0);

  return (
    <>
      <Head>
        <title>내 경조사 내역 · 정담</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>

          {/* 헤더 */}
          <div className={styles.header}>
            <img src="/jeongdamlogo.png" alt="정담" className={styles.headerLogo} />
            <div>
              <p className={styles.headerTitle}>정담</p>
              <p className={styles.headerSub}>내 경조사 내역</p>
            </div>
          </div>

          {/* 휴대폰 입력 */}
          {step === 'phone' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>휴대폰번호로 조회</h2>
              <p className={styles.cardDesc}>축의금·조의금을 전달할 때 사용한 번호를 입력하세요</p>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type="tel"
                  placeholder="010-0000-0000"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                />
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button
                className={styles.primaryBtn}
                onClick={handleSendCode}
                disabled={loading || !phone.trim()}
              >
                {loading ? '발송 중...' : '인증번호 받기'}
              </button>
            </div>
          )}

          {/* 인증번호 입력 */}
          {step === 'code' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>인증번호 입력</h2>
              <p className={styles.cardDesc}>
                {formatPhoneDisplay(phone)}로 발송된<br />6자리 인증번호를 입력하세요
              </p>
              <div className={styles.inputWrap}>
                <input
                  className={styles.input}
                  type="number"
                  placeholder="000000"
                  maxLength={6}
                  value={code}
                  onChange={e => setCode(e.target.value.slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                />
                {countdown > 0 && (
                  <span className={styles.countdown}>
                    {String(Math.floor(countdown / 60)).padStart(2, '0')}:{String(countdown % 60).padStart(2, '0')}
                  </span>
                )}
              </div>
              {error && <p className={styles.errorMsg}>{error}</p>}
              <button
                className={styles.primaryBtn}
                onClick={handleVerifyCode}
                disabled={loading || code.length < 6}
              >
                {loading ? '확인 중...' : '확인'}
              </button>
              <button className={styles.textBtn} onClick={() => setStep('phone')}>
                번호 다시 입력
              </button>
            </div>
          )}

          {/* 내역 */}
          {step === 'history' && (
            <>
              {/* 요약 카드 */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryTop}>
                  <p className={styles.summaryPhone}>{formatPhoneDisplay(verifiedPhone)}</p>
                  <button className={styles.changeBtn} onClick={handleReset}>번호 변경</button>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>총 건수</span>
                  <span className={styles.summaryValue}>{history.length}건</span>
                </div>
                <div className={styles.summaryRow}>
                  <span className={styles.summaryLabel}>총 금액</span>
                  <span className={styles.summaryAmount}>{formatAmount(totalAmount)}원</span>
                </div>
              </div>

              {loading && <p className={styles.loadingText}>불러오는 중...</p>}

              {!loading && history.length === 0 && (
                <div className={styles.emptyCard}>
                  <p className={styles.emptyText}>아직 전달한 축의·조의 내역이 없습니다</p>
                </div>
              )}

              {!loading && history.map(item => (
                <div key={item.id} className={styles.historyCard}>
                  <div className={styles.historyTop}>
                    <div>
                      <p className={styles.historyEvent}>{item.groomName} · {item.brideName} 결혼식</p>
                      {item.eventDate && (
                        <p className={styles.historyEventDate}>{formatDate(item.eventDate)}</p>
                      )}
                    </div>
                    <span className={styles.historyAmount}>{formatAmount(item.amount)}원</span>
                  </div>
                  <div className={styles.historyDivider} />
                  <div className={styles.historyMeta}>
                    {item.side && <span className={styles.historyTag}>{SIDE_MAP[item.side] || item.side}</span>}
                    {item.relationship && <span className={styles.historyTag}>{RELATION_MAP[item.relationship] || item.relationship}</span>}
                    <span className={styles.historyDate}>{formatCreatedAt(item.createdAt)}</span>
                  </div>
                </div>
              ))}
            </>
          )}

        </div>
      </div>
    </>
  );
}
