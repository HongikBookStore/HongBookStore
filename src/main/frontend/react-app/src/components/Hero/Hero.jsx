import { Link } from 'react-router-dom';
import styled from 'styled-components';

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
  line-height: 1.1;
  margin-bottom: 2rem;
  background: linear-gradient(to right, #ffffff, rgba(255, 255, 255, 0.8));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: fadeInUp 1s ease-out;

  @media (max-width: 768px) {
    font-size: 3rem;
  }
`;

const Description = styled.p`
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 3rem;
  animation: fadeInUp 1s ease-out 0.2s backwards;

  @media (max-width: 768px) {
    font-size: 1.25rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  animation: fadeInUp 1s ease-out 0.4s backwards;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 2rem;
  font-size: 1.125rem;
  font-weight: 600;
  border-radius: var(--radius-lg);
  transition: var(--transition);
  cursor: pointer;
  gap: 0.75rem;
  position: relative;
  overflow: hidden;
  text-decoration: none;

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

const PrimaryButton = styled(Button)`
  background: white;
  color: var(--primary);
  border: none;
  box-shadow: var(--shadow-lg);

  &:hover {
    transform: translateY(-3px);
    box-shadow: var(--shadow-xl);
  }
`;

const SecondaryButton = styled(Button)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-3px);
  }
`;

const Hero = () => {
  return (
    <HeroSection>
      <HeroContent>
        <Title>Welcome to Hong Bookstore</Title>
        <Description>
          Discover, share, and trade books with fellow readers in your community.
          Join our vibrant book-loving community today!
        </Description>
        <ButtonGroup>
          <PrimaryButton to="/marketplace">Explore Books</PrimaryButton>
          <SecondaryButton to="/register">Join Now</SecondaryButton>
        </ButtonGroup>
      </HeroContent>
    </HeroSection>
  );
};

export default Hero; 