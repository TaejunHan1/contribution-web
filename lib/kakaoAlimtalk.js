// lib/kakaoAlimtalk.js - 솔라피 카카오 알림톡 발송
import crypto from 'crypto';

const RELATION_MAP = {
  family: '가족', relative: '친척', friend: '지인·친구',
  colleague: '직장동료', senior: '선배', junior: '후배',
  neighbor: '이웃', other: '기타',
};

const SIDE_MAP = { groom: '신랑측', bride: '신부측' };

function formatAmount(amount) {
  return Number(String(amount).replace(/,/g, '')).toLocaleString('ko-KR');
}

function formatKSTDateTime() {
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric', month: 'long', day: 'numeric',
    weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true,
  }).format(new Date());
}

function buildAuthHeader() {
  const apiKey    = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  const date      = new Date().toISOString();
  const salt      = crypto.randomBytes(16).toString('hex');
  const signature = crypto.createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');
  return `HMAC-SHA256 ApiKey=${apiKey}, Date=${date}, Salt=${salt}, Signature=${signature}`;
}

/**
 * 축의금 전달 완료 알림톡 발송
 * @param {object} params
 * @param {string} params.phone        - 수신자 번호 (+82 형식 또는 01012345678)
 * @param {string} params.guestName    - 하객 이름
 * @param {number} params.amount       - 축의금 금액
 * @param {string} params.side         - 'groom' | 'bride'
 * @param {string} params.relationship - 관계 코드
 * @param {string} params.groomName      - 신랑 이름
 * @param {string} params.brideName      - 신부 이름
 * @param {string} [params.contributionId] - 영수증 페이지 링크용 ID
 */
export async function sendContributionAlimtalk({
  phone, guestName, amount, side, relationship, groomName, brideName, contributionId,
}) {
  const apiKey     = process.env.SOLAPI_API_KEY;
  const apiSecret  = process.env.SOLAPI_API_SECRET;
  const pfId       = process.env.SOLAPI_KAKAO_PFID;       // 카카오 채널 ID (KA01Pf...)
  const templateId = process.env.SOLAPI_KAKAO_TEMPLATE_ID; // 승인된 템플릿 ID (KA01TP...)
  const fromNumber = process.env.SOLAPI_SENDER_NUMBER;     // 발신번호

  if (!apiKey || !apiSecret || !pfId || !templateId || !fromNumber) {
    console.warn('[알림톡] 환경변수 미설정 — 발송 건너뜀');
    return { success: false, reason: 'env_not_set' };
  }

  // +82 → 010 형식 변환
  const toNumber = phone.startsWith('+82')
    ? '0' + phone.slice(3).replace(/-/g, '')
    : phone.replace(/-/g, '');

  const variables = {
    '#{이름}':    guestName,
    '#{신랑신부}': `${groomName} · ${brideName}`,
    '#{금액}':    formatAmount(amount),
    '#{구분}':    SIDE_MAP[side] || side,
    '#{관계}':    RELATION_MAP[relationship] || relationship,
    '#{일시}':    formatKSTDateTime(),
  };

  try {
    const response = await fetch('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': buildAuthHeader(),
      },
      body: JSON.stringify({
        message: {
          to: toNumber,
          from: fromNumber,
          kakaoOptions: {
            pfId,
            templateId,
            variables,
            ...(contributionId && {
              buttons: [{
                buttonType: 'WL',
                buttonName: '영수증 확인하기',
                linkMo: `${process.env.NEXT_PUBLIC_SITE_URL}/receipt/${contributionId}`,
                linkPc: `${process.env.NEXT_PUBLIC_SITE_URL}/receipt/${contributionId}`,
              }],
            }),
          },
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('[알림톡] 발송 실패:', result);
      return { success: false, error: result };
    }

    console.log('[알림톡] 발송 성공:', result);
    return { success: true, result };
  } catch (err) {
    console.error('[알림톡] 네트워크 오류:', err);
    return { success: false, error: err.message };
  }
}
