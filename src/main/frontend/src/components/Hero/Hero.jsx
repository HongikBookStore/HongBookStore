import { Link, useNavigate } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { FaBookOpen, FaMapMarkedAlt, FaRobot, FaUser, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const slideOut = keyframes`
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(-100%); opacity: 0; }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

const HeroSection = styled.section`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-16) 0;
  position: relative;
  overflow: hidden;
  background: transparent;
`;

const BackgroundIllustration = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: ${props => props.$bgImage};
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => props.$active ? 1 : 0};
  transition: opacity 1s ease-in-out;
  z-index: 1;
`;

const FloatingElements = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
`;

const FloatingElement = styled.div`
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: ${float} 6s ease-in-out infinite;
  
  &:nth-child(1) {
    width: 80px;
    height: 80px;
    top: 20%;
    left: 10%;
    animation-delay: 0s;
  }
  
  &:nth-child(2) {
    width: 120px;
    height: 120px;
    top: 60%;
    right: 15%;
    animation-delay: 2s;
  }
  
  &:nth-child(3) {
    width: 60px;
    height: 60px;
    bottom: 30%;
    left: 20%;
    animation-delay: 4s;
  }
`;

const OnboardingContainer = styled.div`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
`;

const SlideContainer = styled.div`
  position: relative;
  width: 100%;
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  margin-bottom: 4rem;

  @media (max-width: 768px) {
    height: 400px;
    margin-bottom: 3rem;
  }
`;

const Slide = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  opacity: ${props => props.$active ? 1 : 0};
  transform: translateX(${props => props.$active ? 0 : props.$direction === 'next' ? '100%' : '-100%'});
  transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  animation: ${props => props.$active ? fadeIn : 'none'} 0.8s ease-out;
`;

const SlideIcon = styled.div`
  font-size: 6rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 1s ease-out 0.3s backwards, ${pulse} 3s ease-in-out infinite;
  filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.3));
  background: rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 50%;
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    font-size: 4rem;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
  }
`;

const SlideTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1.5rem;
  animation: ${fadeIn} 1s ease-out 0.5s backwards;
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
  color: white;
  background: rgba(0, 0, 0, 0.3);
  padding: 1rem 2rem;
  border-radius: 15px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 768px) {
    font-size: clamp(2rem, 4vw, 2.5rem);
    margin-bottom: 1rem;
    padding: 0.8rem 1.5rem;
  }
`;

const SlideDescription = styled.p`
  font-size: clamp(1.1rem, 2vw, 1.3rem);
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto 2rem;
  opacity: 0.95;
  animation: ${fadeIn} 1s ease-out 0.7s backwards;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  color: white;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    font-size: clamp(1rem, 3vw, 1.1rem);
    margin-bottom: 1.5rem;
    padding: 0.8rem 1.2rem;
  }
`;

const SlideButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 1.2rem 2.5rem;
  border-radius: 50px;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.8);
  animation: ${fadeIn} 1s ease-out 0.9s backwards;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  &:hover {
    background: rgba(255, 255, 255, 1);
    transform: translateY(-3px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 1);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 1rem 2rem;
    font-size: 1rem;
  }
`;

const NavigationDots = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 4rem;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    margin-bottom: 3rem;
    gap: 1rem;
  }
`;

const Dot = styled.button`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: ${props => props.$active ? 'white' : 'transparent'};
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: white;
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  ${props => props.$active && `
    &::before {
      width: 8px;
      height: 8px;
    }
  `}

  &:hover {
    border-color: rgba(255, 255, 255, 0.8);
    transform: scale(1.2);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const NavigationButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.3);
    transform: translateY(-50%) scale(1.1);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }

  &.prev {
    left: 2rem;
  }

  &.next {
    right: 2rem;
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    
    &.prev {
      left: 1rem;
    }
    
    &.next {
      right: 1rem;
    }
  }
`;

const ProgressBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  width: 100%;
  z-index: 10;
`;

const Progress = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #fff, #f0f0f0);
  width: ${props => props.$progress}%;
  transition: width 0.3s ease;
  border-radius: 0 2px 2px 0;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
`;

const MenuSection = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  flex-wrap: wrap;
  margin-top: 2rem;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    gap: 2rem;
    margin-top: 1rem;
  }
`;

const MenuButton = styled(Link)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 2rem 2.5rem;
  border-radius: 20px;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(15px);
  min-width: 140px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transition: left 0.6s;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: translateY(-8px);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
    border-color: rgba(255, 255, 255, 0.5);

    &::before {
      left: 100%;
    }
  }

  @media (max-width: 768px) {
    padding: 1.5rem 2rem;
    min-width: 120px;
    gap: 0.8rem;
  }
