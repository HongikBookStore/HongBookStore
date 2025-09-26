let _es = null;          // 단일 SSE 연결
let _retryTimer = null;  // 재연결 타이머

export function startNotificationStream(onEvent, onError) {
    // 이미 열려있으면 그대로 반환 (중복 연결 방지)
    if (_es) return _es;

    const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt') ||
        localStorage.getItem('token') || '';

    const env = (import.meta && import.meta.env) ? import.meta.env : {};
    const isLocal =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.port === '5173');
    const isVercel =
        typeof window !== 'undefined' &&
        /\.vercel\.app$/i.test(window.location.hostname);

    // 후보: API_BASE > BACKEND_ORIGIN > WS_BASE(스킴 전환) > (로컬일 때만) 현재 오리진
    const candidates = [
        env.VITE_API_BASE,
        env.VITE_BACKEND_ORIGIN,
        env.VITE_WS_BASE,
        isLocal ? window.location.origin : null, // 배포에서는 vercel 오리진 금지
    ].filter(Boolean);

    // 후보들 중 첫 번째 유효 호스트를 http(s) origin으로 변환
    let httpOrigin = null;
    for (const raw of candidates) {
        try {
            const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
            // ws/wss로 들어오면 http/https로 전환(페이지 스킴 기준)
            if (u.protocol === 'ws:' || u.protocol === 'wss:') {
                u.protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'https:' : 'http:';
            }
            httpOrigin = `${u.protocol}//${u.host}`; // host만 사용
            break;
        } catch { /* 다음 후보 시도 */ }
    }

    // 배포에서 vercel 오리진으로 떨어지지 않도록 차단
    if (!httpOrigin) {
        if (isLocal) {
            httpOrigin = 'http://localhost:8080';
        } else {
            if (isVercel) {
                console.error('[SSE] No backend origin. Set VITE_API_BASE to your Cloud Run host.');
                return null;
            }
            httpOrigin = window.location.origin;
        }
    }

    const streamUrl =
        `${httpOrigin.replace(/\/+$/, '')}/api/notifications/stream` +
        (token ? `?token=${encodeURIComponent(token)}` : '');

    // 디버깅 출력
    try {
        // eslint-disable-next-line no-console
        console.log('[SSE] origin:', httpOrigin, 'url:', streamUrl);
    } catch {}

    // 연결 생성
    try {
        _es = new EventSource(streamUrl, { withCredentials: false });
    } catch (err) {
        console.error('[SSE] create failed:', err);
        onError?.(err);
        return null;
    }

    // 정상 오픈 시 로그
    _es.addEventListener('open', () => {
        // eslint-disable-next-line no-console
        console.log('[SSE] opened');
    });

    // 서버가 event: notification 으로 보낼 때
    _es.addEventListener('notification', (e) => {
        try { onEvent?.(JSON.parse(e.data)); }
        catch { onEvent?.(e.data); }
    });

    // 기본 message도 수신
    _es.onmessage = (e) => {
        try { onEvent?.(JSON.parse(e.data)); }
        catch { onEvent?.(e.data); }
    };

    // 오류 시 재연결(3s), 중복 타이머 방지
    _es.onerror = (err) => {
        console.warn('[SSE] error -> reconnect in 3s', err);
        try { _es.close(); } catch {}
        _es = null;
        if (_retryTimer) clearTimeout(_retryTimer);
        _retryTimer = setTimeout(() => {
            _retryTimer = null;
            startNotificationStream(onEvent, onError);
        }, 3000);
        onError?.(err);
    };

    return _es;
}
