// src/api/notifications.js
// Cloud Run API 베이스를 우선 사용하고, 없으면 현재 오리진 사용
export function startNotificationStream(onEvent, onError) {
    const token = localStorage.getItem('accessToken');

    const base = (import.meta.env?.VITE_API_BASE || window.location.origin);
    const u = new URL('/api/notifications/stream', base);
    if (token) u.searchParams.set('token', token);

    // 절대 URL로 직결 (CORS는 서버에서 허용되어 있음)
    const es = new EventSource(u.toString(), { withCredentials: false });

    es.addEventListener('notification', (e) => {
        try { onEvent?.(JSON.parse(e.data)); } catch (_) {}
    });

    es.onerror = (err) => {
        try { es.close(); } catch {}
        onError?.(err);
        setTimeout(() => startNotificationStream(onEvent, onError), 3000);
    };

    return es;
}
