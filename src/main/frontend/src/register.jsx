import React, { useState } from 'react';

function Register() {
  const [form, setForm] = useState({
    userId: '',
    email: '',
    password: '',
    password2: '',
  });

  // 입력값 변경 핸들러
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // 중복확인, 회원가입 등은 추후 구현
  return (
    <div className="register-container">
      <header className="header">
        <div className="language-selector">
          <select>
            <option>한국어</option>
            <option>English</option>
          </select>
        </div>
        <h1 className="title">홍책방</h1>
      </header>
      <main className="main-content">
        <h2 className="page-title">회원가입</h2>
        <form className="register-form">
          <div className="input-group">
            <input
              name="userId"
              placeholder="아이디를 입력하세요."
              value={form.userId}
              onChange={handleChange}
            />
            <button type="button">중복확인</button>
          </div>
          <div className="input-group">
            <input
              name="email"
              placeholder="이메일을 입력하세요."
              value={form.email}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요."
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <div className="input-group">
            <input
              name="password2"
              type="password"
              placeholder="비밀번호를 다시 입력하세요."
              value={form.password2}
              onChange={handleChange}
            />
          </div>
          <button type="submit">회원가입</button>
        </form>
        <div className="social-login-section">
          <p>소셜 계정으로 회원가입</p>
          <button className="social-btn naver">네이버</button>
          <button className="social-btn kakao">카카오</button>
          <button className="social-btn google">구글</button>
        </div>
      </main>
    </div>
  );
}

export default Register;
