import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
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
  margin-bottom: 2rem;
`;

function FindPw() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [msgKey, setMsgKey] = useState('');
  const [msgColor, setMsgColor] = useState('');

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!email.trim()) {
      setMsgKey('emailRequired');
      setMsgColor('red');
      return;
    }
    // 임시: test@test.com만 성공, 그 외는 에러
    if (email.trim() !== 'test@test.com') {
      setMsgKey('emailNotFound');
      setMsgColor('red');
      return;
    }
    setMsgKey('findPwResult');
    setMsgColor('green');
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <FindContainer>
        <Title>{t('findPw')}</Title>
        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => { setEmail(e.target.value); setMsgKey(''); }}
            />
          </InputGroup>
          <SubmitButton type="submit">{t('findPw')}</SubmitButton>
        </StyledForm>
        {msgKey && <Message color={msgColor}>{t(msgKey)}</Message>}
      </FindContainer>
    </>
  );
}

export default FindPw; 