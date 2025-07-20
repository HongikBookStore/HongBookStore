import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import Header from '../../components/Header/Header.jsx';

// Styled-components는 FindPw.jsx와 유사하게 작성
const ResetContainer = styled.div`
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

function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ textKey: '', color: '' });
  const [loading, setLoading] =useState(false);

  // 컴포넌트 마운트 시 URL에서 토큰을 읽어옵니다.
  useEffect(() => {
    const urlToken = searchParams.get('token');
    if (urlToken) {
      setToken(urlToken);
    } else {
      setMessage({ textKey: 'invalidToken', color: 'red' });
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사
    if (!password || !confirmPassword) {
      setMessage({ textKey: 'passwordRequired', color: 'red' });
      return;
    }
    if (password !== confirmPassword) {
      setMessage({ textKey: 'passwordMismatch', color: 'red' });
      return;
    }
    // 여기에 비밀번호 정규식 검사를 추가할 수도 있습니다.

    setLoading(true);
    setMessage({ textKey: '', color: '' });

    try {
      const response = await fetch('/api/auth/password/reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        setMessage({ textKey: 'passwordResetSuccess', color: 'green' });
        // 성공 시 3초 후 로그인 페이지로 리디렉션
        setTimeout(() => navigate('/login'), 3000);
      } else {
        // 토큰 만료, 잘못된 토큰 등의 서버 에러 처리
        const errorData = await response.json();
        setMessage({ textKey: errorData.message || 'requestFailed', color: 'red' });
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setMessage({ textKey: 'requestFailed', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <ResetContainer>
        <Title>{t('resetPasswordTitle')}</Title>
        <StyledForm onSubmit={handleSubmit}>
          <Input
            type="password"
            placeholder={t('newPassword')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            disabled={loading}
          />
          <Input
            type="password"
            placeholder={t('confirmPassword')}
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            disabled={loading}
          />
          <SubmitButton type="submit" disabled={!token || loading}>
            {loading ? t('processing') : t('ok')}
          </SubmitButton>
        </StyledForm>
        {message.textKey && <Message color={message.color}>{t(message.textKey)}</Message>}
      </ResetContainer>
    </>
  );
}

export default ResetPassword;