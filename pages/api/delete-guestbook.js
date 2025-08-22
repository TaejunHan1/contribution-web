// pages/api/delete-guestbook.js - 방명록 삭제 API
export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id, phone } = req.body;

  if (!id || !phone) {
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

    // 본인 확인 후 삭제
    const { data: deletedData, error: deleteError } = await supabase
      .from('guest_book')
      .delete()
      .eq('id', id)
      .eq('guest_phone', phone) // 본인 전화번호만 삭제 가능
      .select();

    if (deleteError) {
      console.error('방명록 삭제 오류:', deleteError);
      return res.status(500).json({ 
        success: false, 
        error: '방명록 삭제 중 오류가 발생했습니다.' 
      });
    }

    if (!deletedData || deletedData.length === 0) {
      return res.status(403).json({ 
        success: false, 
        error: '본인이 작성한 방명록만 삭제할 수 있습니다.' 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: '방명록이 삭제되었습니다.',
      data: deletedData[0]
    });

  } catch (error) {
    console.error('방명록 삭제 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}