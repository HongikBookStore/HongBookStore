import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import Header from '../../components/Header/Header.jsx';
import naverLogo from '../../assets/naver.png';
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';

const RegisterContainer = styled.div`
  padding: 6rem 2rem 4rem;
  max-width: 500px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2rem;
`;

const Subtitle = styled.p`
  font-size: 1.1rem;
  color: var(--text-light);
  margin-bottom: 3rem;
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

function Register() {
  const { t, i18n } = useTranslation();
  
  // 소셜 로그인 버튼 클릭 시, 백엔드의 인증 URL로 이동시키는 함수
  const handleSocialLogin = (provider) => {
    // 이 URL은 로그인 페이지의 함수와 동일해.
    const env = import.meta.env || {};
    const backendOrigin = env?.VITE_BACKEND_ORIGIN || (env?.VITE_API_BASE ? (() => { try { return new URL(env.VITE_API_BASE, window.location.origin).origin; } catch { return ''; } })() : '');
    const devFallback = (typeof window !== 'undefined' && window.location.port === '5173') ? 'http://localhost:8080' : '';
    const origin = backendOrigin || devFallback;
    window.location.href = `${origin}/oauth2/authorization/${provider}`;
  };

  const [lang, setLang] = useState(i18n.language || 'ko');

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <RegisterContainer>
        <Title>{t('signupTitle', '홍북서점에 오신 것을 환영합니다')}</Title>
        <Subtitle>
          {t('signupDesc', 'SNS 계정으로 간편하게 가입하고, 우리 학교 학생들과 안전하게 중고 교재를 거래해보세요!')}
        </Subtitle>
        
        <SocialButtonContainer>
          <SocialButton aria-label="네이버로 시작하기" onClick={() => handleSocialLogin('naver')}>
            <img src={naverLogo} alt="Naver" style={{width:40, height:40}} />
          </SocialButton>
          <SocialButton aria-label="카카오로 시작하기" onClick={() => handleSocialLogin('kakao')}>
            <img src={kakaoLogo} alt="Kakao" style={{width:40, height:40}} />
          </SocialButton>
          <SocialButton aria-label="구글로 시작하기" onClick={() => handleSocialLogin('google')}>
            <img src={googleLogo} alt="Google" style={{width:40, height:40}} />
          </SocialButton>
        </SocialButtonContainer>
      </RegisterContainer>
    </>
  );
}

export default Register; 
