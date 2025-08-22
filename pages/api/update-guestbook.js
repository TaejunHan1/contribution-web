// pages/api/update-guestbook.js - 방명록 수정 API
export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, guestName, message, phone } = req.body;

  if (!id || !guestName || !message || !phone) {
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

    // 본인 확인 후 업데이트
    const { data: updatedData, error: updateError } = await supabase
      .from('guest_book')
      .update({
        guest_name: guestName,
        message: message,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('guest_phone', phone) // 본인 전화번호만 수정 가능
      .select();

    if (updateError) {
      console.error('방명록 수정 오류:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: '방명록 수정 중 오류가 발생했습니다.' 
      });
    }

    if (!updatedData || updatedData.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: '본인이 작성한 방명록만 수정할 수 있습니다.' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: '방명록이 수정되었습니다.',
      data: updatedData[0]
    });

  } catch (error) {
    console.error('방명록 수정 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}