import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;


const HeroSection = styled.section`
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: transparent;
  margin-top: 80px;
`;

const OnboardingSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  position: relative;
  min-height: calc(70vh - 80px);
  background: #ffffff;
`;


const OnboardingContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-bottom: 2rem;
  width: 100%;
  max-width: 600px;

  @media (max-width: 768px) {
    gap: 1.5rem;
    margin-bottom: 1.5rem;
  }
`;

const Title = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 1rem;
  animation: ${fadeIn} 1s ease-out 0.3s backwards;
  color: #1a202c;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  letter-spacing: -0.01em;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 0.8rem;
  }
`;

const Description = styled.p`
  font-size: clamp(1.1rem, 2.2vw, 1.3rem);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 0 2rem 0;
  opacity: 0.9;
  animation: ${fadeIn} 1s ease-out 0.5s backwards;
  color: #2d3748;
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: clamp(1rem, 2.5vw, 1.2rem);
    margin-bottom: 1.5rem;
  }
`;

const MenuButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: none;
  animation: ${fadeIn} 1s ease-out 0.7s backwards;
  backdrop-filter: blur(10px);
  box-shadow: 0 12px 30px rgba(59, 130, 246, 0.3);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  letter-spacing: 0.3px;
  width: 100%;
  max-width: 300px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(59, 130, 246, 0.4);
    letter-spacing: 0.5px;

    &::before {
      left: 100%;
    }
  }

  &:active {
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1rem;
    max-width: 280px;
  }
`;


const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const menuItems = [
    {
      title: '책거래게시판',
      description: '전공서적, 교양서적을 안전하고 간편하게 거래하세요',
      path: '/marketplace'
    },
    {
      title: '홍익지도',
      description: '홍익대학교 주변의 여러 장소들을 공유해요',
      path: '/hongikmap'
    },
    {
      title: '나의 거래',
      description: '내가 등록한 책과 거래 내역을 관리하세요',
      path: '/bookstore'
    }
  ];

  const handleMenuClick = (path) => {
    navigate(path);
  };

  return (
    <HeroSection>
      <OnboardingSection>
        <OnboardingContainer>
          <Title>홍책방</Title>
          <Description>홍익대 학생들을 위한 중고책 거래 플랫폼입니다.</Description>
          
          <ButtonContainer>
            {menuItems.map((item, index) => (
              <MenuButton 
                key={index}
                onClick={() => handleMenuClick(item.path)}
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                {item.title}
                <span>→</span>
              </MenuButton>
            ))}
          </ButtonContainer>
        </OnboardingContainer>
      </OnboardingSection>
    </HeroSection>
  );
};

export default Hero; 