import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/Header/Header';

const LoginContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 400px;
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 2rem;
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
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 1rem;
  transition: var(--transition);
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const SubmitButton = styled.button`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const SocialSection = styled.div`
  margin-top: 2rem;
  text-align: center;
`;

const SocialBtn = styled.button`
  margin: 0 0.5rem;
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  color: ${({ type }) => (type === 'kakao' ? '#222' : 'white')};
  background: ${({ type }) =>
    type === 'naver' ? '#03c75a' :
    type === 'kakao' ? '#fee500' :
    type === 'google' ? '#4285F4' :
    'var(--primary)'};
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  min-width: 80px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  &:hover {
    opacity: 0.85;
    filter: brightness(0.97);
  }
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
  const [form, setForm] = useState({
    userId: '',
    password: '',
  });
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [lang, setLang] = useState(i18n.language || 'ko');
  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);
  const navigate = useNavigate();

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsg('');
  };

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.userId.trim() || !form.password) {
      setMsg(t('loginRequired'));
      setMsgColor('red');
      return;
    }
    // 실제 서비스에서는 서버 인증 요청
    setMsg(t('loginSuccess'));
    setMsgColor('green');
    // 로그인 성공 시 메인 페이지 등으로 이동 가능
  };

  // 소셜 로그인 리다이렉트
  const handleSocialLogin = provider => {
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <LoginContainer>
        <Title>{t('login')}</Title>
        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="userId"
              placeholder={t('idPlaceholder')}
              value={form.userId}
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
        {msg && <Message color={msgColor}>{msg}</Message>}
        <LinkGroup>
          <span onClick={() => navigate('/register')}>{t('signup')}</span>
          |
          <span onClick={() => navigate('/find-id')}>{t('findId')}</span>
          |
          <span onClick={() => navigate('/find-pw')}>{t('findPw')}</span>
        </LinkGroup>
        <SocialSection>
          <p>{t('socialLogin')}</p>
          <SocialBtn type="naver" aria-label="Naver Login" onClick={() => window.location.href = '/oauth2/authorization/naver'}>{t('naver')}</SocialBtn>
          <SocialBtn type="kakao" aria-label="Kakao Login" onClick={() => window.location.href = '/oauth2/authorization/kakao'}>{t('kakao')}</SocialBtn>
          <SocialBtn type="google" aria-label="Google Login" onClick={() => window.location.href = '/oauth2/authorization/google'}>{t('google')}</SocialBtn>
        </SocialSection>
      </LoginContainer>
    </>
  );
}

export default Login; 