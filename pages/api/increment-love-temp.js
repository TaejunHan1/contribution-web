// pages/api/increment-love-temp.js — 사랑 온도 +0.1 (원자적, 100도 캡)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.body || {};
  if (!eventId) {
    return res.status(400).json({ error: 'eventId가 필요합니다.' });
  }

  try {
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ success: false, error: 'Supabase 설정 오류' });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // RPC 우선 (원자적)
    const { data: rpcData, error: rpcErr } = await supabase
      .rpc('increment_love_temperature', { p_event_id: eventId });

    if (!rpcErr && rpcData && rpcData[0]) {
      return res.status(200).json({ success: true, temperature: Number(rpcData[0].new_temperature) });
    }

    // RPC 실패 시 fallback: UPDATE (컬럼 존재 필요)
    const { data: row } = await supabase
      .from('events')
      .select('love_temperature')
      .eq('id', eventId)
      .single();
    const current = Number(row?.love_temperature) || 36.5;
    const next = Math.min(100, Number((current + 0.1).toFixed(1)));
    const { error: updErr } = await supabase
      .from('events')
      .update({ love_temperature: next })
      .eq('id', eventId);
    if (updErr) {
      return res.status(500).json({ success: false, error: updErr.message });
    }
    return res.status(200).json({ success: true, temperature: next });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
