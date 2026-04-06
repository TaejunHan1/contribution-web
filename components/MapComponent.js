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

  // 앱 딥링크 시도 후 웹으로 fallback
  const tryOpenApp = (appUrl, webUrl) => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) {
      window.open(webUrl, '_blank');
      return;
    }
    const start = Date.now();
    window.location.href = appUrl;
    setTimeout(() => {
      if (Date.now() - start < 2500) {
        window.location.href = webUrl;
      }
    }, 1500);
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

  // 각 지도 앱으로 연결하는 함수들
  const openNaverMap = () => {
    const appUrl = `nmap://search?query=${searchQuery}&appname=com.gyeongjo.app`;
    const webUrl = `https://map.naver.com/v5/search/${searchQuery}`;
    tryOpenApp(appUrl, webUrl);
  };

  const openTmap = () => {
    const appUrl = `tmap://search?name=${searchQuery}`;
    const webUrl = `https://tmap.life/${searchQuery}`;
    tryOpenApp(appUrl, webUrl);
  };
  
  const openKakaoMap = () => {
    const kakaoUrl = `https://map.kakao.com/link/search/${searchQuery}`;
    window.open(kakaoUrl, '_blank');
  };
  
  const openGoogleMaps = () => {
    const googleUrl = `https://www.google.com/maps/search/?api=1&query=${searchQuery}`;
    window.open(googleUrl, '_blank');
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
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '12px'
      }}>
        <button
          onClick={openNaverMap}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#03c75a';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ 
            width: '28px', 
            height: '28px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src="/naver.png" 
              alt="네이버지도" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </div>
          <span>네이버지도에서 열기</span>
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#adb5bd' }}>→</div>
        </button>
        
        <button
          onClick={openTmap}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: 'white',
            color: '#333',
            border: '1px solid #dee2e6',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#f8f9fa';
            e.target.style.borderColor = '#1e88e5';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.borderColor = '#dee2e6';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
          }}
        >
          <div style={{ 
            width: '28px', 
            height: '28px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <img 
              src="/tmap.jpeg" 
              alt="T맵" 
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'contain' 
              }} 
            />
          </div>
          <span>T맵에서 열기</span>
          <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#adb5bd' }}>→</div>
        </button>
      </div>
    </div>
  );
};

export default GoogleMapEmbed;