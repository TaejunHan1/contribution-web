// components/MobileGuestBookForm.js - 모바일 방명록 폼 컴포넌트
import { useState } from 'react';

const MobileGuestBookForm = ({ 
  event,
  formData,
  setFormData,
  relationTypes = [],
  onSubmit,
  submitting = false,
  validateForm,
  getSelectedAmount,
  formatAmount 
}) => {
  if (!event) return null;

  const isWedding = event.event_type === 'wedding';
  const isFuneral = event.event_type === 'funeral';

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

  return (
    <div className="mobile-invitation" style={{ padding: '0 16px' }}>
      {/* 방명록 작성 헤더 */}
      <div className="card-toss" style={{
        background: isWedding ? 'var(--color-wedding)' : isFuneral ? 'var(--color-funeral)' : '#374151',
        color: 'white',
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          margin: '0 0 8px 0',
          letterSpacing: '-0.2px'
        }}>
          📝 방명록 작성
        </h2>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0 }}>
          참석 확인 및 {isFuneral ? '조의금' : '축의금'} 등록
        </p>
      </div>

      {/* 성함 입력 */}
      <div className="card-toss" style={{ marginBottom: '16px' }}>
        <label className="text-body-2" style={{
          display: 'block',
          color: '#374151',
          marginBottom: '12px',
          fontWeight: '500'
        }}>
          성함 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <input
          type="text"
          className="input-toss"
          value={formData.guest_name}
          onChange={e => setFormData({ ...formData, guest_name: e.target.value })}
          placeholder="성함을 입력해주세요"
          style={{
            fontSize: '16px', // iOS 줌 방지
            fontWeight: '400'
          }}
        />
      </div>

      {/* 관계 선택 */}
      <div className="card-toss" style={{ marginBottom: '16px' }}>
        <label className="text-body-2" style={{
          display: 'block',
          color: '#374151',
          marginBottom: '16px',
          fontWeight: '500'
        }}>
          관계 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '10px'
        }}>
          {relationTypes
            .filter(rt => rt.event_type === event.event_type)
            .slice(0, 8)
            .map((relation) => (
            <button
              key={`${relation.category}-${relation.detail}`}
              type="button"
              className={`select-button ${isWedding ? 'wedding' : isFuneral ? 'funeral' : ''} ${
                formData.relation_category === relation.category && 
                formData.relation_detail === relation.detail ? 'selected' : ''
              }`}
              onClick={() => handleRelationChange(relation.category, relation.detail)}
              style={{ fontSize: '14px', fontWeight: '500' }}
            >
              {relation.display_name}
            </button>
          ))}
        </div>
      </div>

      {/* 금액 입력 */}
      <div className="card-toss" style={{ marginBottom: '16px' }}>
        <label className="text-body-2" style={{
          display: 'block',
          color: '#374151',
          marginBottom: '8px',
          fontWeight: '500'
        }}>
          {isFuneral ? '조의금' : '축의금'} 금액 <span style={{ color: '#EF4444' }}>*</span>
        </label>
        <p className="text-caption-1" style={{
          color: '#6B7280',
          marginBottom: '20px',
          margin: '0 0 20px 0'
        }}>
          빠른 선택 또는 직접 입력으로 금액을 설정해주세요
        </p>
        
        {/* 빠른 선택 버튼들 */}
        {event.preset_amounts && event.preset_amounts.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <span className="text-caption-1" style={{ 
                color: '#6B7280', 
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.5px' 
              }}>
                빠른 선택
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
                  className={`select-button ${
                    !formData.useCustomAmount && formData.amount === amount.toString() ? 'selected' : ''
                  }`}
                  onClick={() => handleAmountSelect(amount)}
                  style={{
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '12px 8px'
                  }}
                >
                  {formatAmount(amount)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 직접 입력 */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <span className="text-caption-1" style={{
              color: '#6B7280',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              직접 입력
            </span>
          </div>
          <div className={`select-button ${formData.useCustomAmount ? 'selected' : ''}`} style={{
            padding: '20px',
            textAlign: 'center',
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
                fontSize: '20px',
                fontWeight: '600',
                color: formData.useCustomAmount ? 'white' : '#111827',
                padding: '8px 0'
              }}
            />
          </div>
        </div>

        {/* 선택된 금액 표시 */}
        {getSelectedAmount() > 0 && (
          <div className="badge-primary" style={{
            display: 'block',
            textAlign: 'center',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px'
          }}>
            선택한 금액: <strong>{formatAmount(getSelectedAmount())}</strong>
          </div>
        )}
      </div>

      {/* 공개 메시지 섹션 */}
      <div className="mobile-message-card" style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            fontSize: '16px',
            fontWeight: '600',
            display: 'block',
            marginBottom: '8px',
            color: 'white'
          }}>
            {isFuneral ? '🕊️ 추모 메시지' : '🎉 축하 메시지'} (선택사항)
          </label>
          <p style={{
            fontSize: '13px',
            margin: '0 0 16px 0',
            opacity: 0.9,
            lineHeight: '1.5'
          }}>
            {isFuneral 
              ? '모든 방문자가 볼 수 있는 추모의 글을 남겨주세요' 
              : '모든 방문자가 볼 수 있는 축하의 메시지를 남겨주세요'
            }
          </p>
          
          <label className="select-button" style={{
            background: formData.sendPublicMessage ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: 'white',
            fontSize: '14px',
            fontWeight: '500',
            width: 'auto',
            display: 'inline-flex'
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
            {isFuneral ? '추모 메시지 남기기' : '축하 메시지 남기기'}
          </label>
        </div>

        {formData.sendPublicMessage && (
          <div style={{ position: 'relative' }}>
            <textarea
              value={formData.publicMessage}
              onChange={e => setFormData({ ...formData, publicMessage: e.target.value })}
              placeholder={isWedding 
                ? '축하의 마음을 전해주세요 💕\n예: 결혼을 축하드립니다! 항상 행복하게 사세요~' 
                : '추모의 마음을 전해주세요 🕊️\n예: 삼가 고인의 명복을 빕니다. 유족분들께 위로의 말씀드립니다.'
              }
              rows={4}
              className="input-toss"
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                color: 'white',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
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
        )}
      </div>

      {/* 요약 정보 */}
      <div className="card-toss" style={{
        background: '#374151',
        color: 'white',
        marginBottom: '100px' // 하단 고정 버튼을 위한 여백
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
              {isFuneral ? '조의금' : '축의금'}
            </span>
            <span style={{ fontSize: '20px', fontWeight: '700' }}>
              {getSelectedAmount() > 0 ? formatAmount(getSelectedAmount()) : '미선택'}
            </span>
          </div>
        </div>
      </div>

      {/* 하단 고정 버튼 */}
      <div className="mobile-nav-safe" style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 24px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid #F3F4F6',
        zIndex: 50
      }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <button
            onClick={onSubmit}
            disabled={!validateForm() || submitting}
            className={`btn-toss ${
              isWedding ? 'btn-wedding' : isFuneral ? 'btn-funeral' : 'btn-primary'
            }`}
            style={{
              width: '100%',
              opacity: (!validateForm() || submitting) ? 0.5 : 1,
              cursor: (!validateForm() || submitting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {submitting ? (
              <>
                <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                등록 중...
              </>
            ) : (
              '📝 방명록 작성하기'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MobileGuestBookForm;