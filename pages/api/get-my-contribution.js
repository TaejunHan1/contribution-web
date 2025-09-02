// pages/api/get-my-contribution.js - 내 축의금 조회 API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId, phone } = req.query;

  if (!eventId || !phone) {
    return res.status(400).json({ 
      success: false,
      error: '이벤트 ID와 휴대폰 번호가 필요합니다.' 
    });
  }

  try {
    // Supabase 클라이언트 생성
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase 설정 오류'
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // guest_book 테이블에서 해당 이벤트와 휴대폰번호로 축의금 데이터 조회
    const { data: contribution, error } = await supabase
      .from('guest_book')
      .select('*')
      .eq('event_id', eventId)
      .eq('guest_phone', phone)
      .eq('is_verified', true)
      .maybeSingle();

    if (error) {
      console.error('축의금 조회 오류:', error);
      return res.status(500).json({ 
        success: false, 
        error: '축의금 조회 중 오류가 발생했습니다.',
        details: error.message 
      });
    }

    if (!contribution) {
      return res.status(200).json({ 
        success: true,
        contribution: null,
        message: '축의금 기록이 없습니다.'
      });
    }

    // 성공 응답
    return res.status(200).json({ 
      success: true,
      contribution: {
        id: contribution.id,
        guestName: contribution.guest_name,
        contributionAmount: contribution.amount,
        relationship: contribution.relation_detail,
        side: contribution.relation_category,
        phone: contribution.guest_phone,
        createdAt: contribution.created_at,
        updatedAt: contribution.updated_at
      }
    });

  } catch (error) {
    console.error('축의금 조회 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}