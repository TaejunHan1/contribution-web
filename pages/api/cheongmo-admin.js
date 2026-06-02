import crypto from 'crypto';

import { createSupabaseClient } from '../../lib/cheongmoUtils';
import { normalizeKoreanPhone } from '../../lib/phoneUtils';

const ADMIN_PHONE = process.env.CHEONGMO_ADMIN_PHONE || '01058359358';
const ADMIN_TOKEN_MAX_AGE_MS = 12 * 60 * 60 * 1000;

const hasResponseContent = item =>
  Boolean(item?.available_dates?.length || item?.suggested_regions?.length);

const getAdminSecret = () =>
  process.env.CHEONGMO_ADMIN_SECRET ||
  process.env.CHEONGMO_TOKEN_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'cheongmo-admin-local-secret';

const createAdminToken = () => {
  const payload = {
    scope: 'cheongmo-admin',
    issuedAt: Date.now(),
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    'base64url'
  );
  const signature = crypto
    .createHmac('sha256', getAdminSecret())
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
};

const verifyAdminToken = token => {
  if (!token || !String(token).includes('.')) return false;
  const [encodedPayload, signature] = String(token).split('.');
  const expectedSignature = crypto
    .createHmac('sha256', getAdminSecret())
    .update(encodedPayload)
    .digest('base64url');

  if (
    signature.length !== expectedSignature.length ||
    !crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    )
  ) {
    return false;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    );
    return (
      payload.scope === 'cheongmo-admin' &&
      Number.isFinite(payload.issuedAt) &&
      Date.now() - payload.issuedAt < ADMIN_TOKEN_MAX_AGE_MS
    );
  } catch {
    return false;
  }
};

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const phone = normalizeKoreanPhone(req.body?.phone);
  const hasValidPhone = phone && phone === normalizeKoreanPhone(ADMIN_PHONE);
  const hasValidToken = verifyAdminToken(req.body?.adminToken);
  if (!hasValidPhone && !hasValidToken) {
    return res.status(403).json({
      success: false,
      error: '관리자 확인에 실패했습니다.',
    });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gatherings, error: gatheringError } = await supabase
      .from('cheongmo_events')
      .select(
        `
        id,
        slug,
        title,
        host_name,
        partner_name,
        access_type,
        location_mode,
        status,
        selected_months,
        vote_deadline_at,
        created_at,
        updated_at
      `
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (gatheringError) throw gatheringError;

    const eventIds = (gatherings || []).map(item => item.id);
    const { data: responses, error: responseError } = eventIds.length
      ? await supabase
          .from('cheongmo_responses')
          .select(
            'cheongmo_event_id, available_dates, suggested_regions, updated_at'
          )
          .in('cheongmo_event_id', eventIds)
      : { data: [], error: null };

    if (responseError) throw responseError;

    const responseSummary = new Map();
    (responses || []).forEach(item => {
      const current = responseSummary.get(item.cheongmo_event_id) || {
        participantCount: 0,
        savedCount: 0,
        lastResponseAt: null,
      };
      current.participantCount += 1;
      if (hasResponseContent(item)) current.savedCount += 1;
      if (
        item.updated_at &&
        (!current.lastResponseAt || item.updated_at > current.lastResponseAt)
      ) {
        current.lastResponseAt = item.updated_at;
      }
      responseSummary.set(item.cheongmo_event_id, current);
    });

    return res.status(200).json({
      success: true,
      data: {
        adminToken: hasValidPhone ? createAdminToken() : req.body.adminToken,
        totalCount: gatherings?.length || 0,
        gatherings: (gatherings || []).map(item => {
          const summary = responseSummary.get(item.id) || {
            participantCount: 0,
            savedCount: 0,
            lastResponseAt: null,
          };
          return {
            id: item.id,
            slug: item.slug,
            title: item.title,
            hostName: item.host_name,
            partnerName: item.partner_name,
            accessType: item.access_type,
            locationMode: item.location_mode,
            status: item.status,
            selectedMonths: item.selected_months || [],
            voteDeadlineAt: item.vote_deadline_at,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            participantCount: summary.participantCount,
            savedCount: summary.savedCount,
            lastResponseAt: summary.lastResponseAt,
          };
        }),
      },
    });
  } catch (error) {
    console.error('청모 관리자 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '청모 관리자 정보를 불러오는 중 오류가 발생했습니다.',
    });
  }
}
