// pages/api/submit-guestbook.js - 방명록 제출 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, guestName, message, eventId } = req.body;

  if (!phone || !guestName || !message) {
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
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

    // 먼저 SMS 인증이 완료되었는지 확인
    const { data: verificationData, error: verificationError } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('is_verified', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (verificationError || !verificationData) {
      console.log('SMS 인증 확인 실패:', { phone, error: verificationError });
      return res.status(400).json({ 
        success: false, 
        error: '핸드폰 인증이 완료되지 않았습니다.' 
      });
    }

    // 방명록 데이터 저장
    const guestBookData = {
      event_id: eventId || null,
      guest_name: guestName,
      guest_phone: phone,
      message: message,
      is_verified: true
    };

    const { data: guestBookEntry, error: insertError } = await supabase
      .from('guest_book')
      .insert([guestBookData])
      .select()
      .single();

    if (insertError) {
      console.error('방명록 저장 오류:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: '방명록 저장 중 오류가 발생했습니다.' 
      });
    }

    // 방명록 저장 완료

    console.log('방명록 저장 성공:', { 
      phone, 
      guestName,
      messageLength: message.length 
    });

    return res.status(200).json({ 
      success: true,
      message: '방명록이 성공적으로 저장되었습니다.',
      data: {
        id: guestBookEntry.id,
        guest_name: guestName,
        created_at: guestBookEntry.created_at
      }
    });

  } catch (error) {
    console.error('방명록 제출 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}