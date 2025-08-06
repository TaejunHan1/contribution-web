// lib/supabase.js - eventId 기반 이미지 처리 수정 버전
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL과 Anon Key가 환경변수에 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// 응답 형태 표준화
const createResponse = (success, data = null, error = null) => ({
  success,
  data,
  error,
});

// 에러 메시지 한국어화
const getKoreanErrorMessage = error => {
  const errorMessages = {
    'Row not found': '해당 경조사를 찾을 수 없습니다.',
    'Network error': '네트워크 연결을 확인해주세요.',
    'Invalid input': '입력 정보가 올바르지 않습니다.',
    'Permission denied': '접근 권한이 없습니다.',
    'Rate limit exceeded': '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
    'Service unavailable': '서비스가 일시적으로 이용할 수 없습니다.',
  };

  const postgresErrors = {
    23505: '이미 등록된 정보입니다.',
    23503: '참조된 데이터가 존재하지 않습니다.',
    23514: '입력 값이 올바르지 않습니다.',
    '42P01': '시스템 오류가 발생했습니다.',
  };

  if (error?.code && postgresErrors[error.code]) {
    return postgresErrors[error.code];
  }

  if (error?.message && errorMessages[error.message]) {
    return errorMessages[error.message];
  }

  return error?.message || '알 수 없는 오류가 발생했습니다.';
};

/**
 * 🔥 특정 eventId의 Storage 이미지들 가져오기 (웹용)
 */
const getEventStorageImages = async (userId, eventId) => {
  try {
    console.log('🔍 특정 이벤트 Storage 이미지 조회:', { userId, eventId });
    
    if (!userId || !eventId) {
      console.log('❌ userId 또는 eventId 없음');
      return [];
    }

    // eventId 폴더의 파일 목록 가져오기
    const { data: files, error } = await supabase.storage
      .from('event-images')
      .list(`${userId}/${eventId}`);

    if (error) {
      console.log('❌ Storage 파일 목록 조회 오류:', error.message);
      return [];
    }

    if (!files || files.length === 0) {
      console.log('📭 해당 이벤트의 Storage 이미지가 없음');
      return [];
    }

    console.log('✅ Storage 파일 발견:', files.length, '개');
    
    // 각 파일의 public URL 생성
    const filesWithUrls = files.map(file => {
      const fullPath = `${userId}/${eventId}/${file.name}`;
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(fullPath);
      
      // 파일명에서 카테고리 추정
      const category = determineImageCategory(file.name);
      
      return {
        id: file.name.split('.')[0], // 확장자 제거한 파일명을 ID로 사용
        category: category,
        categoryLabel: getCategoryLabel(category),
        publicUrl: publicUrl,
        name: file.name,
        fullPath: fullPath,
        eventId: eventId,
        originalFile: file
      };
    });

    console.log('✅ 처리된 이미지 목록:', {
      total: filesWithUrls.length,
      categories: filesWithUrls.reduce((acc, img) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
      }, {})
    });

    return filesWithUrls;
    
  } catch (error) {
    console.error('❌ getEventStorageImages error:', error);
    return [];
  }
};

/**
 * 🔥 파일명에서 이미지 카테고리 추정
 */
const determineImageCategory = (fileName) => {
  const lowerFileName = fileName.toLowerCase();
  
  if (lowerFileName.includes('main')) return 'main';
  if (lowerFileName.includes('gallery')) return 'gallery';
  if (lowerFileName.includes('groom')) return 'groom';
  if (lowerFileName.includes('bride')) return 'bride';
  
  // 기본값은 main
  return 'main';
};

/**
 * 🔥 카테고리 라벨 가져오기
 */
const getCategoryLabel = (category) => {
  const labels = {
    main: '메인 사진',
    gallery: '갤러리 사진',
    groom: '신랑 사진',
    bride: '신부 사진'
  };
  
  return labels[category] || '사진';
};

/**
 * 🔥 이미지 URL 처리 함수 - 임시 폴더도 지원하도록 개선
 */
