import styled, { keyframes, css } from 'styled-components';

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
`;

const bounce = keyframes`
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
`;

const Spinner = styled.div`
  width: ${props => props.$size || '24px'};
  height: ${props => props.$size || '24px'};
  border: 2px solid var(--border-light);
  border-top: 2px solid var(--primary);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const Dots = styled.div`
  display: flex;
  gap: var(--space-1);
  align-items: center;
  justify-content: center;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  animation: ${bounce} 1.4s ease-in-out infinite both;

  &:nth-child(1) {
    animation-delay: -0.32s;
  }

  &:nth-child(2) {
    animation-delay: -0.16s;
  }
`;

const Pulse = styled.div`
  width: ${props => props.$size || '24px'};
  height: ${props => props.$size || '24px'};
  border-radius: 50%;
  background: var(--primary);
  animation: ${pulse} 1s ease-in-out infinite;
`;

const Shimmer = styled.div`
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.2);
  animation: shimmer 1.5s infinite;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;

  ${props => props.$fullScreen && css`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(4px);
    z-index: var(--z-modal);
  `}

  ${props => props.$overlay && css`
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(2px);
    z-index: 1;
  `}
`;

const LoadingText = styled.span`
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
`;

const Loading = ({ 
  type = 'spinner', 
  size = 'md', 
  text, 
  fullScreen = false, 
  overlay = false,
  className 
}) => {
  const sizeMap = {
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px'
  };

  const renderLoader = () => {
    switch (type) {
      case 'dots':
        return (
          <Dots>
            <Dot />
            <Dot />
            <Dot />
          </Dots>
        );
      case 'pulse':
        return <Pulse $size={sizeMap[size]} />;
      case 'shimmer':
        return <Shimmer />;
      case 'spinner':
      default:
        return <Spinner $size={sizeMap[size]} />;
    }
  };

  return (
    <LoadingContainer 
      $fullScreen={fullScreen} 
      $overlay={overlay}
      className={className}
    >
      {renderLoader()}
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

export default Loading; 