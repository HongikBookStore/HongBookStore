import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
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

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideOut = keyframes`
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(-100%);
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
  justify-content: flex-end;
  padding: var(--space-16) 0;
  position: relative;
  min-height: calc(70vh - 80px);
  background: ${props => props.$background || '#f8f4f0'};
  transition: background 1s ease-in-out;
`;

const BackgroundIllustration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => props.$bgImage};
  background-size: 60% auto;
  background-position: 15% 30%;
  background-repeat: no-repeat;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 1s ease-in-out;
  z-index: 1;

  @media (max-width: 768px) {
    background-size: 80% auto;
    background-position: center 30%;
  }
`;

const OnboardingContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
  display: flex;
  justify-content: flex-end;
`;

const SlideContainer = styled.div`
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  overflow: visible;
  margin-bottom: 4rem;
  width: 60%;
  position: relative;
  padding-bottom: 0;

  @media (max-width: 768px) {
    height: 400px;
    margin-bottom: 3rem;
    justify-content: center;
    width: 100%;
    align-items: center;
    padding-bottom: 0;
    overflow: hidden;
  }
`;

const Slide = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: center;
  text-align: right;
  color: white;
  opacity: ${props => props.$active ? 1 : 0};
  transform: translateX(${props => props.$active ? 0 : props.$direction === 'next' ? '100%' : '-100%'});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${props => props.$active ? fadeIn : 'none'} 0.8s ease-out;
  padding-right: 2rem;
  width: 100%;
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateX(${props => props.$active ? 0 : props.$direction === 'next' ? '100%' : '-100%'}) translateY(-50%);

  @media (max-width: 768px) {
    align-items: center;
    text-align: center;
    padding-right: 0;
    position: relative;
    justify-content: center;
    top: auto;
    transform: translateX(${props => props.$active ? 0 : props.$direction === 'next' ? '100%' : '-100%'});
  }
`;

const SlideTitle = styled.h1`
  font-size: clamp(2.2rem, 4.5vw, 3rem);
  font-weight: 700;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 1s ease-out 0.3s backwards;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #1a202c;
  background: rgba(255, 255, 255, 0.98);
  padding: 1.5rem 2.5rem;
  border-radius: 20px;
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.9);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.08);
  letter-spacing: -0.01em;
  line-height: 1.2;
  position: relative;
  width: fit-content;
  max-width: 600px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(37, 99, 235, 0.05));
    border-radius: 20px;
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: clamp(1.8rem, 3.5vw, 2.2rem);
    margin-bottom: 1.2rem;
    padding: 1.2rem 2rem;
    max-width: 100%;
  }
`;

const SlideDescription = styled.p`
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.5;
  max-width: 600px;
  margin: 0 0 2.5rem 0;
  opacity: 0.95;
  animation: ${fadeIn} 1s ease-out 0.5s backwards;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  color: #2d3748;
  background: rgba(255, 255, 255, 0.95);
  padding: 1.5rem 2rem;
  border-radius: 15px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  font-weight: 500;
  position: relative;
  text-align: right;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(59, 130, 246, 0.03), rgba(37, 99, 235, 0.03));
    border-radius: 15px;
    z-index: -1;
  }

  @media (max-width: 768px) {
    font-size: clamp(0.9rem, 2.5vw, 1.1rem);
    margin-bottom: 2rem;
    padding: 1.2rem 1.5rem;
    max-width: 100%;
    text-align: center;
  }
`;

const SlideButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
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
  align-self: flex-end;

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
    align-self: center;
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  width: 100%;
  z-index: 10;
`;

