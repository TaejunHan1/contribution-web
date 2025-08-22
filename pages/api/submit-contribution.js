// pages/api/submit-contribution.js - 축의금 저장 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestName, contributionAmount, relationship, side, phone, eventId } = req.body;

  if (!guestName || !contributionAmount || !relationship || !side || !phone || !eventId) {
    return res.status(400).json({ 
      success: false,
      error: '필수 정보가 누락되었습니다.' 
    });
  }

  try {
    // Supabase 클라이언트 생성
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경변수가 설정되지 않았습니다');
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase 설정 오류' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // contributions 테이블에 축의금 정보 저장
    const { data: contributionData, error: insertError } = await supabase
      .from('contributions')
      .insert({
        event_id: eventId,
        guest_phone: phone,
        guest_name: guestName,
        amount: contributionAmount,
        relationship: relationship,
        side: side, // 'groom' 또는 'bride'
        is_verified: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('축의금 저장 오류:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: '축의금 저장 중 오류가 발생했습니다.' 
      });
    }

    // 성공 응답
    return res.status(200).json({ 
      success: true,
      message: '축의금이 성공적으로 등록되었습니다.',
      contributionId: contributionData.id
    });

  } catch (error) {
    console.error('축의금 저장 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}