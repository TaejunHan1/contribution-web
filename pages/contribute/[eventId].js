// pages/contribute/[eventId].js - 토스 스타일 부조 페이지
import { useState, useEffect } from 'react';
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
} from '../../lib/supabase';

export default function ContributePage() {
  const router = useRouter();
  const { eventId } = router.query;

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: 정보입력, 2: 완료

  const [formData, setFormData] = useState({
    contributorName: '',
    amount: '',
    customAmount: '',
    relation: '',
    message: '',
    useCustomAmount: false,
    sendMessage: false,
  });

  useEffect(() => {
    if (eventId) {
      loadEventData();
    }
  }, [eventId]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      const result = await getEventDetails(eventId);

      if (result.success) {
        setEvent(result.data);

        // 첫 번째 관계를 기본값으로 설정
        if (
          result.data.family_relations &&
          result.data.family_relations.length > 0
        ) {
          setFormData(prev => ({
            ...prev,
            relation: result.data.family_relations[0],
          }));
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
      // 부조금 등록
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

      // 메시지 등록 (선택사항)
      if (formData.sendMessage && formData.message.trim()) {
        const messageResult = await addEventMessage({
          event_id: eventId,
          sender_name: formData.contributorName.trim(),
          message: formData.message.trim(),
          message_type:
            event.event_type === 'funeral' ? 'condolence' : 'congratulation',
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
      toast.error(error.message || '부조 등록에 실패했습니다.', {
        id: toastId,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getEventTypeInfo = () => {
    switch (event?.event_type) {
      case 'wedding':
        return {
          text: '결혼식',
          icon: '💒',
          theme: 'wedding',
          amountLabel: '축의금',
        };
      case 'funeral':
        return {
          text: '부고',
          icon: '🕯️',
          theme: 'funeral',
          amountLabel: '조의금',
        };
      case 'birthday':
        return {
          text: '돌잔치',
          icon: '🎂',
          theme: 'celebration',
          amountLabel: '축의금',
        };
      default:
        return {
          text: '경조사',
          icon: '🎉',
          theme: 'primary',
          amountLabel: '부조금',
        };
    }
  };

  // 로딩 화면
  if (loading) {
    return (
      <div
        className="min-h-screen-mobile flex items-center justify-center"
        style={{ background: 'var(--color-background-secondary)' }}
      >
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-body-2 text-gray-600">
            경조사 정보를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (!event) {
    return (
      <div
        className="min-h-screen-mobile flex items-center justify-center p-6"
        style={{ background: 'var(--color-background-secondary)' }}
      >
        <div className="w-full max-w-md">
          <div className="card-toss text-center">
            <div className="text-6xl mb-6">😕</div>
            <h1 className="text-title-1 text-gray-900 mb-4">
              경조사를 찾을 수 없습니다
            </h1>
            <p className="text-body-2 text-gray-600 mb-6">
              유효하지 않은 링크이거나 만료된 경조사입니다.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-toss btn-primary w-full"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventInfo = getEventTypeInfo();

  // 완료 화면
  if (step === 2) {
    return (
      <>
        <Head>
          <title>{event.event_name} - 부조 완료</title>
        </Head>

        <div
          className="min-h-screen-mobile flex items-center justify-center p-6"
          style={{ background: 'var(--color-background-secondary)' }}
        >
          <div className="w-full max-w-md fade-in">
            <div className="card-toss text-center">
              <div
                className="icon-wrapper icon-primary mx-auto mb-6"
                style={{ width: '80px', height: '80px', fontSize: '40px' }}
              >
                ✅
              </div>

              <h1 className="text-title-1 text-gray-900 mb-4">
                부조가 완료되었습니다
              </h1>
              <p className="text-body-2 text-gray-600 mb-8">
                {formData.contributorName}님의 소중한 마음이
                <br />잘 전달되었습니다.
              </p>

              <div
                className="card-toss"
                style={{
                  background: 'var(--color-gray-50)',
                  border: 'none',
                  marginBottom: '32px',
                }}
              >
                <div className="text-center">
                  <div className="text-caption-1 text-gray-600 mb-2">
                    {eventInfo.amountLabel}
                  </div>
                  <div className="amount-display">
                    {formatAmount(getSelectedAmount())}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => window.close()}
                  className="btn-toss btn-primary w-full"
                >
                  닫기
                </button>

                <div className="divider-toss"></div>

                <div className="text-center">
                  <p className="text-caption-1 text-gray-600 mb-4">
                    더 편리한 부조를 위해
                  </p>
                  <button
                    onClick={() => {
                      window.open(
                        'https://apps.apple.com/app/jeongdam',
                        '_blank'
                      );
                    }}
                    className="btn-toss btn-ghost w-full"
                  >
                    <span className="mr-2">📱</span>
                    정담 앱 다운로드
                  </button>
                </div>
              </div>
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
        <meta
          name="description"
          content={`${event.event_name} 부조를 간편하게 해보세요`}
        />
      </Head>

      <div
        className="min-h-screen-mobile"
        style={{ background: 'var(--color-background-secondary)' }}
      >
        {/* 상단 헤더 */}
        <header className="bg-white shadow-sm safe-area-top">
          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className={`icon-wrapper icon-${eventInfo.theme}`}>
                {eventInfo.icon}
              </div>
              <div className="flex-1">
                <h1 className="text-title-3 text-gray-900">
                  {event.event_name}
                </h1>
                <p className="text-body-2 text-gray-600">{eventInfo.text}</p>
              </div>
            </div>
          </div>
        </header>

        {/* 경조사 상세 정보 */}
        <section className="bg-white border-b border-gray-100">
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-500">📅</span>
                <div>
                  <span className="text-body-1 text-gray-900">
                    {formatDate(event.event_date)}
                  </span>
                  {event.ceremony_time && (
                    <span className="text-body-2 text-gray-600 ml-3">
                      {formatTime(event.ceremony_time)}
                    </span>
                  )}
                </div>
              </div>

              {event.location && (
                <div className="flex items-start gap-3">
                  <span className="text-gray-500 mt-1">📍</span>
                  <div>
                    <div className="text-body-1 text-gray-900">
                      {event.location}
                    </div>
                    {event.detailed_address && (
                      <div className="text-body-2 text-gray-600 mt-1">
                        {event.detailed_address}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 부고 추가 정보 */}
              {event.event_type === 'funeral' && (
                <>
                  {event.funeral_home && (
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">🏥</span>
                      <span className="text-body-1 text-gray-900">
                        {event.funeral_home}
                      </span>
                    </div>
                  )}
                  {(event.primary_contact || event.secondary_contact) && (
                    <div className="flex items-start gap-3">
                      <span className="text-gray-500 mt-1">📞</span>
                      <div className="space-y-1">
                        {event.primary_contact && (
                          <div className="text-body-1 text-gray-900">
                            {event.primary_contact}
                          </div>
                        )}
                        {event.secondary_contact && (
                          <div className="text-body-1 text-gray-900">
                            {event.secondary_contact}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </section>

        {/* 부조 입력 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-8">
          {/* 성함 입력 */}
          <section className="fade-in">
            <label className="block text-title-3 text-gray-900 mb-4">
              성함 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contributorName}
              onChange={e =>
                setFormData({ ...formData, contributorName: e.target.value })
              }
              placeholder="성함을 입력해주세요"
              className="input-toss text-center font-medium"
              style={{ fontSize: '18px' }}
              required
            />
          </section>

          {/* 관계 선택 */}
          {event.family_relations && event.family_relations.length > 0 && (
            <section className="fade-in" style={{ animationDelay: '100ms' }}>
              <label className="block text-title-3 text-gray-900 mb-4">
                관계 (선택사항)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {event.family_relations.map((relation, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, relation })}
                    className={`select-button ${eventInfo.theme} ${
                      formData.relation === relation ? 'selected' : ''
                    }`}
                  >
                    {relation}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, relation: '' })}
                  className={`select-button ${
                    !formData.relation ? 'selected' : ''
                  }`}
                  style={{
                    gridColumn:
                      event.family_relations.length % 2 === 1
                        ? 'span 2'
                        : 'auto',
                  }}
                >
                  선택 안함
                </button>
              </div>
            </section>
          )}

          {/* 부조금 선택 */}
          <section className="fade-in" style={{ animationDelay: '200ms' }}>
            <label className="block text-title-3 text-gray-900 mb-4">
              {eventInfo.amountLabel} <span className="text-red-500">*</span>
            </label>

            {/* 미리 설정된 금액 */}
            {event.preset_amounts && event.preset_amounts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {event.preset_amounts.map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`select-button ${eventInfo.theme} ${
                      !formData.useCustomAmount &&
                      formData.amount === amount.toString()
                        ? 'selected'
                        : ''
                    }`}
                    style={{ minHeight: '64px' }}
                  >
                    <span className="font-bold text-lg">
                      {formatAmount(amount)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 직접 입력 */}
            <div
              className="card-toss"
              style={{
                background: 'var(--color-gray-50)',
                border: '2px solid var(--color-gray-200)',
              }}
            >
              <div className="text-center">
                <label className="block text-body-2 text-gray-600 mb-3">
                  직접 입력
                </label>
                <input
                  type="text"
                  value={
                    formData.customAmount
                      ? formatAmount(parseInt(formData.customAmount))
                      : ''
                  }
                  onChange={e => handleCustomAmountChange(e.target.value)}
                  onFocus={() =>
                    setFormData({
                      ...formData,
                      useCustomAmount: true,
                      amount: '',
                    })
                  }
                  placeholder="금액을 입력하세요"
                  className="input-toss text-center font-bold"
                  style={{
                    fontSize: '20px',
                    background: 'transparent',
                    border: formData.useCustomAmount
                      ? '2px solid var(--color-primary)'
                      : 'none',
                    boxShadow: formData.useCustomAmount
                      ? '0 0 0 3px rgba(49, 130, 246, 0.1)'
                      : 'none',
                  }}
                />
              </div>
            </div>
          </section>

          {/* 메시지 (선택사항) */}
          {event.allow_messages && (
            <section className="fade-in" style={{ animationDelay: '300ms' }}>
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="sendMessage"
                  checked={formData.sendMessage}
                  onChange={e =>
                    setFormData({ ...formData, sendMessage: e.target.checked })
                  }
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label
                  htmlFor="sendMessage"
                  className="text-title-3 text-gray-900"
                >
                  {event.event_type === 'funeral'
                    ? '조문 메시지'
                    : '축하 메시지'}{' '}
                  남기기
                </label>
              </div>

              {formData.sendMessage && (
                <div className="slide-up">
                  <textarea
                    value={formData.message}
                    onChange={e =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    placeholder={
                      event.message_placeholder ||
                      (event.event_type === 'funeral'
                        ? '삼가 고인의 명복을 빕니다.'
                        : '축하합니다!')
                    }
                    rows={3}
                    className="input-toss resize-none"
                  />
                </div>
              )}
            </section>
          )}

          {/* 요약 카드 */}
          <section className="fade-in" style={{ animationDelay: '400ms' }}>
            <div
              className="card-toss"
              style={{
                background: 'linear-gradient(135deg, #3182F6 0%, #6366F1 100%)',
                color: 'white',
                border: 'none',
              }}
            >
              <h3 className="text-title-3 mb-4">
                {event.event_type === 'funeral' ? '조의 내역' : '부조 내역'}
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-body-2 opacity-90">성함</span>
                  <span className="text-body-1 font-medium">
                    {formData.contributorName || '미입력'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-body-2 opacity-90">관계</span>
                  <span className="text-body-1 font-medium">
                    {formData.relation || '선택 안함'}
                  </span>
                </div>
                <div
                  className="divider-toss"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    margin: '16px 0',
                  }}
                ></div>
                <div className="flex justify-between items-center">
                  <span className="text-body-2 opacity-90">
                    {eventInfo.amountLabel}
                  </span>
                  <span
                    className="amount-display"
                    style={{ color: 'white', fontSize: '24px' }}
                  >
                    {getSelectedAmount() > 0
                      ? formatAmount(getSelectedAmount())
                      : '미선택'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={
              !formData.contributorName ||
              getSelectedAmount() < 1000 ||
              submitting
            }
            className={`btn-toss w-full ${
              event.event_type === 'funeral'
                ? 'btn-funeral'
                : event.event_type === 'wedding'
                  ? 'btn-wedding'
                  : 'btn-primary'
            } ${submitting ? 'disabled' : ''}`}
            style={{ minHeight: '64px', fontSize: '18px' }}
          >
            {submitting ? (
              <div className="flex items-center justify-center gap-2">
                <div
                  className="loading-spinner"
                  style={{ width: '20px', height: '20px' }}
                ></div>
                등록 중...
              </div>
            ) : event.event_type === 'funeral' ? (
              '조의 전하기'
            ) : (
              '부조하기'
            )}
          </button>

          {/* 앱 다운로드 유도 */}
          <div className="text-center pt-8">
            <div className="divider-toss"></div>
            <p className="text-body-2 text-gray-600 mb-4">
              더 편리한 경조사 관리를 원하신다면
            </p>
            <button
              type="button"
              onClick={() => {
                window.open('https://apps.apple.com/app/jeongdam', '_blank');
              }}
              className="btn-toss btn-ghost"
            >
              <span className="mr-2">📱</span>
              정담 앱 다운로드
            </button>
          </div>
        </form>

        <div className="safe-area-bottom"></div>
      </div>
    </>
  );
}
