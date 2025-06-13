import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from './Header';

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
    <div className="register-container">
      <Header lang={lang} onLangChange={handleLangChange} />
      <main className="main-content">
        <h2 className="page-title">{t('login')}</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="userId"
              placeholder={t('idPlaceholder')}
              value={form.userId}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
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
          </div>
          <button type="submit">{t('login')}</button>
        </form>
        {msg && (
          <div style={{ color: msgColor, fontSize: '15px', margin: '16px 0 0 2px', textAlign: 'center' }}>{msg}</div>
        )}
        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 14 }}>
          <span style={{ cursor: 'pointer', color: '#0033cc' }} onClick={() => navigate('/register')}>{t('signup')}</span>
          {' | '}
          <span style={{ cursor: 'pointer', color: '#0033cc' }} onClick={() => navigate('/find-id')}>{t('findId')}</span>
          {' | '}
          <span style={{ cursor: 'pointer', color: '#0033cc' }} onClick={() => navigate('/find-pw')}>{t('findPw')}</span>
        </div>
        <div className="social-login-section">
          <p>{t('socialLogin')}</p>
          <button className="social-btn naver" type="button" onClick={() => handleSocialLogin('naver')}>{t('naver')}</button>
          <button className="social-btn kakao" type="button" onClick={() => handleSocialLogin('kakao')}>{t('kakao')}</button>
          <button className="social-btn google" type="button" onClick={() => handleSocialLogin('google')}>{t('google')}</button>
        </div>
      </main>
    </div>
  );
}

export default Login; 