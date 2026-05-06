// components/GoogleMapEmbed.js - 구글 지도 임베드 컴포넌트
const GoogleMapEmbed = ({ address, venueName, width = "100%", height = "300px" }) => {
  // 전달받은 주소 또는 기본 주소 사용
  const fullAddress = address || '서울시 중구 소공로 119';
  
  // 도로명주소만 추출 (시/도 이후 부분, 중복 제거)
  const extractRoadAddress = (addr) => {
    const regionPattern = /(서울|부산|대구|인천|광주|대전|울산|세종|경기|강원|충북|충남|전북|전남|경북|경남|제주)/g;
    const matches = [...addr.matchAll(regionPattern)];
    if (matches.length === 0) {
      return addr.replace(/\s+\d+층\b.*/g, '').replace(/\s+\d+호\b.*/g, '').trim();
    }
    // 첫 번째 시도명부터 시작, 두 번째 시도명 직전까지만 사용 (중복 방지)
    const startIdx = matches[0].index;
    let roadAddr = matches.length > 1
      ? addr.slice(startIdx, matches[1].index).trim()
      : addr.slice(startIdx);
    roadAddr = roadAddr
      .replace(/\s+\d+층\b.*/g, '')
      .replace(/\s+B\d+\b.*/g, '')
      .replace(/\s+\d+호\b.*/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
    return roadAddr;
  };

  const cleanedAddress = extractRoadAddress(fullAddress);
  const searchQuery = encodeURIComponent(cleanedAddress);
  // 지도 임베드에는 전체 주소 사용 (venueName 포함)
  const embedQuery = encodeURIComponent(venueName ? `${venueName} ${cleanedAddress}` : cleanedAddress);
  
  // Google Maps Embed API URL (정확한 위치 표시)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // API key 확인 (에러는 조용히 처리)
  
  // API key 문제 시 fallback URL 사용
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${embedQuery}&zoom=16&maptype=roadmap&language=ko&region=KR`
    : `https://www.google.com/maps?q=${embedQuery}&output=embed&hl=ko`;

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
  };
  const iconStyle = { width: '22px', height: '22px', objectFit: 'contain', borderRadius: '4px' };

  return (
    <div style={{ width }}>
      {/* 지도 영역 */}
      <div style={{ 
        width: '100%',
        height,
        borderRadius: '15px',
        overflow: 'hidden',
        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
        marginBottom: '16px'
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
            e.target.src = `https://www.google.com/maps?q=${searchQuery}&output=embed&hl=ko`;
          }}
        />
      </div>
      
      {/* 지도 앱 연결 버튼들 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={openNaverApp} style={btnStyle}>
            <img src="/naver.png" alt="네이버지도" style={iconStyle} />
            <span>네이버지도</span>
          </button>
          <button type="button" onClick={openTmapApp} style={btnStyle}>
            <img src="/tmap.jpeg" alt="T맵" style={iconStyle} />
            <span>T맵</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default GoogleMapEmbed;
