// pages/api/submit-contribution.js - 축의금 저장 API
import { sendContributionNotification } from '../../lib/notificationService';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { guestName, contributionAmount, relationship, side, phone, eventId } = req.body;

  console.log('축의금 전달 요청 데이터:', {
    guestName,
    contributionAmount,
    relationship,
    side,
    phone,
    eventId
  });

  if (!guestName || !contributionAmount || !relationship || !side || !phone || !eventId) {
    console.error('필수 정보 누락:', { guestName, contributionAmount, relationship, side, phone, eventId });
    return res.status(400).json({ 
      success: false,
      error: '필수 정보가 누락되었습니다.' 
    });
  }

  // 랜덤 축하 메시지 배열 (30개)
  const defaultMessages = [
    "두 분의 결혼을 진심으로 축하드립니다. 행복하세요!",
    "아름다운 두 분의 결혼식을 축하합니다. 늘 사랑하며 살아가세요.",
    "결혼 축하드려요! 평생 행복한 가정 이루시길 바랍니다.",
    "새로운 시작을 축하드립니다. 언제나 서로를 아끼며 살아가세요.",
    "두 분의 사랑이 영원하기를 기원합니다. 축복합니다!",
    "행복한 결혼생활 되시길 진심으로 기원합니다.",
    "결혼을 축하드립니다. 서로 사랑하며 아름답게 살아가세요.",
    "두 분의 앞날에 행복만 가득하길 바랍니다. 축하해요!",
    "평생 서로의 든든한 동반자가 되어주세요. 축하합니다.",
    "사랑으로 가득한 가정을 이루시길 바랍니다. 결혼 축하드려요!",
    "언제나 지금처럼 서로를 아끼고 사랑하세요. 축하합니다!",
    "두 분의 결혼을 축하하며, 행복한 미래를 응원합니다.",
    "아름다운 부부가 되시길 바랍니다. 진심으로 축하드려요!",
    "서로를 이해하고 배려하는 멋진 부부가 되세요. 축하합니다.",
    "꽃길만 걸으시길 바라며, 결혼을 축하드립니다.",
    "두 분의 사랑이 더욱 깊어지길 기원합니다. 축하해요!",
    "늘 웃음이 가득한 가정 이루시길 바랍니다. 결혼 축하드려요.",
    "서로의 최고의 친구가 되어주세요. 축하합니다!",
    "행복한 날들로 가득한 결혼생활 되세요. 축하드립니다.",
    "두 분의 결혼식에 함께하게 되어 기쁩니다. 축하해요!",
    "사랑과 행복이 넘치는 가정 이루시길 기원합니다.",
    "언제나 서로에게 힘이 되어주는 부부가 되세요. 축하합니다.",
    "두 분의 아름다운 사랑을 축복합니다. 행복하세요!",
    "평생 함께 웃으며 살아가시길 바랍니다. 결혼 축하드려요.",
    "서로를 존중하고 사랑하는 부부가 되세요. 축하합니다!",
    "두 분의 새로운 여정을 응원합니다. 결혼 축하드려요!",
    "늘 행복하고 건강한 가정 이루시길 바랍니다.",
    "사랑스러운 두 분의 결혼을 진심으로 축하합니다.",
    "서로에게 영원한 사랑이 되어주세요. 축복합니다!",
    "두 분의 결혼을 축하하며, 앞날에 좋은 일만 가득하길 기원합니다."
  ];

  // 랜덤으로 메시지 선택
  const randomMessage = defaultMessages[Math.floor(Math.random() * defaultMessages.length)];

  try {
    // Supabase 클라이언트 생성
    const { createClient } = await import('@supabase/supabase-js');
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    console.log('환경 변수 체크:', {
      supabaseUrl: supabaseUrl ? '설정됨' : '누락',
      supabaseServiceKey: supabaseServiceKey ? '설정됨' : '누락'
    });
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase 환경변수가 설정되지 않았습니다', { supabaseUrl, supabaseServiceKey });
      return res.status(500).json({ 
        success: false, 
        error: 'Supabase 설정 오류',
        details: `URL: ${supabaseUrl ? '설정됨' : '누락'}, Key: ${supabaseServiceKey ? '설정됨' : '누락'}` 
      });
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 먼저 guest_book에서 해당 event_id와 phone으로 기존 레코드를 찾기
    const { data: existingRecord, error: findError } = await supabase
      .from('guest_book')
      .select('*')
      .eq('event_id', eventId)
      .eq('guest_phone', phone)
      .single();

    if (findError && findError.code !== 'PGRST116') { // PGRST116은 no rows found 에러
      console.error('기존 레코드 조회 오류:', findError);
      return res.status(500).json({ 
        success: false, 
        error: '데이터 조회 중 오류가 발생했습니다.',
        details: findError.message 
      });
    }

    console.log('기존 레코드 조회 결과:', existingRecord ? '기존 레코드 있음' : '새 레코드 생성 필요');

    let contributionData;

    if (existingRecord) {
      // 기존 레코드가 있으면 업데이트
      console.log('기존 레코드 업데이트 시도:', {
        id: existingRecord.id,
        guest_name: guestName,
        amount: contributionAmount,
        relation_category: side,
        relation_detail: relationship
      });

      const { data: updateData, error: updateError } = await supabase
        .from('guest_book')
        .update({
          guest_name: guestName,
          amount: contributionAmount,
          relation_category: side, // 'groom' 또는 'bride'를 relation_category에 저장
          relation_detail: relationship,
          is_verified: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();

      if (updateError) {
        console.error('축의금 업데이트 오류:', updateError);
        return res.status(500).json({ 
          success: false, 
          error: '축의금 업데이트 중 오류가 발생했습니다.',
          details: updateError.message 
        });
      }
      contributionData = updateData;
    } else {
      // 새 레코드 삽입
      console.log('새 레코드 삽입 시도:', {
        event_id: eventId,
        guest_phone: phone,
        guest_name: guestName,
        amount: contributionAmount,
        relation_category: side,
        relation_detail: relationship
      });

      const { data: insertData, error: insertError } = await supabase
        .from('guest_book')
        .insert({
          event_id: eventId,
          guest_phone: phone,
          guest_name: guestName,
          amount: contributionAmount,
          relation_category: side, // 'groom' 또는 'bride'를 relation_category에 저장
          relation_detail: relationship,
          message: randomMessage, // 랜덤으로 선택된 축하 메시지
          amount_type: 'money',
          payment_method: 'online',
          message_type: 'congratulation', // 기본값 명시적 추가
          is_verified: true,
          is_public: true, // 랜덤 메시지는 방명록에 표시
          attending: true,
          companion_count: 0, // 기본값 추가
          meal_required: true, // 기본값 추가
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (insertError) {
        console.error('축의금 저장 오류:', insertError);
        return res.status(500).json({ 
          success: false, 
          error: '축의금 저장 중 오류가 발생했습니다.',
          details: insertError.message 
        });
      }
      contributionData = insertData;
    }

    // 🔔 푸시 알림 발송 시도
    try {
      const notificationResult = await sendContributionNotification(eventId, {
        guestName,
        contributionAmount,
        relationship,
        side,
        contributionId: contributionData.id
      });
      
      if (notificationResult.success) {
        console.log('푸시 알림 발송 성공:', notificationResult.message);
      } else {
        console.warn('푸시 알림 발송 실패:', notificationResult.error);
      }
    } catch (notificationError) {
      console.error('푸시 알림 발송 오류 (축의금 저장은 성공):', notificationError);
      // 알림 발송 실패해도 축의금 저장은 성공이므로 계속 진행
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
      error: '서버 오류가 발생했습니다.',
      details: error.message 
    });
  }
}