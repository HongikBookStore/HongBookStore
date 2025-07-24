import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header/Header.jsx';
import { FormContainer, Title, Form, Input, SubmitButton, Message } from '../../components/ui';

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
      <FormContainer>
        <Title>{t('resetPasswordTitle')}</Title>
        <Form onSubmit={handleSubmit}>
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
        </Form>
        {message.textKey && <Message color={message.color}>{t(message.textKey)}</Message>}
      </FormContainer>
    </>
  );
}

export default ResetPassword;