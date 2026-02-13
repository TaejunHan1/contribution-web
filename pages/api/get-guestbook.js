// pages/api/get-guestbook.js - 방명록 조회 API
export default async function handler(req, res) {
  // 브라우저 캐시 방지
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventId } = req.query;

  if (!eventId) {
    return res.status(400).json({ error: 'Event ID가 필요합니다.' });
  }

  try {
    // Supabase 클라이언트 생성
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경변수 누락:', { supabaseUrl: !!supabaseUrl, supabaseServiceKey: !!supabaseServiceKey });
      return res.status(500).json({
        success: false,
        error: 'Supabase 설정 오류'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // guest_book 테이블에서 방명록 데이터 조회
    const { data: guestBookData, error: guestError } = await supabase
      .from('guest_book')
      .select('*')
      .eq('event_id', eventId)
      .order('created_at', { ascending: false });

    if (guestError) {
      console.error('방명록 조회 오류:', guestError);
      return res.status(500).json({
        success: false,
        error: '방명록 조회 중 오류가 발생했습니다.'
      });
    }

    // 방명록 데이터 포맷팅 (메시지가 있는 항목만)
    const formattedMessages = (guestBookData || [])
      .filter(entry => entry.message && entry.guest_name)
      .map(entry => ({
        id: entry.id,
        from: entry.guest_name || '익명',
        phone: entry.guest_phone,
        date: new Date(entry.created_at).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        }).replace(/\./g, '.').replace(/\s/g, ' '),
        content: entry.message || ''
      }));

    return res.status(200).json({
      success: true,
      messages: formattedMessages
    });

  } catch (error) {
    console.error('방명록 조회 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '서버 오류가 발생했습니다.'
    });
  }
}
