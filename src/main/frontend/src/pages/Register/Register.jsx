import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '../../i18n.js';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Header from '../../components/Header/Header.jsx';

import { signUp } from '../../api/user';

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
  padding: 0.5rem 1.2rem;
  border: none;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 1rem;
  color: white;
  background: ${({ type }) =>
    type === 'naver' ? '#03c75a' :
    type === 'kakao' ? '#fee500' :
    type === 'google' ? '#4285F4' :
    'var(--primary)'};
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: var(--transition);
  &:hover {
    opacity: 0.85;
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
  const handleSubmit = async e => {
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

    // 서버에 회원가입 요청
    try {
      await signUp({
        email,
        username: form.userId.trim(),
        password: form.password
      });
      setSubmitMsg(t('registerSuccess'));
      setSubmitMsgColor('green');

      // 입력값 리셋
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

      // 1초 뒤 로그인 화면으로 이동
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      // 백엔드에서 400/409 등 오류 메시지 전달 시 표시
      setSubmitMsg(err.message || t('registerFail'));
      setSubmitMsgColor('red');
    }
  };

    // 소셜 로그인 리다이렉트
    const handleSocialLogin = provider => {
      // 실제 서비스에서는 백엔드에서 제공하는 OAuth URL로 이동
      window.location.href = `/oauth2/authorization/${provider}`;
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
            {idCheckMsg && <Message color={idCheckColor}>{idCheckMsg}</Message>}
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
            {emailCheckMsg && <Message color={emailCheckColor}>{emailCheckMsg}</Message>}
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
            {pwMsg && <Message color={pwMsgColor}>{pwMsg}</Message>}
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
            {pw2Msg && <Message color={pw2MsgColor}>{pw2Msg}</Message>}
            <SubmitButton type="submit">{t('submit')}</SubmitButton>
          </StyledForm>
          {submitMsg && <Message color={submitMsgColor}>{submitMsg}</Message>}
          <SocialSection>
            <p>{t('socialLogin')}</p>
            <SocialBtn type="naver" aria-label="Naver Login"
                       onClick={() => window.location.href = '/oauth2/authorization/naver'}>{t('naver')}</SocialBtn>
            <SocialBtn type="kakao" aria-label="Kakao Login"
                       onClick={() => window.location.href = '/oauth2/authorization/kakao'}>{t('kakao')}</SocialBtn>
            <SocialBtn type="google" aria-label="Google Login"
                       onClick={() => window.location.href = '/oauth2/authorization/google'}>{t('google')}</SocialBtn>
          </SocialSection>
        </RegisterContainer>
      </>
    );
  }

export default Register; 