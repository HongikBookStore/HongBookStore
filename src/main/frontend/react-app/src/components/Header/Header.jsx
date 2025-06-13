import { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
  justify-content: center;
`;

const NavContainer = styled.nav`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 5rem;

  @media (max-width: 1440px) {
    padding: 0 3rem;
  }

  @media (max-width: 1024px) {
    padding: 0 2rem;
  }

  @media (max-width: 768px) {
    padding: 0 1.5rem;
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

  &:hover {
    transform: translateY(-2px);
  }
`;

const NavLinks = styled.ul`
  display: flex;
  gap: 3rem;
  list-style: none;

  @media (max-width: 768px) {
    display: ${({ isOpen }) => (isOpen ? 'flex' : 'none')};
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(12px);
    padding: 1.5rem;
    box-shadow: var(--shadow-xl);
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    gap: 1.5rem;
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

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <HeaderContainer>
      <NavContainer>
        <Logo to="/">Hong Bookstore</Logo>
        <NavLinks isOpen={isOpen}>
          <li><NavLink to="/marketplace">Book Market</NavLink></li>
          <li><NavLink to="/community">Community</NavLink></li>
          <li><NavLink to="/map">Map</NavLink></li>
          <li><NavLink to="/mypage">My Page</NavLink></li>
        </NavLinks>
        <Hamburger onClick={() => setIsOpen(!isOpen)}>
          <span />
          <span />
          <span />
        </Hamburger>
      </NavContainer>
    </HeaderContainer>
  );
};

export default Header; 