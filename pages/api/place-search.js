const normalizeQuery = value => String(value || '').replace(/\s+/g, ' ').trim();

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  const query = normalizeQuery(req.query.query);
  if (query.length < 2) {
    return res.status(400).json({
      success: false,
      error: '검색어를 2글자 이상 입력해주세요.',
    });
  }

  const kakaoRestApiKey =
    process.env.KAKAO_REST_API_KEY || process.env.NEXT_PUBLIC_KAKAO_REST_API_KEY;

  if (!kakaoRestApiKey) {
    return res.status(500).json({
      success: false,
      error: '카카오 장소 검색 API 키가 설정되지 않았습니다.',
    });
  }

  try {
    const searchParams = new URLSearchParams({
      query,
      size: '10',
      sort: 'accuracy',
    });

    const response = await fetch(
      `https://dapi.kakao.com/v2/local/search/keyword.json?${searchParams.toString()}`,
      {
        headers: {
          Authorization: `KakaoAK ${kakaoRestApiKey}`,
        },
      }
    );
    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: result?.message || '장소 검색에 실패했습니다.',
      });
    }

    return res.status(200).json({
      success: true,
      data: (result.documents || []).map(place => ({
        id: place.id,
        name: place.place_name,
        category: place.category_name,
        roadAddress: place.road_address_name,
        address: place.address_name,
        phone: place.phone,
        placeUrl: place.place_url,
        x: place.x,
        y: place.y,
      })),
    });
  } catch (error) {
    console.error('장소 검색 API 오류:', error);
    return res.status(500).json({
      success: false,
      error: '장소 검색 중 오류가 발생했습니다.',
    });
  }
}
