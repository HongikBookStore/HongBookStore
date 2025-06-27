import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n.js';
import bookIcon from '../../assets/book.svg';
import { AuthCtx } from '../../contexts/AuthContext';
import { useWriting } from '../../contexts/WritingContext';
import WarningModal from '../WarningModal/WarningModal';

const slideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-100%);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const HeaderContainer = styled.header`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${slideDown} 0.6s ease-out;
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
  position: relative;
`;

const LangSelect = styled.select`
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.2);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--primary);
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;

  &:hover {
    background: rgba(124, 58, 237, 0.15);
    border-color: rgba(124, 58, 237, 0.3);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &::before {
    content: '🌍';
    margin-right: 0.5rem;
  }

  .lang-text {
    display: inline;
  }

  @media (max-width: 768px) {
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
    
    .lang-text {
      display: none;
    }
    
    option {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 600px) {
    padding: 0.5rem;
    min-width: 60px;
    
    .lang-text {
      display: none;
    }
    
    option {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    padding: 0.4rem 0.5rem;
    min-width: 50px;
    font-size: 0.75rem;
    
    .lang-text {
      display: none;
    }
    
    option {
      font-size: 0.7rem;
    }
  }
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
  position: relative;
  min-width: 0;
  flex-shrink: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  @media (max-width: 900px) {
    font-size: 1.2rem;
  }
  @media (max-width: 600px) {
    font-size: 1.1rem;
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
  animation: ${fadeIn} 0.6s ease-out 0.2s backwards;
  
  @media (max-width: 900px) {
    display: ${({ $isOpen }) => ($isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    padding: 1.5rem 0.5rem 1.5rem 0.5rem;
    box-shadow: var(--shadow-xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.3);
    gap: 1.2rem;
    z-index: 2000;
    align-items: stretch;
    margin: 0;
    justify-content: flex-start;
    animation: ${slideDown} 0.3s ease-out;
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
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: var(--transition);
    transform: translateX(-50%);
    border-radius: 2px;
  }

  &:hover {
    color: var(--primary);
    transform: translateY(-2px);
    background: rgba(124, 58, 237, 0.05);
  }

  &:hover::before {
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
  position: relative;

  &:hover {
    background: rgba(124, 58, 237, 0.2);
    transform: scale(1.05);
  }

  span {
    width: 28px;
    height: 2px;
    background: var(--primary);
    transition: var(--transition);
    border-radius: 2px;
    transform-origin: center;
  }

  &.active span:nth-child(1) {
    transform: rotate(45deg) translate(6px, 6px);
  }

  &.active span:nth-child(2) {
    opacity: 0;
  }

  &.active span:nth-child(3) {
    transform: rotate(-45deg) translate(6px, -6px);
  }

  @media (max-width: 900px) {
    display: flex;
  }
`;

const MenuBox = styled.div`
  display: flex;
  gap: 1.2rem;
  align-items: center;
  flex-wrap: nowrap;
  animation: ${fadeIn} 0.6s ease-out 0.4s backwards;
  
  @media (max-width: 900px) {
    display: none;
  }
`;

const AuthButton = styled(Link)`
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-lg);
  font-weight: 600;
  text-decoration: none;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const LoginButton = styled(AuthButton)`
  background: transparent;
  color: var(--primary);
  border: 2px solid var(--primary);

  &:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const RegisterButton = styled(AuthButton)`
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: none;
  box-shadow: var(--shadow);

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  animation: ${fadeIn} 0.6s ease-out 0.4s backwards;
`;

