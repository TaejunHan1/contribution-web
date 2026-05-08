// pages/api/send-verification.js - SMS 인증번호 발송 API
import crypto from 'crypto';

const TEST_PHONE = '+821058359358';
const VERIFICATION_TTL_MS = 5 * 60 * 1000;

const normalizeKoreanPhoneNumber = (phone) => {
  const value = String(phone || '').replace(/[^\d+]/g, '');

  if (value.startsWith('+82')) {
    return `0${value.slice(3)}`.replace(/[^\d]/g, '');
  }

  if (value.startsWith('82')) {
    return `0${value.slice(2)}`.replace(/[^\d]/g, '');
  }

  return value.replace(/[^\d]/g, '');
};

const createSolapiAuthHeader = (apiKey, apiSecret) => {
  const date = new Date().toISOString();
  const salt = crypto.randomBytes(16).toString('hex');
  const signature = crypto
    .createHmac('sha256', apiSecret)
    .update(date + salt)
    .digest('hex');

  return `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`;
};

const getSolapiApiKey = () => (
  process.env.SOLAPI_API_KEY ||
  process.env.EXPO_PUBLIC_SOLAPI_API_KEY ||
  ''
);

const getSolapiApiSecret = () => (
  process.env.SOLAPI_API_SECRET ||
  process.env.EXPO_PUBLIC_SOLAPI_API_SECRET ||
  ''
);

const getSolapiSenderNumber = () => (
  process.env.SOLAPI_SENDER_NUMBER ||
  process.env.SOLAPI_SENDER_PHONE_NUMBER ||
  process.env.EXPO_PUBLIC_SOLAPI_SENDER_PHONE_NUMBER ||
  ''
).replace(/[^\d]/g, '');

const fetchWithTimeout = async (url, options, timeoutMs = 15000) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
};

const sendSolapiSms = async ({ phone, message }) => {
  const apiKey = getSolapiApiKey();
  const apiSecret = getSolapiApiSecret();
  const fromNumber = getSolapiSenderNumber();
  const toNumber = normalizeKoreanPhoneNumber(phone);

  if (!apiKey || !apiSecret || !fromNumber) {
    return {
      success: false,
      skipped: true,
      provider: 'solapi',
      error: 'SOLAPI 환경변수가 설정되지 않았습니다.',
    };
  }

  if (!/^01\d{8,9}$/.test(fromNumber)) {
    return {
      success: false,
      provider: 'solapi',
      error: '발신번호 형식이 올바르지 않습니다.',
    };
  }

  if (!/^01\d{8,9}$/.test(toNumber)) {
    return {
      success: false,
      provider: 'solapi',
      error: '수신 휴대폰 번호 형식이 올바르지 않습니다.',
    };
  }

  let response;

  try {
    response = await fetchWithTimeout('https://api.solapi.com/messages/v4/send', {
      method: 'POST',
      headers: {
        Authorization: createSolapiAuthHeader(apiKey, apiSecret),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: {
          to: toNumber,
          from: fromNumber,
          text: message,
        },
      }),
    });
  } catch (error) {
    return {
      success: false,
      provider: 'solapi',
      error: error?.name === 'AbortError'
        ? 'SOLAPI 문자 발송 요청 시간이 초과되었습니다.'
        : 'SOLAPI 문자 발송 중 네트워크 오류가 발생했습니다.',
    };
  }

  const responseText = await response.text();
  let result = {};

  try {
    result = responseText ? JSON.parse(responseText) : {};
  } catch {
    result = { message: responseText };
  }

  if (!response.ok) {
    return {
      success: false,
      provider: 'solapi',
      error:
        result.errorMessage ||
        result.message ||
        result.error ||
        'SOLAPI 문자 발송에 실패했습니다.',
      result,
    };
  }

  return {
    success: true,
    provider: 'solapi',
    sid: result.messageId || result.groupId || result?.message?.messageId || null,
    result,
  };
};

const createSupabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

const saveVerificationCode = async ({ supabase, phone, verificationCode }) => {
  await supabase
    .from('sms_verifications')
    .delete()
    .eq('phone', phone)
    .eq('is_verified', false);

  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  const { error } = await supabase
    .from('sms_verifications')
    .insert([{
      phone,
      verification_code: verificationCode,
      expires_at: expiresAt,
      is_verified: false,
      attempts_count: 0,
    }]);

  if (error) {
    throw error;
  }
};

const deletePendingVerificationCode = async ({ supabase, phone }) => {
  await supabase
    .from('sms_verifications')
    .delete()
    .eq('phone', phone)
    .eq('is_verified', false);
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: '핸드폰번호가 누락되었습니다.' });
  }

  if (!/^\+?82\d{9,10}$|^01\d{8,9}$/.test(String(phone).replace(/[^\d+]/g, ''))) {
    return res.status(400).json({
      success: false,
      error: '올바른 휴대폰 번호를 입력해주세요.',
    });
  }

  try {
    const supabase = await createSupabaseClient();

    if (String(phone).replace(/[^\d+]/g, '') === TEST_PHONE) {
      await saveVerificationCode({
        supabase,
        phone,
        verificationCode: '999999',
      });

      return res.status(200).json({
        success: true,
        message: '테스트 번호: 인증번호 999999를 입력하세요.',
      });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const message = `[정담] 인증번호는 ${verificationCode}입니다. 5분 내에 입력해주세요.`;

    await saveVerificationCode({
      supabase,
      phone,
      verificationCode,
    });

    const smsResult = await sendSolapiSms({ phone, message });

    if (!smsResult.success) {
      await deletePendingVerificationCode({ supabase, phone });
      console.error('SMS 발송 실패:', {
        phone,
        normalizedPhone: normalizeKoreanPhoneNumber(phone),
        solapi: {
          skipped: smsResult.skipped,
          error: smsResult.error,
          result: smsResult.result,
        },
      });

      return res.status(500).json({
        success: false,
        error: 'SMS 발송에 실패했습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    console.log('SMS 인증번호 발송 성공:', {
      provider: smsResult.provider,
      phone,
      normalizedPhone: normalizeKoreanPhoneNumber(phone),
      sid: smsResult.sid,
    });

    return res.status(200).json({
      success: true,
      message: '인증번호가 발송되었습니다.',
    });
  } catch (error) {
    console.error('SMS 발송 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.',
    });
  }
}
