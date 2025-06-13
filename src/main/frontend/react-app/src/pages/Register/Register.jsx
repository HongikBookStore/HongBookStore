import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../i18n';
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from './Header';

const EMAIL_DOMAINS = [
  'naver.com',
  'kakao.com',
  'gmail.com',
  'nate.com',
  'daum.net',
  '직접입력'
];

function Register() {
  const { t, i18n } = useTranslation();
  const [form, setForm] = useState({
    userId: '',
    emailId: '',
    emailDomain: '',
    customDomain: '',
    password: '',
    password2: '',
  });
  const [lang, setLang] = useState(i18n.language || 'ko');
  const [idCheckMsg, setIdCheckMsg] = useState('');
  const [idCheckColor, setIdCheckColor] = useState('');
  const [emailCheckMsg, setEmailCheckMsg] = useState('');
  const [emailCheckColor, setEmailCheckColor] = useState('');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwMsgColor, setPwMsgColor] = useState('');
  const [pw2Msg, setPw2Msg] = useState('');
  const [pw2MsgColor, setPw2MsgColor] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitMsgColor, setSubmitMsgColor] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'userId') setIdCheckMsg('');
    if (e.target.name === 'emailId' || e.target.name === 'emailDomain' || e.target.name === 'customDomain') setEmailCheckMsg('');
  };

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  // 아이디 중복확인 (임시: 랜덤)
  const handleIdCheck = () => {
    if (!form.userId.trim()) {
      setIdCheckMsg(t('idRequired'));
      setIdCheckColor('red');
      return;
    }
    const isDuplicate = Math.random() < 0.5;
    if (isDuplicate) {
      setIdCheckMsg(t('idDuplicate'));
      setIdCheckColor('red');
    } else {
      setIdCheckMsg(t('idAvailable'));
      setIdCheckColor('green');
    }
  };

  // 이메일 도메인 선택 핸들러
  const handleDomainChange = e => {
    setForm({ ...form, emailDomain: e.target.value, customDomain: '' });
    setShowCustomDomain(e.target.value === '직접입력');
    setEmailCheckMsg('');
  };

  // 이메일 중복확인 (임시: 랜덤)
  const handleEmailCheck = () => {
    const email = form.emailId.trim() + '@' + (showCustomDomain ? form.customDomain.trim() : form.emailDomain);
    if (!form.emailId.trim() || !(showCustomDomain ? form.customDomain.trim() : form.emailDomain)) {
      setEmailCheckMsg(t('emailRequired'));
      setEmailCheckColor('red');
      return;
    }
    // 간단한 이메일 유효성 검사
    const emailPattern = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      setEmailCheckMsg(t('emailInvalid'));
      setEmailCheckColor('red');
      return;
    }
    const isDuplicate = Math.random() < 0.5;
    if (isDuplicate) {
      setEmailCheckMsg(t('emailDuplicate'));
      setEmailCheckColor('red');
    } else {
      setEmailCheckMsg(t('emailAvailable'));
      setEmailCheckColor('green');
    }
  };

  // 비밀번호 조건 체크
  const handlePasswordChange = e => {
    const value = e.target.value;
    setForm({ ...form, password: value });
    // 조건: 8~16자, 영문/숫자/특수문자 포함
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!value) {
      setPwMsg('');
    } else if (!pwPattern.test(value)) {
      setPwMsg(t('pwInvalid'));
      setPwMsgColor('red');
    } else {
      setPwMsg(t('pwValid'));
      setPwMsgColor('green');
    }
    // 비밀번호 확인도 동시에 체크
    if (form.password2) {
      if (value === form.password2) {
        setPw2Msg(t('pwMatch'));
        setPw2MsgColor('green');
      } else {
        setPw2Msg(t('pwNotMatch'));
        setPw2MsgColor('red');
      }
    } else {
      setPw2Msg('');
    }
  };

  // 비밀번호 확인 입력
  const handlePassword2Change = e => {
    const value = e.target.value;
    setForm({ ...form, password2: value });
    if (!value) {
      setPw2Msg('');
    } else if (form.password === value) {
      setPw2Msg(t('pwMatch'));
      setPw2MsgColor('green');
    } else {
      setPw2Msg(t('pwNotMatch'));
      setPw2MsgColor('red');
    }
  };

  // 회원가입 버튼 동작
  const handleSubmit = e => {
    e.preventDefault();
    setSubmitMsg('');
    // 아이디
    if (!form.userId.trim()) {
      setSubmitMsg(t('idRequired'));
      setSubmitMsgColor('red');
      return;
    }
    // 이메일
    const email = form.emailId.trim() + '@' + (showCustomDomain ? form.customDomain.trim() : form.emailDomain);
    if (!form.emailId.trim() || !(showCustomDomain ? form.customDomain.trim() : form.emailDomain)) {
      setSubmitMsg(t('emailRequired'));
      setSubmitMsgColor('red');
      return;
    }
    const emailPattern = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      setSubmitMsg(t('emailInvalid'));
      setSubmitMsgColor('red');
      return;
    }
    // 비밀번호
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$/;
    if (!form.password) {
      setSubmitMsg(t('pwInvalid'));
      setSubmitMsgColor('red');
      return;
    }
    if (!pwPattern.test(form.password)) {
      setSubmitMsg(t('pwInvalid'));
      setSubmitMsgColor('red');
      return;
    }
    // 비밀번호 일치
    if (form.password !== form.password2) {
      setSubmitMsg(t('pwNotMatch'));
      setSubmitMsgColor('red');
      return;
    }
    // (실제 서비스라면 여기서 서버로 전송)
    setSubmitMsg(t('registerSuccess'));
    setSubmitMsgColor('green');
    setForm({
      userId: '',
      emailId: '',
      emailDomain: '',
      customDomain: '',
      password: '',
      password2: '',
    });
    setIdCheckMsg('');
    setEmailCheckMsg('');
    setPwMsg('');
    setPw2Msg('');
    setTimeout(() => {
      navigate('/login');
    }, 1000);
  };

  // 소셜 로그인 리다이렉트
  const handleSocialLogin = provider => {
    // 실제 서비스에서는 백엔드에서 제공하는 OAuth URL로 이동
    window.location.href = `/oauth2/authorization/${provider}`;
  };

  return (
    <div className="register-container">
      <Header lang={lang} onLangChange={handleLangChange} />
      <main className="main-content">
        <h2 className="page-title">{t('signup')}</h2>
        <form className="register-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <input
              name="userId"
              placeholder={t('idPlaceholder')}
              value={form.userId}
              onChange={handleChange}
            />
            <button type="button" onClick={handleIdCheck}>{t('idCheck')}</button>
          </div>
          {idCheckMsg && (
            <div style={{ color: idCheckColor, fontSize: '13px', marginBottom: '8px', marginLeft: '2px' }}>{idCheckMsg}</div>
          )}
          <div className="input-group email-group">
            <input
              name="emailId"
              placeholder={t('emailIdPlaceholder') || t('emailPlaceholder')}
              value={form.emailId}
              onChange={handleChange}
            />
            <span>@</span>
            <select
              name="emailDomain"
              value={form.emailDomain}
              onChange={handleDomainChange}
            >
              <option value="">{t('domainSelect') || '선택'}</option>
              {EMAIL_DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </select>
            {showCustomDomain && (
              <input
                name="customDomain"
                placeholder={t('customDomainPlaceholder') || '직접입력'}
                value={form.customDomain}
                onChange={handleChange}
              />
            )}
            <button type="button" onClick={handleEmailCheck}>{t('emailCheck') || t('idCheck')}</button>
          </div>
          {emailCheckMsg && (
            <div style={{ color: emailCheckColor, fontSize: '13px', marginBottom: '8px', marginLeft: '2px' }}>{emailCheckMsg}</div>
          )}
          <div className="input-group">
            <input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder={t('pwPlaceholder')}
              value={form.password}
              onChange={handlePasswordChange}
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
          {pwMsg && (
            <div style={{ color: pwMsgColor, fontSize: '13px', marginBottom: '8px', marginLeft: '2px' }}>{pwMsg}</div>
          )}
          <div className="input-group">
            <input
              name="password2"
              type={showPw2 ? 'text' : 'password'}
              placeholder={t('pw2Placeholder')}
              value={form.password2}
              onChange={handlePassword2Change}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, marginLeft: 4, display: 'flex', alignItems: 'center' }}
              onClick={() => setShowPw2(v => !v)}
              aria-label={showPw2 ? t('hidePw') : t('showPw')}
            >
              {showPw2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {pw2Msg && (
            <div style={{ color: pw2MsgColor, fontSize: '13px', marginBottom: '8px', marginLeft: '2px' }}>{pw2Msg}</div>
          )}
          <button type="submit">{t('submit')}</button>
        </form>
        {submitMsg && (
          <div style={{ color: submitMsgColor, fontSize: '15px', margin: '16px 0 0 2px', textAlign: 'center' }}>{submitMsg}</div>
        )}
        <div className="social-login-section">
          <p>{t('social')}</p>
          <button className="social-btn naver" type="button" onClick={() => handleSocialLogin('naver')}>{t('naver')}</button>
          <button className="social-btn kakao" type="button" onClick={() => handleSocialLogin('kakao')}>{t('kakao')}</button>
          <button className="social-btn google" type="button" onClick={() => handleSocialLogin('google')}>{t('google')}</button>
        </div>
      </main>
    </div>
  );
}

export default Register; 