const UserAvatar = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: var(--shadow);
  border: 2px solid white;
  position: relative;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 50%;
  }

  .default-avatar {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 1.2rem;
    font-weight: 600;
  }

  &:hover {
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }
`;

const LogoutButton = styled.button`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.5rem 1rem;
  border-radius: var(--radius);
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: #ef4444;
    color: white;
    transform: translateY(-1px);
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
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, token } = useContext(AuthCtx);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { isWriting, writingType } = useWriting();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // AuthContext의 token과 localStorage의 jwt를 모두 확인
    const localToken = localStorage.getItem('jwt');
    const isAuthenticated = !!(token || localToken);
    setIsLoggedIn(isAuthenticated);
  }, [token]);

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    navigate('/');
    // 페이지 새로고침으로 AuthContext 상태 초기화
    window.location.reload();
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  // 안전한 네비게이션 함수
  const safeNavigate = (path) => {
    if (isWriting) {
      setPendingNavigation(path);
      setShowWarningModal(true);
    } else {
      navigate(path);
    }
  };

  // 경고 모달에서 나가기 선택
  const handleConfirmExit = () => {
    setShowWarningModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // 경고 모달에서 취소 선택
  const handleCancelExit = () => {
    setShowWarningModal(false);
    setPendingNavigation(null);
  };

  // 기본 아바타 생성 함수
  const getDefaultAvatar = () => {
    if (user && user.username) {
      return user.username.charAt(0).toUpperCase();
    }
    // localStorage에서 사용자 정보 확인
    try {
      const localUser = localStorage.getItem('user');
      if (localUser) {
        const parsedUser = JSON.parse(localUser);
        if (parsedUser && parsedUser.username) {
          return parsedUser.username.charAt(0).toUpperCase();
        }
      }
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
    }
    return 'U';
  };

  // 사용자 정보 가져오기 (AuthContext 또는 localStorage)
  const getUserInfo = () => {
    if (user) return user;
    try {
      const localUser = localStorage.getItem('user');
      return localUser ? JSON.parse(localUser) : null;
    } catch (error) {
      console.error('사용자 정보 파싱 오류:', error);
      return null;
    }
  };

  const currentUser = getUserInfo();

  return (
    <>
      <HeaderContainer>
        <NavContainer>
          <FlexRow>
            <LeftBox>
              <LangSelectBox>
                <LangSelect value={i18n.language} onChange={handleLangChange}>
                  <option value="ko">🇰🇷 한국어</option>
                  <option value="en">🇺🇸 English</option>
                  <option value="ja">🇯🇵 日本語</option>
                  <option value="zh">🇨🇳 中文</option>
                </LangSelect>
              </LangSelectBox>
              <Logo to="/" onClick={(e) => {
                if (isWriting) {
                  e.preventDefault();
                  safeNavigate('/');
                }
              }}>
                홍책방
              </Logo>
            </LeftBox>

            {!isHome && (
              <NavLinks $isOpen={isOpen}>
                <li>
                  <NavLink 
                    to="/marketplace" 
                    onClick={(e) => {
                      if (isWriting) {
                        e.preventDefault();
                        safeNavigate('/marketplace');
                      }
                      setIsOpen(false);
                    }}
                  >
                    책거래게시판
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/map" 
                    onClick={(e) => {
                      if (isWriting) {
                        e.preventDefault();
                        safeNavigate('/map');
                      }
                      setIsOpen(false);
                    }}
                  >
                    지도
                  </NavLink>
                </li>
                <li>
                  <NavLink 
                    to="/ai-chat" 
                    onClick={(e) => {
                      if (isWriting) {
                        e.preventDefault();
                        safeNavigate('/ai-chat');
                      }
                      setIsOpen(false);
                    }}
                  >
                    AI 챗봇
                  </NavLink>
                </li>
              </NavLinks>
            )}

            <MenuBox>
              {isLoggedIn ? (
                <UserMenu>
                  <UserAvatar 
                    onClick={() => {
                      if (isWriting) {
                        safeNavigate('/mypage');
                      } else {
                        navigate('/mypage');
                      }
                    }} 
                    title="마이페이지"
                  >
                    {currentUser && currentUser.profileImage ? (
                      <img src={currentUser.profileImage} alt="Profile" />
                    ) : (
                      <div className="default-avatar">
                        {getDefaultAvatar()}
                      </div>
                    )}
                  </UserAvatar>
                  <LogoutButton onClick={handleLogout}>
                    로그아웃
                  </LogoutButton>
                </UserMenu>
              ) : (
                <>
                  <LoginButton 
                    to="/login"
                    onClick={(e) => {
                      if (isWriting) {
                        e.preventDefault();
                        safeNavigate('/login');
                      }
                    }}
                  >
                    로그인
                  </LoginButton>
                  <RegisterButton 
                    to="/register"
                    onClick={(e) => {
                      if (isWriting) {
                        e.preventDefault();
                        safeNavigate('/register');
                      }
                    }}
                  >
                    회원가입
                  </RegisterButton>
                </>
              )}
            </MenuBox>

            <Hamburger 
              onClick={toggleMenu} 
              className={isOpen ? 'active' : ''}
            >
              <span></span>
              <span></span>
              <span></span>
            </Hamburger>
          </FlexRow>

          <MobileMenuActions>
            {isOpen && (
              <>
                {isLoggedIn ? (
                  <>
                    <NavLink 
                      to="/mypage" 
                      onClick={(e) => {
                        if (isWriting) {
                          e.preventDefault();
                          safeNavigate('/mypage');
                        }
                        setIsOpen(false);
                      }}
                    >
                      마이페이지
                    </NavLink>
                    <LogoutButton onClick={handleLogout}>
                      로그아웃
                    </LogoutButton>
                  </>
                ) : (
                  <>
                    <LoginButton 
                      to="/login" 
                      onClick={(e) => {
                        if (isWriting) {
                          e.preventDefault();
                          safeNavigate('/login');
                        }
                        setIsOpen(false);
                      }}
                    >
                      로그인
                    </LoginButton>
                    <RegisterButton 
                      to="/register" 
                      onClick={(e) => {
                        if (isWriting) {
                          e.preventDefault();
                          safeNavigate('/register');
                        }
                        setIsOpen(false);
                      }}
                    >
                      회원가입
                    </RegisterButton>
                  </>
                )}
              </>
            )}
          </MobileMenuActions>
        </NavContainer>
      </HeaderContainer>

      {/* 경고 모달 */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        type={writingType}
        showSaveDraft={writingType === 'sale'}
      />
    </>
  );
};

export default Header; 