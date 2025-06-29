import React, { useEffect, useContext } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AuthCtx } from '../../contexts/AuthContext'; // 1. 전역 상태 관리를 위한 Context
import { getMyInfo } from '../../api/auth';           // 2. '내 정보 조회' API 함수

/**
 * OAuth2 소셜 로그인 성공 시, 백엔드로부터 리다이렉트되는 컴포넌트입니다.
 * URL에 담겨온 토큰을 처리하고 최종 로그인 절차를 완료합니다.
 */
function OAuth2RedirectHandler() {
  // URL의 쿼리 파라미터(?accessToken=...&refreshToken=...)를 읽기 위한 훅
  const [searchParams] = useSearchParams();
  // 페이지 이동을 위한 훅
  const navigate = useNavigate();
  // 전역 상태에 로그인 정보를 저장하기 위한 Context의 save 함수
  const { save } = useContext(AuthCtx);

  useEffect(() => {
    // 이 컴포넌트가 화면에 렌더링되면 단 한 번만 실행되는 비동기 함수
    const handleLoginRedirect = async () => {
      // 1. URL에서 accessToken과 refreshToken을 추출합니다.
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');

      // 2. accessToken이 있는지 확인합니다. 없다면 비정상적인 접근입니다.
      if (!accessToken) {
        console.error("URL에서 accessToken을 찾을 수 없습니다.");
        navigate('/login', { replace: true, state: { error: "로그인 처리 중 오류가 발생했습니다. (토큰 없음)" } });
        return;
      }

      // 3. 받아온 토큰들을 로컬 스토리지에 즉시 저장합니다.
      //    이렇게 해야 getMyInfo() 함수가 헤더에 토큰을 담아 요청을 보낼 수 있어요.
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) {
        localStorage.setItem('refreshToken', refreshToken);
      }
      console.log("토큰을 성공적으로 로컬 스토리지에 저장했습니다.");


      try {
        // 4. 저장된 토큰을 기반으로 '내 정보 조회' API를 호출합니다.
        const userInfo = await getMyInfo(); // API 함수는 내부적으로 로컬 스토리지의 토큰을 사용해요.
        console.log("서버로부터 사용자 정보를 성공적으로 받아왔습니다:", userInfo);

        // 5. 받아온 사용자 정보와 토큰을 전역 상태(Context)에 저장하여 로그인 상태를 확정합니다.
        save(accessToken, userInfo); // save(token, user) 형태로 저장
        
        // 6. 모든 처리가 성공적으로 끝나면, 사용자를 홈페이지로 이동시킵니다.
        //    history에 현재 페이지를 남기지 않기 위해 replace: true 옵션을 사용해요.
        navigate('/', { replace: true });

      } catch (error) {
        // '내 정보 조회' API 호출 실패 시 (e.g., 토큰 만료, 서버 오류 등)
        console.error("내 정보 조회 실패:", error);
        // 혹시 모르니 저장했던 토큰들을 다시 지워줍니다.
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // 사용자에게 오류를 알리며 로그인 페이지로 돌려보냅니다.
        navigate('/login', { replace: true, state: { error: "사용자 정보를 가져오는 데 실패했습니다. 다시 로그인해주세요." } });
      }
    };

    handleLoginRedirect();
  }, [navigate, save, searchParams]); // 빈 배열 '[]'을 전달하여, 최초 렌더링 시 딱 한 번만 실행되도록 설정!

  // 이 컴포넌트는 처리 시간 동안 잠깐 보일 뿐이므로, 간단한 로딩 화면을 보여줍니다.
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h2>소셜 로그인 처리 중입니다. 잠시만 기다려주세요...</h2>
    </div>
  );
}

export default OAuth2RedirectHandler;