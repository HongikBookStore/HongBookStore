const BASE = 'http://localhost:8080';

export async function api(path, opt = {}) {
  const token = localStorage.getItem('jwt');

  const res = await fetch(`${BASE}${path}`, {
    ...opt,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...opt.headers // 컴포넌트에서 추가한 헤더 덮어쓰지 않도록
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('jwt');
    window.location.href = '/login';
    throw new Error('unauthorized');
  }
  if (!res.ok) throw await res.json();
  return res.json();
}