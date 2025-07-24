import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header.jsx';
import { FormContainer, Title, Form, InputGroup, Input, SubmitButton, Message } from '../../components/ui';

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
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [message, setMessage] = useState({ textKey: '', color: '' });
  const [loading, setLoading] = useState(false);

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  // 실제 API를 호출하는 비동기 함수로 변경
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ textKey: 'emailRequired', color: 'red' });
      return;
    }
    
    setLoading(true); // 로딩 시작
    setMessage({ textKey: '', color: '' });

    try {
      const response = await fetch('/api/auth/password/reset-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      // 백엔드는 이메일 존재 여부와 상관없이 항상 성공 응답을 주기로 했으므로,
      // fetch 요청 자체가 성공하면 사용자에게 안내 메시지를 보여줍니다.
      if (response.ok) {
        setMessage({ textKey: 'findPwResult', color: 'green' });
      } else {
        // 서버에서 5xx 에러 등 예외적인 상황 처리
        setMessage({ textKey: 'requestFailed', color: 'red' });
      }
    } catch (error) {
      console.error('Password reset request failed:', error);
      setMessage({ textKey: 'requestFailed', color: 'red' });
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <FormContainer>
        <Title>{t('findPwTitle')}</Title>
        <Description>{t('findPwDesc')}</Description>
        <Form onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              type="email"
              name="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading} // 로딩 중 입력 비활성화
            />
          </InputGroup>
          {/* 로딩 상태에 따라 버튼 비활성화 및 텍스트 변경 */}
          <SubmitButton type="submit" disabled={loading}>
            {loading ? t('processing') : t('findPw')}
          </SubmitButton>
        </Form>
        {message.textKey && <Message color={message.color}>{t(message.textKey)}</Message>}
      </FormContainer>
    </>
  );
}

export default FindPw; 