// pages/contribute/[eventId].js - 프리미엄 모바일 청첩장/부고장 디자인
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import toast from 'react-hot-toast';
import {
  getEventDetails,
  addContribution,
  addEventMessage,
  formatAmount,
  formatDate,
  formatTime,
  debugStorageFiles,
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

  const [formData, setFormData] = useState({
    contributorName: '',
    amount: '',
    customAmount: '',
    relation: '',
    message: '',
    useCustomAmount: false,
    sendMessage: false,
  });

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
                
        if (eventData.event_type === 'wedding') {
          setFormData(prev => ({ ...prev, relation: '신랑측' }));
        } else if (eventData.event_type === 'funeral') {
          setFormData(prev => ({ ...prev, relation: '친구' }));
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

  const handleAmountSelect = amount => {
    setFormData({
      ...formData,
      amount: amount.toString(),
      customAmount: '',
      useCustomAmount: false,
    });
  };

  const handleCustomAmountChange = value => {
    const numbers = value.replace(/[^\d]/g, '');
    setFormData({
      ...formData,
      customAmount: numbers,
      amount: '',
      useCustomAmount: true,
    });
  };

  const getSelectedAmount = () => {
    if (formData.useCustomAmount) {
      return parseInt(formData.customAmount) || 0;
    }
    return parseInt(formData.amount) || 0;
  };

  const validateForm = () => {
    if (!formData.contributorName.trim()) {
      toast.error('성함을 입력해주세요.');
      return false;
    }

    const amount = getSelectedAmount();
    if (!amount || amount < 1000) {
      toast.error('부조금을 1,000원 이상 입력해주세요.');
      return false;
    }

    if (!formData.relation) {
      toast.error('관계를 선택해주세요.');
      return false;
    }

    if (formData.sendMessage && !formData.message.trim()) {
      toast.error('메시지를 입력해주세요.');
      return false;
    }

    return true;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    const toastId = toast.loading('부조를 등록하고 있습니다...');

    try {
      const contributionResult = await addContribution({
        event_id: eventId,
        contributor_name: formData.contributorName.trim(),
        amount: getSelectedAmount(),
        relation_to: formData.relation || null,
        notes: formData.sendMessage ? formData.message.trim() : null,
      });

      if (!contributionResult.success) {
        throw new Error(contributionResult.error);
      }

      if (event.allow_messages && formData.sendMessage && formData.message.trim()) {
        const messageResult = await addEventMessage({
          event_id: eventId,
          sender_name: formData.contributorName.trim(),
          message: formData.message.trim(),
          message_type: event.event_type === 'funeral' ? 'condolence' : 'congratulation',
          is_anonymous: false,
        });

        if (!messageResult.success) {
          console.warn('메시지 등록 실패:', messageResult.error);
        }
      }

      toast.success('부조가 완료되었습니다!', { id: toastId });
      setStep(2);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || '부조 등록에 실패했습니다.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const getEventDesign = () => {
    switch (event?.event_type) {
      case 'wedding':
        return {
          // 결혼식 - 로맨틱하고 우아한 디자인
          bgGradient: 'linear-gradient(135deg, #FFE4E6 0%, #FDF2F8 50%, #FEFCE8 100%)',
          headerBg: 'linear-gradient(135deg, #FB7185 0%, #F472B6 50%, #FBBF24 100%)',
          primaryColor: '#E11D48',
          accentColor: '#F472B6',
          textColor: '#BE185D',
          lightColor: '#FDF2F8',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          amountLabel: '축의금',
          relations: ['신랑측', '신부측'],
          defaultMessage: '결혼을 축하합니다!',
          decorations: ['🌸', '💕', '✨'],
          titleText: '결혼을 축하합니다'
        };
      case 'funeral':
        return {
          // 부고 - 차분하고 엄숙한 디자인  
          bgGradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 50%, #CBD5E1 100%)',
          headerBg: 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)',
          primaryColor: '#475569',
          accentColor: '#64748B',
          textColor: '#334155',
          lightColor: '#F8FAFC',
          cardBg: 'rgba(255, 255, 255, 0.98)',
          amountLabel: '조의금',
          relations: ['가족', '친척', '친구', '동료', '지인'],
          defaultMessage: '삼가 고인의 명복을 빕니다.',
          decorations: ['🕊️', '🤍', '💙'],
          titleText: '삼가 고인의 명복을 빕니다'
        };
      case 'birthday':
        return {
          // 돌잔치 - 밝고 즐거운 디자인
          bgGradient: 'linear-gradient(135deg, #DBEAFE 0%, #E0E7FF 50%, #EDE9FE 100%)',
          headerBg: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 50%, #8B5CF6 100%)',
          primaryColor: '#2563EB',
          accentColor: '#6366F1',
          textColor: '#1E40AF',
          lightColor: '#EFF6FF',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          amountLabel: '축의금',
          relations: ['가족', '친척', '친구', '지인'],
          defaultMessage: '돌 축하합니다!',
          decorations: ['🎂', '🎈', '🎉'],
          titleText: '돌잔치를 축하합니다'
        };
      default:
        return {
          bgGradient: 'linear-gradient(135deg, #F1F5F9 0%, #E2E8F0 100%)',
          headerBg: 'linear-gradient(135deg, #64748B 0%, #94A3B8 100%)',
          primaryColor: '#475569',
          accentColor: '#64748B',
          textColor: '#334155',
          lightColor: '#F8FAFC',
          cardBg: 'rgba(255, 255, 255, 0.95)',
          amountLabel: '부조금',
          relations: ['가족', '친구', '지인'],
          defaultMessage: '축하합니다!',
          decorations: ['🎉'],
          titleText: '경조사'
        };
    }
  };

  // 이미지 슬라이드 컴포넌트 - 대형 사진
  const ImageSlider = ({ design }) => {
    if (eventStorageImages.length === 0) {
      return (
        <div style={{
          width: '280px',
          height: '280px',
          margin: '0 auto 32px',
          borderRadius: '20px',
          background: `linear-gradient(135deg, ${design.lightColor} 0%, rgba(255,255,255,0.8) 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          border: `3px solid ${design.accentColor}30`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.7 }}>
            {design.decorations[0]}
          </div>
          <div style={{ 
            fontSize: '14px', 
            color: design.textColor, 
            opacity: 0.8,
            fontWeight: '500',
            letterSpacing: '0.5px'
          }}>
            사진
          </div>
        </div>
      );
    }

    const currentImage = eventStorageImages[currentImageIndex];
    const imageId = currentImage.id || currentImage.name;
    const imageUrl = currentImage.primaryUrl || currentImage.publicUrl;
    const loadState = imageLoadStates[imageId];

    return (
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '280px',
          height: '280px',
          margin: '0 auto',
          borderRadius: '20px',
          overflow: 'hidden',
          border: `3px solid ${design.accentColor}30`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          position: 'relative',
          background: design.lightColor
        }}>
          <img
            src={imageUrl}
            alt={event.event_type === 'funeral' 
              ? `고 ${event.main_person_name || '故人'}` 
              : event.event_name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: loadState === 'loaded' ? '1' : '0',
              transition: 'opacity 0.5s ease'
            }}
            onLoad={() => handleImageLoad(imageId)}
            onError={() => handleImageError(imageId)}
          />
          
          {/* 이미지 오버레이 */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
            pointerEvents: 'none'
          }} />
        </div>

        {/* 이미지 네비게이션 */}
        {eventStorageImages.length > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '20px',
            gap: '16px'
          }}>
            <button
              onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : eventStorageImages.length - 1)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: design.cardBg,
                color: design.primaryColor,
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
              ←
            </button>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              {eventStorageImages.map((_, index) => (
                <div
                  key={index}
                  onClick={() => setCurrentImageIndex(index)}
                  style={{
                    width: index === currentImageIndex ? '24px' : '8px',
                    height: '8px',
                    borderRadius: '4px',
                    background: index === currentImageIndex ? design.primaryColor : `${design.accentColor}40`,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
              <span style={{ 
                marginLeft: '8px', 
                fontSize: '12px', 
                color: design.textColor,
                fontWeight: '500'
              }}>
                {currentImageIndex + 1} / {eventStorageImages.length}
              </span>
            </div>

            <button
              onClick={() => setCurrentImageIndex(prev => prev < eventStorageImages.length - 1 ? prev + 1 : 0)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                border: 'none',
                background: design.cardBg,
                color: design.primaryColor,
                fontSize: '18px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.target.style.transform = 'scale(1.1)'}
              onMouseOut={e => e.target.style.transform = 'scale(1)'}
            >
              →
            </button>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 24px'
          }}></div>
          <p style={{ fontSize: '18px', fontWeight: '600', opacity: 0.9 }}>
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
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '0 24px',
        fontFamily: "'SF Pro Display', -apple-system, sans-serif"
      }}>
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px 32px',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
          maxWidth: '400px',
          width: '100%'
        }}>
          <div style={{ fontSize: '80px', marginBottom: '32px' }}>😕</div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '16px', color: '#1E293B' }}>
            경조사를 찾을 수 없습니다
          </h1>
          <p style={{ fontSize: '16px', color: '#64748B', marginBottom: '40px', lineHeight: '1.6' }}>
            유효하지 않은 링크이거나<br />만료된 경조사입니다.
          </p>
          <button
            onClick={() => router.push('/')}
            style={{
              width: '100%',
              height: '56px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 10px 25px rgba(102, 126, 234, 0.4)'
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const design = getEventDesign();

  if (step === 2) {
    return (
      <>
        <Head>
          <title>{event.event_name} - 부조 완료</title>
        </Head>
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: design.bgGradient,
          padding: '0 24px',
          fontFamily: "'SF Pro Display', -apple-system, sans-serif"
        }}>
          <div style={{
            background: design.cardBg,
            borderRadius: '28px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
            maxWidth: '400px',
            width: '100%',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${design.accentColor}20`
          }}>
            <div style={{
              width: '120px',
              height: '120px',
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              fontSize: '48px',
              color: 'white',
              boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)'
            }}>
              ✓
            </div>
            <h1 style={{ 
              fontSize: '28px', 
              fontWeight: '800', 
              marginBottom: '16px', 
              color: '#1E293B',
              letterSpacing: '-0.5px'
            }}>
              부조가 완료되었습니다
            </h1>
            <p style={{ 
              fontSize: '18px', 
              color: '#64748B', 
              marginBottom: '40px', 
              lineHeight: '1.6' 
            }}>
              <strong style={{ color: design.primaryColor, fontWeight: '700' }}>
                {formData.contributorName}
              </strong>님의 소중한 마음이<br />잘 전달되었습니다.
            </p>
            <div style={{
              background: `linear-gradient(135deg, ${design.lightColor} 0%, rgba(255,255,255,0.8) 100%)`,
              borderRadius: '20px',
              padding: '32px 24px',
              marginBottom: '40px',
              border: `2px solid ${design.accentColor}20`
            }}>
              <div style={{ 
                fontSize: '14px', 
                color: design.textColor, 
                marginBottom: '12px', 
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                {design.amountLabel}
              </div>
              <div style={{ 
                fontSize: '36px', 
                fontWeight: '900', 
                color: design.primaryColor,
                letterSpacing: '-1px'
              }}>
                {formatAmount(getSelectedAmount())}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button
                onClick={() => window.close()}
                style={{
                  width: '100%',
                  height: '56px',
                  background: design.headerBg,
                  color: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  fontSize: '16px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: `0 15px 35px ${design.primaryColor}40`,
                  transition: 'transform 0.2s ease'
                }}
                onMouseOver={e => e.target.style.transform = 'translateY(-2px)'}
                onMouseOut={e => e.target.style.transform = 'translateY(0)'}
              >
                닫기
              </button>
              <button
                onClick={() => window.open('https://apps.apple.com/app/jeongdam', '_blank')}
                style={{
                  width: '100%',
                  height: '48px',
                  background: 'transparent',
                  color: design.primaryColor,
                  border: `2px solid ${design.accentColor}30`,
                  borderRadius: '16px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                정담 앱 다운로드
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{event.event_name} - 부조하기</title>
        <meta name="description" content={`${event.event_name} 부조를 간편하게 해보세요`} />
      </Head>

      <div style={{
        minHeight: '100vh',
        background: design.bgGradient,
        fontFamily: "'SF Pro Display', -apple-system, sans-serif",
        paddingBottom: '100px' // 하단 버튼 공간 확보
      }}>
        {/* 장식 요소들 */}
        <div style={{
          position: 'fixed',
          top: '10%',
          left: '-5%',
          fontSize: '120px',
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {design.decorations[0]}
        </div>
        <div style={{
          position: 'fixed',
          top: '60%',
          right: '-5%',
          fontSize: '80px',
          opacity: 0.1,
          zIndex: 0,
          pointerEvents: 'none'
        }}>
          {design.decorations[1]}
        </div>

        {/* 헤더 */}
        <header style={{
          background: design.headerBg,
          padding: '60px 24px 80px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* 헤더 장식 요소 */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '200px',
            height: '200px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '50%',
            opacity: 0.6
          }}></div>
          <div style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '150px',
            height: '150px',
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50%'
          }}></div>

          <div style={{ position: 'relative', zIndex: 1, maxWidth: '400px', margin: '0 auto' }}>
            {/* 대형 이미지 */}
            <ImageSlider design={design} />

            {/* 부고인 경우 고인 정보 */}
            {event.event_type === 'funeral' && (
              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: '800',
                  marginBottom: '8px',
                  color: 'white',
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                  letterSpacing: '-0.5px'
                }}>
                  고 {event.main_person_name || '故人'}
                </div>
                {event.deceased_age && (
                  <div style={{
                    fontSize: '18px',
                    color: 'rgba(255,255,255,0.9)',
                    fontWeight: '600',
                    textShadow: '0 1px 5px rgba(0,0,0,0.2)'
                  }}>
                    향년 {event.deceased_age}세
                  </div>
                )}
              </div>
            )}

            <h1 style={{
              fontSize: '32px',
              fontWeight: '900',
              marginBottom: '16px',
              color: 'white',
              lineHeight: '1.2',
              textShadow: '0 2px 15px rgba(0,0,0,0.3)',
              letterSpacing: '-1px'
            }}>
              {event.event_name}
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255,255,255,0.95)',
              fontWeight: '600',
              textShadow: '0 1px 5px rgba(0,0,0,0.2)'
            }}>
              {formatDate(event.event_date)}
              {event.ceremony_time && (
                <span style={{ marginLeft: '20px', opacity: 0.9 }}>
                  {formatTime(event.ceremony_time)}
                </span>
              )}
            </p>
          </div>
        </header>

        {/* 컨텐츠 */}
        <section style={{ padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            {/* 상세 정보 카드 */}
            <div style={{
              background: design.cardBg,
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '24px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${design.accentColor}20`,
              marginTop: '-40px'
            }}>
              {event.location && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: design.primaryColor,
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></div>
                    <span style={{
                      fontSize: '14px',
                      color: design.textColor,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      장소
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#1E293B',
                    marginBottom: '8px',
                    letterSpacing: '-0.3px'
                  }}>
                    {event.location}
                  </div>
                  {event.detailed_address && (
                    <div style={{
                      fontSize: '16px',
                      color: '#64748B',
                      lineHeight: '1.5',
                      fontWeight: '500'
                    }}>
                      {event.detailed_address}
                    </div>
                  )}
                </div>
              )}

              {event.event_type === 'funeral' && event.funeral_home && (
                <div style={{ marginBottom: '32px' }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: design.primaryColor,
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></div>
                    <span style={{
                      fontSize: '14px',
                      color: design.textColor,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      빈소
                    </span>
                  </div>
                  <div style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#1E293B',
                    letterSpacing: '-0.3px'
                  }}>
                    {event.funeral_home}
                  </div>
                </div>
              )}

              {(event.primary_contact || event.secondary_contact) && (
                <div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      background: design.primaryColor,
                      borderRadius: '50%',
                      marginRight: '12px'
                    }}></div>
                    <span style={{
                      fontSize: '14px',
                      color: design.textColor,
                      fontWeight: '700',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      연락처
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {event.primary_contact && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: design.lightColor,
                        padding: '20px 24px',
                        borderRadius: '16px',
                        border: `2px solid ${design.accentColor}15`
                      }}>
                        <span style={{
                          fontSize: '16px',
                          color: design.textColor,
                          fontWeight: '600'
                        }}>
                          {event.event_type === 'wedding' ? '신랑측' : '상주'}
                        </span>
                        <a
                          href={`tel:${event.primary_contact}`}
                          style={{
                            color: design.primaryColor,
                            textDecoration: 'none',
                            fontWeight: '800',
                            fontSize: '18px',
                            letterSpacing: '-0.3px'
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
                        alignItems: 'center',
                        background: design.lightColor,
                        padding: '20px 24px',
                        borderRadius: '16px',
                        border: `2px solid ${design.accentColor}15`
                      }}>
                        <span style={{
                          fontSize: '16px',
                          color: design.textColor,
                          fontWeight: '600'
                        }}>
                          {event.event_type === 'wedding' ? '신부측' : '가족'}
                        </span>
                        <a
                          href={`tel:${event.secondary_contact}`}
                          style={{
                            color: design.primaryColor,
                            textDecoration: 'none',
                            fontWeight: '800',
                            fontSize: '18px',
                            letterSpacing: '-0.3px'
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

            {/* 성함 입력 */}
            <div style={{
              background: design.cardBg,
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '24px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${design.accentColor}20`
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1E293B',
                margin: '0 0 24px 0',
                letterSpacing: '-0.3px'
              }}>
                성함을 알려주세요
              </h3>
              <input
                type="text"
                value={formData.contributorName}
                onChange={e => setFormData({ ...formData, contributorName: e.target.value })}
                placeholder="홍길동"
                style={{
                  width: '100%',
                  height: '64px',
                  border: `2px solid ${design.accentColor}20`,
                  borderRadius: '16px',
                  padding: '0 24px',
                  fontSize: '18px',
                  fontWeight: '600',
                  textAlign: 'center',
                  background: design.lightColor,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  letterSpacing: '-0.3px'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = design.primaryColor;
                  e.target.style.boxShadow = `0 0 0 4px ${design.primaryColor}15`;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = `${design.accentColor}20`;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* 관계 선택 */}
            <div style={{
              background: design.cardBg,
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '24px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${design.accentColor}20`
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1E293B',
                margin: '0 0 24px 0',
                letterSpacing: '-0.3px'
              }}>
                관계를 선택해주세요
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: event.event_type === 'wedding' ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)',
                gap: '12px'
              }}>
                {design.relations.map((relation, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, relation })}
                    style={{
                      height: '56px',
                      border: '2px solid',
                      borderColor: formData.relation === relation ? design.primaryColor : `${design.accentColor}20`,
                      borderRadius: '14px',
                      background: formData.relation === relation 
                        ? design.primaryColor 
                        : design.lightColor,
                      color: formData.relation === relation ? 'white' : '#1E293B',
                      fontSize: '16px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: formData.relation === relation 
                        ? `0 8px 25px ${design.primaryColor}40` 
                        : 'none',
                      letterSpacing: '-0.2px'
                    }}
                  >
                    {relation}
                  </button>
                ))}
              </div>
            </div>

            {/* 부조금 선택 */}
            <div style={{
              background: design.cardBg,
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '24px',
              boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${design.accentColor}20`
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '800',
                color: '#1E293B',
                margin: '0 0 24px 0',
                letterSpacing: '-0.3px'
              }}>
                {design.amountLabel}을 선택해주세요
              </h3>

              {event.preset_amounts && event.preset_amounts.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px',
                  marginBottom: '24px'
                }}>
                  {event.preset_amounts.map((amount, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleAmountSelect(amount)}
                      style={{
                        height: '64px',
                        border: '2px solid',
                        borderColor: !formData.useCustomAmount && formData.amount === amount.toString() 
                          ? design.primaryColor 
                          : `${design.accentColor}20`,
                        borderRadius: '16px',
                        background: !formData.useCustomAmount && formData.amount === amount.toString() 
                          ? design.primaryColor 
                          : design.lightColor,
                        color: !formData.useCustomAmount && formData.amount === amount.toString() 
                          ? 'white' 
                          : '#1E293B',
                        fontSize: '18px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        boxShadow: !formData.useCustomAmount && formData.amount === amount.toString() 
                          ? `0 8px 25px ${design.primaryColor}40` 
                          : 'none',
                        letterSpacing: '-0.5px'
                      }}
                    >
                      {formatAmount(amount)}
                    </button>
                  ))}
                </div>
              )}

              <div style={{
                border: '2px solid',
                borderColor: formData.useCustomAmount ? design.primaryColor : `${design.accentColor}20`,
                borderRadius: '20px',
                background: design.lightColor,
                padding: '28px',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                boxShadow: formData.useCustomAmount ? `0 8px 25px ${design.primaryColor}30` : 'none'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: design.textColor,
                  marginBottom: '16px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  직접 입력
                </label>
                <input
                  type="text"
                  value={formData.customAmount ? formatAmount(parseInt(formData.customAmount)) : ''}
                  onChange={e => handleCustomAmountChange(e.target.value)}
                  onFocus={() => setFormData({ ...formData, useCustomAmount: true, amount: '' })}
                  placeholder="금액을 입력하세요"
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    textAlign: 'center',
                    fontSize: '32px',
                    fontWeight: '900',
                    color: '#1E293B',
                    padding: '16px 0',
                    letterSpacing: '-1px'
                  }}
                />
              </div>
            </div>

            {/* 메시지 남기기 */}
            {event.allow_messages && (
              <div style={{
                background: design.cardBg,
                borderRadius: '24px',
                padding: '32px 28px',
                marginBottom: '24px',
                boxShadow: '0 15px 35px rgba(0,0,0,0.1)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${design.accentColor}20`
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontSize: '20px',
                    fontWeight: '800',
                    color: '#1E293B',
                    margin: 0,
                    letterSpacing: '-0.3px'
                  }}>
                    방문글 남기기
                  </h3>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.sendMessage}
                      onChange={e => setFormData({ ...formData, sendMessage: e.target.checked })}
                      style={{
                        width: '24px',
                        height: '24px',
                        marginRight: '12px',
                        accentColor: design.primaryColor
                      }}
                    />
                    <span style={{
                      fontSize: '14px',
                      color: design.textColor,
                      fontWeight: '600'
                    }}>선택</span>
                  </label>
                </div>

                {formData.sendMessage && (
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    placeholder={event.message_placeholder || design.defaultMessage}
                    rows={4}
                    style={{
                      width: '100%',
                      border: `2px solid ${design.accentColor}20`,
                      borderRadius: '16px',
                      padding: '20px',
                      fontSize: '16px',
                      background: design.lightColor,
                      resize: 'none',
                      outline: 'none',
                      lineHeight: '1.6',
                      transition: 'all 0.2s ease',
                      fontWeight: '500'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = design.primaryColor;
                      e.target.style.boxShadow = `0 0 0 4px ${design.primaryColor}15`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${design.accentColor}20`;
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                )}
              </div>
            )}

            {/* 요약 */}
            <div style={{
              background: design.headerBg,
              borderRadius: '24px',
              padding: '32px 28px',
              marginBottom: '24px',
              color: 'white',
              boxShadow: `0 20px 40px ${design.primaryColor}30`,
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* 배경 장식 */}
              <div style={{
                position: 'absolute',
                top: '-30px',
                right: '-30px',
                width: '120px',
                height: '120px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '50%'
              }}></div>

              <h3 style={{
                fontSize: '20px',
                fontWeight: '800',
                margin: '0 0 24px 0',
                position: 'relative',
                letterSpacing: '-0.3px'
              }}>
                {event.event_type === 'funeral' ? '조의 내역' : '부조 내역'}
              </h3>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '20px',
                position: 'relative'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.9, fontSize: '16px', fontWeight: '600' }}>성함</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>
                    {formData.contributorName || '미입력'}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.9, fontSize: '16px', fontWeight: '600' }}>관계</span>
                  <span style={{ fontWeight: '700', fontSize: '16px' }}>
                    {formData.relation || '미선택'}
                  </span>
                </div>
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.3)', borderRadius: '1px' }}></div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ opacity: 0.9, fontSize: '16px', fontWeight: '600' }}>
                    {design.amountLabel}
                  </span>
                  <span style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-0.8px' }}>
                    {getSelectedAmount() > 0 ? formatAmount(getSelectedAmount()) : '미선택'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 하단 고정 버튼 */}
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '20px 24px 36px',
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: `1px solid ${design.accentColor}20`,
          zIndex: 10
        }}>
          <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <button
              onClick={handleSubmit}
              disabled={!formData.contributorName || !formData.relation || getSelectedAmount() < 1000 || submitting}
              style={{
                width: '100%',
                height: '64px',
                border: 'none',
                borderRadius: '20px',
                fontSize: '18px',
                fontWeight: '800',
                cursor: submitting ? 'not-allowed' : 'pointer',
                background: (!formData.contributorName || !formData.relation || getSelectedAmount() < 1000 || submitting) 
                  ? '#CBD5E1' 
                  : design.headerBg,
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                boxShadow: (!formData.contributorName || !formData.relation || getSelectedAmount() < 1000 || submitting) 
                  ? 'none' 
                  : `0 15px 35px ${design.primaryColor}40`,
                letterSpacing: '-0.3px'
              }}
              onMouseOver={e => {
                if (!e.target.disabled) {
                  e.target.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={e => {
                e.target.style.transform = 'translateY(0)';
              }}
            >
              {submitting ? (
                <>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    border: '3px solid transparent',
                    borderTop: '3px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  등록 중...
                </>
              ) : (
                `${formatAmount(getSelectedAmount() || 0)} ${event.event_type === 'funeral' ? '조의 전하기' : '부조하기'}`
              )}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}