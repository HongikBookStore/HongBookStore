import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/Header/Header.jsx';
import naverLogo from '../../assets/naver.png';
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';

import { login, getMyInfo } from '../../api/auth';      // ① 로그인 API
import { AuthCtx } from '../../contexts/AuthContext'; // ② 전역 저장소

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

const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  flex: 1;
  padding: 1rem 1.2rem;
  border: 1.5px solid var(--border);
  border-radius: 1.2rem;
  background: var(--surface);
  color: var(--text);
  font-size: 1.15rem;
  font-family: 'Pretendard', 'Noto Sans', 'Apple SD Gothic Neo', sans-serif;
  font-weight: 600;
  transition: var(--transition);
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const SubmitButton = styled.button`
  padding: 0.9rem 1.7rem;
  font-size: 1.25rem;
  font-weight: 700;
  font-family: 'Pretendard', 'Noto Sans', 'Apple SD Gothic Neo', sans-serif;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  letter-spacing: -0.5px;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.07);
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px) scale(1.03);
  }
`;

const SocialSection = styled.div`
  margin-top: 2.5rem;
  text-align: center;
  width: 100%;
`;

const SocialTitle = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  font-weight: 500;
`;

const SocialButtonsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 1rem;
`;

const SocialBtn = styled.button`
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  img {
    width: 24px;
    height: 24px;
    transition: transform 0.2s ease;
  }
  
  &:hover img {
    transform: scale(1.1);
  }
  
  /* 네이버 버튼 스타일 */
  &[type="naver"] {
    background: #03C75A;
    color: white;
    &:hover {
      background: #02A94A;
    }
  }
  
  /* 카카오 버튼 스타일 */
  &[type="kakao"] {
    background: #FEE500;
    color: #3C1E1E;
    &:hover {
      background: #FDD835;
    }
  }
  
  /* 구글 버튼 스타일 */
  &[type="google"] {
    background: white;
    color: #757575;
    border: 1px solid #dadce0;
    &:hover {
      background: #f8f9fa;
      border-color: #c6c6c6;
    }
  }
`;

const SocialBtnText = styled.span`
  font-family: 'Pretendard', 'Noto Sans', 'Apple SD Gothic Neo', sans-serif;
  font-weight: 600;
`;

const RememberMeGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
  font-size: 0.95rem;
  color: var(--text);
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--primary);
`;

const LinkGroup = styled.div`
  margin-top: 1.5rem;
  text-align: center;
  font-size: 1rem;
  color: var(--primary);
  span {
    cursor: pointer;
    color: var(--primary);
    margin: 0 0.5rem;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const Message = styled.div`
  color: ${({ color }) => color || 'var(--primary)'};
  font-size: 1rem;
  margin: 1rem 0 0 2px;
  text-align: center;
`;

function Login() {
  const { t, i18n } = useTranslation();
  const { save } = useContext(AuthCtx);
  const [form, setForm] = useState({
    username: '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [lang, setLang] = useState(i18n.language || 'ko');
  
  useEffect(() => {
    setLang(i18n.language);
    // 저장된 로그인 정보 불러오기
    const savedUsername = localStorage.getItem('rememberedUsername');
    const savedPassword = localStorage.getItem('rememberedPassword');
    const remembered = localStorage.getItem('rememberMe') === 'true';
    
    if (remembered && savedUsername && savedPassword) {
      setForm({
        username: savedUsername,
        password: savedPassword,
      });
      setRememberMe(true);
    }
  }, [i18n.language]);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // URL 파라미터 읽기
  // 소셜 로그인 실패 시 메시지를 보여주기 위한 useEffect
  useEffect(() => {
    const error = searchParams.get('error');
    if (error) {
      setMsg('소셜 로그인에 실패했습니다. 다시 시도해주세요.');
      setMsgColor('red');
    }
  }, [searchParams]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
  };

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.username.trim() || !form.password) {
      setMsg(t('loginRequired'));
      setMsgColor('red');
      return;
    }

    try {
      // 1. 일반 로그인 API를 호출하여 토큰들을 받습니다.
      const { accessToken, refreshToken } = await login(form.username.trim(), form.password);
      
      // 2. 받아온 토큰들을 즉시 로컬 스토리지에 저장합니다.
      //    (getMyInfo가 이 토큰을 사용해서 요청을 보내야 하니까요!)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // 3. 새로 받은 accessToken으로 '내 정보'를 조회합니다.
      const userInfo = await getMyInfo();

      // 4. "관리인(AuthContext)"에게 토큰과 사용자 정보를 전달하여 최종 로그인 처리를 합니다.
      save(accessToken, userInfo);

      // 5. 아이디/비밀번호 기억하기 처리
      if (rememberMe) {
        localStorage.setItem('rememberedUsername', form.username);
        localStorage.setItem('rememberedPassword', form.password);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedUsername');
        localStorage.removeItem('rememberedPassword');
        localStorage.removeItem('rememberMe');
      }

      // 6. 사용자에게 성공 메시지를 보여주고 홈페이지로 이동합니다.
      setMsg(t('loginSuccess'));
      setMsgColor('green');
      setTimeout(() => navigate('/'), 500);

    } catch (err) {
      setMsg(err.message || t('loginFail'));
      setMsgColor('red');
    }
  };

  // 소셜 로그인 리다이렉트
  const handleSocialLogin = provider => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <LoginContainer>
        <Title>{t('login')}</Title>
        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="username"
              placeholder={t('idPlaceholder')}
              value={form.username}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder={t('pwPlaceholder')}
              value={form.password}
              onChange={handleChange}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginLeft: 4, display: 'flex', alignItems: 'center' }}
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? t('hidePw') : t('showPw')}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </InputGroup>
          <SubmitButton type="submit">{t('login')}</SubmitButton>
        </StyledForm>
        <RememberMeGroup>
          <Checkbox
            type="checkbox"
            id="rememberMe"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
          />
          <label htmlFor="rememberMe">{t('rememberMe')}</label>
        </RememberMeGroup>
        {msg && <Message color={msgColor}>{msg}</Message>}
        <LinkGroup>
          <span onClick={() => navigate('/register')}>{t('signup')}</span>
          |
          <span onClick={() => navigate('/find-id')}>{t('findId')}</span>
          |
          <span onClick={() => navigate('/find-pw')}>{t('findPw')}</span>
        </LinkGroup>
        <SocialSection>
          <SocialTitle>{t('socialLogin')}</SocialTitle>
          <SocialButtonsContainer>
            <SocialBtn type="naver" aria-label="Naver Login" onClick={() => handleSocialLogin('naver')}>
              <img src={naverLogo} alt="Naver" />
              <SocialBtnText>Naver</SocialBtnText>
            </SocialBtn>
            <SocialBtn type="kakao" aria-label="Kakao Login" onClick={() => handleSocialLogin('kakao')}>
              <img src={kakaoLogo} alt="Kakao" />
              <SocialBtnText>Kakao</SocialBtnText>
            </SocialBtn>
            <SocialBtn type="google" aria-label="Google Login" onClick={() => handleSocialLogin('google')}>
              <img src={googleLogo} alt="Google" />
              <SocialBtnText>Google</SocialBtnText>
            </SocialBtn>
          </SocialButtonsContainer>
        </SocialSection>
      </LoginContainer>
    </>
  );
}

export default Login; 