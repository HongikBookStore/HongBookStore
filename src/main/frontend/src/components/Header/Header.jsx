import { useState, useEffect, useContext, useRef } from 'react';
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
  border-bottom: 1px solid var(--border-light);
  position: fixed;
  width: 100%;
  top: 0;
  z-index: var(--z-fixed);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: ${slideDown} 0.6s ease-out;
  transition: var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const NavContainer = styled.nav`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 var(--space-16);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;

  @media (max-width: 1440px) {
    padding: 0 var(--space-12);
  }

  @media (max-width: 1024px) {
    padding: 0 var(--space-8);
  }

  @media (max-width: 900px) {
    padding: 0 var(--space-2);
  }
`;

const FlexRow = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 48px;
  padding: var(--space-1) 0 var(--space-1) 0;
  
  @media (max-width: 900px) {
    min-height: 40px;
    padding: var(--space-1) 0;
  }
`;

const LeftBox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-5);
`;

const LangSelectBox = styled.div`
  display: flex;
  align-items: center;
  margin-right: var(--space-5);
  position: relative;
`;

const LangSelect = styled.select`
  background: var(--primary-50);
  border: 1px solid var(--primary-200);
  border-radius: var(--radius-lg);
  padding: var(--space-2) var(--space-4);
  font-size: 0.9rem;
  color: var(--primary-700);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: 500;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right var(--space-2) center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: var(--space-8);

  &:hover {
    background-color: var(--primary-100);
    border-color: var(--primary-300);
    transform: translateY(-1px);
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px var(--primary-100);
    border-color: var(--primary-500);
  }

  .lang-text {
    display: inline;
  }

  @media (max-width: 768px) {
    padding: var(--space-2) var(--space-3);
    font-size: 0.8rem;
    
    .lang-text {
      display: none;
    }
    
    option {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 600px) {
    padding: var(--space-2);
    min-width: 60px;
    
    .lang-text {
      display: none;
    }
    
    option {
      font-size: 0.75rem;
    }
  }

  @media (max-width: 480px) {
    padding: var(--space-1) var(--space-2);
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
  background-clip: text;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  transition: var(--transition-normal);
  position: relative;
  min-width: 0;
  flex-shrink: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  &:hover {
    transform: translateY(-1px);
    filter: brightness(1.1);
  }
  
  @media (max-width: 900px) {
    font-size: 1.2rem;
  }
  
  @media (max-width: 600px) {
    font-size: 1.1rem;
  }
`;

const NavLinks = styled.ul`
  display: flex;
  align-items: center;
  gap: var(--space-8);
  list-style: none;
  margin: 0;
  padding: 0;

  @media (max-width: 900px) {
    display: none;
  }
`;

const NavLink = styled.li`
  position: relative;
`;

const NavLinkItem = styled(Link)`
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 500;
  font-size: 0.95rem;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  position: relative;
  display: flex;
  align-items: center;
  gap: var(--space-1);

  &:hover {
    color: var(--primary);
    background-color: var(--primary-50);
    transform: translateY(-1px);
  }

  &.active {
    color: var(--primary);
    background-color: var(--primary-100);
    font-weight: 600;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 2px;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    transition: var(--transition-normal);
    border-radius: var(--radius-full);
  }

  &:hover::after,
  &.active::after {
    width: 80%;
  }
`;

const RightBox = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-4);
`;

const AuthButtons = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);

  @media (max-width: 900px) {
    display: none;
  }
`;

const Button = styled.button`
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-lg);
  font-weight: 500;
  font-size: 0.9rem;
  transition: var(--transition-normal);
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: var(--transition-normal);
  }

  &:hover::before {
    left: 100%;
  }
`;

const LoginButton = styled(Button)`
  background: transparent;
  color: var(--primary);
  border: 1px solid var(--primary-200);

  &:hover {
    background: var(--primary-50);
    border-color: var(--primary-300);
    transform: translateY(-1px);
    box-shadow: var(--shadow-sm);
  }
`;

