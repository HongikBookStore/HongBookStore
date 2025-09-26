// src/api/notifications.js
// Cloud Run 직결 + base 정규화 + 전역 WS 호스트 폴백 + 단일 연결

let _es = null;          // 단일 SSE 연결
let _retryTimer = null;  // 재연결 타이머

export function startNotificationStream(onEvent, onError) {
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

    // ChatRoom에서 심어둔 WS 호스트 재활용 (ws/wss → http/https)
    const hostFromGlobal =
        (typeof window !== 'undefined' && window.__HBS_BACKEND_HOST__)
            ? ((window.location.protocol === 'https:' ? 'https:' : 'http:') + '//' + window.__HBS_BACKEND_HOST__)
            : null;

    // 우선순위: API_BASE > BACKEND_ORIGIN > WS_BASE(스킴 전환) > 전역 host > (로컬) localhost
    const candidates = [
        env.VITE_API_BASE,
        env.VITE_BACKEND_ORIGIN,
        env.VITE_WS_BASE,
        hostFromGlobal,
        isLocal ? 'http://localhost:8080' : null,
    ].filter(Boolean);

    let httpOrigin = null;
    for (const raw of candidates) {
        try {
            const u = new URL(raw, typeof window !== 'undefined' ? window.location.origin : 'https://example.com');
            if (u.protocol === 'ws:' || u.protocol === 'wss:') {
                u.protocol = (typeof window !== 'undefined' && window.location.protocol === 'https:') ? 'https:' : 'http:';
            }
            httpOrigin = `${u.protocol}//${u.host}`; // host만 사용
            break;
        } catch { /* 다음 후보 */ }
    }

    if (!httpOrigin) {
        if (isVercel) {
            console.error('[SSE] No backend origin. Set VITE_API_BASE to your Cloud Run host.');
            return null;
        }
        httpOrigin = window.location.origin;
    }

    const streamUrl =
        `${httpOrigin.replace(/\/+$/, '')}/api/notifications/stream` +
        (token ? `?token=${encodeURIComponent(token)}` : '');

    try { console.log('[SSE] origin:', httpOrigin, 'url:', streamUrl); } catch {}

    try {
        _es = new EventSource(streamUrl, { withCredentials: false });
    } catch (err) {
        console.error('[SSE] create failed:', err);
        onError?.(err);
        return null;
    }

    _es.addEventListener('open', () => console.log('[SSE] opened'));

    _es.addEventListener('notification', (e) => {
        try { onEvent?.(JSON.parse(e.data)); }
        catch { onEvent?.(e.data); }
    });

    _es.onmessage = (e) => {
        try { onEvent?.(JSON.parse(e.data)); }
        catch { onEvent?.(e.data); }
    };

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
