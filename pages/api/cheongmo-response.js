import {
  createSupabaseClient,
  getClientIp,
  verifyEntryToken,
} from '../../lib/cheongmoUtils';

const sanitizeText = (value, maxLength = 300) =>
  String(value || '')
    .trim()
    .slice(0, maxLength);
const hasResponseContent = item =>
  Boolean(item?.available_dates?.length || item?.suggested_regions?.length);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    slug,
    entryToken,
    participantId,
    guestName,
    availableDates,
    suggestedRegions,
  } = req.body;

  const tokenPayload = verifyEntryToken(entryToken);
  if (!tokenPayload || tokenPayload.slug !== slug) {
    return res.status(403).json({
      success: false,
      error: '입장 정보가 만료되었거나 올바르지 않습니다.',
    });
  }

  if (!guestName || !String(guestName).trim()) {
    return res
      .status(400)
      .json({ success: false, error: '이름을 입력해주세요.' });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gathering, error: gatheringError } = await supabase
      .from('cheongmo_events')
      .select('id, slug, access_type, allowed_phones, vote_deadline_at')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (gatheringError) throw gatheringError;
    if (!gathering) {
      return res
        .status(404)
        .json({ success: false, error: '청모 정보를 찾을 수 없습니다.' });
    }

    if (
      gathering.access_type === 'password' &&
      gathering.vote_deadline_at &&
      new Date(gathering.vote_deadline_at).getTime() < Date.now()
    ) {
      return res.status(403).json({
        success: false,
        error: '투표 마감일이 지나 의견 수정이 종료됐습니다.',
      });
    }

    const cleanDates = Array.isArray(availableDates)
      ? Array.from(
          new Set(
            availableDates
              .map(date => String(date || '').trim())
              .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
          )
        ).slice(0, 90)
      : [];
    const cleanRegions = Array.isArray(suggestedRegions)
      ? Array.from(
          new Set(
            suggestedRegions
              .map(region => sanitizeText(region, 60))
              .filter(Boolean)
          )
        ).slice(0, 12)
      : [];

    const payload = {
      cheongmo_event_id: gathering.id,
      guest_name: sanitizeText(guestName, 80),
      guest_phone: tokenPayload.phone || null,
      memo: null,
      available_dates: cleanDates,
      suggested_regions: cleanRegions,
      entry_method: gathering.access_type,
      is_verified: true,
      ip_address: getClientIp(req),
      user_agent: req.headers['user-agent'] || null,
      updated_at: new Date().toISOString(),
    };

    let targetParticipantId = participantId;
    if (!targetParticipantId && tokenPayload.phone) {
      const { data: existingResponse, error: existingError } = await supabase
        .from('cheongmo_responses')
        .select('id')
        .eq('cheongmo_event_id', gathering.id)
        .eq('guest_phone', tokenPayload.phone)
        .maybeSingle();

      if (existingError) throw existingError;
      targetParticipantId = existingResponse?.id || null;
    }

    if (gathering.access_type === 'phone_list') {
      const expectedCount = Array.isArray(gathering.allowed_phones)
        ? gathering.allowed_phones.length
        : 0;
      if (expectedCount > 0) {
        const { data: responses, error: responsesError } = await supabase
          .from('cheongmo_responses')
          .select('id, available_dates, suggested_regions')
          .eq('cheongmo_event_id', gathering.id);

        if (responsesError) throw responsesError;
        const respondedCount = (responses || []).filter(hasResponseContent).length;
        if (respondedCount >= expectedCount) {
          return res.status(403).json({
            success: false,
            error: '초대된 인원이 모두 투표해 의견 수정이 종료됐습니다.',
          });
        }
      }
    }

    let query;
    if (targetParticipantId) {
      query = supabase
        .from('cheongmo_responses')
        .update(payload)
        .eq('id', targetParticipantId)
        .eq('cheongmo_event_id', gathering.id)
        .select(
          'id, guest_name, available_dates, suggested_regions, updated_at'
        )
        .maybeSingle();
    } else {
      query = supabase
        .from('cheongmo_responses')
        .insert([payload])
        .select(
          'id, guest_name, available_dates, suggested_regions, updated_at'
        )
        .single();
    }

    const { data, error } = await query;
    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: {
        id: data.id,
        guestName: data.guest_name,
        availableDates: data.available_dates || [],
        suggestedRegions: data.suggested_regions || [],
        updatedAt: data.updated_at,
      },
    });
  } catch (error) {
    console.error('청모 가입 API 오류:', error);
    return res
      .status(500)
      .json({ success: false, error: '청모 가입 중 오류가 발생했습니다.' });
  }
}
