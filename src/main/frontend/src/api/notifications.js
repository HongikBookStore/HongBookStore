// src/api/notifications.js
// SSE 스트림을 열고 'notification' 이벤트를 수신합니다.
// 서버는 /api/notifications/stream?token=<JWT> 형태로 접속합니다.
export function startNotificationStream(onEvent, onError) {
    const token = localStorage.getItem('accessToken');
    const url = token
        ? `/api/notifications/stream?token=${encodeURIComponent(token)}`
        : `/api/notifications/stream`;

    const es = new EventSource(url, { withCredentials: false });

    es.addEventListener('notification', (e) => {
        try {
            const data = JSON.parse(e.data);
            onEvent && onEvent(data);
        } catch (err) {
            console.error('Failed to parse SSE notification:', err);
        }
    });

    es.onerror = (err) => {
        console.warn('SSE disconnected. Will retry in 3s.', err);
        try { es.close(); } catch {}
        onError && onError(err);
        setTimeout(() => startNotificationStream(onEvent, onError), 3000);
    };

    return es;
}
