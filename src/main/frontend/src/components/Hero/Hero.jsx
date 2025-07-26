import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaBookOpen, FaExchangeAlt, FaMapMarkedAlt, FaRobot } from 'react-icons/fa';

const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(5deg); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
`;

const slideInLeft = keyframes`
  from { transform: translateX(-100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideInRight = keyframes`
  from { transform: translateX(100px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const gradientShift = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: var(--space-32) 0;
  position: relative;
  overflow: hidden;
  background: #fff;
`;

const FloatingElement = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  animation: ${float} 6s ease-in-out infinite;
  
  &:nth-child(1) {
    top: 20%;
    left: 10%;
    animation-delay: 0s;
    width: 60px;
    height: 60px;
  }
  
  &:nth-child(2) {
    top: 60%;
    right: 15%;
    animation-delay: 2s;
    width: 80px;
    height: 80px;
  }
  
  &:nth-child(3) {
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
    width: 40px;
    height: 40px;
  }
`;

const BookIcon = styled.div`
  position: absolute;
  font-size: 2rem;
  color: rgba(255, 255, 255, 0.3);
  animation: ${rotate} 20s linear infinite;
  
  &:nth-child(4) {
    top: 30%;
    right: 25%;
    animation-delay: 0s;
  }
  
  &:nth-child(5) {
    bottom: 30%;
    right: 10%;
    animation-delay: 10s;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  text-align: center;
  color: var(--text-primary);
  animation: fadeInUp 1s ease-out;
`;

const Title = styled.h1`
  font-size: clamp(3rem, 8vw, 5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: var(--space-8);
  padding-bottom: var(--space-4);
  color: var(--text-primary);
  animation: fadeInUp 1s ease-out;
  position: relative;
  letter-spacing: -0.025em;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 120px;
    height: 4px;
    background: var(--primary-200);
    animation: ${pulse} 2s ease-in-out infinite;
    border-radius: var(--radius-full);
  }

  @media (max-width: 768px) {
    font-size: clamp(2.5rem, 6vw, 3.5rem);
    margin-bottom: var(--space-6);
  }
`;

const Description = styled.p`
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  color: var(--text-secondary);
  margin-bottom: var(--space-12);
  animation: fadeInUp 1s ease-out 0.2s backwards;
  position: relative;
  line-height: 1.6;
  font-weight: 400;

  @media (max-width: 768px) {
    font-size: clamp(1.125rem, 3vw, 1.5rem);
    margin-bottom: var(--space-8);
  }
`;

const MainGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-top: var(--space-16);
  max-width: 1200px;
  margin-left: auto;
  margin-right: auto;
  flex-wrap: wrap;
`;

const MainCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  background: none;
  border: none;
  box-shadow: none;
  padding: 0;
  min-width: 0;
  min-height: 0;
  color: var(--primary);
  font-weight: 600;
  font-size: 1.1rem;
  transition: none;
  cursor: pointer;
  &:hover, &:focus {
    color: var(--primary-dark);
    background: none;
    box-shadow: none;
    border: none;
    text-decoration: underline;
  }
`;

const CardIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  margin-bottom: 0.7rem;
  
  & > svg {
    font-size: 3rem;
    color: var(--primary);
  }
`;

const CardTitle = styled.div`
  font-size: 1.08rem;
  font-weight: 500;
  color: var(--primary);
  margin-top: 0.1rem;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: var(--text-secondary);
  text-align: center;
  line-height: 1.6;
  font-weight: 400;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const StatsSection = styled.div`
  margin-top: var(--space-16);
  display: flex;
  justify-content: center;
  gap: var(--space-12);
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin-top: var(--space-8);
    gap: var(--space-6);
  }
`;

const StatItem = styled.div`
  text-align: center;
  color: rgba(255, 255, 255, 0.9);
  animation: fadeInUp 1s ease-out 0.4s backwards;
`;

const StatNumber = styled.div`
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 800;
  color: white;
  margin-bottom: var(--space-2);
`;

const StatLabel = styled.div`
  font-size: 1rem;
  font-weight: 500;
  opacity: 0.8;
`;

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  background: rgba(255, 255, 255, 0.95);
  color: var(--primary);
  padding: var(--space-4) var(--space-8);
  border-radius: var(--radius-2xl);
  text-decoration: none;
  font-weight: 600;
  font-size: 1.125rem;
  transition: var(--transition-normal);
  box-shadow: var(--shadow-lg);
  border: 1px solid rgba(255, 255, 255, 0.2);
  margin-top: var(--space-8);

  &:hover {
    background: white;
    transform: translateY(-2px);
    box-shadow: var(--shadow-xl);
    color: var(--primary-dark);
  }

  @media (max-width: 900px) {
    display: none;
  }

  @media (max-width: 768px) {
    padding: var(--space-3) var(--space-6);
    font-size: 1rem;
    margin-top: var(--space-6);
  }
`;

const Hero = () => {
  const { t } = useTranslation();

  return (
    <HeroSection>
      <FloatingElement />
      <FloatingElement />
      <FloatingElement />
      <BookIcon>📚</BookIcon>
      <BookIcon>📖</BookIcon>
      
      <HeroContent>
        <Title>홍북스토어</Title>
        <Description>
          홍익대학교 학생들을 위한 중고책 거래 플랫폼
        </Description>
        
        <MainGrid>
          <MainCard to="/marketplace">
            <CardIcon>
              <FaBookOpen />
            </CardIcon>
            <CardTitle>책거래게시판</CardTitle>
          </MainCard>
          
          <MainCard to="/wanted">
            <CardIcon>
              <FaExchangeAlt />
            </CardIcon>
            <CardTitle>구해요</CardTitle>
          </MainCard>
          
          <MainCard to="/hongikmap">
            <CardIcon>
              <FaMapMarkedAlt />
            </CardIcon>
            <CardTitle>지도</CardTitle>
          </MainCard>
        </MainGrid>

        {/* 통계(StatsSection) 삭제됨 */}

        <CTAButton to="/marketplace" className="hero-cta">
          지금 시작하기
          <span>→</span>
        </CTAButton>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero; 