import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';

const FindContainer = styled.div`
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
  @media (max-width: 600px) {
    padding: 4rem 0.5rem 2rem;
    max-width: 98vw;
  }
`;

const StyledForm = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  align-items: stretch;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
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
  width: 100%;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  color: white;
  background: var(--primary);
  border: none;
  border-radius: var(--radius);
  cursor: pointer;
  transition: var(--transition);
  margin-top: 0.5rem;
  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

const Message = styled.div`
  color: ${({ color }) => color || 'var(--primary)'};
  font-size: 1rem;
  margin: 0.5rem 0 0 2px;
  text-align: center;
`;

const Title = styled.h2`
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--primary);
`;

const Description = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  text-align: center;
  line-height: 1.5;
`;

const SignupLink = styled.span`
  color: var(--primary);
  cursor: pointer;
  text-decoration: underline;
  font-weight: 600;
  &:hover {
    color: var(--primary-dark);
  }
`;

function FindPw() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    email: '',
  });
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [msgKey, setMsgKey] = useState('');
  const [msgColor, setMsgColor] = useState('');
  const [isNotRegistered, setIsNotRegistered] = useState(false);

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setMsgKey('');
    setIsNotRegistered(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    
    if (!form.username.trim() || !form.email.trim()) {
      setMsgKey('loginRequired');
      setMsgColor('red');
      return;
    }

    try {
      // TODO: 실제 API 호출로 변경
      // const response = await findPassword(form.username, form.email);
      
      // 임시 로직: test/test@test.com만 성공, 그 외는 미가입 계정
      if (form.username === 'test' && form.email === 'test@test.com') {
        setMsgKey('findPwSuccess');
        setMsgColor('green');
        setIsNotRegistered(false);
      } else {
        setMsgKey('findPwNotRegistered');
        setMsgColor('red');
        setIsNotRegistered(true);
      }
    } catch (error) {
      setMsgKey('findPwFail');
      setMsgColor('red');
      setIsNotRegistered(false);
    }
  };

  const handleGoToSignup = () => {
    navigate('/register');
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <FindContainer>
        <Title>{t('findPwTitle')}</Title>
        <Description>{t('findPwDesc')}</Description>
        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="username"
              placeholder={t('findPwIdPlaceholder')}
              value={form.username}
              onChange={handleChange}
            />
          </InputGroup>
          <InputGroup>
            <Input
              name="email"
              placeholder={t('findPwEmailPlaceholder')}
              value={form.email}
              onChange={handleChange}
            />
          </InputGroup>
          <SubmitButton type="submit">{t('findPwSubmit')}</SubmitButton>
        </StyledForm>
        {msgKey && (
          <Message color={msgColor}>
            {t(msgKey)}
            {isNotRegistered && (
              <div style={{ marginTop: '0.5rem' }}>
                <SignupLink onClick={handleGoToSignup}>
                  {t('findPwGoToSignup')}
                </SignupLink>
              </div>
            )}
          </Message>
        )}
      </FindContainer>
    </>
  );
}

export default FindPw; 