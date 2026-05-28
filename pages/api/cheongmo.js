import { createSupabaseClient } from '../../lib/cheongmoUtils';

export default async function handler(req, res) {
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate'
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const slug = String(req.query.slug || '').trim();
  if (!slug) {
    return res
      .status(400)
      .json({ success: false, error: '청모 링크가 누락되었습니다.' });
  }

  try {
    const supabase = await createSupabaseClient();
    const { data: gathering, error: gatheringError } = await supabase
      .from('cheongmo_events')
      .select(
        `
        id,
        slug,
        title,
        host_name,
        partner_name,
        message,
        access_type,
        allowed_phones,
        selected_months,
        location_mode,
        location_label,
        venue_name,
        venue_address,
        meeting_time,
        vote_deadline_at,
        status
      `
      )
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle();

    if (gatheringError) throw gatheringError;

    if (!gathering) {
      return res
        .status(404)
        .json({ success: false, error: '청모 정보를 찾을 수 없습니다.' });
    }

    const { data: participants, error: participantsError } = await supabase
      .from('cheongmo_responses')
      .select(
        'id, guest_name, available_dates, suggested_regions, created_at, updated_at'
      )
      .eq('cheongmo_event_id', gathering.id)
      .order('created_at', { ascending: true });

    if (participantsError) throw participantsError;

    return res.status(200).json({
      success: true,
      data: {
        ...gathering,
        participants: (participants || []).map(item => ({
          id: item.id,
          guestName: item.guest_name,
          availableDates: item.available_dates || [],
          suggestedRegions: item.suggested_regions || [],
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })),
      },
    });
  } catch (error) {
    console.error('청모 조회 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '청모 정보를 불러오는 중 오류가 발생했습니다.',
    });
  }
}
