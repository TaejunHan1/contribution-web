import { normalizeKoreanPhone } from '../../lib/phoneUtils';
import {
  createSupabaseClient,
  verifyEntryToken,
} from '../../lib/cheongmoUtils';

const cleanDateList = dates =>
  Array.isArray(dates)
    ? Array.from(
        new Set(
          dates
            .map(date => String(date || '').trim())
            .filter(date => /^\d{4}-\d{2}-\d{2}$/.test(date))
        )
      ).slice(0, 120)
    : [];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug, entryToken, unavailableDates } = req.body;
  const tokenPayload = verifyEntryToken(entryToken);
  if (!slug || !tokenPayload || tokenPayload.slug !== slug) {
    return res.status(403).json({
      success: false,
      error: '입장 정보가 만료되었거나 올바르지 않습니다.',
    });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gathering, error: gatheringError } = await supabase
      .from('cheongmo_events')
      .select('id, slug, host_phone, selected_months')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (gatheringError) throw gatheringError;
    if (!gathering) {
      return res
        .status(404)
        .json({ success: false, error: '청모 정보를 찾을 수 없습니다.' });
    }

    const hostPhone = normalizeKoreanPhone(gathering.host_phone);
    const tokenPhone = normalizeKoreanPhone(tokenPayload.phone);
    if (!hostPhone || tokenPhone !== hostPhone) {
      return res.status(403).json({
        success: false,
        error: '주최자만 수정할 수 있습니다.',
      });
    }

    const selectedMonths = Array.isArray(gathering.selected_months)
      ? gathering.selected_months
      : [];
    const cleanDates = cleanDateList(unavailableDates).filter(date =>
      selectedMonths.length > 0
        ? selectedMonths.includes(date.slice(0, 7))
        : true
    );

    const { data, error } = await supabase
      .from('cheongmo_events')
      .update({
        host_unavailable_dates: cleanDates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', gathering.id)
      .select('host_unavailable_dates')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: {
        hostUnavailableDates: data.host_unavailable_dates || [],
      },
    });
  } catch (error) {
    console.error('청모 주최자 불가능 날짜 저장 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '주최자 불가능 날짜를 저장하는 중 오류가 발생했습니다.',
    });
  }
}
