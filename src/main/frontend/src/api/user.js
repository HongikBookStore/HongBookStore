import { api } from '../lib/api';

// 회원가입
export const signUp = body =>
  api('/api/users/signup', { method: 'POST', body: JSON.stringify(body) });

// 로그인 → 토큰
export const login = async (username, password) => {
  const res = await api(`/api/users/login?username=${username}&password=${password}`, { method: 'POST' });
  localStorage.setItem('jwt', res.data);        // 저장
  return res.data;
};