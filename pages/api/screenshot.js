// Next.js API Route for taking screenshots of websites
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  try {
    console.log('스크린샷 요청:', url);
    
    // Microlink.io API 시도 (가장 안정적)
    const screenshotUrl = `https://api.microlink.io/?url=${encodeURIComponent(url)}&screenshot=true&meta=false&viewport.width=375&viewport.height=667&waitFor=2000`;
    
    console.log('스크린샷 API URL:', screenshotUrl);
    
    const response = await fetch(screenshotUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      
      if (data.status === 'success' && data.data && data.data.screenshot && data.data.screenshot.url) {
        // 스크린샷 이미지 URL에서 실제 이미지 가져오기
        const imageResponse = await fetch(data.data.screenshot.url);
        
        if (imageResponse.ok) {
          const imageBuffer = await imageResponse.buffer();
          
          res.setHeader('Content-Type', 'image/png');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.setHeader('Access-Control-Allow-Origin', '*');
          
          console.log('스크린샷 성공');
          return res.send(imageBuffer);
        }
      }
    }
    
    console.log('Microlink API 실패, 응답:', await response.text());
    throw new Error(`Screenshot API failed: ${response.status}`);
    
  } catch (error) {
    console.error('Screenshot error:', error);
    
    // 에러 발생 시 기본 PNG 이미지 반환 (Base64 encoded)
    const fallbackPngBase64 = "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";
    const buffer = Buffer.from(fallbackPngBase64, 'base64');
    
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-cache');
    return res.send(buffer);
  }
}