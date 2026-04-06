// pages/api/get-my-history.js - 휴대폰번호로 전체 축의/조의 내역 조회
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.query;
  if (!phone) {
    return res.status(400).json({ success: false, error: '휴대폰번호가 필요합니다.' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('guest_book')
      .select('id, guest_name, amount, relation_detail, relation_category, created_at, event_id')
      .eq('guest_phone', phone)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(200).json({ success: true, history: [] });
    }

    // event_id 목록으로 이벤트 정보 한번에 조회
    const eventIds = [...new Set(data.map(d => d.event_id).filter(Boolean))];
    const { data: events } = await supabase
      .from('events')
      .select('id, groom_name, bride_name, event_date, event_type')
      .in('id', eventIds);

    const eventMap = {};
    (events || []).forEach(e => { eventMap[e.id] = e; });

    const history = data.map(d => {
      const event = eventMap[d.event_id] || {};
      return {
        id: d.id,
        guestName: d.guest_name,
        amount: d.amount,
        relationship: d.relation_detail,
        side: d.relation_category,
        createdAt: d.created_at,
        groomName: event.groom_name || '신랑',
        brideName: event.bride_name || '신부',
        eventDate: event.event_date || null,
        eventType: event.event_type || 'wedding',
      };
    });

    return res.status(200).json({ success: true, history });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
