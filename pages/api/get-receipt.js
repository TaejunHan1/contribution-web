// pages/api/get-receipt.js - contributionId로 영수증 데이터 조회
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ success: false, error: 'id가 필요합니다.' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data, error } = await supabase
      .from('guest_book')
      .select(`
        id, guest_name, amount, relation_detail, relation_category,
        created_at,
        events ( groom_name, bride_name, event_date, ceremony_time, location )
      `)
      .eq('id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ success: false, error: '영수증을 찾을 수 없습니다.', details: error, id });
    }

    return res.status(200).json({
      success: true,
      receipt: {
        id: data.id,
        guestName: data.guest_name,
        amount: data.amount,
        relationship: data.relation_detail,
        side: data.relation_category,
        createdAt: data.created_at,
        groomName: data.events?.groom_name || '신랑',
        brideName: data.events?.bride_name || '신부',
        eventDate: data.events?.event_date,
        ceremonyTime: data.events?.ceremony_time,
        location: data.events?.location,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
