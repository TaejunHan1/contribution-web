// pages/api/verify-code.js - SMS 인증번호 검증 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone, code } = req.body;

  if (!phone || !code) {
    return res.status(400).json({ error: '필수 정보가 누락되었습니다.' });
  }

  try {
    // Supabase 클라이언트 생성
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 서버 측에서는 Service Role Key 사용
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경변수가 설정되지 않았습니다');
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase 설정 오류' 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 인증번호 확인
    const { data: verificationData, error: selectError } = await supabase
      .from('sms_verifications')
      .select('*')
      .eq('phone', phone)
      .eq('verification_code', code)
      .eq('is_verified', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (selectError || !verificationData) {
      console.log('인증번호 검증 실패:', { phone, code, error: selectError });
      return res.status(400).json({ 
        success: false, 
        error: '인증번호가 올바르지 않거나 만료되었습니다.' 
      });
    }

    // 인증 완료 처리
    const { error: updateError } = await supabase
      .from('sms_verifications')
      .update({ 
        is_verified: true
      })
      .eq('id', verificationData.id);

    if (updateError) {
      console.error('인증 상태 업데이트 오류:', updateError);
      return res.status(500).json({ 
        success: false, 
        error: '인증 처리 중 오류가 발생했습니다.' 
      });
    }

    console.log('SMS 인증 완료:', { phone });

    return res.status(200).json({ 
      success: true,
      message: '인증이 완료되었습니다.',
      verified: true
    });

  } catch (error) {
    console.error('인증번호 검증 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}