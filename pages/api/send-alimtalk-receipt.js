// pages/api/send-alimtalk-receipt.js — 앱 태블릿 접수 후 영수증 알림톡 발송
import { createClient } from '@supabase/supabase-js';
import { sendContributionAlimtalk } from '../../lib/kakaoAlimtalk';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, guestName, amount, side, relationship, eventId, contributionId } = req.body;

  if (!phone || !guestName || !amount || !eventId) {
    return res.status(400).json({ success: false, error: '필수 정보 누락' });
  }

  try {
    // 이벤트에서 신랑/신부 이름 가져오기
    const { data: eventInfo } = await supabaseAdmin
      .from('events')
      .select('groom_name, bride_name')
      .eq('id', eventId)
      .single();

    const result = await sendContributionAlimtalk({
      phone,
      guestName,
      amount,
      side: side || 'groom',
      relationship: relationship || 'other',
      groomName: eventInfo?.groom_name || '신랑',
      brideName: eventInfo?.bride_name || '신부',
      contributionId,
    });

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error('[send-alimtalk-receipt] 오류:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
