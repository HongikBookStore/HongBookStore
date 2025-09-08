export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // /api 로 시작하는 요청만 프록시
    if (!url.pathname.startsWith('/api')) {
      return new Response('Not Found', { status: 404 });
    }

    const isGet = request.method === 'GET';
    const hasAuth = request.headers.has('Authorization') || /session|token/i.test(request.headers.get('cookie') || '');

    // 백엔드 오리진(예: http://<GCE_IP>:8080)
    const backendOrigin = env.BACKEND_ORIGIN;
    const backendURL = backendOrigin.replace(/\/$/, '') + url.pathname.replace(/^\/api/, '') + url.search;

    const headers = new Headers(request.headers);
    // Hop-by-hop 제거 및 공유 시크릿 헤더 추가
    headers.delete('host');
    if (env.EDGE_SHARED_SECRET) {
      headers.set('x-edge-key', env.EDGE_SHARED_SECRET);
    }

    const init = {
      method: request.method,
      headers,
      body: isGet ? undefined : await request.arrayBuffer(),
      redirect: 'follow',
    };

    const cache = caches.default;
    const cacheTtl = isGet && !hasAuth ? 300 : 0; // 공개 GET 5분 캐시
    const cacheKey = new Request(request.url, { method: 'GET' });

    if (cacheTtl > 0) {
      const cached = await cache.match(cacheKey);
      if (cached) return cached;
    }

    const resp = await fetch(backendURL, init);
    const respHeaders = new Headers(resp.headers);

    // CORS 기본 설정: Pages 도메인 허용 필요 시 업데이트
    const allowOrigin = env.FRONT_ORIGIN || '*';
    respHeaders.set('Access-Control-Allow-Origin', allowOrigin);
    respHeaders.set('Vary', 'Origin');

    const out = new Response(resp.body, { status: resp.status, headers: respHeaders });
    if (cacheTtl > 0 && resp.ok) {
      out.headers.set('Cache-Control', `public, max-age=${cacheTtl}`);
      ctx.waitUntil(cache.put(cacheKey, out.clone()));
    }
    return out;
  }
};

