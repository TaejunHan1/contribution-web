// pages/receipt/[id].js - 축의금 영수증 전용 페이지
import Head from 'next/head';
import styles from './receipt.module.css';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];
const RELATION_MAP = {
  family: '가족', relative: '친척', friend: '지인·친구',
  colleague: '직장동료', senior: '선배', junior: '후배',
  neighbor: '이웃', other: '기타',
};
const SIDE_MAP = { groom: '신랑측', bride: '신부측' };

function formatAmount(amount) {
  if (!amount) return '0';
  return Number(amount).toLocaleString('ko-KR');
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const ampm = h < 12 ? '오전' : '오후';
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${ampm} ${hour}시${m > 0 ? ` ${m}분` : ''}`;
}

function formatCreatedAt(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date(dateStr));
}

function DetailRow({ label, value }) {
  return (
    <div className={styles.detailRow}>
      <span className={styles.detailLabel}>{label}</span>
      <span className={styles.detailValue}>{value}</span>
    </div>
  );
}


export default function ReceiptPage({ receipt, error }) {
  if (error || !receipt) {
    return (
      <div className={styles.errorWrap}>
        <p className={styles.errorText}>영수증을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const handleShare = async () => {
    const text = [
      `[정담] 축의금 전달 완료`,
      ``,
      `${receipt.guestName}님이 ${receipt.groomName}·${receipt.brideName} 결혼식에`,
      `${formatAmount(receipt.amount)}원을 축의하셨습니다 🎊`,
      ``,
      `정담 앱에서 내 축의 내역을 확인하세요.`,
    ].join('\n');

    if (navigator.share) {
      try { await navigator.share({ title: '[정담] 축의금 영수증', text }); } catch (_) {}
    } else {
      try { await navigator.clipboard.writeText(text); } catch (_) {}
    }
  };

  return (
    <>
      <Head>
        <title>축의금 영수증 · 정담</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className={styles.page}>
        <div className={styles.container}>

          {/* 영수증 */}
          <div className={styles.receiptWrap}>
            {/* 위 지그재그 */}
            <div className={styles.zigzagTop} />

            <div className={styles.paper}>
              {/* 로고 배지 */}
              <div className={styles.logoBadge}>
                <img src="/jeongdamlogo.png" alt="정담" className={styles.logoImg} />
              </div>
              <p className={styles.brandName}>JEONGDAM · 정담</p>
              <p className={styles.brandSub}>디지털 경조사 · 축의금 영수증</p>

              <div className={styles.dashed} />

              {/* 성함 + 결혼식 */}
              <div className={styles.mainInfo}>
                <p className={styles.mainName}>{receipt.guestName}</p>
                <p className={styles.mainEvent}>{receipt.groomName} · {receipt.brideName} 결혼식</p>
              </div>

              <div className={styles.dashed} />

              {/* 상세 항목 */}
              <div className={styles.detailList}>
                {receipt.side && <DetailRow label="구분" value={SIDE_MAP[receipt.side] || receipt.side} />}
                {receipt.relationship && <DetailRow label="관계" value={RELATION_MAP[receipt.relationship] || receipt.relationship} />}
                <DetailRow label="일시" value={formatCreatedAt(receipt.createdAt)} />
                {receipt.eventDate && (
                  <DetailRow
                    label="결혼식일"
                    value={`${formatDate(receipt.eventDate)}${receipt.ceremonyTime ? ' ' + formatTime(receipt.ceremonyTime) : ''}`}
                  />
                )}
                {receipt.location && <DetailRow label="장소" value={receipt.location} />}
              </div>

              <div className={styles.dashed} />

              {/* 총 금액 */}
              <div className={styles.totalRow}>
                <span className={styles.totalLabel}>축의금</span>
                <span className={styles.totalAmount}>{formatAmount(receipt.amount)}원</span>
              </div>

              <div className={styles.receiptNo}>
                <span className={styles.receiptNoLabel}>영수증 번호</span>
                <span className={styles.receiptNoValue}>{receipt.id?.toUpperCase()}</span>
              </div>

              <div className={styles.dashed} />

              {/* 앱 CTA */}
              <div className={styles.appCta}>
                <p className={styles.appCtaTitle}>내 축의 내역을 앱에서 평생 보관하세요</p>
                <p className={styles.appCtaSub}>정담 앱에서 모든 경조사 내역을 한눈에</p>
                <div className={styles.appBtns}>
              <a
                href="https://apps.apple.com/app/id6747748534"
                className={styles.appBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                App Store
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.gyeongjo.app"
                className={styles.appBtn}
                target="_blank"
                rel="noopener noreferrer"
              >
                Google Play
              </a>
                </div>
              </div>
            </div>

            {/* 아래 지그재그 */}
            <div className={styles.zigzagBottom} />
          </div>

          {/* 공유하기 버튼 */}
          <button className={styles.shareBtn} onClick={handleShare}>
            공유하기
          </button>

        </div>
      </div>
    </>
  );
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('guest_book')
      .select('id, guest_name, amount, relation_detail, relation_category, created_at, event_id')
      .eq('id', id)
      .single();

    if (error || !data) {
      console.error('[receipt] guest_book query error:', error, 'id:', id);
      return { props: { receipt: null, error: true } };
    }

    let eventInfo = null;
    if (data.event_id) {
      const { data: evData } = await supabase
        .from('events')
        .select('groom_name, bride_name, event_date, ceremony_time, location')
        .eq('id', data.event_id)
        .single();
      eventInfo = evData;
    }

    return {
      props: {
        receipt: {
          id: data.id,
          guestName: data.guest_name,
          amount: data.amount,
          relationship: data.relation_detail,
          side: data.relation_category,
          createdAt: data.created_at,
          groomName: eventInfo?.groom_name || '신랑',
          brideName: eventInfo?.bride_name || '신부',
          eventDate: eventInfo?.event_date || null,
          ceremonyTime: eventInfo?.ceremony_time || null,
          location: eventInfo?.location || null,
        },
        error: false,
      },
    };
  } catch (err) {
    console.error('[receipt] catch error:', err);
    return { props: { receipt: null, error: true } };
  }
}
