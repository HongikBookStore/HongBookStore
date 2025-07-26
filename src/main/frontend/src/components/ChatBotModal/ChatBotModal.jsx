import React, { useState } from "react";
import styled, { keyframes } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideInRight = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const ChatArea = styled.div`
  min-height: 300px;
  max-height: 400px;
  overflow-y: auto;
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 1px solid var(--border-light);
  box-shadow: var(--shadow-inner);
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 3px;
    
    &:hover {
      background: var(--gray-400);
    }
  }
`;

const MessageContainer = styled.div`
  margin: 1rem 0;
  animation: ${props => props.sender === "bot" ? slideIn : slideInRight} 0.4s ease-out;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.sender === "bot" ? "flex-start" : "flex-end"};
  max-width: 80%;
  margin: ${props => props.sender === "bot" ? "0 0 0 0" : "0 0 0 auto"};
`;

const MessageBubble = styled.div`
  background: ${props => props.sender === "bot" ? "var(--surface)" : "linear-gradient(135deg, var(--primary), var(--secondary))"};
  color: ${props => props.sender === "bot" ? "var(--text-primary)" : "white"};
  padding: 1rem 1.5rem;
  border-radius: ${props => props.sender === "bot" ? "var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)" : "var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)"};
  box-shadow: var(--shadow-sm);
  border: ${props => props.sender === "bot" ? "1px solid var(--border-light)" : "none"};
  position: relative;
  word-break: keep-all;
  line-height: 1.6;
  
  &::before {
    content: '';
    position: absolute;
    ${props => props.sender === "bot" ? "left: -8px; top: 12px;" : "right: -8px; top: 12px;"}
    width: 0;
    height: 0;
    border: 8px solid transparent;
    border-${props => props.sender === "bot" ? "right" : "left"}-color: ${props => props.sender === "bot" ? "var(--surface)" : "var(--primary)"};
  }
`;

const MessageSender = styled.span`
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: ${props => props.sender === "bot" ? "var(--text-secondary)" : "var(--primary)"};
`;

const ImageContainer = styled.div`
  margin-top: 1rem;
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  transition: var(--transition-normal);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const StyledImage = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  
  &:hover {
    transform: scale(1.02);
  }
`;

const OptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const OptionButton = styled.button`
  padding: 1rem 1.25rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: left;
  word-break: keep-all;
  line-height: 1.4;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: var(--transition-normal);
  }
  
  &:hover {
    border-color: var(--primary);
    background: var(--surface-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
    
    &::before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const ResetButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  text-align: center;
  width: 100%;
  margin-top: 1rem;
  
  &:hover {
    border-color: var(--primary);
    background: var(--surface-hover);
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const OPTIONS = [
  { 
    label: "책을 어떻게 등록하나요?", 
    answer: "책 등록은 '책 거래 게시판'에서 '책 등록' 버튼을 눌러 진행할 수 있습니다.",
    image: "/images/book-register-guide.png",
    image2: "/images/book-register-guide2.png"
  },
  { 
    label: "거래는 어떻게 하나요?", 
    answer: "관심 있는 책의 게시글에서 판매자와 채팅으로 거래를 진행하세요. 채팅창에서 거래를 예약하고 거래를 수행하실 수 있습니다.",
    image: "/images/trade-guide.png",
    image2: "/images/trade-guide2.png"
  },
  { 
    label: "지도에 내 위치가 안 나와요.", 
    answer: "브라우저 위치 권한이 허용되어 있는지 확인해 주세요. 위치 권한이 꺼져 있으면 내 위치가 표시되지 않습니다.",
    image: "/images/location-permission.png"
  },
  { 
    label: "지도에서 거래장소를 추가할 수 있나요?", 
    answer: "현재는 거래장소 추가 기능을 지원하지 않습니다. 공식 거래장소만 이용해 주세요." 
  },
  { 
    label: "나의 거래 내역은 어디서 볼 수 있나요?", 
    answer: "'나의 거래' 메뉴에서 내역을 확인할 수 있습니다."
  },
  { 
    label: "비밀번호를 잊어버렸어요.", 
    answer: "로그인 화면의 '비밀번호 찾기'를 이용해 주세요. 회원가입 때 사용한 전자우편을 통해 비밀번호를 찾을 수 있습니다.",
    image: "/images/find-password.png"
  },
  { 
    label: "회원가입/탈퇴는 어떻게 하나요?", 
    answer: "회원가입은 로그인 화면에서, 탈퇴는 '마이페이지'에서 가능합니다.",
    image: "/images/register-withdraw.png"
  },
  { 
    label: "학과 공지사항을 보고 싶어요.", 
    answer: "현재 학과 공지사항 자동 제공 기능은 지원하지 않습니다. 학교 홈페이지를 참고해 주세요." 
  },
  { 
    label: "학교생활 관련 정보가 궁금해요.", 
    answer: "학식, 동아리, 시설 이용 등은 학교 공식 홈페이지 또는 커뮤니티를 참고해 주세요." 
  },
];

const ChatBotContent = ({ onClose, messages, setMessages, onReset }) => {
  const handleOptionClick = (option) => {
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: option.label },
      { sender: "bot", text: option.answer, image: option.image, image2: option.image2 }
    ]);
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <>
      <ChatArea>
        {messages.map((msg, idx) => (
          <MessageContainer key={idx} sender={msg.sender}>
            <Message sender={msg.sender}>
              <MessageSender sender={msg.sender}>
                {msg.sender === "bot" ? "챗봇" : "나"}
              </MessageSender>
              <MessageBubble sender={msg.sender}>
                {msg.text}
              </MessageBubble>
              {msg.image && (
                <ImageContainer>
                  <StyledImage 
                    src={msg.image} 
                    alt="안내 이미지" 
                  />
                </ImageContainer>
              )}
              {msg.image2 && (
                <ImageContainer>
                  <StyledImage 
                    src={msg.image2} 
                    alt="안내 이미지 2" 
                  />
                </ImageContainer>
              )}
            </Message>
          </MessageContainer>
        ))}
      </ChatArea>
      
      <OptionsContainer>
        {OPTIONS.map((option, idx) => (
          <OptionButton 
            key={idx} 
            onClick={() => handleOptionClick(option)}
          >
            {option.label}
          </OptionButton>
        ))}
      </OptionsContainer>
      
      {messages.length > 1 && (
        <ResetButton onClick={onReset}>
          대화 초기화
        </ResetButton>
      )}
    </>
  );
};

export default ChatBotContent; 