import crypto from 'crypto';

import { normalizeKoreanPhone } from './phoneUtils';

export const createSupabaseClient = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase 환경변수가 설정되지 않았습니다.');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};

export const createSlug = () => {
  const alphabet = 'abcdefghijkmnopqrstuvwxyz23456789';
  let value = '';
  for (let index = 0; index < 8; index += 1) {
    value += alphabet[crypto.randomInt(0, alphabet.length)];
  }
  return value;
};

export const hashPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto
    .pbkdf2Sync(String(password), salt, 120000, 32, 'sha256')
    .toString('hex');
  return `${salt}:${hash}`;
};

export const verifyPassword = (password, storedHash) => {
  if (!password || !storedHash || !storedHash.includes(':')) return false;
  const [salt, hash] = storedHash.split(':');
  const nextHash = crypto
    .pbkdf2Sync(String(password), salt, 120000, 32, 'sha256')
    .toString('hex');
  return crypto.timingSafeEqual(
    Buffer.from(hash, 'hex'),
    Buffer.from(nextHash, 'hex')
  );
};

const getTokenSecret = () =>
  process.env.CHEONGMO_TOKEN_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'cheongmo-local-secret';

export const createEntryToken = ({ slug, accessType, phone = null }) => {
  const payload = {
    slug,
    accessType,
    phone: phone ? normalizeKoreanPhone(phone) : null,
    issuedAt: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
};

export const verifyEntryToken = token => {
  if (!token || !String(token).includes('.')) return null;
  const [encodedPayload, signature] = String(token).split('.');
  const expectedSignature = crypto
    .createHmac('sha256', getTokenSecret())
    .update(encodedPayload)
    .digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return null;
  }

  try {
    return JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );
  } catch {
    return null;
  }
};

export const getClientIp = req => {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
};

export const normalizePhoneList = phones => {
  if (!Array.isArray(phones)) return [];
  return Array.from(
    new Set(
      phones
        .map(item =>
          normalizeKoreanPhone(
            typeof item === 'object' && item !== null ? item.phone : item
          )
        )
        .filter(Boolean)
    )
  );
};

export const normalizeAllowedPhoneEntries = phones => {
  if (!Array.isArray(phones)) return [];

  const seen = new Set();
  return phones.reduce((entries, item) => {
    const phone = normalizeKoreanPhone(
      typeof item === 'object' && item !== null ? item.phone : item
    );
    if (!phone || seen.has(phone)) return entries;

    seen.add(phone);
    entries.push({
      name:
        typeof item === 'object' && item !== null
          ? String(item.name || '')
              .trim()
              .slice(0, 60)
          : '',
      phone,
    });
    return entries;
  }, []);
};

export const findAllowedPhoneEntry = (phones, phone) => {
  const normalizedPhone = normalizeKoreanPhone(phone);
  if (!normalizedPhone || !Array.isArray(phones)) return null;

  return phones.reduce((match, item) => {
    if (match) return match;
    const itemPhone = normalizeKoreanPhone(
      typeof item === 'object' && item !== null ? item.phone : item
    );
    if (itemPhone !== normalizedPhone) return null;

    return {
      name:
        typeof item === 'object' && item !== null
          ? String(item.name || '').trim()
          : '',
      phone: itemPhone,
    };
  }, null);
};
