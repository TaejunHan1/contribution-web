// pages/api/get-my-guestbook.js - 본인이 작성한 방명록 조회 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, eventId } = req.body;

  if (!phone || !eventId) {
    return res.status(400).json({ error: '전화번호와 이벤트 ID가 필요합니다.' });
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

    // 본인이 작성한 방명록 조회
    const { data: guestBookEntry, error: selectError } = await supabase
      .from('guest_book')
      .select('*')
      .eq('event_id', eventId)
      .eq('guest_phone', phone)
      .eq('is_verified', true)
      .single();

    if (selectError) {
      console.error('방명록 조회 오류:', selectError);
      return res.status(500).json({ 
        success: false, 
        error: '방명록 조회 중 오류가 발생했습니다.' 
      });
    }

    if (!guestBookEntry) {
      return res.status(404).json({ 
        success: false, 
        error: '작성된 방명록을 찾을 수 없습니다.' 
      });
    }

    return res.status(200).json({ 
      success: true,
      guestbook: {
        id: guestBookEntry.id,
        name: guestBookEntry.guest_name,
        message: guestBookEntry.message,
        phone: guestBookEntry.guest_phone,
        createdAt: guestBookEntry.created_at
      }
    });

  } catch (error) {
    console.error('방명록 조회 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}