// pages/api/send-verification.js - SMS 인증번호 발송 API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ error: '핸드폰번호가 누락되었습니다.' });
  }

  try {
    // Twilio 계정 정보 (환경변수)
    const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
    const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
    const TWILIO_MESSAGE_SERVICE_SID = process.env.TWILIO_MESSAGE_SERVICE_SID;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_MESSAGE_SERVICE_SID) {
      console.error('Twilio 환경변수가 설정되지 않았습니다');
      return res.status(500).json({ 
        success: false, 
        error: 'SMS 설정 오류' 
      });
    }

    // 인증번호 생성
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Twilio 인증 헤더
    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');

    // SMS 메시지
    const message = `[경조사 청첩장] 인증번호는 ${verificationCode}입니다. 5분 내에 입력해주세요.`;

    // Twilio API 요청
    const formBody = [
      `To=${encodeURIComponent(phone)}`,
      `MessagingServiceSid=${encodeURIComponent(TWILIO_MESSAGE_SERVICE_SID)}`,
      `Body=${encodeURIComponent(message)}`
    ].join('&');

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formBody,
      }
    );

    const twilioResult = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error('Twilio SMS 발송 실패:', twilioResult);
      return res.status(500).json({ 
        success: false, 
        error: 'SMS 발송에 실패했습니다.' 
      });
    }

    // Supabase에 인증번호 저장
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

    // 기존 인증번호 삭제
    await supabase
      .from('sms_verifications')
      .delete()
      .eq('phone', phone)
      .eq('is_verified', false);

    // 새 인증번호 저장
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { error: insertError } = await supabase
      .from('sms_verifications')
      .insert([{
        phone: phone,
        verification_code: verificationCode,
        expires_at: expiresAt,
        is_verified: false,
        attempts_count: 0
      }]);

    if (insertError) {
      console.error('인증번호 DB 저장 오류:', insertError);
      return res.status(500).json({ 
        success: false, 
        error: '인증번호 저장 중 오류가 발생했습니다.' 
      });
    }

    console.log('SMS 인증번호 발송 성공:', { phone, sid: twilioResult.sid });

    return res.status(200).json({ 
      success: true,
      message: '인증번호가 발송되었습니다.'
    });

  } catch (error) {
    console.error('SMS 발송 API 오류:', error);
    return res.status(500).json({ 
      success: false, 
      error: '서버 오류가 발생했습니다.' 
    });
  }
}