const RegisterButton = styled(Button)`
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  color: white;
  border: 1px solid var(--primary);

  &:hover {
    background: linear-gradient(135deg, var(--primary-dark), var(--secondary-dark));
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
`;

const UserMenu = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;

  @media (max-width: 900px) {
    display: none;
  }
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition-normal);
  border: 2px solid var(--primary-100);

  &:hover {
    transform: scale(1.05);
    box-shadow: var(--shadow-md);
  }
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-2);
  background: white;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  min-width: 200px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: var(--transition-normal);
  z-index: var(--z-dropdown);

  ${({ isOpen }) => isOpen && `
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
  `}
`;

const DropdownItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  transition: var(--transition-fast);
  border-bottom: 1px solid var(--border-light);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: var(--gray-50);
    color: var(--primary);
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--error);
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: var(--transition-fast);

  &:hover {
    background: var(--error-50);
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 1.5rem;
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);

  &:hover {
    background: var(--gray-100);
    color: var(--primary);
  }

  @media (max-width: 900px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const MobileMenu = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: var(--z-modal-backdrop);
  opacity: 0;
  visibility: hidden;
  transition: var(--transition-normal);

  ${({ isOpen }) => isOpen && `
    opacity: 1;
    visibility: visible;
  `}
`;

const MobileMenuContent = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  background: white;
  padding: var(--space-6);
  transform: translateX(100%);
  transition: var(--transition-normal);
  overflow-y: auto;

  ${({ isOpen }) => isOpen && `
    transform: translateX(0);
  `}
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--border-light);
`;

const MobileMenuClose = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: var(--space-2);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);

  &:hover {
    background: var(--gray-100);
    color: var(--error);
  }
`;

const MobileNavLinks = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
`;

const MobileNavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  font-weight: 500;

  &:hover {
    background: var(--gray-50);
    color: var(--primary);
  }

  &.active {
    background: var(--primary-50);
    color: var(--primary);
    font-weight: 600;
  }
`;

const WritingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-3);
  background: var(--warning-50);
  color: var(--warning-700);
  border: 1px solid var(--warning-200);
  border-radius: var(--radius-full);
  font-size: 0.8rem;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;

  @media (max-width: 900px) {
    display: none;
  }