const Progress = styled.div`
  height: 100%;
  background: ${props => {
    const slideIndex = props.$slideIndex;
    if (slideIndex === 0) {
      return 'linear-gradient(90deg, #E0F6FF, #87CEEB)'; // 연한 하늘색 그라데이션
    } else if (slideIndex === 1) {
      return 'linear-gradient(90deg, #E0F6FF, #4682B4)'; // 연한 하늘색 → 스틸블루
    } else if (slideIndex === 2) {
      return 'linear-gradient(90deg, #E0F6FF, #4169E1)'; // 연한 하늘색 → 로얄블루
    } else {
      return 'linear-gradient(90deg, #E0F6FF, #2563eb)'; // 연한 하늘색 → 파란색
    }
  }};
  width: ${props => props.$progress}%;
  transition: width 0.4s ease, background 0.8s ease;
  border-radius: 0 3px 3px 0;
  box-shadow: 0 0 15px ${props => {
    const slideIndex = props.$slideIndex;
    if (slideIndex === 0) {
      return 'rgba(224, 246, 255, 0.5)'; // 연한 하늘색 그림자
    } else if (slideIndex === 1) {
      return 'rgba(224, 246, 255, 0.5)'; // 연한 하늘색 그림자
    } else if (slideIndex === 2) {
      return 'rgba(224, 246, 255, 0.5)'; // 연한 하늘색 그림자
    } else {
      return 'rgba(224, 246, 255, 0.5)'; // 연한 하늘색 그림자
    }
  }};
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 55px;
  height: 55px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(15px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.25);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.prev {
    left: -550px;
  }

  &.next {
    right: -80px;
  }

  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
    
    &.prev {
      left: 1rem;
    }
    
    &.next {
      right: 1rem;
    }
  }
`;

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = [
    {
      title: '홍책방',
      description: '홍익대 학생들을 위한 중고책 거래 플랫폼입니다.',
      buttonText: '회원가입',
      backgroundImage: 'url("/images/onboarding-welcome.png")',
      background: '#f8f4f0'
    },
    {
      title: '북마켓',
      description: '전공서적, 교양서적을 안전하고 간편하게 이용하세요',
      buttonText: '책거래 시작하기',
      backgroundImage: 'url("/images/onboarding-marketplace.png")',
      background: '#f0f8f8'
    },
    {
      title: '홍익지도',
      description: '홍익대학교 주변의 여러 장소들을 공유해요',
      buttonText: '지도 보기',
      backgroundImage: 'url("/images/onboarding-map.png")',
      background: '#f8f0f8'
    },
    {
      title: 'AI 챗봇',
      description: 'AI 챗봇에게 여러 학교 정보들을 확인하세요',
      buttonText: 'AI 챗봇 시작하기',
      backgroundImage: 'url("/images/onboarding-chatbot.png")',
      background: '#f0f0f8'
    }
  ];

  useEffect(() => {
    if (autoPlay) {
      const timer = setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentSlide, autoPlay, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setAutoPlay(false);
    setTimeout(() => setAutoPlay(true), 5000);
  };

  const handleSlideButtonClick = (slideIndex) => {
    // 첫 번째 슬라이드(환영 메시지)인 경우 회원가입으로 이동
    if (slideIndex === 0) {
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/register');
    } else {
      // 다른 슬라이드들은 마켓플레이스로 이동
      localStorage.setItem('onboardingCompleted', 'true');
      navigate('/marketplace');
    }
  };

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

      <OnboardingSection $background={slides[currentSlide].background}>
        <OnboardingContainer>
          <SlideContainer>
            <NavigationButton className="prev" onClick={prevSlide}>
              <FaChevronLeft />
            </NavigationButton>
            {slides.map((slide, index) => (
              <Slide
                key={index}
                $active={currentSlide === index}
                $direction={index > currentSlide ? 'next' : 'prev'}
              >
                <SlideTitle>{slide.title}</SlideTitle>
                <SlideDescription>{slide.description}</SlideDescription>
                <SlideButton onClick={() => handleSlideButtonClick(index)}>
                  {slide.buttonText}
                  <span>→</span>
                </SlideButton>
              </Slide>
            ))}
            <NavigationButton className="next" onClick={nextSlide}>
              <FaChevronRight />
            </NavigationButton>
          </SlideContainer>

          <ProgressBar>
            <Progress $progress={((currentSlide + 1) / slides.length) * 100} $slideIndex={currentSlide} />
          </ProgressBar>
        </OnboardingContainer>
      </OnboardingSection>
    </HeroSection>
  );
};

export default Hero; 