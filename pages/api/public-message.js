// pages/api/public-message.js - 공개 메시지 등록 API
import { createClient } from '@supabase/supabase-js';

// 서비스 키로 RLS 우회
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // 서비스 키 필요
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      event_id,
      sender_name,
      message,
      message_type,
      is_anonymous
    } = req.body;

    // 필수 필드 검증
    if (!event_id || !sender_name || !message) {
      return res.status(400).json({ 
        message: '필수 정보를 모두 입력해주세요.' 
      });
    }

    // 메시지 길이 검증
    if (message.length > 500) {
      return res.status(400).json({ 
        message: '메시지는 500자 이내로 입력해주세요.' 
      });
    }

    // 이벤트 존재 여부 확인
    const { data: eventCheck, error: eventError } = await supabaseAdmin
      .from('events')
      .select('id, event_type, status')
      .eq('id', event_id)
      .eq('status', 'active')
      .single();

    if (eventError || !eventCheck) {
      return res.status(400).json({ 
        message: '유효하지 않은 경조사입니다.' 
      });
    }

    // 공개 메시지 삽입
    const { data, error } = await supabaseAdmin
      .from('event_messages')
      .insert([
        {
          event_id,
          sender_name: sender_name.trim(),
          message: message.trim(),
          message_type: message_type || (eventCheck.event_type === 'funeral' ? 'condolence' : 'congratulation'),
          is_anonymous: is_anonymous || false
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Public message insert error:', error);
      return res.status(500).json({ 
        message: '메시지 등록 중 오류가 발생했습니다.',
        error: error.message 
      });
    }

    res.status(200).json({ 
      success: true, 
      data,
      message: '축하 메시지가 성공적으로 등록되었습니다.' 
    });

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      message: '서버 오류가 발생했습니다.',
      error: error.message 
    });
  }
}