const processImageUrls = (imageUrls, userId, eventId) => {
  console.log('🔍 이미지 URL 처리 시작:', { 
    imageUrlsCount: Array.isArray(imageUrls) ? imageUrls.length : 0,
    userId, 
    eventId 
  });
  
  if (!imageUrls || !Array.isArray(imageUrls)) {
    console.log('❌ 이미지 URL이 없거나 배열이 아님');
    return [];
  }

  return imageUrls.map((imageData, index) => {
    console.log(`🔍 이미지 ${index} 처리:`, imageData);
    
    // 이미지 데이터가 문자열인 경우 (JSON으로 파싱 필요할 수 있음)
    let processedImageData = imageData;
    if (typeof imageData === 'string') {
      try {
        processedImageData = JSON.parse(imageData);
      } catch (e) {
        console.log('🔍 JSON 파싱 실패, 문자열로 처리:', imageData);
        processedImageData = { uri: imageData };
      }
    }

    // 🔥 다양한 방법으로 이미지 URL 생성
    const candidates = [];

    // 1. 기존 publicUrl이 있는 경우 (최우선)
    if (processedImageData.publicUrl) {
      candidates.push(processedImageData.publicUrl);
    }

    // 2. storagePath가 있는 경우
    if (processedImageData.storagePath) {
      const { data: { publicUrl } } = supabase.storage
        .from('event-images')
        .getPublicUrl(processedImageData.storagePath);
      if (publicUrl) {
        candidates.push(publicUrl);
      }
    }

    // 3. eventId가 있고 해당 eventId 폴더에서 이미지 찾기
    if (userId && eventId && processedImageData.id) {
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      for (const ext of extensions) {
        const path = `${userId}/${eventId}/${processedImageData.id}.${ext}`;
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(path);
        if (publicUrl) {
          candidates.push(publicUrl);
        }
      }
    }

    // 4. 🔥 임시 eventId가 있는 경우 (temp_ 폴더에서 찾기)
    if (userId && processedImageData.eventId && processedImageData.eventId.startsWith('temp_')) {
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      const possibleFileNames = [
        processedImageData.id,
        `${processedImageData.category}_${processedImageData.id}`,
        processedImageData.category
      ];
      
      for (const baseName of possibleFileNames) {
        for (const ext of extensions) {
          const path = `${userId}/${processedImageData.eventId}/${baseName}.${ext}`;
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(path);
          if (publicUrl) {
            candidates.push(publicUrl);
            break; // 첫 번째 매치되는 것만 사용
          }
        }
        if (candidates.length > 1) break; // 이미 찾았으면 중단
      }
    }

    // 5. category와 timestamp를 포함한 파일명으로 찾기 (실제 eventId 폴더)
    if (userId && eventId && processedImageData.category) {
      const extensions = ['jpg', 'jpeg', 'png', 'webp'];
      const possibleFileNames = [
        `${processedImageData.category}_${processedImageData.id}`,
        processedImageData.category,
        `${processedImageData.category}_main`
      ];
      
      for (const baseName of possibleFileNames) {
        for (const ext of extensions) {
          const path = `${userId}/${eventId}/${baseName}.${ext}`;
          const { data: { publicUrl } } = supabase.storage
            .from('event-images')
            .getPublicUrl(path);
          if (publicUrl) {
            candidates.push(publicUrl);
          }
        }
      }
    }

    // 6. 🔥 Storage path 패턴 직접 매칭 (타임스탬프 포함)
    if (userId && processedImageData.storagePath) {
      // storagePath에서 파일명 추출해서 다른 폴더에서도 찾기
      const pathParts = processedImageData.storagePath.split('/');
      const fileName = pathParts[pathParts.length - 1];
      
      // 실제 eventId 폴더에서 같은 파일명 찾기
      if (eventId) {
        const newPath = `${userId}/${eventId}/${fileName}`;
        const { data: { publicUrl } } = supabase.storage
          .from('event-images')
          .getPublicUrl(newPath);
        if (publicUrl) {
          candidates.push(publicUrl);
        }
      }
    }

    // 최종 결과
    const result = {
      ...processedImageData,
      candidates,
      primaryUrl: candidates[0] || null,
      originalData: imageData,
      eventId: eventId
    };

    console.log(`✅ 이미지 ${index} 처리 완료:`, {
      id: result.id,
      category: result.category,
      candidatesCount: candidates.length,
      primaryUrl: result.primaryUrl,
      hasValidUrl: !!result.primaryUrl,
      tempEventId: processedImageData.eventId || 'none'
    });

    return result;
  });
};

/**
 * 🔥 경조사 상세 정보 조회 - eventId 기반 이미지 처리 개선
 */
