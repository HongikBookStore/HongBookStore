import api from '../lib/api';

// 회원가입
export const signUp = (body) => api.post('/users/signup', body);

// 아이디 중복 확인
export const checkUsername = (username) =>
  api.get(`/users/id-check?username=${encodeURIComponent(username)}`);

// 이메일 중복 확인
export const checkEmail = (email) =>
  api.get(`/users/email-check?email=${encodeURIComponent(email)}`);

// 이메일로 아이디 찾기
export const findIdByEmail = (email) =>
  api.get(`/users/find-id?email=${encodeURIComponent(email)}`);

// 일반 로그인
// 성공 시 토큰 객체를 반환하여 Context가 상태를 관리
export const login = async (username, password) => {
  try {
    const response = await api.post('/auth/login', { username, password });

    // 백엔드 응답이 { success: true, data: { accessToken, ... } } 구조로 옵니다.
    // axios는 실제 응답 데이터를 response.data에 담아줍니다.
    if (response && response.success) {
      // 성공 시, 토큰이 담긴 data 객체를 반환합니다.
      return response.data; // { accessToken, refreshToken }
    } else {
      // API 호출은 성공했지만, 백엔드에서 실패 응답을 보낸 경우
      throw new Error(response.message || '아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  } catch (error) {
    console.error('로그인 API 호출 중 에러 발생:', error);
    // 컴포넌트에서 에러 메시지를 표시할 수 있도록 에러를 다시 던집니다.
    throw error;
  }
};

// 내 정보 조회 (토큰 기반)
// 소셜 로그인 성공 후, 또는 페이지 새로고침 시 사용자 정보를 가져올 때 사용됩니다.
export const getMyInfo = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return Promise.reject(new Error('인증 토큰이 없습니다.'));
  }

  try {
    // api 인스턴스에 이미 헤더 설정이 되어있다면, 아래 headers 부분은 생략 가능합니다.
    // 하지만 명시적으로 적어주는 것이 안전합니다.
    const response = await api.get('/users/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // 백엔드 응답이 { success: true, data: { username, email } } 구조로 옵니다.
    if (response && response.success) {
      return response.data; // 성공 시 사용자 정보 객체 반환
    } else {
      throw new Error(response.message || '내 정보 조회에 실패했습니다.');
    }
  } catch (error) {
    console.error('내 정보 조회 API 호출 실패:', error);
    throw error;
  }
};

// 로그아웃
export const logout = async () => {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    if (refreshToken) {
      await api.post('/auth/logout', {
        headers: {
          'Refresh-Token': refreshToken
        }
      });
      console.log('서버에 로그아웃 요청을 성공적으로 보냈습니다.');
    }
  } catch (error) {
    console.error('서버 로그아웃 요청 실패:', error);
  } finally {
    // 서버 요청의 성공/실패 여부와 관계없이 로컬 스토리지의 토큰들은 반드시 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // 사용자 정보도 함께 삭제
    console.log('로컬 스토리지의 토큰과 사용자 정보를 모두 삭제했습니다.');
  }
};