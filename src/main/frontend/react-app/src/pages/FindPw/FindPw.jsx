import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Register.css';
import Header from './Header';

function FindPw() {
  const { t, i18n } = useTranslation();
  const [email, setEmail] = useState('');
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [msg, setMsg] = useState('');
  const [msgColor, setMsgColor] = useState('');

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  const handleSubmit = e => {
    e.preventDefault();
    if (!email.trim()) {
      setMsg(t('emailRequired'));
      setMsgColor('red');
      return;
    }
    // 임시: test@test.com만 성공, 그 외는 에러
    if (email.trim() !== 'test@test.com') {
      setMsg(t('emailNotFound'));
      setMsgColor('red');
      return;
    }
    setMsg(t('findPwResult'));
    setMsgColor('green');
  };

  return (
    <div className="register-container">
      <Header lang={lang} onLangChange={handleLangChange} />
      <main className="main-content">
        <h2 className="page-title">{t('findPw')}</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="email"
              placeholder={t('emailPlaceholder')}
              value={email}
              onChange={e => { setEmail(e.target.value); setMsg(''); }}
            />
          </div>
          <button type="submit">{t('findPw')}</button>
        </form>
        {msg && (
          <div style={{ color: msgColor, fontSize: '15px', margin: '16px 0 0 2px', textAlign: 'center' }}>{msg}</div>
        )}
      </main>
    </div>
  );
}

export default FindPw; 