import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
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

const FooterContainer = styled.footer`
  background: linear-gradient(135deg, var(--text) 0%, #1e293b 100%);
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

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(14, 165, 233, 0.1) 0%, transparent 50%);
    pointer-events: none;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  animation: ${float} 6s ease-in-out infinite;
  
  &:nth-child(1) {
    top: 10%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    top: 30%;
    right: 15%;
    animation-delay: 2s;
    width: 40px;
    height: 40px;
  }
  
  &:nth-child(3) {
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
    width: 30px;
    height: 30px;
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
  position: relative;
  z-index: 1;

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
  animation: ${fadeInUp} 0.6s ease-out ${props => props.delay || '0s'} backwards;

  h3 {
    font-size: 1.75rem;
    font-weight: 700;
    margin-bottom: 2.5rem;
    background: linear-gradient(135deg, white, rgba(255, 255, 255, 0.8));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: -8px;
      left: 0;
      width: 50px;
      height: 3px;
      background: linear-gradient(90deg, var(--primary), var(--secondary));
      border-radius: 2px;
    }
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
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  position: relative;
  padding: 0.5rem 0;

  &::before {
    content: '→';
    opacity: 0;
    transform: translateX(-10px);
    transition: var(--transition);
    color: var(--accent);
  }

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transition: var(--transition);
    border-radius: 1px;
  }

  &:hover {
    color: white;
    transform: translateX(8px);
  }

  &:hover::before {
    opacity: 1;
    transform: translateX(0);
  }

  &:hover::after {
    width: 100%;
  }
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 2rem;
  margin-top: 1rem;
`;

const SocialLink = styled.a`
  color: white;
  font-size: 2rem;
  transition: var(--transition);
  opacity: 0.8;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
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

  &:hover {
    color: var(--accent);
    transform: translateY(-4px) scale(1.1);
    opacity: 1;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
  }

  &:hover::before {
    transform: translateX(100%);
  }
`;

const ContactInfo = styled.div`
  margin-top: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 1rem;
`;

const FooterBottom = styled.div`
  text-align: center;
  padding-top: 3rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-size: 1.125rem;
  position: relative;
  z-index: 1;

  p {
    animation: ${fadeInUp} 0.6s ease-out 0.8s backwards;
  }
`;

const NewsletterSection = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: var(--radius-lg);
  padding: 2rem;
  margin-bottom: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: ${fadeInUp} 0.6s ease-out 0.4s backwards;

  h4 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
    color: white;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
  }
`;

const NewsletterForm = styled.form`
  display: flex;
  gap: 1rem;
  max-width: 400px;

  @media (max-width: 768px) {
    flex-direction: column;
  }

  input {
    flex: 1;
    padding: 0.75rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius);
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1rem;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
    }
  }

  button {
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, var(--primary), var(--secondary));
    color: white;
    border: none;
    border-radius: var(--radius);
    font-weight: 600;
    cursor: pointer;
    transition: var(--transition);

    &:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-lg);
    }
  }
`;

const Footer = () => {
  const { t } = useTranslation();
  return (
    <FooterContainer>
      <FloatingElement />
      <FloatingElement />
      <FloatingElement />
      
      <FooterContent>
        <FooterSection delay="0s">
          <h3>빠른 링크</h3>
          <ul>
            <li><FooterLink to="/marketplace">책거래게시판</FooterLink></li>
            <li><FooterLink to="/wanted">구하기 게시판</FooterLink></li>
            <li><FooterLink to="/bookstore">나의 책방</FooterLink></li>
            <li><FooterLink to="/chat">AI챗봇</FooterLink></li>
            <li><FooterLink to="/map">지도</FooterLink></li>
          </ul>
        </FooterSection>
        
        <FooterSection delay="0.2s">
          <h3>고객 지원</h3>
          <ul>
            <li><FooterLink to="/faq">자주 묻는 질문</FooterLink></li>
            <li><FooterLink to="/contact">문의하기</FooterLink></li>
            <li><FooterLink to="/privacy">개인정보처리방침</FooterLink></li>
            <li><FooterLink to="/terms">이용약관</FooterLink></li>
          </ul>
        </FooterSection>
        
        <FooterSection delay="0.4s">
          <h3>연락처</h3>
          <ContactInfo>
            <ContactItem type="email">support@hongbookstore.com</ContactItem>
            <ContactItem type="phone">02-1234-5678</ContactItem>
            <ContactItem type="location">서울특별시 마포구 와우산로 94</ContactItem>
          </ContactInfo>
          
          <NewsletterSection>
            <h4>뉴스레터 구독</h4>
            <p>새로운 책과 이벤트 소식을 받아보세요!</p>
            <NewsletterForm>
              <input type="email" placeholder="이메일 주소를 입력하세요" />
              <button type="submit">구독하기</button>
            </NewsletterForm>
          </NewsletterSection>
        </FooterSection>
        
        <FooterSection delay="0.6s">
          <h3>소셜 미디어</h3>
          <SocialLinks>
            <SocialLink href="#facebook" aria-label="Facebook" />
            <SocialLink href="#twitter" aria-label="Twitter" />
            <SocialLink href="#instagram" aria-label="Instagram" />
            <SocialLink href="#youtube" aria-label="YouTube" />
          </SocialLinks>
        </FooterSection>
      </FooterContent>
      
      <FooterBottom>
        <p>&copy; {new Date().getFullYear()} 홍북스토어. 모든 권리 보유.</p>
      </FooterBottom>
    </FooterContainer>
  );
};

export default Footer; 