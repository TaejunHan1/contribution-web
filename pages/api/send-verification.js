// pages/api/send-verification.js - SMS 인증번호 발송 API
import crypto from 'crypto';

const VERIFICATION_TTL_MS = 5 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;
const PHONE_HOURLY_LIMIT = 5;
const IP_HOURLY_LIMIT = 20;
const FIXED_VERIFICATION_PHONE = '01058359358';
const FIXED_VERIFICATION_CODE = '999999';

const ipSendBuckets = new Map();

const normalizeKoreanPhoneNumber = phone => {
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

const getSolapiApiKey = () =>
  process.env.SOLAPI_API_KEY || process.env.EXPO_PUBLIC_SOLAPI_API_KEY || '';

const getSolapiApiSecret = () =>
  process.env.SOLAPI_API_SECRET ||
  process.env.EXPO_PUBLIC_SOLAPI_API_SECRET ||
  '';

const getSolapiSenderNumber = () =>
  (
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
    response = await fetchWithTimeout(
      'https://api.solapi.com/messages/v4/send',
      {
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
      }
    );
  } catch (error) {
    return {
      success: false,
      provider: 'solapi',
      error:
        error?.name === 'AbortError'
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
    sid:
      result.messageId || result.groupId || result?.message?.messageId || null,
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

const getClientIp = req => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (typeof forwardedFor === 'string' && forwardedFor.trim()) {
    return forwardedFor.split(',')[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor[0]) {
    return forwardedFor[0].split(',')[0].trim();
  }

  return (
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  ).toString();
};

const pruneTimestamps = (timestamps, windowStart) =>
  timestamps.filter(timestamp => timestamp > windowStart);

const checkIpRateLimit = ip => {
  const now = Date.now();
  const windowStart = now - 60 * 60 * 1000;
  const bucket = pruneTimestamps(ipSendBuckets.get(ip) || [], windowStart);

  if (bucket.length >= IP_HOURLY_LIMIT) {
    ipSendBuckets.set(ip, bucket);
    return {
      allowed: false,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((bucket[0] + 60 * 60 * 1000 - now) / 1000)
      ),
    };
  }

  bucket.push(now);
  ipSendBuckets.set(ip, bucket);
  return { allowed: true };
};

const checkPhoneRateLimit = async ({ supabase, phone }) => {
  const now = Date.now();
  const cooldownStart = new Date(now - RESEND_COOLDOWN_MS).toISOString();
  const hourlyStart = new Date(now - 60 * 60 * 1000).toISOString();

  const { count: cooldownCount, error: cooldownError } = await supabase
    .from('sms_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', cooldownStart);

  if (cooldownError) {
    throw cooldownError;
  }

  if ((cooldownCount || 0) > 0) {
    return {
      allowed: false,
      status: 429,
      retryAfterSeconds: Math.ceil(RESEND_COOLDOWN_MS / 1000),
      error: '인증번호는 1분에 한 번만 받을 수 있습니다.',
    };
  }

  const { count: hourlyCount, error: hourlyError } = await supabase
    .from('sms_verifications')
    .select('id', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('created_at', hourlyStart);

  if (hourlyError) {
    throw hourlyError;
  }

  if ((hourlyCount || 0) >= PHONE_HOURLY_LIMIT) {
    return {
      allowed: false,
      status: 429,
      retryAfterSeconds: 60 * 60,
      error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    };
  }

  return { allowed: true };
};

const invalidatePendingVerificationCode = async ({ supabase, phone }) => {
  await supabase
    .from('sms_verifications')
    .update({ expires_at: new Date().toISOString() })
    .eq('phone', phone)
    .eq('is_verified', false);
};

const saveVerificationCode = async ({ supabase, phone, verificationCode }) => {
  await invalidatePendingVerificationCode({ supabase, phone });

  const expiresAt = new Date(Date.now() + VERIFICATION_TTL_MS).toISOString();
  const { error } = await supabase.from('sms_verifications').insert([
    {
      phone,
      verification_code: verificationCode,
      expires_at: expiresAt,
      is_verified: false,
      attempts_count: 0,
    },
  ]);

  if (error) {
    throw error;
  }
};

const deletePendingVerificationCode = async ({ supabase, phone }) => {
  await invalidatePendingVerificationCode({ supabase, phone });
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: '핸드폰번호가 누락되었습니다.' });
  }

  const normalizedPhone = normalizeKoreanPhoneNumber(phone);

  if (
    !/^\+?82\d{9,10}$|^01\d{8,9}$/.test(String(phone).replace(/[^\d+]/g, ''))
  ) {
    return res.status(400).json({
      success: false,
      error: '올바른 휴대폰 번호를 입력해주세요.',
    });
  }

  try {
    const supabase = await createSupabaseClient();
    const isFixedVerificationPhone =
      normalizedPhone === FIXED_VERIFICATION_PHONE;

    if (isFixedVerificationPhone) {
      await saveVerificationCode({
        supabase,
        phone: normalizedPhone,
        verificationCode: FIXED_VERIFICATION_CODE,
      });

      console.log('SMS 인증번호 발송 생략:', {
        phone: normalizedPhone,
        reason: 'fixed verification phone',
      });

      return res.status(200).json({
        success: true,
        message: '인증번호가 설정되었습니다.',
        skippedSms: true,
      });
    }

    const clientIp = getClientIp(req);
    const ipLimit = checkIpRateLimit(clientIp);

    if (!ipLimit.allowed) {
      res.setHeader('Retry-After', String(ipLimit.retryAfterSeconds));
      return res.status(429).json({
        success: false,
        error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
      });
    }

    const phoneLimit = await checkPhoneRateLimit({
      supabase,
      phone: normalizedPhone,
    });

    if (!phoneLimit.allowed) {
      res.setHeader('Retry-After', String(phoneLimit.retryAfterSeconds));
      return res.status(phoneLimit.status).json({
        success: false,
        error: phoneLimit.error,
      });
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const message = `[정담] 인증번호는 ${verificationCode}입니다. 5분 내에 입력해주세요.`;

    await saveVerificationCode({
      supabase,
      phone: normalizedPhone,
      verificationCode,
    });

    const smsResult = await sendSolapiSms({ phone: normalizedPhone, message });

    if (!smsResult.success) {
      await deletePendingVerificationCode({ supabase, phone: normalizedPhone });
      console.error('SMS 발송 실패:', {
        phone: normalizedPhone,
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
      phone: normalizedPhone,
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
