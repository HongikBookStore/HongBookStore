// src/api/notifications.js
// SSE 스트림을 Cloud Run에 "직결" + base 정규화(https 고정, host만 사용, 예외 폴백)

export function startNotificationStream(onEvent, onError) {
    const token =
        localStorage.getItem('accessToken') ||
        localStorage.getItem('jwt') ||
        localStorage.getItem('token');

    // 1) 원시 base를 읽고
    const rawBase = (import.meta.env && import.meta.env.VITE_API_BASE) || window.location.origin;

    // 2) 안전하게 http(s) + host만 남기기
    let httpOrigin;
    try {
        const u = new URL(rawBase, window.location.origin); // rawBase가 상대/빈값이어도 보정
        // ws/wss로 들어오면 http/https로 강제 전환 (페이지 스킴에 맞춤)
        if (u.protocol === 'ws:' || u.protocol === 'wss:') {
            u.protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
        }
        // path/쿼리는 버리고 "origin"만 사용
        httpOrigin = `${u.protocol}//${u.host}`;
    } catch {
        // 그래도 실패하면 현재 오리진으로 폴백
        httpOrigin = window.location.origin;
    }

    // 3) 최종 SSE URL
    const streamUrl =
        `${httpOrigin}/api/notifications/stream` +
        (token ? `?token=${encodeURIComponent(token)}` : '');

    // 4) EventSource 생성 (예외가 앱 전체를 죽이지 않도록 try/catch)
    let es;
    try {
        es = new EventSource(streamUrl, { withCredentials: false });
    } catch (err) {
        console.error('[SSE] create failed:', err);
        onError?.(err);
        return null;
    }

    // 서버가 "notification" 이벤트 타입을 쏘는 경우
    es.addEventListener('notification', (e) => {
        try {
            onEvent?.(JSON.parse(e.data));
        } catch {
            onEvent?.(e.data);
        }
    });

    // 기본 message도 케이스에 따라 처리
    es.onmessage = (e) => {
        try {
            const data = JSON.parse(e.data);
            onEvent?.(data);
        } catch {
            onEvent?.(e.data);
        }
    };

    es.onerror = (err) => {
        console.warn('[SSE] error -> reconnect in 3s', err);
        try { es.close(); } catch {}
        onError?.(err);
        setTimeout(() => startNotificationStream(onEvent, onError), 3000);
    };

    return es;
}
