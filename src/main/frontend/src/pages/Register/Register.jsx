import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/Header/Header.jsx';
import naverLogo from '../../assets/naver.png';
import kakaoLogo from '../../assets/kakao.png';
import googleLogo from '../../assets/google.png';

import { signUp, checkUsername, checkEmail } from '../../api/auth';
import { AuthCtx } from '../../contexts/AuthContext';

const EMAIL_DOMAINS = [
  'naver.com',
  'kakao.com',
  'gmail.com',
  'nate.com',
  'daum.net',
  '직접입력'
];

const RegisterContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 480px;
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
  gap: 1.2rem;
`;

const InputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  &.email-group {
    flex-wrap: wrap;
    align-items: flex-start;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.3rem;
    &.email-group {
      flex-direction: column;
      align-items: stretch;
    }
  }
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

const Select = styled.select`
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

const CheckButton = styled.button`
  padding: 0.5rem 1rem;
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
  margin-top: 0.5rem;
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
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid #e0e0e0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  cursor: pointer;
  transition: var(--transition);
  &:hover {
    box-shadow: 0 4px 16px rgba(35,81,233,0.10);
    border-color: #2351e9;
    opacity: 0.95;
  }
`;

const Message = styled.div`
  color: ${({ color }) => color || 'var(--primary)'};
  font-size: 1rem;
  margin: 0.5rem 0 0 2px;
  text-align: left;
`;

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
  const [idCheckMsgKey, setIdCheckMsgKey] = useState('');
  const [idCheckColor, setIdCheckColor] = useState('');
  const [emailCheckMsgKey, setEmailCheckMsgKey] = useState('');
  const [emailCheckColor, setEmailCheckColor] = useState('');
  const [showCustomDomain, setShowCustomDomain] = useState(false);
  const [pwMsgKey, setPwMsgKey] = useState('');
  const [pwMsgColor, setPwMsgColor] = useState('');
  const [pw2MsgKey, setPw2MsgKey] = useState('');
  const [pw2MsgColor, setPw2MsgColor] = useState('');
  const [submitMsgKey, setSubmitMsgKey] = useState('');
  const [submitMsgColor, setSubmitMsgColor] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === 'userId') setIdCheckMsgKey('');
    if (e.target.name === 'emailId' || e.target.name === 'emailDomain' || e.target.name === 'customDomain') setEmailCheckMsgKey('');
  };

  const handleLangChange = e => {
    setLang(e.target.value);
    i18n.changeLanguage(e.target.value);
  };

  // 아이디 중복확인 (백엔드 연동)
  const handleIdCheck = async () => {
    const username = form.userId.trim();

    // 입력값 검증
    if (!username) {
      setIdCheckMsgKey('idRequired');
      setIdCheckColor('red');
      return;
    }

    try {
      const { available } = await checkUsername(username);
      if (available) {
        setIdCheckMsgKey('idAvailable');
        setIdCheckColor('green');
      } else {
        setIdCheckMsgKey('idDuplicate');
        setIdCheckColor('red');
      }
    } catch (err) {
      // 네트워크 오류 등
      setIdCheckMsgKey('networkError');
      setIdCheckColor('red');
    }
  };

  const handleDomainChange = e => {
    setForm({ ...form, emailDomain: e.target.value, customDomain: '' });
    setShowCustomDomain(e.target.value === '직접입력');
    setEmailCheckMsgKey('');
  };

  // 이메일 중복확인 (백엔드 연동)
  const handleEmailCheck = async () => {
    const email = form.emailId.trim() + '@' + (showCustomDomain ? form.customDomain.trim() : form.emailDomain);

    // 이메일 입력값 검증
    if (!form.emailId.trim() || !(showCustomDomain ? form.customDomain.trim() : form.emailDomain)) {
      setEmailCheckMsgKey('emailRequired');
      setEmailCheckColor('red');
      return;
    }
    // 간단 이메일 유효성
    const pattern = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!pattern.test(email)) {
      setEmailCheckMsgKey('emailInvalid');
      setEmailCheckColor('red');
      return;
    }

    try {
      const { available } = await checkEmail(email);
      if (available) {
        setEmailCheckMsgKey('emailAvailable');
        setEmailCheckColor('green');
      } else {
        setEmailCheckMsgKey('emailDuplicate');
        setEmailCheckColor('red');
      }
    } catch (err) {
      setEmailCheckMsgKey('networkError');
      setEmailCheckColor('red');
    }
  };

  const handlePasswordChange = e => {
    const value = e.target.value;
    setForm({ ...form, password: value });
    // 조건: 8~16자, 영문/숫자/특수문자 포함
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
    if (!value) {
      setPwMsgKey('');
    } else if (!pwPattern.test(value)) {
      setPwMsgKey('pwInvalid');
      setPwMsgColor('red');
    } else {
      setPwMsgKey('pwValid');
      setPwMsgColor('green');
    }
    if (form.password2) {
      if (value === form.password2) {
        setPw2MsgKey('pwMatch');
        setPw2MsgColor('green');
      } else {
        setPw2MsgKey('pwNotMatch');
        setPw2MsgColor('red');
      }
    } else {
      setPw2MsgKey('');
    }
  };

  const handlePassword2Change = e => {
    const value = e.target.value;
    setForm({ ...form, password2: value });
    if (!value) {
      setPw2MsgKey('');
    } else if (form.password === value) {
      setPw2MsgKey('pwMatch');
      setPw2MsgColor('green');
    } else {
      setPw2MsgKey('pwNotMatch');
      setPw2MsgColor('red');
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitMsgKey('');
    if (!form.userId.trim()) {
      setSubmitMsgKey('idRequired');
      setSubmitMsgColor('red');
      return;
    }
    const email = form.emailId.trim() + '@' + (showCustomDomain ? form.customDomain.trim() : form.emailDomain);
    if (!form.emailId.trim() || !(showCustomDomain ? form.customDomain.trim() : form.emailDomain)) {
      setSubmitMsgKey('emailRequired');
      setSubmitMsgColor('red');
      return;
    }
    const emailPattern = /^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/;
    if (!emailPattern.test(email)) {
      setSubmitMsgKey('emailInvalid');
      setSubmitMsgColor('red');
      return;
    }
    // 비밀번호
    const pwPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,16}$/;
    if (!form.password) {
      setSubmitMsgKey('pwInvalid');
      setSubmitMsgColor('red');
      return;
    }
    if (!pwPattern.test(form.password)) {
      setSubmitMsgKey('pwInvalid');
      setSubmitMsgColor('red');
      return;
    }
    if (form.password !== form.password2) {
      setSubmitMsgKey('pwNotMatch');
      setSubmitMsgColor('red');
      return;
    }
    try {
      await signUp({
        email,
        username: form.userId.trim(),
        password: form.password
      });
      setSubmitMsgKey('registerSuccess');
      setSubmitMsgColor('green');
      setForm({
        userId: '',
        emailId: '',
        emailDomain: '',
        customDomain: '',
        password: '',
        password2: '',
      });
      setIdCheckMsgKey('');
      setEmailCheckMsgKey('');
      setPwMsgKey('');
      setPw2MsgKey('');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      setSubmitMsgKey('registerFail');
      setSubmitMsgColor('red');
    }
  };

  const handleSocialLogin = provider => {
    window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
  };

  return (
    <>
      <Header lang={lang} onLangChange={handleLangChange} />
      <RegisterContainer>
        <Title>{t('signup')}</Title>
        <StyledForm onSubmit={handleSubmit}>
          <InputGroup>
            <Input
              name="userId"
              placeholder={t('idPlaceholder')}
              value={form.userId}
              onChange={handleChange}
            />
            <CheckButton type="button" onClick={handleIdCheck}>{t('idCheck')}</CheckButton>
          </InputGroup>
          {idCheckMsgKey && <Message color={idCheckColor}>{t(idCheckMsgKey)}</Message>}
          <InputGroup className="email-group">
            <Input
              name="emailId"
              placeholder={t('emailIdPlaceholder')}
              value={form.emailId}
              onChange={handleChange}
              style={{ minWidth: 0, flex: 2 }}
            />
            <span>@</span>
            <Select
              name="emailDomain"
              value={form.emailDomain}
              onChange={handleDomainChange}
              style={{ minWidth: 0, flex: 1 }}
            >
              <option value="">{t('domainSelect')}</option>
              {EMAIL_DOMAINS.map(domain => (
                <option key={domain} value={domain}>{domain}</option>
              ))}
            </Select>
            {showCustomDomain && (
              <Input
                name="customDomain"
                placeholder={t('customDomainPlaceholder')}
                value={form.customDomain}
                onChange={handleChange}
                style={{ minWidth: 0, flex: 1 }}
              />
            )}
            <CheckButton type="button" onClick={handleEmailCheck} style={{
              whiteSpace: 'nowrap',
              height: '42px',
              marginLeft: 4
            }}>{t('emailCheck')}</CheckButton>
          </InputGroup>
          {emailCheckMsgKey && <Message color={emailCheckColor}>{t(emailCheckMsgKey)}</Message>}
          <InputGroup>
            <Input
              name="password"
              type={showPw ? 'text' : 'password'}
              placeholder={t('pwPlaceholder')}
              value={form.password}
              onChange={handlePasswordChange}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                marginLeft: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowPw(v => !v)}
              aria-label={showPw ? t('hidePw') : t('showPw')}
            >
              {showPw ? <FaEyeSlash /> : <FaEye />}
            </button>
          </InputGroup>
          {pwMsgKey && <Message color={pwMsgColor}>{t(pwMsgKey)}</Message>}
          <InputGroup>
            <Input
              name="password2"
              type={showPw2 ? 'text' : 'password'}
              placeholder={t('pw2Placeholder')}
              value={form.password2}
              onChange={handlePassword2Change}
            />
            <button
              type="button"
              tabIndex={-1}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 20,
                marginLeft: 4,
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => setShowPw2(v => !v)}
              aria-label={showPw2 ? t('hidePw') : t('showPw')}
            >
              {showPw2 ? <FaEyeSlash /> : <FaEye />}
            </button>
          </InputGroup>
          {pw2MsgKey && <Message color={pw2MsgColor}>{t(pw2MsgKey)}</Message>}
          <SubmitButton type="submit">{t('submit')}</SubmitButton>
        </StyledForm>
        {submitMsgKey && <Message color={submitMsgColor}>{t(submitMsgKey)}</Message>}
        <SocialSection>
                  <p>{t('social')}</p>
                  <div style={{display:'flex', justifyContent:'center', gap:'1.5rem', marginTop:'1rem'}}>
                    <SocialBtn type="naver" aria-label="Naver Login" onClick={() => handleSocialLogin('naver')}>
                      <img src={naverLogo} alt="Naver" style={{width:40, height:40}} />
                    </SocialBtn>
                    <SocialBtn type="kakao" aria-label="Kakao Login" onClick={() => handleSocialLogin('kakao')}>
                      <img src={kakaoLogo} alt="Kakao" style={{width:40, height:40}} />
                    </SocialBtn>
                    <SocialBtn type="google" aria-label="Google Login" onClick={() => handleSocialLogin('google')}>
                      <img src={googleLogo} alt="Google" style={{width:40, height:40}} />
                    </SocialBtn>
                  </div>
        </SocialSection>
      </RegisterContainer>
    </>
  );
}

export default Register; 