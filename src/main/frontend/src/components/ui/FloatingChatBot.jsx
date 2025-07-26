import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import ChatBotContent from '../ChatBotModal/ChatBotModal';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideInFromRight = keyframes`
  from { 
    transform: translateX(100%); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0); 
    opacity: 1; 
  }
`;

const slideOutToRight = keyframes`
  from { 
    transform: translateX(0); 
    opacity: 1; 
  }
  to { 
    transform: translateX(100%); 
    opacity: 0; 
  }
`;

const FloatingButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 9999;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 25px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: scale(0.95);
  }
  
  @media (max-width: 768px) {
    bottom: 1.5rem;
    right: 1.5rem;
    width: 60px;
    height: 60px;
  }
`;

const SideModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 10000;
  pointer-events: none;
`;

const SideModalContent = styled.div`
  position: fixed;
  top: 50%;
  right: 2rem;
  transform: translateY(-50%);
  width: 350px;
  max-height: 80vh;
  background: var(--surface);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: ${slideInFromRight} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  pointer-events: auto;
  
  @media (max-width: 768px) {
    width: 90vw;
    right: 1rem;
    left: 1rem;
    max-height: 70vh;
  }
`;

const SideModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-light);
  background: var(--surface);
  border-radius: var(--radius-xl) var(--radius-xl) 0 0;
`;

const SideModalTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: var(--radius-md);
  transition: var(--transition-normal);
  
  &:hover {
    background: var(--gray-100);
    color: var(--text-primary);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const SideModalBody = styled.div`
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
  max-height: calc(80vh - 80px);
  
  @media (max-width: 768px) {
    max-height: calc(70vh - 80px);
  }
`;

const FloatingChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 궁금한 점을 선택해 주세요." }
  ]);

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleReset = () => {
    setMessages([{ sender: "bot", text: "안녕하세요! 궁금한 점을 선택해 주세요." }]);
  };

  return (
    <>
      <FloatingButton onClick={handleOpen}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          <path d="M8 9h8"></path>
          <path d="M8 13h6"></path>
        </svg>
      </FloatingButton>
      
      {isOpen && (
        <SideModalOverlay>
          <SideModalContent>
            <SideModalHeader>
              <SideModalTitle>AI 챗봇</SideModalTitle>
              <CloseButton onClick={handleClose}>&times;</CloseButton>
            </SideModalHeader>
            <SideModalBody>
              <ChatBotContent 
                onClose={handleClose} 
                messages={messages}
                setMessages={setMessages}
                onReset={handleReset}
              />
            </SideModalBody>
          </SideModalContent>
        </SideModalOverlay>
      )}
    </>
  );
};

export default FloatingChatBot; 