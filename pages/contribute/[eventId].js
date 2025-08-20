// pages/contribute/[eventId].js - 통합 방명록 시스템
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import {
  getEventDetails,
  addGuestBookEntry,
  getRelationTypes,
  formatAmount,
  formatDate,
  formatTime,
  debugStorageFiles,
  supabase,
} from '../../lib/supabase';

export default function ContributePage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [imageLoadStates, setImageLoadStates] = useState({});
  const [eventStorageImages, setEventStorageImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [relationTypes, setRelationTypes] = useState([]);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const [formData, setFormData] = useState({
    guest_name: '',
    guest_phone: '',
    relation_category: '',
    relation_detail: '',
    amount: '',
    customAmount: '',
    message: '', // 개인 메시지 (방명록용)
    attending: true,
    companion_count: 0,
    useCustomAmount: false,
    sendMessage: false,
    // 공개 축하 메시지용
    publicMessage: '',
    sendPublicMessage: false,
  });

  // 웨딩 메시지 모음 (20개) - 줄나눔이 포함된 긴 문구들
  const weddingMessages = [
    "저희 두 사람이 사랑으로 하나 되어\n새로운 출발을 하려 합니다.\n바쁘시더라도 오셔서 축복해 주시면\n더없는 기쁨이 되겠습니다.",
    "평생을 함께할 반려자를 만나\n새로운 시작을 하게 되었습니다.\n소중한 분들의 축복 속에서\n아름다운 가정을 이루어 나가겠습니다.",
    "서로 사랑하며 믿음으로 하나가 되어\n행복한 가정을 꾸리려 합니다.\n귀한 걸음 하시어 저희의 출발을\n축복해 주시기 바랍니다.",
    "두 마음이 하나가 되어\n사랑과 신뢰로 평생을 약속하게 되었습니다.\n여러분의 따뜻한 축복과 격려를\n부탁드립니다.",
    "진실한 사랑으로 만나\n서로를 아끼고 존중하며 살아가겠습니다.\n바쁘신 중에도 참석하시어\n축복해 주시면 감사하겠습니다.",
    "하나님의 은혜 속에서 만난\n소중한 인연으로 결혼하게 되었습니다.\n저희의 새로운 출발을 지켜봐 주시고\n축복해 주세요.",
    "사랑하는 사람과 함께\n인생의 새로운 여정을 시작하려 합니다.\n많은 분들의 관심과 축복 속에서\n행복한 가정을 만들어 가겠습니다.",
    "두 가족이 하나가 되어\n화목하고 따뜻한 가정을 이루려 합니다.\n소중한 시간 내시어 저희의 결혼식에\n참석해 주시기 바랍니다.",
    "서로를 이해하고 배려하며\n평생을 함께 살아가겠습니다.\n여러분의 축복과 사랑이\n저희에게 큰 힘이 될 것입니다.",
    "진정한 사랑을 바탕으로\n서로의 꿈을 응원하며 살아가겠습니다.\n귀한 발걸음으로 저희의 행복한 순간을\n함께해 주세요.",
    "따뜻한 사랑으로 만나\n평생의 동반자가 되기로 약속했습니다.\n바쁘신 가운데서도 시간을 내어\n축복해 주시면 감사하겠습니다.",
    "두 손을 맞잡고 어려움과 기쁨을\n함께 나누며 살아가겠습니다.\n많은 분들의 사랑과 관심 속에서\n아름다운 가정을 꾸려나가겠습니다.",
    "서로의 부족함을 채워주며\n하나가 되어 행복을 만들어 가겠습니다.\n소중한 분들과 함께\n이 기쁨을 나누고 싶습니다.",
    "사랑과 믿음을 바탕으로\n서로를 존중하며 평생을 약속합니다.\n여러분의 따뜻한 마음과 축복이\n저희에게 큰 선물이 될 것입니다.",
    "하나님 안에서 만난 귀한 인연으로\n결혼의 예식을 갖습니다.\n바쁘신 중에도 참석하시어\n저희의 출발을 축복해 주시기 바랍니다.",
    "평생을 함께할 동반자로서\n서로를 믿고 의지하며 살겠습니다.\n귀중한 시간을 내어 저희의 결혼을\n축하해 주시면 감사하겠습니다.",
    "사랑의 결실로 맺어진 인연을\n소중히 여기며 새 출발을 다짐합니다.\n많은 분들의 격려와 축복 속에서\n행복한 가정을 이루겠습니다.",
    "두 마음이 만나\n하나의 사랑으로 새로운 가족이 됩니다.\n소중한 분들의 축복과 사랑으로\n더욱 행복한 결혼생활을 시작하겠습니다.",
    "서로를 아끼고 사랑하며\n화목한 가정의 터전을 마련하겠습니다.\n바쁘신 가운데서도 귀한 걸음 해주시어\n축복해 주시기 바랍니다.",
    "소중한 인연으로 만나\n평생을 약속하며 결혼하게 되었습니다.\n여러분의 따뜻한 마음과 축복 속에서\n아름다운 사랑을 키워나가겠습니다."
  ];

  // 장례식 메시지 모음 (20개) - 줄나눔이 포함된 긴 문구들
  const funeralMessages = [
    "그동안 보여주신 따뜻한 관심과 사랑에\n깊이 감사드리며, 삼가 고인의 명복을 빕니다.\n하늘나라에서 편안히 쉬시기를\n기원합니다.",
    "고인께서 생전에 보여주신\n사랑과 가르침을 마음 깊이 새기며\n살아가겠습니다. 영원한 안식 속에서\n평안하시기를 빕니다.",
    "고인의 거룩한 뜻을 기리며\n삼가 명복을 빕니다.\n유족 여러분께 위로의 말씀을 전하며,\n하늘에서 영면하시길 기원합니다.",
    "그동안 고인께서 보여주신\n덕과 은혜를 잊지 않고 기억하겠습니다.\n하나님 품에서 영원한 평안을\n누리시기를 간절히 빕니다.",
    "고인을 그리워하며\n삼가 조의를 표합니다.\n생전의 따뜻한 모습만을 기억하며,\n천국에서 모든 고통 없이 평안하시길 바랍니다.",
    "고인의 숭고한 뜻과 사랑을\n계승하여 살아가겠습니다.\n영혼이 하나님께로 돌아가\n영원한 안식을 누리시기를 기원합니다.",
    "하늘나라에서 영원한 평안을\n얻으시기를 빕니다.\n고인께서 보여주신 좋은 모습들을\n마음속 깊이 간직하겠습니다.",
    "고인을 추모하며\n깊은 애도의 마음을 전합니다.\n생전에 받은 은혜와 사랑을 잊지 않고\n감사한 마음으로 살아가겠습니다.",
    "삼가 고인의 영면을 빌며\n명복을 빕니다.\n유족분들께 위로와 평안이 함께하시기를\n바라며, 고인의 덕을 기리겠습니다.",
    "고인께서 하늘에서\n평화로운 곳에서 쉬시길 기원합니다.\n생전의 따뜻한 마음과 사랑을\n영원히 기억하며 살아가겠습니다.",
    "영원한 안식에서\n편안하시기를 빕니다.\n고인께서 남겨주신 사랑과 가르침을\n소중히 여기며 감사한 마음으로 살겠습니다.",
    "하늘의 평화로운 곳에서\n영원히 쉬시기를 기원합니다.\n고인을 기리며 삼가 조의를 표하며,\n명복을 빕니다.",
    "천상에서 영원한 복락을\n누리시길 바랍니다.\n고인께서 보여주신 사랑과 온정을\n마음 깊이 새기며 살아가겠습니다.",
    "고인의 따뜻한 인품과 사랑을\n영원히 잊지 않겠습니다.\n하나님 품 안에서 편안한 안식을\n누리시기를 간절히 기원합니다.",
    "생전에 받은 고인의 은혜에\n감사드리며 삼가 명복을 빕니다.\n영혼이 평안한 곳에서\n영원한 쉼을 얻으시기를 빕니다.",
    "고인을 그리워하며\n진심으로 애도의 뜻을 전합니다.\n하늘나라에서 모든 아픔이 사라지고\n평안하시기를 기원합니다.",
    "삼가 고인의 명복을 빌며\n깊은 조의를 표합니다.\n생전의 좋은 모습만을 기억하며,\n영원한 안식을 기원합니다.",
    "고인께서 남겨주신 사랑과 추억을\n소중히 간직하겠습니다.\n하늘에서 영원한 평안 속에\n쉬시기를 빕니다.",
    "고인의 덕과 사랑을 기리며\n삼가 조의를 표합니다.\n영혼이 주님 곁에서\n영원한 안식을 누리시기를 기원합니다.",
    "하늘나라에서 고인께서\n편안히 쉬시기를 빕니다.\n생전에 보여주신 따뜻한 마음과 사랑을\n평생 기억하며 살겠습니다."
  ];

  const loadEventData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await getEventDetails(eventId);

      if (result.success) {
        const eventData = result.data;
        
        // Storage에서 직접 가져온 이미지들 설정
        if (eventData.processedImages && eventData.processedImages.length > 0) {
          setEventStorageImages(eventData.processedImages);
          setEvent({
            ...eventData,
            matchedStorageFiles: eventData.processedImages,
            hasValidImages: eventData.hasValidImages
          });
        } else {
          if (eventData.user_id) {
            const debugResult = await debugStorageFiles(eventData.user_id, eventId);
            if (debugResult.success && debugResult.data.files && debugResult.data.files.length > 0) {
              setEventStorageImages(debugResult.data.files);
              setEvent({
                ...eventData,
                matchedStorageFiles: debugResult.data.files,
                hasValidImages: true
              });
            } else {
              setEvent({
                ...eventData,
                matchedStorageFiles: [],
                hasValidImages: false
              });
            }
          } else {
            setEvent(eventData);
          }
        }
        
        // 관계 유형 로드
        const relationsResult = await getRelationTypes(eventData.event_type);
        if (relationsResult.success) {
          setRelationTypes(relationsResult.data);
          // 기본 관계 설정
          if (eventData.event_type === 'wedding') {
            setFormData(prev => ({ ...prev, relation_category: 'groom_side' }));
          } else if (eventData.event_type === 'funeral') {
            setFormData(prev => ({ ...prev, relation_category: 'acquaintance' }));
          }
        }
      } else {
        toast.error(result.error);
        setTimeout(() => {
          router.push('/error?message=' + encodeURIComponent(result.error));
        }, 3000);
      }
    } catch (error) {
      console.error('Event loading error:', error);
      toast.error('경조사 정보를 불러올 수 없습니다.');
    } finally {
      setLoading(false);
    }
  }, [eventId, router]);

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId, loadEventData]);

  // 이미지 자동 슬라이드 (3초마다)
  useEffect(() => {
    if (eventStorageImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % eventStorageImages.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [eventStorageImages.length]);

  // 메시지 인덱스 초기화 (새로고침할 때만 변경)
  useEffect(() => {
    if (event) {
      const messages = event.event_type === 'wedding' ? weddingMessages : funeralMessages;
      // 새로고침할 때만 랜덤 메시지 선택
      const randomIndex = Math.floor(Math.random() * messages.length);
      setCurrentMessageIndex(randomIndex);
    }
  }, [event]); // event가 변경될 때만 실행

  // 이미지 인덱스 유효성 검사
  useEffect(() => {
    if (eventStorageImages.length > 0 && currentImageIndex >= eventStorageImages.length) {
      setCurrentImageIndex(0);
    }
  }, [eventStorageImages.length, currentImageIndex]);

  const handleImageLoad = (imageId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: 'loaded'
    }));
  };

  const handleImageError = (imageId) => {
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: 'error'
    }));
  };

  const handleAmountSelect = (amount) => {
    setFormData({
      ...formData,
      amount: amount.toString(),
      customAmount: '',
      useCustomAmount: false,
    });
  };

  const handleCustomAmountChange = (value) => {
    const numbers = value.replace(/[^\d]/g, '');
    setFormData({
      ...formData,
      customAmount: numbers,
      amount: '',
      useCustomAmount: true,
    });
  };

  const handleRelationChange = (category, detail) => {
    setFormData({
      ...formData,
      relation_category: category,
      relation_detail: detail,
    });
  };

  const getSelectedAmount = () => {
    if (formData.useCustomAmount) {
      return parseInt(formData.customAmount) || 0;
    }
    return parseInt(formData.amount) || 0;
  };

  const validateForm = () => {
    if (!formData.guest_name.trim()) return false;
    const amount = getSelectedAmount();
    if (!amount || amount < 1000) return false;
    if (!formData.relation_category) return false;
    return true;
  };

  const validateAndShowErrors = () => {
    if (!formData.guest_name.trim()) {
      toast.error('성함을 입력해주세요.');
      return false;
    }

    const amount = getSelectedAmount();
    if (!amount || amount < 1000) {
      toast.error(`${event.event_type === 'funeral' ? '조의금' : '축의금'}을 1,000원 이상 입력해주세요.`);
      return false;
    }

    if (!formData.relation_category) {
      toast.error('관계를 선택해주세요.');
      return false;
    }

    if (formData.sendMessage && !formData.message.trim()) {
      toast.error('개인 메시지를 입력해주세요.');
      return false;
    }

    if (formData.sendPublicMessage && !formData.publicMessage.trim()) {
      toast.error('축하 메시지를 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAndShowErrors()) return;

    setSubmitting(true);
    const toastId = toast.loading('방명록을 등록하고 있습니다...');

    try {
      // 1. 방명록 등록 (RLS 우회를 위해 서비스 키 필요)
      const guestBookData = {
        event_id: eventId,
        guest_name: formData.guest_name.trim(),
        guest_phone: formData.guest_phone.trim() || null,
        relation_category: formData.relation_category,
        relation_detail: formData.relation_detail,
        amount: getSelectedAmount(),
        message: formData.sendMessage ? formData.message.trim() : null,
        message_type: event.event_type === 'funeral' ? 'condolence' : 'congratulation',
        attending: formData.attending,
        companion_count: formData.companion_count || 0,
        is_public: true,
        additional_info: {
          user_agent: navigator.userAgent,
          timestamp: new Date().toISOString()
        }
      };

      // RLS 우회를 위한 서비스 함수 호출 (백엔드에서 처리)
      const response = await fetch('/api/guest-book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(guestBookData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '방명록 등록에 실패했습니다.');
      }

      // 2. 공개 축하 메시지 등록 (선택사항)
      if (formData.sendPublicMessage && formData.publicMessage.trim()) {
        const publicMessageResponse = await fetch('/api/public-message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_id: eventId,
            sender_name: formData.guest_name.trim(),
            message: formData.publicMessage.trim(),
            message_type: event.event_type === 'funeral' ? 'condolence' : 'congratulation',
            is_anonymous: false
          })
        });

        if (!publicMessageResponse.ok) {
          console.warn('공개 메시지 등록에 실패했습니다. 방명록은 정상 등록되었습니다.');
        }
      }

      toast.success('방명록 작성이 완료되었습니다!', { id: toastId });
      setStep(2);

    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || '방명록 등록에 실패했습니다.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // 꽃/잎사귀 장식 컴포넌트
  const FlowerDecoration = ({ className, color = "#F4E6B7" }) => (
    <div className={`absolute ${className}`} style={{ position: 'absolute' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill={color} opacity="0.8"/>
        <ellipse cx="12" cy="8" rx="2" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="16" cy="12" rx="3" ry="2" fill={color} opacity="0.6"/>
        <ellipse cx="12" cy="16" rx="2" ry="3" fill={color} opacity="0.6"/>
        <ellipse cx="8" cy="12" rx="3" ry="2" fill={color} opacity="0.6"/>
      </svg>
    </div>
  );

  const LeafDecoration = ({ className, color = "#B8C5A6" }) => (
    <div className={`absolute ${className}`} style={{ position: 'absolute' }}>
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path d="M2 8C2 4 8 2 16 8C24 2 30 4 30 8C30 12 24 14 16 8C8 14 2 12 2 8Z" fill={color} opacity="0.7"/>
      </svg>
    </div>
  );

  // 완전히 수정된 이미지 슬라이더 - 진짜 페이드 효과
  const ImageSlider = () => {
    const images = eventStorageImages || [];
    
    if (images.length === 0) {
      return (
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '300px',
          margin: '0 auto 24px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          border: '1px solid #E2E8F0',
          position: 'relative'
        }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>
            {event?.event_type === 'wedding' ? '💍' : event?.event_type === 'funeral' ? '🕊️' : '🎉'}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: '#64748B', 
            fontWeight: '500'
          }}>
            사진
          </div>
        </div>
      );
    }

    return (
      <div style={{ marginBottom: '24px' }}>
        {/* 완전히 새로운 방식의 이미지 컨테이너 */}
        <div style={{
          width: '100%',
          maxWidth: '300px',
          height: '300px',
          margin: '0 auto',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
          background: '#000',
          border: '1px solid #E2E8F0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          {/* 모든 이미지를 미리 로드하고 겹쳐놓기 */}
          {images.map((image, index) => {
            const imgUrl = image?.primaryUrl || image?.publicUrl;
            if (!imgUrl) return null;
            
            return (
              <div
                key={`image-${index}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: index === currentImageIndex ? 1 : 0,
                  transition: 'opacity 2s cubic-bezier(0.4, 0, 0.2, 1)',
                  zIndex: index === currentImageIndex ? 2 : 1,
                  backgroundColor: '#f0f0f0'
                }}
              >
                <img
                  src={imgUrl}
                  alt={event?.event_type === 'funeral' 
                    ? `고 ${event?.main_person_name || '故人'}` 
                    : event?.event_name || '사진'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block'
                  }}
                  onLoad={() => handleImageLoad(image?.id || index)}
                  onError={() => handleImageError(image?.id || index)}
                />
              </div>
            );
          })}
          
          {/* 이미지 카운터 (여러 장일 때만) */}
          {images.length > 1 && (
            <div style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              zIndex: 10
            }}>
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* 인디케이터 (2장 이상일 때만 표시) */}
        {images.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '16px',
            gap: '8px'
          }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentImageIndex ? '#374151' : '#CBD5E1',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9FAFB',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid #E5E7EB',
            borderTop: '3px solid #374151',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <p style={{ fontSize: '16px', fontWeight: '500', color: '#6B7280' }}>
            경조사 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#F9FAFB',
        padding: '0 24px',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxWidth: '400px',
          width: '100%',
          border: '1px solid #F3F4F6'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>😕</div>
          <h1 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px', color: '#111827' }}>
            경조사를 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px', lineHeight: '1.5' }}>
            유효하지 않은 링크이거나<br />만료된 경조사입니다.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              height: '48px',
              background: '#374151',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <>
        <Head>
          <title>{event.event_name} - 방명록 작성 완료</title>
        </Head>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#F9FAFB',
          padding: '0 24px',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif"
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            width: '100%',
            border: '1px solid #F3F4F6',
            position: 'relative'
          }}>
            {/* 장식 요소 */}
            <FlowerDecoration className="top-4 right-6" />
            <LeafDecoration className="bottom-4 left-6" />
            
            <div style={{
              width: '80px',
              height: '80px',
              background: '#10B981',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              fontSize: '32px',
              color: 'white'
            }}>
              ✓
            </div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: '700', 
              marginBottom: '12px', 
              color: '#111827',
              letterSpacing: '-0.3px'
            }}>
              방명록 작성 완료!
            </h1>
            <p style={{ 
              fontSize: '16px', 
              color: '#6B7280', 
              marginBottom: '24px', 
              lineHeight: '1.5' 
            }}>
              <strong style={{ color: '#374151', fontWeight: '600' }}>
                {formData.guest_name}
              </strong>님의 소중한 마음이<br />잘 전달되었습니다
            </p>

            <div style={{
              background: '#F9FAFB',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px',
              border: '1px solid #F3F4F6'
            }}>
              <div style={{ 
                fontSize: '12px', 
                color: '#6B7280', 
                marginBottom: '8px', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                {event.event_type === 'funeral' ? '조의금' : '축의금'}
              </div>
              <div style={{ 
                fontSize: '28px', 
                fontWeight: '700', 
                color: '#111827'
              }}>
                {formatAmount(getSelectedAmount())}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => window.close()}
                style={{
                  width: '100%',
                  height: '48px',
                  background: '#374151',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
              >
                닫기
              </button>
              <button
                onClick={() => setStep(1)}
                style={{
                  width: '100%',
                  height: '40px',
                  background: 'transparent',
                  color: '#6B7280',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                다시 작성하기
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const currentMessages = event.event_type === 'wedding' ? weddingMessages : funeralMessages;
  const currentMessage = currentMessages[currentMessageIndex];

  return (
    <>
      <Head>
        <title>{event.event_name} - 방명록 작성</title>
        <meta name="description" content={`${event.event_name} 방명록을 작성해주세요`} />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: '#F9FAFB',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        paddingBottom: '100px'
      }}>
        {/* 메인 헤더 */}
        <div style={{
          background: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 헤더 사진 섹션 */}
          <div style={{
            position: 'relative',
            padding: '32px 24px 0'
          }}>
            {/* 장식 요소들 */}
            <FlowerDecoration className="top-8 left-8" />
            <LeafDecoration className="top-12 right-12" />
            <FlowerDecoration className="bottom-16 right-8" color="#E8B4B8" />
            <LeafDecoration className="bottom-8 left-12" />
            
            <div style={{ maxWidth: '400px', margin: '0 auto', position: 'relative' }}>
              {/* 대형 이미지 */}
              <ImageSlider />
              
              {/* 메인 제목 */}
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ 
                    color: '#6B7280', 
                    fontSize: '12px', 
                    marginBottom: '8px', 
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    {event.event_type === 'wedding' ? 'WEDDING INVITATION' : 
                     event.event_type === 'funeral' ? 'MEMORIAL SERVICE' : 'CELEBRATION'}
                  </p>
                  <h1 style={{ 
                    fontSize: '28px', 
                    fontWeight: '600', 
                    color: '#111827', 
                    marginBottom: '8px',
                    letterSpacing: '-0.5px'
                  }}>
                    {event.main_person_name || event.event_name}
                  </h1>
                  {event.event_type === 'funeral' && event.deceased_age && (
                    <p style={{ 
                      fontSize: '16px', 
                      color: '#6B7280', 
                      fontWeight: '500'
                    }}>
                      향년 {event.deceased_age}세
                    </p>
                  )}
                </div>
                
                {/* 동적 메시지 - 줄바꿈 처리 */}
                <div style={{
                  color: '#6B7280',
                  fontSize: '14px',
                  lineHeight: '1.8',
                  fontWeight: '400',
                  minHeight: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '0 16px'
                }}>
                  <div>
                    {currentMessage.split('\n').map((line, index) => (
                      <div key={index} style={{ marginBottom: index < currentMessage.split('\n').length - 1 ? '6px' : 0 }}>
                        {line}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 예식 정보 */}
              <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '8px'
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#6B7280" strokeWidth="2" fill="none"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="#6B7280" strokeWidth="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="#6B7280" strokeWidth="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="#6B7280" strokeWidth="2"/>
                  </svg>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    {formatDate(event.event_date)}
                    {event.ceremony_time && (
                      <span style={{ marginLeft: '16px', opacity: 0.8 }}>
                        {formatTime(event.ceremony_time)}
                      </span>
                    )}
                  </span>
                </div>
                
                {event.location && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ marginRight: '8px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#6B7280" strokeWidth="2" fill="none"/>
                      <circle cx="12" cy="10" r="3" stroke="#6B7280" strokeWidth="2" fill="none"/>
                    </svg>
                    <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                      <div>{event.location}</div>
                      {event.detailed_address && (
                        <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                          {event.detailed_address}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 연락처 정보 */}
          {(event.primary_contact || event.secondary_contact) && (
            <div style={{ 
              background: '#F9FAFB',
              margin: '0 24px',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '32px',
              border: '1px solid #F3F4F6'
            }}>
              <h3 style={{
                fontSize: '14px',
                color: '#374151',
                marginBottom: '16px',
                fontWeight: '600',
                textAlign: 'center',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                연락처
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {event.primary_contact && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                      {event.event_type === 'wedding' ? '신랑측' : '상주'}
                    </span>
                    <a
                      href={`tel:${event.primary_contact}`}
                      style={{
                        color: '#374151',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      {event.primary_contact}
                    </a>
                  </div>
                )}
                {event.secondary_contact && (
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '14px', color: '#6B7280', fontWeight: '500' }}>
                      {event.event_type === 'wedding' ? '신부측' : '가족'}
                    </span>
                    <a
                      href={`tel:${event.secondary_contact}`}
                      style={{
                        color: '#374151',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px'
                      }}
                    >
                      {event.secondary_contact}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 방명록 작성 폼 */}
        <div style={{ padding: '0 24px' }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            
            {/* 방명록 작성 헤더 */}
            <div style={{
              background: '#374151',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              textAlign: 'center',
              color: 'white',
              position: 'relative'
            }}>
              <FlowerDecoration className="top-3 right-4" color="#93C5FD" />
              <h2 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 8px 0',
                letterSpacing: '-0.2px'
              }}>
                📝 방명록 작성
              </h2>
              <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
                참석 확인 및 {event.event_type === 'funeral' ? '조의금' : '축의금'} 등록
              </p>
            </div>

            {/* 성함 입력 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #F3F4F6'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '12px',
                fontWeight: '500'
              }}>
                성함
              </label>
              <input
                type="text"
                value={formData.guest_name}
                onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
                placeholder="성함을 입력해주세요"
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '400',
                  background: '#FAFBFC',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={e => e.target.style.borderColor = '#6366F1'}
                onBlur={e => e.target.style.borderColor = '#E5E7EB'}
              />
            </div>

            {/* 관계 선택 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #F3F4F6'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '16px',
                fontWeight: '500'
              }}>
                관계
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px'
              }}>
                {relationTypes
                  .filter(rt => rt.event_type === event.event_type)
                  .slice(0, 8)
                  .map((relation) => (
                  <button
                    key={`${relation.category}-${relation.detail}`}
                    type="button"
                    onClick={() => handleRelationChange(relation.category, relation.detail)}
                    style={{
                      padding: '12px 16px',
                      border: '1px solid',
                      borderColor: formData.relation_category === relation.category && formData.relation_detail === relation.detail 
                        ? '#374151' : '#E5E7EB',
                      borderRadius: '8px',
                      background: formData.relation_category === relation.category && formData.relation_detail === relation.detail 
                        ? '#374151' : '#FAFBFC',
                      color: formData.relation_category === relation.category && formData.relation_detail === relation.detail 
                        ? 'white' : '#374151',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {relation.display_name}
                  </button>
                ))}
              </div>
            </div>

            {/* 축의금/조의금 입력 */}
            <div style={{
              background: 'white',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              border: '1px solid #F3F4F6'
            }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: '#374151',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
                {event.event_type === 'funeral' ? '조의금' : '축의금'} 금액
              </label>
              <p style={{
                fontSize: '12px',
                color: '#6B7280',
                marginBottom: '20px',
                margin: '0 0 20px 0'
              }}>
                빠른 선택 또는 직접 입력으로 금액을 설정해주세요
              </p>
              
              {/* 빠른 선택 버튼들 */}
              {event.preset_amounts && event.preset_amounts.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      빠른 선택
                    </span>
                    <span style={{
                      fontSize: '11px',
                      color: '#9CA3AF'
                    }}>
                      원하는 금액을 선택하세요
                    </span>
                  </div>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '8px'
                  }}>
                    {event.preset_amounts.map((amount, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => handleAmountSelect(amount)}
                        style={{
                          padding: '14px 8px',
                          border: '2px solid',
                          borderColor: !formData.useCustomAmount && formData.amount === amount.toString() 
                            ? '#374151' : '#E5E7EB',
                          borderRadius: '12px',
                          background: !formData.useCustomAmount && formData.amount === amount.toString() 
                            ? '#374151' : '#FAFBFC',
                          color: !formData.useCustomAmount && formData.amount === amount.toString() 
                            ? 'white' : '#374151',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'center'
                        }}
                      >
                        {formatAmount(amount)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 직접 입력 */}
              <div style={{ marginBottom: '12px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#6B7280',
                    fontWeight: '500',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    직접 입력
                  </span>
                  <span style={{
                    fontSize: '11px',
                    color: '#9CA3AF'
                  }}>
                    원하는 금액을 직접 입력하세요
                  </span>
                </div>
                <div style={{
                  border: '2px solid',
                  borderColor: formData.useCustomAmount ? '#374151' : '#E5E7EB',
                  borderRadius: '12px',
                  background: '#FAFBFC',
                  padding: '20px',
                  textAlign: 'center',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}>
                  <input
                    type="text"
                    value={formData.customAmount ? formatAmount(parseInt(formData.customAmount)) : ''}
                    onChange={e => handleCustomAmountChange(e.target.value)}
                    onFocus={() => setFormData({ ...formData, useCustomAmount: true, amount: '' })}
                    placeholder="예: 100,000원"
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      textAlign: 'center',
                      fontSize: '24px',
                      fontWeight: '600',
                      color: '#111827',
                      padding: '8px 0'
                    }}
                  />
                  {!formData.customAmount && !formData.useCustomAmount && (
                    <p style={{
                      position: 'absolute',
                      bottom: '8px',
                      left: '0',
                      right: '0',
                      fontSize: '11px',
                      color: '#9CA3AF',
                      margin: 0,
                      textAlign: 'center'
                    }}>
                      클릭하여 직접 입력하세요
                    </p>
                  )}
                </div>
              </div>

              {/* 선택된 금액 표시 */}
              {getSelectedAmount() > 0 && (
                <div style={{
                  background: '#F0F9FF',
                  border: '1px solid #E0F2FE',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  textAlign: 'center'
                }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#0284C7',
                    fontWeight: '500'
                  }}>
                    선택한 금액: 
                  </span>
                  <span style={{
                    fontSize: '16px',
                    color: '#0C4A6E',
                    fontWeight: '700',
                    marginLeft: '8px'
                  }}>
                    {formatAmount(getSelectedAmount())}
                  </span>
                </div>
              )}
            </div>



            {/* 🎉 공개 축하/추도 메시지 섹션 - 눈에 띄는 디자인 */}
            <div style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '16px',
              color: 'white',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 배경 장식 */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                width: '80px',
                height: '80px',
                background: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                opacity: 0.5
              }}></div>
              <div style={{
                position: 'absolute',
                bottom: '-30px',
                left: '-30px',
                width: '100px',
                height: '100px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '50%'
              }}></div>

              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <label style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  display: 'block',
                  marginBottom: '8px',
                  color: 'white'
                }}>
                  {event.event_type === 'funeral' ? '🕊️ 추모 메시지' : '🎉 축하 메시지'} (선택사항)
                </label>
                <p style={{
                  fontSize: '13px',
                  margin: '0 0 16px 0',
                  opacity: 0.9,
                  lineHeight: '1.5'
                }}>
                  {event.event_type === 'funeral' 
                    ? '모든 방문자가 볼 수 있는 추모의 글을 남겨주세요' 
                    : '모든 방문자가 볼 수 있는 축하의 메시지를 남겨주세요'
                  }
                </p>
                
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: formData.sendPublicMessage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  width: 'fit-content'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.sendPublicMessage}
                    onChange={e => setFormData({ ...formData, sendPublicMessage: e.target.checked })}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '10px',
                      accentColor: 'white'
                    }}
                  />
                  {event.event_type === 'funeral' ? '추모 메시지 남기기' : '축하 메시지 남기기'}
                </label>
              </div>

              {formData.sendPublicMessage ? (
                <div style={{ position: 'relative' }}>
                  <textarea
                    value={formData.publicMessage}
                    onChange={e => setFormData({ ...formData, publicMessage: e.target.value })}
                    placeholder={event.event_type === 'wedding' 
                      ? '축하의 마음을 전해주세요 💕\n예: 결혼을 축하드립니다! 항상 행복하게 사세요~' 
                      : '추모의 마음을 전해주세요 🕊️\n예: 삼가 고인의 명복을 빕니다. 유족분들께 위로의 말씀드립니다.'
                    }
                    rows={4}
                    style={{
                      width: '100%',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      padding: '16px',
                      fontSize: '14px',
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: 'white',
                      resize: 'none',
                      outline: 'none',
                      lineHeight: '1.6',
                      transition: 'all 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                    onFocus={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)'}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}>
                    <p style={{
                      fontSize: '12px',
                      margin: 0,
                      opacity: 0.8
                    }}>
                      ✨ 모든 사람이 볼 수 있는 공개 메시지입니다
                    </p>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      opacity: 0.7
                    }}>
                      {formData.publicMessage.length} / 500자
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '32px 16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  border: '1px dashed rgba(255, 255, 255, 0.3)'
                }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>
                    {event.event_type === 'funeral' ? '🕊️' : '🎉'}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    margin: 0,
                    fontWeight: '500',
                    opacity: 0.9
                  }}>
                    {event.event_type === 'funeral' 
                      ? '추모 메시지를 남겨보세요'
                      : '축하 메시지를 남겨보세요'
                    }
                  </p>
                </div>
              )}
            </div>

            {/* 요약 정보 */}
            <div style={{
              background: '#374151',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              color: 'white'
            }}>
              <h3 style={{
                fontSize: '16px',
                fontWeight: '600',
                margin: '0 0 16px 0'
              }}>
                방명록 내역
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.8, fontSize: '14px' }}>성함</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {formData.guest_name || '미입력'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.8, fontSize: '14px' }}>관계</span>
                  <span style={{ fontWeight: '600', fontSize: '14px' }}>
                    {relationTypes.find(rt => 
                      rt.category === formData.relation_category && 
                      rt.detail === formData.relation_detail
                    )?.display_name || '미선택'}
                  </span>
                </div>
                <div style={{ height: '1px', background: 'rgba(255,255,255,0.2)' }}></div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.8, fontSize: '14px' }}>
                    {event.event_type === 'funeral' ? '조의금' : '축의금'}
                  </span>
                  <span style={{ fontSize: '20px', fontWeight: '700' }}>
                    {getSelectedAmount() > 0 ? formatAmount(getSelectedAmount()) : '미선택'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px 24px 32px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          borderTop: '1px solid #F3F4F6',
          zIndex: 10
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <button
              onClick={handleSubmit}
              disabled={!validateForm() || submitting}
              style={{
                width: '100%',
                height: '56px',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: (!validateForm() || submitting) ? 'not-allowed' : 'pointer',
                background: (!validateForm() || submitting) ? '#D1D5DB' : '#374151',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'all 0.2s ease'
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  등록 중...
                </>
              ) : (
                '📝 방명록 작성하기'
              )}
            </button>
          </div>
        </div>

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}