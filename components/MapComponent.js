// components/GoogleMapEmbed.js - 구글 지도 임베드 컴포넌트
const GoogleMapEmbed = ({ address, venueName, width = "100%", height = "300px" }) => {
  // 전달받은 주소 또는 기본 주소 사용
  const fullAddress = address || '서울시 중구 소공로 119';
  
  // 주소에서 불필요한 정보 제거 함수 (호수, 층수, 세부 위치 등)
  const cleanAddress = (addr) => {
    // 한국 주소 패턴 분석: 시도 구군 도로명 건물번호까지만 남기기
    let cleaned = addr
      // 호수 제거 (숫자+호, 영문+숫자+호)
      .replace(/\s+[A-Z]?\d+호\b/g, '') 
      .replace(/\s+\d+호\b/g, '') 
      // 층수 제거 (숫자+층, B+숫자)
      .replace(/\s+\d+층\b/g, '') 
      .replace(/\s+B\d+\b/g, '') 
      // 층수 + 기타 (3층매점, 2층카페 등)
      .replace(/\s+\d+층[가-힣]+/g, '') 
      .replace(/\s+B\d+[가-힣]+/g, '') 
      // 상호명이나 기타 세부사항 제거
      .replace(/\s+[가-힣]{2,}\s*$/g, '') // 끝에 있는 한글 상호명
      .replace(/\s{2,}/g, ' ') // 여러 공백 정리
      .trim();
    
    return cleaned;
  };
  
  // 정제된 주소만 사용 (venueName 사용하지 않음)
  const cleanedAddress = cleanAddress(fullAddress);
  const searchQuery = encodeURIComponent(cleanedAddress);
  
  // Google Maps Embed API URL (정확한 위치 표시)
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
  // API key 확인 (에러는 조용히 처리)
  
  // API key 문제 시 fallback URL 사용
  const mapUrl = apiKey 
    ? `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${searchQuery}&zoom=16&maptype=roadmap&language=ko&region=KR`
    : `https://www.google.com/maps?q=${searchQuery}&output=embed&hl=ko`;
  
  // 각 지도 앱으로 연결하는 함수들
  const openNaverMap = () => {
    const naverUrl = `https://map.naver.com/v5/search/${searchQuery}`;
    window.open(naverUrl, '_blank');
  };
  
  const openTmap = () => {
    // T맵 웹 검색 URL - 정제된 주소 사용
    const tmapWebUrl = `https://www.tmap.co.kr/tmap2/mobile/route.jsp?name=${searchQuery}`;
    
    // 모바일에서는 앱 스토어로, PC에서는 웹으로
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // 모바일에서는 앱 스토어로 이동
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      if (isIOS) {
        window.open('https://apps.apple.com/kr/app/t-map/id431589174', '_blank');
      } else {
        window.open('https://play.google.com/store/apps/details?id=com.skt.tmap.ku', '_blank');
      }
    } else {
      // PC에서는 웹 버전으로
      window.open(tmapWebUrl, '_blank');
    }
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
            fontWeight: '500',
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
            fontWeight: '500',
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