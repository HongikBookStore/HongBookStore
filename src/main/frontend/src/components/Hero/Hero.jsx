import { Link } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FaBookOpen, FaExchangeAlt, FaMapMarkedAlt, FaRobot } from 'react-icons/fa';

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
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

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 8rem 0;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
    animation: gradientShift 15s ease infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    animation: float 20s ease-in-out infinite;
  }
`;

const FloatingElement = styled.div`
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
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
  color: white;
  animation: fadeInUp 1s ease-out;
`;

const Title = styled.h1`
  font-size: 5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 2rem;
  padding-bottom: 0.3em;
  background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 1s ease-out;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    height: 4px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: ${pulse} 2s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Description = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  animation: fadeInUp 1s ease-out 0.2s backwards;
  position: relative;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const MainGrid = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4rem;
  margin-top: 6rem;
  flex-wrap: wrap;

  @media (max-width: 900px) {
    gap: 2rem;
    flex-direction: column;
    margin-top: 2rem;
  }
`;

const MainCard = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  background: white;
  border: 2px solid var(--primary);
  border-radius: 1.5rem;
  padding: 2.5rem 2.5rem 1.5rem 2.5rem;
  min-width: 200px;
  min-height: 260px;
  box-shadow: 0 4px 24px 0 rgba(35,81,233,0.07);
  transition: box-shadow 0.2s, transform 0.2s, color 0.2s, border-color 0.2s;
  color: var(--primary);
  font-weight: 600;
  font-size: 1.2rem;
  &:hover {
    box-shadow: 0 8px 32px 0 rgba(35,81,233,0.15);
    transform: translateY(-6px) scale(1.03);
    color: var(--primary-dark);
    border-color: var(--primary-dark);
  }
`;

const MainIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  color: var(--primary);
`;

const MainLabel = styled.div`
  margin-top: 1rem;
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--primary);
`;

const Hero = () => {
  return (
    <HeroSection style={{background: '#f5f8ff', minHeight: '100vh'}}>
      <HeroContent style={{color: '#2351e9', background: 'none', maxWidth: '1200px'}}>
        <MainGrid>
          <MainCard to="/marketplace">
            <MainIcon><FaBookOpen /></MainIcon>
            <MainLabel>책 거래 게시판</MainLabel>
          </MainCard>
          <MainCard to="/my-transactions">
            <MainIcon><FaExchangeAlt /></MainIcon>
            <MainLabel>나의 거래</MainLabel>
          </MainCard>
          <MainCard to="/hongikmap">
            <MainIcon><FaMapMarkedAlt /></MainIcon>
            <MainLabel>지도</MainLabel>
          </MainCard>
          <MainCard to="/chatbot">
            <MainIcon><FaRobot /></MainIcon>
            <MainLabel>AI 챗봇</MainLabel>
          </MainCard>
        </MainGrid>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero; 