`;

const MenuIcon = styled.div`
  font-size: 2.5rem;
  transition: all 0.3s ease;
  animation: ${bounce} 2s ease-in-out infinite;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));

  ${MenuButton}:hover & {
    transform: scale(1.2);
    animation: ${pulse} 1s ease-in-out infinite;
  }

  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const MenuText = styled.span`
  font-weight: 700;
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.5px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 768px) {
    font-size: 0.9rem;
  }
`;

const Divider = styled.div`
  width: 80%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  margin: 3rem auto;
  position: relative;
  z-index: 3;

  @media (max-width: 768px) {
    margin: 2rem auto;
  }
`;

const Hero = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const slides = [
    {
      icon: '📚',
      title: '홍책방에 오신 것을 환영합니다',
      description: '홍익대학교 학생들을 위한 중고책 거래 플랫폼입니다. 안전하고 편리하게 책을 거래해보세요.',
      buttonText: '회원가입',
      backgroundImage: 'url("/images/onboarding-welcome.png")' // PNG 파일 경로
    },
    {
      icon: <FaBookOpen />,
      title: '책거래게시판',
      description: '전공서적부터 교양도서까지, 다양한 책들을 구매하고 판매할 수 있습니다. 학과별 필터링으로 원하는 책을 쉽게 찾아보세요.',
      buttonText: '책거래 시작하기',
      backgroundImage: 'url("/images/onboarding-marketplace.png")' // PNG 파일 경로
    },
    {
      icon: <FaMapMarkedAlt />,
      title: '홍익지도',
      description: '홍익대학교 주변의 서점, 도서관, 카페 등 책과 관련된 장소들을 지도에서 확인할 수 있습니다.',
      buttonText: '지도 보기',
      backgroundImage: 'url("/images/onboarding-map.png")' // PNG 파일 경로
    },
    {
      icon: <FaRobot />,
      title: 'AI 챗봇',
      description: '책 추천, 가격 조언, 거래 팁 등 AI 챗봇과 대화하며 도움을 받아보세요.',
      buttonText: 'AI 챗봇 시작하기',
      backgroundImage: 'url("/images/onboarding-chatbot.png")' // PNG 파일 경로
    }
  ];

  const menuItems = [
    { icon: <FaBookOpen />, text: '책거래', link: '/marketplace' },
    { icon: <FaMapMarkedAlt />, text: '홍익지도', link: '/hongikmap' },
    { icon: <FaRobot />, text: 'AI 챗봇', link: '/ai-chat' },
    { icon: <FaUser />, text: '마이페이지', link: '/mypage' }
  ];

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [autoPlay, slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setAutoPlay(false);
    // 5초 후 자동재생 재개
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
      <ProgressBar>
        <Progress $progress={((currentSlide + 1) / slides.length) * 100} />
      </ProgressBar>
      
      {/* 배경 일러스트레이션들 */}
      {slides.map((slide, index) => (
        <BackgroundIllustration
          key={index}
          $bgImage={slide.backgroundImage}
          $active={currentSlide === index}
        />
      ))}
      
      <FloatingElements>
        <FloatingElement />
        <FloatingElement />
        <FloatingElement />
      </FloatingElements>

      <OnboardingContainer>
        <SlideContainer>
          {slides.map((slide, index) => (
            <Slide
              key={index}
              $active={currentSlide === index}
              $direction={index > currentSlide ? 'next' : 'prev'}
            >
              <SlideIcon>
                {slide.icon}
              </SlideIcon>
              <SlideTitle>{slide.title}</SlideTitle>
              <SlideDescription>{slide.description}</SlideDescription>
              <SlideButton onClick={() => handleSlideButtonClick(index)}>
                {slide.buttonText}
                <span>→</span>
              </SlideButton>
            </Slide>
          ))}
        </SlideContainer>

        <NavigationButton className="prev" onClick={prevSlide}>
          <FaChevronLeft />
        </NavigationButton>
        
        <NavigationButton className="next" onClick={nextSlide}>
          <FaChevronRight />
        </NavigationButton>

        <NavigationDots>
          {slides.map((_, index) => (
            <Dot
              key={index}
              $active={currentSlide === index}
              onClick={() => goToSlide(index)}
            />
          ))}
        </NavigationDots>

        <Divider />

        <MenuSection>
          {menuItems.map((item, index) => (
            <MenuButton 
              key={index} 
              to={item.link}
              onClick={() => {
                localStorage.setItem('onboardingCompleted', 'true');
              }}
            >
              <MenuIcon>{item.icon}</MenuIcon>
              <MenuText>{item.text}</MenuText>
            </MenuButton>
          ))}
        </MenuSection>
      </OnboardingContainer>
    </HeroSection>
  );
};

export default Hero; 