`;

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // 데스크탑 유저 드롭다운 상태
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const location = useLocation();
  
  // Context API를 사용하여 로그인 상태와 로그아웃 함수를 가져옵니다.
  const { isLoggedIn, user, logout } = useContext(AuthCtx);
  const { isWriting, writingType } = useWriting();

  const userMenuRef = useRef(null); // 드롭다운 외부 클릭 감지를 위한 ref
  const isHome = location.pathname === '/';

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  const handleLogout = async () => {
  // 모바일 메뉴가 열려있을 경우를 대비해 먼저 닫아줍니다.
  setIsMobileMenuOpen(false);
  setIsDropdownOpen(false);

  try {
        // Context에서 가져온 logout 함수를 호출
        // 이 함수는 api 호출, 로컬 스토리지 정리, 상태 업데이트를 모두 책임
        await logout();
        navigate('/');
    } catch (error) {
        console.error("로그아웃 처리 중 에러 발생", error);
        alert("로그아웃 중 문제가 발생했습니다.");
    }
    //localStorage.removeItem('isVerified');
    //localStorage.removeItem('verifiedEmail');

};

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // 안전한 네비게이션 함수
  const safeNavigate = (path) => {
    if (isWriting) {
      setPendingNavigation(path);
      setShowWarningModal(true);
    } else {
      navigate(path);
    }
    // 메뉴가 열려있다면 닫기
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
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
              <NavLinks>
                {/* NavLinkItem들은 safeNavigate를 사용하도록 onClick을 추가 */}
                <NavLinkItem to="/marketplace" className={location.pathname === '/marketplace' ? 'active' : ''} onClick={(e) => { e.preventDefault(); safeNavigate('/marketplace'); }}>
                  책 거래 게시판
                </NavLinkItem>
                <NavLinkItem to="/my-transactions" className={location.pathname === '/my-transactions' ? 'active' : ''} onClick={(e) => { e.preventDefault(); safeNavigate('/my-transactions'); }}>
                  나의 거래
                </NavLinkItem>
                <NavLinkItem to="/hongikmap" className={location.pathname === '/hongikmap' ? 'active' : ''} onClick={(e) => { e.preventDefault(); safeNavigate('/hongikmap'); }}>
                  지도
                </NavLinkItem>
                <NavLinkItem to="/ai-chat" className={location.pathname === '/ai-chat' ? 'active' : ''} onClick={(e) => { e.preventDefault(); safeNavigate('/ai-chat'); }}>
                  AI 챗봇
                </NavLinkItem>
              </NavLinks>
            )}

            <RightBox>
              {isLoggedIn ? (
                <UserMenu ref={userMenuRef}>
                  <UserAvatar 
                    onClick={() => setIsDropdownOpen(prev => !prev)} 
                    title="사용자 메뉴"
                  >
                    {user && user.profileImage ? (
                      <img src={user.profileImage} alt="Profile" style={{width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover'}}/>
                    ) : (
                      <div className="default-avatar">
                        {getDefaultAvatar()}
                      </div>
                    )}
                  </UserAvatar>
                  <UserDropdown isOpen={isDropdownOpen}>
                    <DropdownItem to="/mypage" onClick={() => safeNavigate('/mypage')}>
                      마이페이지
                    </DropdownItem>
                    <DropdownItem to="/my-transactions" onClick={() => safeNavigate('/my-transactions')}>
                      나의 거래
                    </DropdownItem>
                    <LogoutButton onClick={handleLogout}>
                      로그아웃
                    </LogoutButton>
                  </UserDropdown>
                </UserMenu>
              ) : (
                <AuthButtons>
                  <LoginButton onClick={() => safeNavigate('/login')}>
                    로그인
                  </LoginButton>
                  <RegisterButton onClick={() => safeNavigate('/register')}>
                    회원가입
                  </RegisterButton>
                </AuthButtons>
              )}
              {isWriting && (
                <WritingIndicator>
                  초안 저장 중
                </WritingIndicator>
              )}
            </RightBox>

            <MobileMenuButton onClick={toggleMobileMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </MobileMenuButton>
          </FlexRow>
        </NavContainer>
      </HeaderContainer>

          <MobileMenu isOpen={isMobileMenuOpen} onClick={toggleMobileMenu}>
        <MobileMenuContent isOpen={isMobileMenuOpen} onClick={(e) => e.stopPropagation()}>
          <MobileMenuHeader>
            <h3>메뉴</h3>
            <MobileMenuClose onClick={toggleMobileMenu}>×</MobileMenuClose>
          </MobileMenuHeader>
          <MobileNavLinks>
            <MobileNavLink to="/marketplace" onClick={() => safeNavigate('/marketplace')} style={{fontWeight: '700', color: 'var(--primary)', justifyContent: 'center', fontSize: '1.1rem', background: 'var(--primary-50)', borderRadius: 'var(--radius-xl)', marginBottom: 'var(--space-4)'}}>
              지금 시작하기 <span style={{marginLeft: 4}}>→</span>
            </MobileNavLink>
            {isLoggedIn ? (
              <>
                <MobileNavLink to="/mypage" onClick={() => safeNavigate('/mypage')}>
                  마이페이지
                </MobileNavLink>
                <MobileNavLink to="/my-transactions" onClick={() => safeNavigate('/my-transactions')}>
                  나의 거래
                </MobileNavLink>
                <MobileNavLink as="button" onClick={handleLogout}>
                  로그아웃
                </MobileNavLink>
              </>
            ) : (
              <>
                <MobileNavLink to="/login" onClick={() => safeNavigate('/login')}>
                  로그인
                </MobileNavLink>
                <MobileNavLink to="/register" onClick={() => safeNavigate('/register')}>
                  회원가입
                </MobileNavLink>
              </>
            )}
          </MobileNavLinks>
        </MobileMenuContent>
      </MobileMenu>

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