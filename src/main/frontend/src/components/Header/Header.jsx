import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n.js';

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NavContainer = styled.nav`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 4rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;

  @media (max-width: 1440px) {
    padding: 0 3rem;
  }

  @media (max-width: 1024px) {
    padding: 0 2rem;
  }

  @media (max-width: 900px) {
    padding: 0 0.5rem;
  }
`;

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  padding: 0.25rem 0 0.15rem 0;
  @media (max-width: 900px) {
    min-height: 40px;
    padding: 0.1rem 0;
  }
`;

const LeftBox = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
`;

const LangSelectBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: 1.2rem;
`;

const Logo = styled(Link)`
  font-size: 1.75rem;
  font-weight: 800;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: var(--transition);

  &:hover {
    transform: translateY(-2px);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 2rem;
  list-style: none;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: nowrap;
  min-width: 0;
  margin: 0;
  @media (max-width: 900px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(12px);
    padding: 1.5rem 0.5rem 1.5rem 0.5rem;
    box-shadow: var(--shadow-xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    gap: 1.2rem;
    z-index: 2000;
    align-items: stretch;
    margin: 0;
    justify-content: flex-start;
  }
`;

const NavLink = styled(Link)`
  color: var(--text);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  padding: 0.75rem 1.25rem;
  border-radius: var(--radius);
  transition: var(--transition);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: var(--transition);
    transform: translateX(-50%);
  }

  &:hover {
    color: var(--primary);
    transform: translateY(-2px);
  }

  &:hover::after {
    width: 80%;
  }
`;

const Hamburger = styled.button`
  display: none;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  padding: 0.75rem;
  border-radius: var(--radius);
  transition: var(--transition);
  background: rgba(124, 58, 237, 0.1);
  border: none;

  &:hover {
    background: rgba(124, 58, 237, 0.2);
  }

  span {
    width: 28px;
    height: 2px;
    background: var(--primary);
    transition: var(--transition);
    border-radius: 2px;
  }

  @media (max-width: 768px) {
    display: flex;
  }
`;

const MenuBox = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: nowrap;
  @media (max-width: 900px) {
    display: none;
  }
`;

const MobileMenuActions = styled.div`
  display: none;
  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 0.5rem;
    align-items: stretch;
  }
`;

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [lang, setLang] = useState(i18n.language);
  const isLoggedIn = !!localStorage.getItem('jwt');

  useEffect(() => {
    setLang(i18n.language);
  }, [i18n.language]);

  const handleLangChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    i18n.changeLanguage(newLang);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    navigate('/');
    window.location.reload();
  };

  return (
    <HeaderContainer>
      <NavContainer>
        <FlexRow>
          <LangSelectBox>
            <select value={lang} onChange={handleLangChange}>
              <option value="ko">한국어</option>
              <option value="en">English</option>
              <option value="ja">日本語</option>
              <option value="zh">中文</option>
            </select>
          </LangSelectBox>
          <LeftBox>
            <Logo to="/">Hong Bookstore</Logo>
          </LeftBox>
          <>
            <Hamburger onClick={() => setIsOpen(!isOpen)}>
              <span />
              <span />
              <span />
            </Hamburger>
            <NavLinks isOpen={isOpen}>
              <li><NavLink to="/marketplace" onClick={() => setIsOpen(false)}>{t('marketplace')}</NavLink></li>
              <li><NavLink to="/community" onClick={() => setIsOpen(false)}>{t('community')}</NavLink></li>
              <li><NavLink to="/map" onClick={() => setIsOpen(false)}>{t('map')}</NavLink></li>
              <li><NavLink to="/mypage" onClick={() => setIsOpen(false)}>{t('mypage')}</NavLink></li>
              <MobileMenuActions>
                {!isLoggedIn ? (
                  <>
                    <NavLink to="/login" onClick={() => setIsOpen(false)}>{t('login')}</NavLink>
                    <NavLink to="/register" onClick={() => setIsOpen(false)}>{t('signup')}</NavLink>
                  </>
                ) : (
                  <button onClick={() => { setIsOpen(false); handleLogout(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text)' }}>
                    {t('logout')}
                  </button>
                )}
              </MobileMenuActions>
            </NavLinks>
            <MenuBox>
              {!isLoggedIn ? (
                <>
                  <NavLink to="/login">{t('login')}</NavLink>
                  <NavLink to="/register">{t('signup')}</NavLink>
                </>
              ) : (
                <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '1.125rem', color: 'var(--text)' }}>
                  {t('logout')}
                </button>
              )}
            </MenuBox>
          </>
        </FlexRow>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header; 