import api from '../lib/api'; // axios 인스턴스를 import 합니다.

// 회원가입
export const signUp = (body) => api.post('/users/signup', body);

/* 1-1 아이디 중복 */
export const checkUsername = (username) =>
  api.get(`/users/id-check?username=${encodeURIComponent(username)}`);

/* 1-2 이메일 중복 */
export const checkEmail = (email) =>
  api.get(`/users/email-check?email=${encodeURIComponent(email)}`);

// 이메일로 아이디 찾기
export const findIdByEmail = (email) =>
  api.get(`/users/find-id?email=${encodeURIComponent(email)}`);

// 로그인
export const login = async (username, password) => {
  try {
    // 서버로부터 받은 전체 응답.
    // 이 응답의 구조는 { success: true, message: "...", data: { ... } } 입니다.
    const response = await api.post('/auth/login', { username, password });

    // 1. 실제 토큰이 들어있는 'data' 객체를 먼저 확인하고 추출합니다.
    if (response && response.data) {
      // 2. data 객체에서 accessToken과 refreshToken을 추출합니다.
      // 이 부분이 핵심적인 수정사항입니다!
      const { accessToken, refreshToken } = response.data;

      if (accessToken && refreshToken) {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        console.log('로그인 성공! 토큰을 로컬 스토리지에 저장했습니다.');
      } else {
        console.error('응답의 data 객체 안에 토큰이 없습니다:', response.data);
      }
    } else {
      // 서버가 성공(200 OK)은 했지만, data 필드가 없는 비정상적인 경우
      console.error('로그인 응답에 data 필드가 없습니다:', response);
    }
    
    return response; 

  } catch (error) {
    console.error('로그인 API 호출 중 에러 발생:', error);
    // 에러 발생 시 상위로 전파하여, 호출한 컴포넌트에서 후속 처리를 할 수 있게 합니다.
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    return;
  }

  try {
    // 1. 메서드를 api.post에서 api.delete로 변경합니다.
    // 2. DELETE 요청 시에는 본문(body)이 없으므로, 두 번째 인자에 바로 config 객체를 전달합니다.
    await api.delete('/auth/logout', {
      headers: {
        'Refresh-Token': refreshToken
      }
    });

    console.log('서버에 DELETE 로그아웃 요청 성공 (헤더 방식)');

  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};