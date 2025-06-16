import { api } from '../lib/api';

// 회원가입
export const signUp = body =>
  api('/api/users/signup', { method: 'POST', body: JSON.stringify(body) });

/* 1-1 아이디 중복 */
export const checkUsername = (username) =>
    api(`/api/users/id-check?username=${encodeURIComponent(username)}`);  // { available: true|false }

/* 1-2 이메일 중복 */
export const checkEmail = (email) =>
    api(`/api/users/email-check?email=${encodeURIComponent(email)}`);     // { available: true|false }

// 이메일로 아이디 찾기
export const findIdByEmail = email =>
  api(`/api/users/find-id?email=${encodeURIComponent(email)}`);


// 로그인 → 토큰
export const login = async (username, password) => {
  const res = await api(
      `/api/users/login?username=${username}&password=${password}`,
      { method: 'POST' }
  );
  localStorage.setItem('jwt', res.data);        // 저장
  return res.data;
};