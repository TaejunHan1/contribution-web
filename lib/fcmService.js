// Firebase Cloud Messaging V1 API 서비스
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

let serviceAccount;
try {
  // 서비스 계정 파일 읽기
  const serviceAccountPath = path.resolve('../GyeongjoApp/gyeongjoapp-firebase-adminsdk-fbsvc-4fc4512631.json');
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  console.log('✅ Firebase 서비스 계정 파일 로드 성공');
} catch (error) {
  console.error('❌ 서비스 계정 파일 로드 실패:', error);
  // 백업용 하드코딩 설정
  serviceAccount = {
    "type": "service_account",
    "project_id": "gyeongjoapp",
    "private_key_id": "4fc4512631cddc26085c62a85e4ee6cec95c7bf3",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCvWDyJWz0AcsHd\ndnnSa/OWKsknWRWJiXiQe3u5KOPrTUtJJCV2Ow7jqeIGmoHsoUYoVNLwULFWS6TA\nVJ6w9TAofLZ16LSA+POiS7d9r/a81I2nDbNOFuD8cOqCzF/NFTjlwbyHjBqDzPQO\nmW195iz6RVKBXcFe+lfcY/E3Hkkp4tGn8TdQvs9CzlrenQtoixprCV8qGi4xywbM\nQm/Lnoy4USZ/KPUiVTijN+tvAQflew/va2VfBHv5Zn0YN9sRfxTrmpzq51OacDW/\nlus+uE7UNV74OKBq1wWueuvNYgKQRL/DYconOd5c/IOo3Vjs3gVfNFHR5hXRJrG/\nYFM9XUflAgMBAAECggEADngZhrwgrIjLtpqwMsz1rM6bCsQvIspVSJbn/r+BD0mx\njLeO39K/x8mc/S6CyiQExg852NrPx282iShyb+fLsYuZAuHRA1OHxzy4R4bdtXdU\nuRRIV4lLx4kJ0QFMZn/50fvKsuS8y2N+QDYo8tqrm3tc84/pBQ1jcqxMm1/EadBK\nqIsPEtiRiU6Y9rYil6xe1+MYErvlsjWD8OIFapo8/oLP+tRWOuhcWLyUpMLjJKF8\nRGWCyxZiP5jTM9Xa2WE1+sMkod1TxVzIGbnzw4goDbLutWy9aPGiqmwnxZQ4lrfO\ncPSbZrli1mXECC3/q3k/QYS4sI5CNb1OlCA7yOBgAQKBgQDlh4ilvYsmqDRTaDR9\nzSrk+3LVq2vAN6I74X3E5XxBD4tDcORcSZ+bwkt7rwLlSz0cKhXAnrosgLPTGszg\ncBDEZo7eLycOnjtKpY7CY4lFbjwMGUfLB0Gum8q1nlCedhmzxlVSg6m5wm8Yq229\nmi4i0s6KW9HKQqTCSa5Br2WmJQKBgQDDkP1qSiFGDbg3r0F8SmIsJUV/X3Cucg3+\nHf0sktYyQELtxVqC6vQiIOEzGEBpcR+dJjJ2hYlM6opjtcs7C6cmS88ul02ixmfI\ntfVX7xG1DNanTbxwYt8D8i0UBNfqZqWANnduxWtV2EBtXAOvUwW4YcuLYIsTUfBP\nlM4YsoEOwQKBgQCgV3v3/F821A4prgPtVeP/LkDcTvHox3SHzFAlugKBGLC6niSI\n682Z67L7ZhjpwROhlyy28Ksx5363nGM+7kpoSRTI1bu9FIBq9xixZwNAA2/jK83h\nYOJbbe2/ziaXa/0sfwKfr+ZjJBaj7y2sZAaSwR0TvmzhlIiwSPR4YmTqGQKBgA71\nhzzbIMJwCDhSMoskUXAZBcDhdwgQ91sJxjTjonjDi5sObob3G+eEZlV3NG4cVhO6\nOT/xpPf6NM29uSbyFD4MrHNe5XRfAs9Kg9LPGaakrcKsYo6iMXbmzmXqnO10HpK5\nF9ekSDqPyRXUZP/DNPvOlzg5EUpQCTa9JiqjdNXBAoGAAMpNUZnuoOxWeqxh1Yg4\nDS4ZytLCNwsQFz8KncgO4mTmvf+tJz+PHcl93fk6SEVsOiIF6dXc+/VLe0SZfsOs\nJmziv3pijaSg2oFZwApiiOxfcBsnoQOqexSa/CHhsKG6EF+MiSBf29bfDuqIe2GU\nY3QU+QjOgAFuDWlg95XmQV4=\n-----END PRIVATE KEY-----\n",
    "client_email": "firebase-adminsdk-fbsvc@gyeongjoapp.iam.gserviceaccount.com"
  };
}

// FCM V1 API로 직접 푸시 알림 발송
export async function sendFCMNotification(fcmToken, title, body, data = {}) {
  try {
    console.log('🔥 FCM V1 API 직접 호출 시작');
    
    // 서비스 계정으로 OAuth2 토큰 획득
    const jwtClient = new google.auth.JWT({
      email: serviceAccount.client_email,
      key: serviceAccount.private_key,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging'],
    });
    
    // 액세스 토큰 획득
    const accessToken = await jwtClient.getAccessToken();
    
    // FCM V1 API 메시지 구조
    const message = {
      message: {
        token: fcmToken,
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK'
        },
        android: {
          notification: {
            channel_id: 'contribution-notifications',
            default_sound: true,
            default_vibrate_timings: true
          },
          priority: 'high'
        }
      }
    };
    
    console.log('📤 FCM 메시지:', JSON.stringify(message, null, 2));
    
    // FCM V1 API 호출
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message)
      }
    );
    
    const result = await response.json();
    console.log('📨 FCM API 응답:', result);
    
    if (response.ok) {
      return { success: true, messageId: result.name };
    } else {
      throw new Error(`FCM API 오류: ${result.error?.message || 'Unknown error'}`);
    }
    
  } catch (error) {
    console.error('❌ FCM 발송 실패:', error);
    throw error;
  }
}