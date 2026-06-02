// components/GoogleMapEmbed.js - 구글 지도 임베드 컴포넌트
const GoogleMapEmbed = ({
  address,
  venueName,
  width = "100%",
  height = "300px",
  showDirections = true,
}) => {
  const normalizeMapText = (value) => {
    const words = String(value || '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .filter(Boolean);

    if (words.length <= 1) return words.join(' ');

    const output = [];
    for (let i = 0; i < words.length; i += 1) {
      let repeated = false;
      const maxSize = Math.min(10, output.length, words.length - i);

      for (let size = maxSize; size >= 2; size -= 1) {
        const previous = output.slice(output.length - size).join(' ');
        const current = words.slice(i, i + size).join(' ');
        if (previous === current) {
          i += size - 1;
          repeated = true;
          break;
        }
      }

      if (!repeated) output.push(words[i]);
    }

    return output.join(' ').trim();
  };

  // 전달받은 주소 또는 기본 주소 사용
  const fullAddress = normalizeMapText(address || '서울시 중구 소공로 119');
  const cleanedVenueName = normalizeMapText(venueName);

  // 도로명주소만 추출한다. 예: "부산 해운대구 센텀1로 17 단독홀" -> "센텀1로 17"
  const extractRoadAddress = (addr) => {
    const withoutDetail = addr
      .replace(/\s+\d+\s*층.*$/g, '')
      .replace(/\s+B\d+\b.*$/g, '')
      .replace(/\s+\d+\s*호.*$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const roadMatch = withoutDetail.match(/([가-힣A-Za-z0-9·.-]+(?:로|길)\s*\d+(?:-\d+)?)/);
    if (roadMatch) return roadMatch[1].replace(/\s{2,}/g, ' ').trim();

    return withoutDetail;
  };

  const cleanedAddress = extractRoadAddress(fullAddress);
  const searchQuery = encodeURIComponent(cleanedAddress);
  const venueLooksLikeAddress = /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주|로\b|길\b|\d)/.test(cleanedVenueName);
  const shouldUseVenueName =
    cleanedVenueName
    && !venueLooksLikeAddress
    && !cleanedAddress.includes(cleanedVenueName);
  const embedSearchText = shouldUseVenueName
    ? `${cleanedVenueName} ${cleanedAddress}`.trim()
    : cleanedAddress;
  const embedQuery = encodeURIComponent(embedSearchText);
  
  // Google Maps Embed API URL (정확한 위치 표시)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // API key 확인 (에러는 조용히 처리)
  
  // API key 문제 시 fallback URL 사용
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${embedQuery}&zoom=15&maptype=roadmap&language=ko&region=KR`
    : `https://www.google.com/maps?q=${embedQuery}&output=embed&hl=ko&z=15`;

  const openMap = (appUrl, fallbackUrl) => {
    const startedAt = Date.now();
    window.location.href = appUrl;

    setTimeout(() => {
      if (document.visibilityState === 'visible' && Date.now() - startedAt < 1800) {
        window.location.href = fallbackUrl;
      }
    }, 1200);
  };

  const openNaverApp = () => {
    openMap(
      `nmap://search?query=${searchQuery}&appname=com.gyeongjo.app`,
      `https://map.naver.com/p/search/${searchQuery}`
    );
  };

  const openKakaoApp = () => {
    openMap(
      `kakaomap://search?q=${searchQuery}`,
      `https://map.kakao.com/?q=${searchQuery}`
    );
  };

  const openTmapApp = () => {
    openMap(
      `tmap://search?name=${searchQuery}`,
      `https://www.tmap.co.kr/search?searchKeyword=${searchQuery}`
    );
  };

  const btnStyle = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '14px 12px',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #dee2e6',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    minWidth: 0,
  };
  const iconStyle = { width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' };
  const kakaoIconStyle = {
    ...iconStyle,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FEE500',
    color: '#191919',
    fontSize: '11px',
    fontWeight: '800',
    lineHeight: '22px',
  };

  return (
    <div style={{ width }}>
      {/* 지도 영역 */}
      <div style={{ 
        width: '100%',
        height,
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: showDirections ? '16px' : 0
      }}>
        <iframe
          width="100%"
          height="100%"
          frameBorder="0"
          style={{ border: 0 }}
          src={mapUrl}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Location Map"
          onError={(e) => {
            // fallback으로 일반 Google Maps URL 사용
            e.target.src = `https://www.google.com/maps?q=${searchQuery}&output=embed&hl=ko&z=15`;
          }}
        />
      </div>
      
      {/* 지도 앱 연결 버튼들 */}
      {showDirections && (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={openNaverApp} style={btnStyle}>
            <img src="/naver.png" alt="네이버지도" style={iconStyle} />
            <span>네이버지도</span>
          </button>
          <button type="button" onClick={openKakaoApp} style={btnStyle}>
            <span aria-hidden="true" style={kakaoIconStyle}>K</span>
            <span>카카오맵</span>
          </button>
          <button type="button" onClick={openTmapApp} style={btnStyle}>
            <img src="/tmap.jpeg" alt="T맵" style={iconStyle} />
            <span>T맵</span>
          </button>
        </div>

      </div>
      )}
    </div>
  );
};

export default GoogleMapEmbed;
