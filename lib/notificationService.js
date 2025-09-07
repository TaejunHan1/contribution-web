// lib/notificationService.js - Expo Push Notification Service
import { createClient } from '@supabase/supabase-js';
import { sendFCMNotification } from './fcmService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function sendContributionNotification(eventId, contributionData) {
  try {
    console.log('푸시 알림 발송 시작:', { eventId, contributionData });

    // Supabase 클라이언트 생성
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. 이벤트 정보 조회하여 이벤트 소유자 찾기
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('user_id, event_type, bride_name, groom_name')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('이벤트 정보 조회 실패:', eventError);
      return { success: false, error: '이벤트 정보를 찾을 수 없습니다.' };
    }

    console.log('이벤트 정보 조회 성공:', event);

    // 2. 해당 이벤트의 총 부조금 계산
    const { data: contributions, error: contributionsError } = await supabase
      .from('guest_book')
      .select('amount')
      .eq('event_id', eventId);

    let totalAmount = 0;
    if (contributions && contributions.length > 0) {
      totalAmount = contributions.reduce((sum, contribution) => sum + contribution.amount, 0);
    }

    console.log('이벤트 총 부조금:', {
      contributionCount: contributions?.length || 0,
      totalAmount: totalAmount.toLocaleString()
    });

    // 3. 이벤트 소유자의 푸시 알림 설정 조회
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('push_notification_enabled, push_token, notification_settings')
      .eq('id', event.user_id)
      .single();

    if (userError || !user) {
      console.error('사용자 정보 조회 실패:', userError);
      return { success: false, error: '사용자 정보를 찾을 수 없습니다.' };
    }

    console.log('사용자 알림 설정:', {
      enabled: user.push_notification_enabled,
      hasToken: !!user.push_token,
      settings: user.notification_settings
    });

    // 3. 알림 설정 확인
    if (!user.push_notification_enabled || !user.push_token) {
      console.log('알림이 비활성화되었거나 푸시 토큰이 없음');
      return { success: true, message: '사용자가 알림을 비활성화했거나 토큰이 없음' };
    }

    // 4. 푸시 알림이 활성화되어 있는지 확인 (단순화)
    const notificationSettings = user.notification_settings || {};
    if (user.push_notification_enabled === false || notificationSettings.contribution === false) {
      console.log('푸시 알림이 비활성화됨');
      return { success: true, message: '사용자가 푸시 알림을 비활성화함' };
    }

    // 5. 알림 메시지 생성
    const { guestName, contributionAmount, relationship, side } = contributionData;
    
    const eventNames = event.event_type === 'wedding' 
      ? `${event.groom_name}·${event.bride_name} 결혼식`
      : '경조사';

    const sideText = side === 'groom' ? '신랑' : '신부';
    
    // 관계 한글 변환
    const relationshipKorean = {
      'family': '가족',
      'relative': '친척', 
      'friend': '친구',
      'colleague': '동료',
      'neighbor': '이웃',
      'other': '기타'
    };
    
    const relationshipText = relationshipKorean[relationship] || relationship;
    const formattedAmount = contributionAmount.toLocaleString();
    const formattedTotalAmount = totalAmount.toLocaleString();

    const title = '💰 새로운 축의금이 전달되었습니다';
    const body = `${guestName}님 (${sideText}측 ${relationshipText})\n💸 ${formattedAmount}원\n📊 총 누적금액: ${formattedTotalAmount}원`;

    // 6. 토큰 타입 확인 - Expo 우선 사용 (FCM 문제로 인한 임시 조치)
    const isExpoToken = user.push_token && 
                       (user.push_token.startsWith('ExponentPushToken') || 
                        user.push_token.includes('polling-mode') ||
                        user.push_token.includes('expo-go-polling'));
    
    const isFCMToken = user.push_token && 
                      !isExpoToken &&
                      !user.push_token.includes('simulator') &&
                      !user.push_token.includes('dev-token');
    
    let result;
    
    if (isExpoToken) {
      // 📱 Expo 토큰 - FCM 시도 없이 바로 Expo API 사용
      console.log('📱 Expo 토큰 감지 - Expo Push API 직접 사용');
      
      if (user.push_token.includes('polling-mode') || user.push_token.includes('expo-go-polling')) {
        console.log('⚠️ 폴링 모드 토큰 - 실제 푸시 알림 불가');
        return { 
          success: true, 
          message: '폴링 모드 - 앱 실행 중에만 알림',
          pushResult: { note: 'polling-mode' }
        };
      }
      
      const message = {
        to: user.push_token,
        sound: 'default',
        title: title,
        body: body,
        data: {
          eventId: eventId,
          contributionId: contributionData.contributionId,
          type: 'contribution',
          guestName: guestName,
          amount: contributionAmount
        },
        priority: 'high',
        channelId: 'contribution-notifications'
      };

      console.log('📤 Expo 푸시 메시지:', message);

      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      result = await response.json();
      console.log('📨 Expo 푸시 API 응답:', result);

      if (!response.ok) {
        throw new Error(`Expo API 오류: ${result.errors?.[0]?.message || 'Unknown error'}`);
      }
      
    } else if (isFCMToken) {
      // FCM V1 API 직접 호출 (서비스 계정 수정됨)
      console.log('🔥 FCM 토큰 감지 - Firebase V1 API 직접 호출');
      
      try {
        result = await sendFCMNotification(
          user.push_token,
          title,
          body,
          {
            eventId: eventId,
            contributionId: contributionData.contributionId,
            type: 'contribution',
            guestName: guestName,
            amount: contributionAmount.toString()
          }
        );
        
        console.log('✅ FCM V1 API 발송 성공:', result);
      } catch (fcmError) {
        console.error('❌ FCM V1 API 실패:', fcmError);
        throw fcmError;
      }
      
    } else {
      console.log('⚠️ 알 수 없는 토큰 타입:', user.push_token);
      return { 
        success: false, 
        error: '지원하지 않는 토큰 타입입니다' 
      };
    }

    // 7. 성공 로그
    console.log('푸시 알림 발송 성공:', {
      eventId,
      userId: event.user_id,
      guestName,
      amount: formattedAmount
    });

    return { 
      success: true, 
      message: '푸시 알림이 성공적으로 발송되었습니다.',
      pushResult: result
    };

  } catch (error) {
    console.error('푸시 알림 발송 중 오류:', error);
    return { 
      success: false, 
      error: error.message,
      details: error.stack
    };
  }
}