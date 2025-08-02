import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import naverLogo from '../../assets/naver.png';
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';

const LoginContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 500px;
  margin: 0 auto;
  background: var(--background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow);
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--primary);
  margin-bottom: 2.5rem;
  font-family: 'Pretendard', 'Noto Sans', 'Apple SD Gothic Neo', sans-serif;
  border-radius: 1rem;
  letter-spacing: -1px;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 3rem;
  font-family: 'Pretendard', 'Noto Sans', 'Apple SD Gothic Neo', sans-serif;
  line-height: 1.6;
`;

const SocialButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1rem;
`;

const SocialButton = styled.button`
  width: 60px;
  height: 60px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  img {
    width: 50%;
    height: 50%;
  }

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
`;

const ErrorMessage = styled.div`
  color: #ef4444;
  font-size: 0.9rem;
  margin-top: 2rem;
  padding: 0.75rem 1.25rem;
  background-color: rgba(239, 68, 68, 0.1);
  border-radius: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
`;

function Login() {
  const { t, i18n } = useTranslation();
  const [errorMsg, setErrorMsg] = useState('');
  const [searchParams] = useSearchParams(); // URL 파라미터 읽기

  const [lang, setLang] = useState(i18n.language || 'ko');

  // 소셜 로그인 실패 시, URL에 담겨온 에러 메시지를 화면에 표시
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setErrorMsg('소셜 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }, [searchParams]);

  // 소셜 로그인 버튼 클릭 시, 백엔드의 인증 URL로 이동시키는 함수
  const handleSocialLogin = (provider) => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  // 언어 변경 핸들러
  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <LoginContainer>
        <Title>{t('socialLoginTitle', 'SNS 계정으로 시작하기')}</Title>
        <Subtitle>
          {t('socialLoginDesc', '복잡한 가입 절차 없이, 사용하던 계정으로 바로 로그인하고 서비스를 이용해보세요.')}
        </Subtitle>

        {errorMsg && <ErrorMessage>{errorMsg}</ErrorMessage>}
        
        <SocialButtonContainer>
          <SocialButton aria-label="네이버로 로그인" onClick={() => handleSocialLogin('naver')}>
            <img src={naverLogo} alt="Naver" style={{width:40, height:40}}/>
          </SocialButton>
          <SocialButton aria-label="카카오로 로그인" onClick={() => handleSocialLogin('kakao')}>
            <img src={kakaoLogo} alt="Kakao" style={{width:40, height:40}}/>
          </SocialButton>
          <SocialButton aria-label="구글로 로그인" onClick={() => handleSocialLogin('google')}>
            <img src={googleLogo} alt="Google" style={{width:40, height:40}}/>
          </SocialButton>
        </SocialButtonContainer>
      </LoginContainer>
    </>
  );
}

export default Login; 