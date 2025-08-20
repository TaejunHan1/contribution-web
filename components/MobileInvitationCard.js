// components/MobileInvitationCard.js - 모바일 청첩장/부고장 카드 컴포넌트
import { useState, useEffect } from 'react';

const MobileInvitationCard = ({ 
  event, 
  images = [], 
  currentImageIndex = 0,
  onImageChange,
  weddingMessages = [],
  funeralMessages = [],
  currentMessageIndex = 0 
}) => {
  if (!event) return null;

  const isWedding = event.event_type === 'wedding';
  const isFuneral = event.event_type === 'funeral';
  const currentMessages = isWedding ? weddingMessages : funeralMessages;
  const currentMessage = currentMessages[currentMessageIndex] || '';

  // 🌸 꽃잎 장식 컴포넌트 (청첩장용)
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

  // 🍃 잎사귀 장식 컴포넌트 (부고장용)
  const LeafDecoration = ({ className, color = "#B8C5A6" }) => (
    <div className={`absolute ${className}`} style={{ position: 'absolute' }}>
      <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
        <path d="M2 8C2 4 8 2 16 8C24 2 30 4 30 8C30 12 24 14 16 8C8 14 2 12 2 8Z" fill={color} opacity="0.7"/>
      </svg>
    </div>
  );

  // 📱 모바일 이미지 슬라이더
  const MobileImageSlider = () => {
    if (!images || images.length === 0) {
      return (
        <div className="mobile-image-slider" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '300px',
          background: 'linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)',
          border: '1px solid #E2E8F0'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px', opacity: 0.5 }}>
              {isWedding ? '💍' : isFuneral ? '🕊️' : '🎉'}
            </div>
            <div style={{ fontSize: '14px', color: '#64748B', fontWeight: '500' }}>
              사진
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="mobile-image-slider" style={{ position: 'relative', height: '300px' }}>
        {images.map((image, index) => {
          const imgUrl = image?.primaryUrl || image?.publicUrl;
          if (!imgUrl) return null;
          
          return (
            <div
              key={`mobile-image-${index}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                opacity: index === currentImageIndex ? 1 : 0,
                transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                zIndex: index === currentImageIndex ? 2 : 1
              }}
            >
              <img
                src={imgUrl}
                alt={isFuneral 
                  ? `고 ${event?.main_person_name || '故人'}` 
                  : event?.event_name || '사진'
                }
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block'
                }}
                loading="lazy"
              />
            </div>
          );
        })}
        
        {/* 이미지 카운터 */}
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
        
        {/* 인디케이터 */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '6px',
            zIndex: 10
          }}>
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => onImageChange?.(index)}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  border: 'none',
                  background: index === currentImageIndex ? '#fff' : 'rgba(255,255,255,0.5)',
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

  return (
    <div className="mobile-invitation" style={{ 
      background: 'white', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* 배경 장식들 */}
      {isWedding && (
        <>
          <FlowerDecoration className="top-8 left-8" />
          <LeafDecoration className="top-12 right-12" />
          <FlowerDecoration className="bottom-16 right-8" color="#E8B4B8" />
          <LeafDecoration className="bottom-8 left-12" />
        </>
      )}
      
      {isFuneral && (
        <>
          <LeafDecoration className="top-8 left-8" color="#C4CDD5" />
          <LeafDecoration className="top-12 right-12" color="#9CA3AF" />
          <LeafDecoration className="bottom-16 right-8" color="#E5E7EB" />
          <LeafDecoration className="bottom-8 left-12" color="#D1D5DB" />
        </>
      )}
      
      <div style={{ padding: '32px 0', position: 'relative' }}>
        {/* 이미지 섹션 */}
        <div style={{ marginBottom: '32px' }}>
          <MobileImageSlider />
        </div>
        
        {/* 제목 섹션 */}
        <div style={{ textAlign: 'center', marginBottom: '32px', padding: '0 20px' }}>
          <p style={{ 
            color: '#6B7280', 
            fontSize: '12px', 
            marginBottom: '12px', 
            fontWeight: '500',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            {isWedding ? 'WEDDING INVITATION' : 
             isFuneral ? 'MEMORIAL SERVICE' : 'CELEBRATION'}
          </p>
          
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: '600', 
            color: '#111827', 
            marginBottom: '12px',
            letterSpacing: '-0.5px',
            lineHeight: '1.2'
          }}>
            {event.main_person_name || event.event_name}
          </h1>
          
          {isFuneral && event.deceased_age && (
            <p style={{ 
              fontSize: '16px', 
              color: '#6B7280', 
              fontWeight: '500',
              marginBottom: '20px'
            }}>
              향년 {event.deceased_age}세
            </p>
          )}
          
          {/* 동적 메시지 */}
          <div className="mobile-message-card">
            <div style={{
              fontSize: '14px',
              lineHeight: '1.7',
              fontWeight: '400',
              textAlign: 'center',
              position: 'relative',
              zIndex: 2
            }}>
              {currentMessage.split('\n').map((line, index) => (
                <div key={index} style={{ 
                  marginBottom: index < currentMessage.split('\n').length - 1 ? '8px' : 0 
                }}>
                  {line}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 일시/장소 정보 */}
        <div style={{ 
          textAlign: 'center', 
          padding: '0 20px',
          marginBottom: '24px'
        }}>
          {/* 날짜 및 시간 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#6B7280" strokeWidth="2" fill="none"/>
              <line x1="16" y1="2" x2="16" y2="6" stroke="#6B7280" strokeWidth="2"/>
              <line x1="8" y1="2" x2="8" y2="6" stroke="#6B7280" strokeWidth="2"/>
              <line x1="3" y1="10" x2="21" y2="10" stroke="#6B7280" strokeWidth="2"/>
            </svg>
            <span style={{ 
              fontSize: '14px', 
              color: '#374151', 
              fontWeight: '500',
              textAlign: 'center'
            }}>
              {new Date(event.event_date).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
              })}
              {event.ceremony_time && (
                <span style={{ display: 'block', marginTop: '4px', opacity: 0.8 }}>
                  {new Date(`2000-01-01T${event.ceremony_time}`).toLocaleTimeString('ko-KR', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              )}
            </span>
          </div>
          
          {/* 장소 */}
          {event.location && (
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#6B7280" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="10" r="3" stroke="#6B7280" strokeWidth="2" fill="none"/>
              </svg>
              <div style={{ fontSize: '14px', color: '#374151', fontWeight: '500', textAlign: 'center' }}>
                <div>{event.location}</div>
                {event.detailed_address && (
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
                    {event.detailed_address}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileInvitationCard;