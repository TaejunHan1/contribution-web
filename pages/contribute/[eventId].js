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
  formatTime 
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
        if (result.data.family_relations && result.data.family_relations.length > 0) {
          setFormData(prev => ({
            ...prev,
            relation: result.data.family_relations[0]
          }));
        }
      } else {
        toast.error(result.error);
        // 3초 후 에러 페이지로 이동
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

  const handleSubmit = async (e) => {
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
          message_type: event.event_type === 'funeral' ? 'condolence' : 'congratulation',
          is_anonymous: false,
        });
        
        if (!messageResult.success) {
          console.warn('메시지 등록 실패:', messageResult.error);
          // 메시지 실패는 전체 프로세스를 중단하지 않음
        }
      }

      toast.success('부조가 완료되었습니다!', { id: toastId });
      setStep(2); // 완료 단계로 이동
      
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(error.message || '부조 등록에 실패했습니다.', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const getEventTypeText = () => {
    switch (event?.event_type) {
      case 'wedding': return '결혼식';
      case 'funeral': return '부고';
      case 'birthday': return '돌잔치';
      default: return '경조사';
    }
  };

  const getEventIcon = () => {
    switch (event?.event_type) {
      case 'wedding': return '💒';
      case 'funeral': return '🕯️';
      case 'birthday': return '🎂';
      default: return '🎉';
    }
  };

  const getThemeColors = () => {
    switch (event?.event_type) {
      case 'wedding': 
        return {
          primary: 'bg-wedding-600 hover:bg-wedding-700',
          light: 'bg-wedding-50 text-wedding-700',
          border: 'border-wedding-200',
          text: 'text-wedding-600'
        };
      case 'funeral': 
        return {
          primary: 'bg-funeral-700 hover:bg-funeral-800',
          light: 'bg-funeral-50 text-funeral-700',
          border: 'border-funeral-200',
          text: 'text-funeral-600'
        };
      default: 
        return {
          primary: 'bg-primary-600 hover:bg-primary-700',
          light: 'bg-primary-50 text-primary-700',
          border: 'border-primary-200',
          text: 'text-primary-600'
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen-mobile flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">경조사 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen-mobile flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">경조사를 찾을 수 없습니다</h1>
          <p className="text-gray-600 mb-6">유효하지 않은 링크이거나 만료된 경조사입니다.</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const theme = getThemeColors();

  if (step === 2) {
    // 완료 화면
    return (
      <>
        <Head>
          <title>{event.event_name} - 부조 완료</title>
        </Head>
        
        <div className="min-h-screen-mobile bg-gray-50 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-soft p-8 text-center">
              <div className="text-6xl mb-6">✅</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                부조가 완료되었습니다
              </h1>
              <p className="text-gray-600 mb-6">
                {formData.contributorName}님의 소중한 마음이<br />
                잘 전달되었습니다.
              </p>
              
              <div className={`${theme.light} rounded-lg p-4 mb-6`}>
                <div className="text-sm text-gray-600 mb-1">부조금</div>
                <div className="text-xl font-bold">
                  {formatAmount(getSelectedAmount())}
                </div>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => window.close()}
                  className={`w-full ${theme.primary} text-white font-semibold py-4 rounded-lg transition-colors`}
                >
                  닫기
                </button>
                
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">
                    더 편리한 부조를 위해
                  </p>
                  <button
                    onClick={() => {
                      // 앱스토어 링크 (실제 앱 출시 시 변경)
                      window.open('https://apps.apple.com/app/jeongdam', '_blank');
                    }}
                    className="text-primary-600 font-semibold text-sm underline"
                  >
                    📱 정담 앱 다운로드
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
        <meta name="description" content={`${event.event_name} 부조를 간편하게 해보세요`} />
      </Head>
      
      <div className="min-h-screen-mobile bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm safe-top">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getEventIcon()}</span>
              <div>
                <h1 className="font-bold text-gray-900">{event.event_name}</h1>
                <p className="text-sm text-gray-600">{getEventTypeText()}</p>
              </div>
            </div>
          </div>
        </header>

        {/* 경조사 정보 */}
        <section className="bg-white border-b border-gray-100 px-6 py-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📅</span>
              <span className="text-gray-900">
                {formatDate(event.event_date)}
                {event.ceremony_time && (
                  <span className="text-gray-600 ml-2">
                    {formatTime(event.ceremony_time)}
                  </span>
                )}
              </span>
            </div>
            
            {event.location && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">📍</span>
                <div>
                  <div className="text-gray-900">{event.location}</div>
                  {event.detailed_address && (
                    <div className="text-sm text-gray-600">{event.detailed_address}</div>
                  )}
                </div>
              </div>
            )}

            {/* 부고 추가 정보 */}
            {event.event_type === 'funeral' && (
              <>
                {event.funeral_home && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🏥</span>
                    <span className="text-gray-900">{event.funeral_home}</span>
                  </div>
                )}
                {(event.primary_contact || event.secondary_contact) && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📞</span>
                    <div className="space-y-1">
                      {event.primary_contact && (
                        <div className="text-gray-900">{event.primary_contact}</div>
                      )}
                      {event.secondary_contact && (
                        <div className="text-gray-900">{event.secondary_contact}</div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* 부조 입력 폼 */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          
          {/* 성함 입력 */}
          <section>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              성함 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.contributorName}
              onChange={(e) => setFormData({ ...formData, contributorName: e.target.value })}
              placeholder="성함을 입력해주세요"
              className="input-field text-center text-lg font-semibold"
              required
            />
          </section>

          {/* 관계 선택 */}
          {event.family_relations && event.family_relations.length > 0 && (
            <section>
              <label className="block text-sm font-semibold text-gray-900 mb-3">
                관계 (선택사항)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {event.family_relations.map((relation, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData({ ...formData, relation })}
                    className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                      formData.relation === relation
                        ? `${theme.primary.replace('hover:', '')} text-white border-transparent`
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {relation}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, relation: '' })}
                  className={`py-3 px-4 rounded-lg border-2 font-medium transition-colors ${
                    !formData.relation
                      ? 'bg-gray-500 text-white border-transparent'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  선택 안함
                </button>
              </div>
            </section>
          )}

          {/* 부조금 선택 */}
          <section>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              {event.event_type === 'funeral' ? '조의금' : '부조금'} <span className="text-red-500">*</span>
            </label>
            
            {/* 미리 설정된 금액 */}
            {event.preset_amounts && event.preset_amounts.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {event.preset_amounts.map((amount, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleAmountSelect(amount)}
                    className={`py-4 px-4 rounded-lg border-2 font-semibold transition-colors ${
                      !formData.useCustomAmount && formData.amount === amount.toString()
                        ? `${theme.primary.replace('hover:', '')} text-white border-transparent`
                        : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {formatAmount(amount)}
                  </button>
                ))}
              </div>
            )}

            {/* 직접 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                직접 입력
              </label>
              <input
                type="text"
                value={formData.customAmount ? formatAmount(parseInt(formData.customAmount)) : ''}
                onChange={(e) => handleCustomAmountChange(e.target.value)}
                onFocus={() => setFormData({ ...formData, useCustomAmount: true, amount: '' })}
                placeholder="금액을 입력하세요"
                className={`input-field text-center text-lg font-semibold ${
                  formData.useCustomAmount ? 'ring-2 ring-primary-500 border-transparent' : ''
                }`}
              />
            </div>
          </section>

          {/* 메시지 (선택사항) */}
          {event.allow_messages && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <input
                  type="checkbox"
                  id="sendMessage"
                  checked={formData.sendMessage}
                  onChange={(e) => setFormData({ ...formData, sendMessage: e.target.checked })}
                  className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <label htmlFor="sendMessage" className="text-sm font-semibold text-gray-900">
                  {event.event_type === 'funeral' ? '조문 메시지' : '축하 메시지'} 남기기
                </label>
              </div>
              
              {formData.sendMessage && (
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={event.message_placeholder || (event.event_type === 'funeral' ? '삼가 고인의 명복을 빕니다.' : '축하합니다!')}
                  rows={3}
                  className="input-field resize-none"
                />
              )}
            </section>
          )}

          {/* 요약 */}
          <section className={`${theme.light} rounded-lg p-4`}>
            <h3 className="font-semibold text-gray-900 mb-3">
              {event.event_type === 'funeral' ? '조의 내역' : '부조 내역'}
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">성함</span>
                <span className="font-medium">{formData.contributorName || '미입력'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">관계</span>
                <span className="font-medium">{formData.relation || '선택 안함'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">
                  {event.event_type === 'funeral' ? '조의금' : '부조금'}
                </span>
                <span className="font-bold text-lg">
                  {getSelectedAmount() > 0 ? formatAmount(getSelectedAmount()) : '미선택'}
                </span>
              </div>
            </div>
          </section>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={!formData.contributorName || getSelectedAmount() < 1000 || submitting}
            className={`w-full ${theme.primary} text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              submitting ? 'btn-loading' : ''
            }`}
          >
            {submitting ? '등록 중...' : (event.event_type === 'funeral' ? '조의 전하기' : '부조하기')}
          </button>

          {/* 앱 다운로드 유도 */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-2">
              더 편리한 경조사 관리를 원하신다면
            </p>
            <button
              type="button"
              onClick={() => {
                window.open('https://apps.apple.com/app/jeongdam', '_blank');
              }}
              className="text-primary-600 font-semibold text-sm underline"
            >
              📱 정담 앱 다운로드
            </button>
          </div>
        </form>

        <div className="safe-bottom"></div>
      </div>
    </>
  );
}