export const getEventDetails = async eventId => {
  try {
    console.log('🔍 getEventDetails 시작:', eventId);
    
    if (!eventId || typeof eventId !== 'string') {
      return createResponse(false, null, '올바른 경조사 ID를 입력해주세요.');
    }

    // 🔥 모든 필드를 포함해서 조회
    const { data, error } = await supabase
      .from('events')
      .select(`
        id,
        event_name,
        event_type,
        event_date,
        ceremony_time,
        location,
        detailed_address,
        funeral_home,
        primary_contact,
        secondary_contact,
        family_relations,
        preset_amounts,
        allow_messages,
        message_placeholder,
        status,
        created_at,
        user_id,
        main_person_name,
        groom_name,
        bride_name,
        deceased_age,
        death_date,
        deceased_gender,
        burial_date,
        burial_time,
        burial_location,
        custom_message,
        template_style,
        image_urls,
        additional_info
      `)
      .eq('id', eventId)
      .eq('status', 'active')
      .single();

    if (error) {
      console.error('❌ Event fetch error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    if (!data) {
      return createResponse(false, null, '경조사를 찾을 수 없습니다.');
    }

    console.log('🔍 DB에서 가져온 원본 데이터:', {
      id: data.id,
      event_name: data.event_name,
      event_type: data.event_type,
      user_id: data.user_id,
      image_urls_type: typeof data.image_urls,
      image_urls_length: Array.isArray(data.image_urls) ? data.image_urls.length : 'not array',
    });

    // 🔥 이미지 데이터 처리 - 우선 순위별로 시도
    let processedImageUrls = [];
    
    // 1순위: Storage에서 해당 eventId 이미지 직접 조회 (가장 확실한 방법)
    if (data.user_id) {
      console.log('🔍 1순위: Storage에서 eventId 기반 이미지 조회 시도...');
      const storageImages = await getEventStorageImages(data.user_id, eventId);
      
      if (storageImages.length > 0) {
        console.log('✅ Storage에서 이미지 발견:', storageImages.length, '개');
        processedImageUrls = storageImages;
      }
    }
    
    // 2순위: DB의 image_urls 필드에서 이미지 가져오기 (Storage에서 못 찾은 경우만)
    if (processedImageUrls.length === 0 && data.image_urls && Array.isArray(data.image_urls)) {
      console.log('🔍 2순위: DB image_urls 필드에서 이미지 처리...');
      processedImageUrls = processImageUrls(data.image_urls, data.user_id, eventId);
    }
    
    // 3순위: additional_info에서 이미지 가져오기 (앱에서 업로드한 경우)
    if (processedImageUrls.length === 0 && data.additional_info?.categorized_images) {
      console.log('🔍 3순위: additional_info에서 이미지 찾기...');
      const categorizedImages = data.additional_info.categorized_images;
      
      // categorized_images에서 모든 이미지 수집
      const allImages = [];
      
      if (categorizedImages.main && Array.isArray(categorizedImages.main)) {
        allImages.push(...categorizedImages.main.map(img => ({ ...img, category: 'main' })));
      }
      
      if (categorizedImages.gallery && Array.isArray(categorizedImages.gallery)) {
        allImages.push(...categorizedImages.gallery.map(img => ({ ...img, category: 'gallery' })));
      }
      
      if (categorizedImages.groom && Array.isArray(categorizedImages.groom)) {
        allImages.push(...categorizedImages.groom.map(img => ({ ...img, category: 'groom' })));
      }
      
      if (categorizedImages.bride && Array.isArray(categorizedImages.bride)) {
        allImages.push(...categorizedImages.bride.map(img => ({ ...img, category: 'bride' })));
      }
      
      if (categorizedImages.all && Array.isArray(categorizedImages.all)) {
        allImages.push(...categorizedImages.all.map(img => ({ ...img, category: img.category || 'main' })));
      }

      console.log('🔍 additional_info에서 수집된 이미지들:', allImages.length, '개');
      
      if (allImages.length > 0) {
        processedImageUrls = processImageUrls(allImages, data.user_id, eventId);
      }
    }

    // 날짜가 과거인지 확인 (부고는 예외)
    if (data.event_type !== 'funeral') {
      const eventDate = new Date(data.event_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        return createResponse(false, null, '종료된 경조사입니다.');
      }
    }

    // 🔥 최종 데이터 구성
    const finalData = {
      ...data,
      processedImages: processedImageUrls,
      hasValidImages: processedImageUrls.some(img => img.primaryUrl || img.publicUrl),
      originalImageUrls: data.image_urls
    };

    console.log('✅ getEventDetails 완료:', {
      id: finalData.id,
      event_name: finalData.event_name,
      processedImagesCount: processedImageUrls.length,
      hasValidImages: finalData.hasValidImages,
      imageCategories: processedImageUrls.reduce((acc, img) => {
        acc[img.category] = (acc[img.category] || 0) + 1;
        return acc;
      }, {})
    });

    return createResponse(true, finalData);
    
  } catch (error) {
    console.error('❌ getEventDetails error:', error);
    return createResponse(
      false,
      null,
      '경조사 정보를 불러오는 중 오류가 발생했습니다.'
    );
  }
};

/**
 * 🔥 디버깅용: 특정 eventId의 Storage 파일 목록 확인 (개선된 버전)
 */
export const debugStorageFiles = async (userId, eventId = null) => {
  try {
    console.log('🔍 Storage 파일 목록 확인:', { userId, eventId });
    
    let files = [];
    
    if (eventId) {
      // 특정 eventId 폴더의 파일들만 조회
      const { data: eventFiles, error } = await supabase.storage
        .from('event-images')
        .list(`${userId}/${eventId}`);

      if (error) {
        console.error('❌ Storage 파일 목록 조회 오류:', error);
        return { success: false, error: error.message };
      }

      if (eventFiles && eventFiles.length > 0) {
        files = eventFiles.map(file => ({
          ...file,
          publicUrl: supabase.storage
            .from('event-images')
            .getPublicUrl(`${userId}/${eventId}/${file.name}`).data.publicUrl,
          fullPath: `${userId}/${eventId}/${file.name}`,
          eventId: eventId,
          category: determineImageCategory(file.name)
        }));
      }
    } else {
      // 전체 사용자 폴더 조회 (호환성을 위해 유지)
      const { data: allFiles, error } = await supabase.storage
        .from('event-images')
        .list(userId);

      if (error) {
        console.error('❌ Storage 파일 목록 조회 오류:', error);
        return { success: false, error: error.message };
      }

      files = allFiles?.map(file => ({
        ...file,
        publicUrl: supabase.storage
          .from('event-images')
          .getPublicUrl(`${userId}/${file.name}`).data.publicUrl,
        fullPath: `${userId}/${file.name}`,
        category: determineImageCategory(file.name)
      })) || [];
    }

    console.log('✅ Storage 파일 목록:', {
      totalFiles: files.length,
      eventId: eventId || 'all',
      categories: files.reduce((acc, file) => {
        acc[file.category] = (acc[file.category] || 0) + 1;
        return acc;
      }, {})
    });

    return {
      success: true,
      data: {
        files: files,
        count: files.length,
        eventId: eventId
      }
    };
    
  } catch (error) {
    console.error('❌ debugStorageFiles error:', error);
    return { success: false, error: error.message };
  }
};

// 기존 함수들은 그대로 유지...
export const addContribution = async contributionData => {
  try {
    const {
      event_id,
      contributor_name,
      amount,
      relation_to = null,
      notes = null,
    } = contributionData;

    if (!event_id || !contributor_name || !amount) {
      return createResponse(false, null, '필수 정보를 모두 입력해주세요.');
    }

    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 1000) {
      return createResponse(false, null, '부조금은 1,000원 이상 입력해주세요.');
    }

    if (contributor_name.length > 50) {
      return createResponse(false, null, '성함은 50자 이내로 입력해주세요.');
    }

    if (notes && notes.length > 500) {
      return createResponse(false, null, '메시지는 500자 이내로 입력해주세요.');
    }

    const eventCheck = await getEventDetails(event_id);
    if (!eventCheck.success) {
      return eventCheck;
    }

    const { data, error } = await supabase
      .from('contributions')
      .insert([
        {
          event_id,
          contributor_name: contributor_name.trim(),
          amount: numAmount,
          relation_to: relation_to?.trim() || null,
          notes: notes?.trim() || null,
          is_confirmed: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Contribution insert error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    return createResponse(true, data);
  } catch (error) {
    console.error('addContribution error:', error);
    return createResponse(false, null, '부조 등록 중 오류가 발생했습니다.');
  }
};

export const addEventMessage = async messageData => {
  try {
    const {
      event_id,
      sender_name,
      message,
      message_type = 'congratulation',
      is_anonymous = false,
    } = messageData;

    if (!event_id || !sender_name || !message) {
      return createResponse(false, null, '필수 정보를 모두 입력해주세요.');
    }

    if (message.length > 500) {
      return createResponse(false, null, '메시지는 500자 이내로 입력해주세요.');
    }

    if (sender_name.length > 50) {
      return createResponse(false, null, '성함은 50자 이내로 입력해주세요.');
    }

    const { data, error } = await supabase
      .from('event_messages')
      .insert([
        {
          event_id,
          sender_name: sender_name.trim(),
          message: message.trim(),
          message_type,
          is_anonymous,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Message insert error:', error);
      return createResponse(false, null, getKoreanErrorMessage(error));
    }

    return createResponse(true, data);
  } catch (error) {
    console.error('addEventMessage error:', error);
    return createResponse(false, null, '메시지 등록 중 오류가 발생했습니다.');
  }
};

// 유틸리티 함수들
export const formatAmount = amount => {
  if (!amount || isNaN(amount)) return '0원';

  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = date => {
  if (!date) return '';

  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '';

    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    }).format(dateObj);
  } catch (error) {
    console.error('Date formatting error:', error);
    return '';
  }
};

export const formatTime = time => {
  if (!time) return '';

  try {
    const [hours, minutes] = time.split(':').map(Number);
    if (isNaN(hours) || isNaN(minutes)) return time;

    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    return new Intl.DateTimeFormat('ko-KR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  } catch (error) {
    console.error('Time formatting error:', error);
    return time;
  }
};

export default supabase;