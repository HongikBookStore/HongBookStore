import api from '../lib/api';

/**
 * 현재 로그인한 사용자의 정보를 서버에서 가져옵니다.
 * 페이지 새로고침이나 마이페이지 접근 시 사용됩니다.
 */
export const getMyInfo = async () => {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) {
    return Promise.reject(new Error('인증 토큰이 없습니다.'));
  }

  try {
    const response = await api.get('/my/profile');

    // 백엔드 응답이 { success: true, data: { username, email } } 구조로 옵니다.
    // api 인터셉터에서 이미 response.data를 반환하므로 response가 실제 응답 데이터입니다.
    if (response && response.success) {
      return response.data; // 성공 시 사용자 정보 객체 반환
    } else {
      throw new Error(response?.message || '내 정보 조회에 실패했습니다.');
    }
  } catch (error) {
    console.error('내 정보 조회 API 호출 실패:', error);
    // 여기서 에러를 다시 던져서, 이 함수를 호출한 컴포넌트(예: MyPage)에서 에러 상황(ex: 로그인 페이지로 리다이렉트)을 처리
    throw error;
  }
};

/**
 * 현재 로그인된 계정을 탈퇴
 * 소셜 로그인 환경이므로 비밀번호 확인 절차는 제거
 * (실제 서비스라면 '탈퇴' 버튼을 누르면 경고 모달을 한 번 더 띄워주는 것이 좋습니다.)
 */
export const deleteAccount = async () => {
  try {
    // 비밀번호 없이, 현재 로그인한 유저의 토큰을 기반으로 탈퇴를 요청
    const response = await api.delete('/my/profile');

    if (response && response.success) {
      return response.data;
    } else {
      throw new Error(response?.message || '계정 탈퇴에 실패했습니다.');
    }
  } catch (error) {
    console.error('계정 탈퇴 API 호출 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃을 처리
 * 서버에 현재 Token을 보내 블랙리스트 처리를 요청
 * 로컬 스토리지에서 모든 인증 정보를 삭제
 */
export const logout = async () => {
  const accessToken = localStorage.getItem('accessToken');

  try {
    // 서버에 로그아웃 요청 시, Authorization 헤더에 Access Token을 보내야 합니다.
    // (api 인스턴스에 인터셉터가 설정되어 있다면 자동으로 처리됩니다.)
    if (accessToken) {
      await api.post('/auth/logout'); // 우리 백엔드 API는 헤더의 토큰을 읽음
      console.log('서버에 로그아웃(토큰 만료) 요청을 보냈습니다.');
    }
  } catch (error) {
    // 서버 요청이 실패하더라도 클라이언트의 로그아웃은 진행
    console.error('서버 로그아웃 요청 실패:', error);
  } finally {
    // 서버 요청의 성공/실패 여부와 관계없이 로컬 스토리지의 토큰들은 반드시 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user'); // 사용자 정보도 함께 삭제
    console.log('로컬 스토리지의 토큰과 사용자 정보를 모두 삭제했습니다.');

    // 로그아웃 후 로그인 페이지로 이동시키는 것이 일반적
    window.location.href = '/login'; 
  }
};