import { normalizeKoreanPhone } from '../../lib/phoneUtils';
import {
  createEntryToken,
  createSupabaseClient,
  findAllowedPhoneEntry,
  getClientIp,
  verifyPassword,
} from '../../lib/cheongmoUtils';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, accessType, value } = req.body;

  if (!slug || !accessType || !value) {
    return res
      .status(400)
      .json({ success: false, error: '입장 정보가 누락되었습니다.' });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gathering, error } = await supabase
      .from('cheongmo_events')
      .select('id, slug, access_type, password_hash, allowed_phones')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (error) throw error;
    if (!gathering || gathering.access_type !== accessType) {
      return res
        .status(404)
        .json({ success: false, error: '청모 정보를 찾을 수 없습니다.' });
    }

    let phone = null;
    let participant = null;
    if (gathering.access_type === 'password') {
      if (!verifyPassword(value, gathering.password_hash)) {
        return res.status(403).json({
          success: false,
          error: '모임 비밀번호가 올바르지 않습니다.',
        });
      }
    } else {
      phone = normalizeKoreanPhone(value);
      const allowedEntry = findAllowedPhoneEntry(
        gathering.allowed_phones,
        phone
      );
      if (!allowedEntry) {
        return res.status(403).json({
          success: false,
          error: '입장이 허용된 휴대폰 번호가 아닙니다.',
        });
      }

      if (allowedEntry.name) {
        const responsePayload = {
          cheongmo_event_id: gathering.id,
          guest_name: allowedEntry.name,
          guest_phone: phone,
          entry_method: gathering.access_type,
          is_verified: true,
          ip_address: getClientIp(req),
          user_agent: req.headers['user-agent'] || null,
          updated_at: new Date().toISOString(),
        };

        const { data: existingResponse, error: existingError } = await supabase
          .from('cheongmo_responses')
          .select('id')
          .eq('cheongmo_event_id', gathering.id)
          .eq('guest_phone', phone)
          .maybeSingle();

        if (existingError) throw existingError;

        const query = existingResponse
          ? supabase
              .from('cheongmo_responses')
              .update(responsePayload)
              .eq('id', existingResponse.id)
              .select('id, guest_name, available_dates, suggested_regions')
              .single()
          : supabase
              .from('cheongmo_responses')
              .insert([responsePayload])
              .select('id, guest_name, available_dates, suggested_regions')
              .single();

        const { data: responseData, error: responseError } = await query;
        if (responseError) throw responseError;

        participant = {
          id: responseData.id,
          guestName: responseData.guest_name,
          availableDates: responseData.available_dates || [],
          suggestedRegions: responseData.suggested_regions || [],
        };
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        entryToken: createEntryToken({
          slug: gathering.slug,
          accessType: gathering.access_type,
          phone,
        }),
        participant,
      },
    });
  } catch (error) {
    console.error('청모 입장 API 오류:', error);
    return res
      .status(500)
      .json({ success: false, error: '청모 입장 중 오류가 발생했습니다.' });
  }
}
