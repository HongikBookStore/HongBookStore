import { Link } from 'react-router-dom';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background: var(--text);
  color: white;
  padding: 8rem 0 3rem;
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: center;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--primary), transparent);
  }
`;

const FooterContent = styled.div`
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 0 4rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 6rem;
  margin-bottom: 4rem;

  @media (max-width: 1440px) {
    padding: 0 3rem;
  }

  @media (max-width: 1024px) {
    padding: 0 2rem;
    gap: 4rem;
  }

  @media (max-width: 768px) {
    padding: 0 1.5rem;
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
    background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  ul {
    list-style: none;
  }

  li {
    margin-bottom: 1.25rem;
  }
`;

const FooterLink = styled(Link)`
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: var(--transition);
  display: inline-block;
  font-size: 1.125rem;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    width: 0;
    height: 1px;
    background: var(--accent);
    transition: var(--transition);
  }

  &:hover {
    color: white;
    transform: translateX(4px);
  }

  &:hover::after {
    width: 100%;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 2rem;
`;

const SocialLink = styled.a`
  color: white;
  font-size: 2rem;
  transition: var(--transition);
  opacity: 0.8;

  &:hover {
    color: var(--accent);
    transform: translateY(-4px) scale(1.1);
    opacity: 1;
  }
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterContent>
        <FooterSection>
          <h3>Quick Links</h3>
          <ul>
            <li><FooterLink to="/marketplace">Book Market</FooterLink></li>
            <li><FooterLink to="/community">Community</FooterLink></li>
            <li><FooterLink to="/map">Map</FooterLink></li>
            <li><FooterLink to="/mypage">My Page</FooterLink></li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>Support</h3>
          <ul>
            <li><FooterLink to="/faq">FAQ</FooterLink></li>
            <li><FooterLink to="/contact">Contact Us</FooterLink></li>
            <li><FooterLink to="/privacy">Privacy Policy</FooterLink></li>
            <li><FooterLink to="/terms">Terms of Service</FooterLink></li>
          </ul>
        </FooterSection>
        <FooterSection>
          <h3>Connect With Us</h3>
          <SocialLinks>
            <SocialLink href="#" aria-label="Facebook">
              <i className="fab fa-facebook"></i>
            </SocialLink>
            <SocialLink href="#" aria-label="Twitter">
              <i className="fab fa-twitter"></i>
            </SocialLink>
            <SocialLink href="#" aria-label="Instagram">
              <i className="fab fa-instagram"></i>
            </SocialLink>
          </SocialLinks>
        </FooterSection>
      </FooterContent>
      <FooterBottom>
        <p>&copy; {new Date().getFullYear()} Hong Bookstore. All rights reserved.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer; 