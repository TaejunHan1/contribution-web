// pages/api/guest-book.js - RLS 우회를 위한 서버 API
import { createClient } from '@supabase/supabase-js';
import { normalizeKoreanPhone } from '../../lib/phoneUtils';

// 환경변수 체크
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 환경변수 체크:', {
  hasUrl: !!supabaseUrl,
  hasServiceKey: !!supabaseServiceKey,
  urlPrefix: supabaseUrl?.substring(0, 20) + '...',
  keyPrefix: supabaseServiceKey?.substring(0, 10) + '...'
});

// 서비스 키로 RLS 우회
const supabaseAdmin = supabaseUrl && supabaseServiceKey ? createClient(
  supabaseUrl,
  supabaseServiceKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
) : null;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Supabase Admin 클라이언트 체크
  if (!supabaseAdmin) {
    console.error('❌ Supabase Admin client not initialized');
    return res.status(500).json({ 
      message: '서버 설정 오류가 발생했습니다. 관리자에게 문의하세요.',
      debug: 'Service key not configured'
    });
  }

  try {
    const {
      event_id,
      guest_name,
      guest_phone,
      relation_category,
      relation_detail,
      amount,
      message,
      message_type,
      attending,
      companion_count,
      is_public,
      additional_info
    } = req.body;

    // 디버깅: 받은 데이터 로깅
    console.log('Received data:', {
      event_id,
      guest_name,
      amount,
      relation_category
    });

    // 환경변수 체크
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing environment variables');
      return res.status(500).json({ 
        message: '서버 설정 오류가 발생했습니다.',
        debug: 'Missing Supabase configuration'
      });
    }

    // 필수 필드 검증
    if (!event_id || !guest_name || !relation_category || !amount) {
      return res.status(400).json({ 
        message: '필수 정보를 모두 입력해주세요.' 
      });
    }

    // 금액 검증
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      return res.status(400).json({ 
        message: '금액은 1,000원 이상 입력해주세요.' 
      });
    }

    // 이벤트 존재 여부 확인 - 더 단순하게 처리
    console.log('🔍 이벤트 확인 시작:', event_id);
    
    const { data: eventCheck, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, event_type, status, event_name')
      .eq('id', event_id)
      .single();

    console.log('📋 이벤트 조회 결과:', {
      found: !!eventCheck,
      error: eventError?.message,
      status: eventCheck?.status,
      event_name: eventCheck?.event_name
    });

    if (eventError) {
      console.error('❌ 이벤트 조회 에러:', eventError);
      if (eventError.code === 'PGRST116') {
        return res.status(404).json({ 
          message: '존재하지 않는 경조사입니다.',
          debug: `Event not found: ${event_id}`
        });
      }
      return res.status(500).json({ 
        message: '이벤트 확인 중 오류가 발생했습니다.',
        error: eventError.message
      });
    }

    if (!eventCheck) {
      return res.status(404).json({ 
        message: '경조사를 찾을 수 없습니다.',
        debug: `Event ID: ${event_id}`
      });
    }

    // status가 active가 아닌 경우만 체크
    if (eventCheck.status !== 'active') {
      console.log('⚠️ 이벤트가 비활성 상태:', eventCheck.status);
      return res.status(400).json({ 
        message: '종료되었거나 비활성화된 경조사입니다.',
        debug: `Event status: ${eventCheck.status}`
      });
    }

    // 중복 방지: 같은 이벤트에 같은 이름으로 등록했는지 확인
    const { data: existingEntry, error: duplicateError } = await supabaseAdmin
      .from('guest_book')
      .select('id')
      .eq('event_id', event_id)
      .eq('guest_name', guest_name.trim())
      .maybeSingle();

    if (duplicateError) {
      console.error('Duplicate check error:', duplicateError);
      // 중복 체크 실패는 진행을 막지 않음
    }

    if (existingEntry) {
      return res.status(400).json({ 
        message: '이미 방명록에 등록된 성함입니다.' 
      });
    }

    // IP 주소 추출
    const forwarded = req.headers['x-forwarded-for'];
    const ip = forwarded ? forwarded.split(',')[0] : req.connection.remoteAddress;
    const normalizedPhone = normalizeKoreanPhone(guest_phone);

    // 방명록 데이터 준비
    const insertData = {
      event_id,
      guest_name: guest_name.trim(),
      guest_phone: normalizedPhone,
      relation_category,
      relation_detail: relation_detail || null,
      amount: numAmount,
      message: message?.trim() || null,
      message_type: message_type || (eventCheck.event_type === 'funeral' ? 'condolence' : 'congratulation'),
      attending: attending !== false, // 기본값 true
      companion_count: companion_count || 0,
      is_public: is_public !== false, // 기본값 true
      input_method: 'web_contribution',
      additional_info: {
        ...additional_info,
        created_via: 'web_contribution',
        source_type: 'web_contribution',
        ip_address: ip,
        user_agent: req.headers['user-agent']
      },
      ip_address: ip,
      user_agent: req.headers['user-agent']
    };

    console.log('Inserting guest book entry:', {
      event_id: insertData.event_id,
      guest_name: insertData.guest_name,
      amount: insertData.amount
    });

    // 방명록 데이터 삽입 (관리자 권한으로 RLS 우회)
    const { data, error } = await supabaseAdmin
      .from('guest_book')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Guest book insert error:', error);
      
      // 더 자세한 에러 메시지 제공
      if (error.code === '23505') { // unique violation
        return res.status(400).json({ 
          message: '이미 등록된 방명록입니다.',
          error: error.message 
        });
      }
      
      if (error.code === '23503') { // foreign key violation
        return res.status(400).json({ 
          message: '잘못된 이벤트 ID입니다.',
          error: error.message 
        });
      }
      
      return res.status(500).json({ 
        message: '방명록 등록 중 오류가 발생했습니다.',
        error: error.message,
        code: error.code,
        details: error.details
      });
    }

    console.log('Guest book entry created successfully:', data.id);

    res.status(200).json({ 
      success: true, 
      data,
      message: '방명록이 성공적으로 등록되었습니다.' 
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
