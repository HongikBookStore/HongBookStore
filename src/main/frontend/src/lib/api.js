import axios from 'axios';

// 1. axios 인스턴스 생성 및 기본 URL 설정
const api = axios.create({
  baseURL: 'http://localhost:8080/api',
});

// 2. 요청(Request) 인터셉터
api.interceptors.request.use(
  (config) => {
    // 요청을 보내기 전에 로컬 스토리지에서 토큰을 가져옵니다.
    const token = localStorage.getItem('accessToken');
    if (token) {
      // 토큰이 있으면 Authorization 헤더에 추가합니다.
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 요청 에러가 발생했을 때의 처리
    return Promise.reject(error);
  }
);

// 3. 응답(Response) 인터셉터
api.interceptors.response.use(
  (response) => {
    // 정상 응답이 왔을 때, response.data만 반환하여 사용하기 편하게 합니다.
    return response.data;
  },
  async (error) => {
    // 에러 응답이 왔을 때의 처리
    const { response } = error;

    // 401 Unauthorized 에러 처리: 자동 로그아웃
    if (response && response.status === 401) {
      console.error('인증되지 않은 요청입니다. 자동 로그아웃됩니다.');
      localStorage.removeItem('jwt');
      // 페이지를 새로고침하며 이동하여 모든 상태를 초기화합니다.
      window.location.href = '/login'; 
      // 추가적인 에러 처리를 막기 위해 여기서 Promise를 reject 합니다.
      return Promise.reject(new Error('Unauthorized'));
    }

    // 그 외 다른 에러들은 그대로 reject하여, 호출한 쪽에서 catch로 처리할 수 있게 합니다.
    return Promise.reject(error);
  }
);

export default api;