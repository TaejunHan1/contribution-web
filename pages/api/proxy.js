// 프록시를 통해 템플릿 페이지를 가져오는 API
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('프록시 요청:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'ko-KR,ko;q=0.8,en-US;q=0.5,en;q=0.3',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    let html = await response.text();
    
    // HTML을 수정하여 iframe에서 작동하도록 조정
    html = html.replace(/<head>/gi, `<head>
      <base href="${new URL(url).origin}/">
      <style>
        body { 
          margin: 0; 
          padding: 0; 
          transform: scale(0.8); 
          transform-origin: top left; 
          width: 125%; 
          height: 125%; 
        }
        .container { max-width: none !important; }
        * { pointer-events: none !important; }
      </style>`);
    
    // X-Frame-Options 헤더 제거를 위한 메타 태그 추가
    html = html.replace(/<meta[^>]*http-equiv[^>]*>/gi, '');
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5분 캐시
    res.setHeader('X-Frame-Options', 'ALLOWALL');
    res.setHeader('Content-Security-Policy', '');
    
    console.log('프록시 성공');
    return res.send(html);
    
  } catch (error) {
    console.error('Proxy error:', error);
    
    // 에러 시 기본 HTML 반환
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, sans-serif;
              background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%);
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              text-align: center;
            }
            .container {
              background: white;
              padding: 40px 30px;
              border-radius: 20px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              max-width: 300px;
            }
            .emoji { font-size: 48px; margin-bottom: 20px; }
            h1 { color: #1f2937; margin: 0 0 10px 0; font-size: 24px; }
            p { color: #6b7280; margin: 0 0 20px 0; font-size: 16px; }
            .qr { 
              width: 100px; 
              height: 100px; 
              background: #1f2937; 
              margin: 20px auto; 
              border-radius: 10px; 
              position: relative;
            }
            .qr::before {
              content: '';
              position: absolute;
              top: 10px;
              left: 10px;
              right: 10px;
              bottom: 10px;
              background: white;
              border-radius: 5px;
            }
            .btn {
              background: #f472b6;
              color: white;
              padding: 12px 24px;
              border: none;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 600;
              margin: 5px;
              display: block;
              width: 100%;
              box-sizing: border-box;
            }
            .btn.blue { background: #3b82f6; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="emoji">💒</div>
            <h1>김민호 ♥ 이지은</h1>
            <p>2025년 3월 15일 (토) 오후 2시</p>
            <div class="qr"></div>
            <p style="font-size: 12px; color: #9ca3af;">QR 스캔하여 참여</p>
            <button class="btn">💝 부조금 기록하기</button>
            <button class="btn blue">💌 축하메시지 남기기</button>
          </div>
        </body>
      </html>
    `;
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(fallbackHtml);
  }
}