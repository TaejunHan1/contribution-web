// pages/api/check-guestbook-duplicate.js - 방명록 중복 작성 확인 API
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

    // 해당 이벤트에서 해당 전화번호로 작성된 방명록 확인
    const { data: existingEntries, error: selectError } = await supabase
      .from('guest_book')
      .select('id, guest_name, created_at')
      .eq('event_id', eventId)
      .eq('guest_phone', phone)
      .eq('is_verified', true);

    if (selectError) {
      console.error('중복 확인 오류:', selectError);
      return res.status(500).json({ 
        success: false, 
        error: '중복 확인 중 오류가 발생했습니다.' 
      });
    }

    // 중복 방명록이 있는 경우
    if (existingEntries && existingEntries.length > 0) {
      const latestEntry = existingEntries[0];
      return res.status(200).json({ 
        success: true,
        isDuplicate: true,
        existingEntry: {
          id: latestEntry.id,
          name: latestEntry.guest_name,
          createdAt: latestEntry.created_at
        },
        message: '이미 이 번호로 방명록을 작성하셨습니다.'
      });
    }

    // 중복이 없는 경우
    return res.status(200).json({ 
      success: true,
      isDuplicate: false,
      message: '방명록 작성이 가능합니다.'
    });

  } catch (error) {
    console.error('중복 확인 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}