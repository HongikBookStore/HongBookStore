import React, { useState, useRef, useEffect } from "react";
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

const typing = keyframes`
  0%, 20%, 60%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  80% { transform: translateY(-5px); }
`;



const ChatBotContainer = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  padding: 2rem;
  background: var(--surface);
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-light);
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    margin: 1rem;
    padding: 1.5rem;
  }
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  text-align: center;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const ChatArea = styled.div`
  min-height: 500px;
  max-height: 700px;
  overflow-y: auto;
  background: var(--background);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  margin-bottom: 2rem;
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
  margin: 1.5rem 0;
  animation: ${props => props.sender === "bot" ? slideIn : slideInRight} 0.4s ease-out;
`;

const Message = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.sender === "bot" ? "flex-start" : "flex-end"};
  max-width: 85%;
  margin: ${props => props.sender === "bot" ? "0 0 0 0" : "0 0 0 auto"};
`;

const MessageBubble = styled.div`
  background: ${props => props.sender === "bot" ? "var(--surface)" : "linear-gradient(135deg, var(--primary), var(--secondary))"};
  color: ${props => props.sender === "bot" ? "var(--text-primary)" : "white"};
  padding: 1.25rem 1.5rem;
  border-radius: ${props => props.sender === "bot" ? "var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm)" : "var(--radius-xl) var(--radius-xl) var(--radius-sm) var(--radius-xl)"};
  box-shadow: var(--shadow-sm);
  border: ${props => props.sender === "bot" ? "1px solid var(--border-light)" : "none"};
  position: relative;
  word-break: keep-all;
  line-height: 1.7;
  font-size: 1rem;
  
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Avatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.sender === "bot" ? "linear-gradient(135deg, var(--primary), var(--secondary))" : "var(--primary)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.8rem;
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
  max-height: 300px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  
  &:hover {
    transform: scale(1.02);
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  background: var(--surface);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-xl);
  padding: 1rem;
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
  
  &:focus-within {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }
`;

const Input = styled.textarea`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 1rem;
  font-family: inherit;
  color: var(--text-primary);
  resize: none;
  min-height: 24px;
  max-height: 120px;
  line-height: 1.5;
  
  &::placeholder {
    color: var(--text-tertiary);
  }
`;

const SendButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border: none;
  border-radius: var(--radius-lg);
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const SuggestionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const SuggestionButton = styled.button`
  padding: 0.5rem 1rem;
  background: var(--surface);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: 0.9rem;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition-normal);
  
  &:hover {
    background: var(--surface-hover);
    border-color: var(--primary);
    transform: translateY(-1px);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: var(--surface);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border-light);
  max-width: 80px;
  
  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    animation: ${typing} 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
`;

const SUGGESTIONS = [
  "책을 어떻게 등록하나요?",
  "거래는 어떻게 하나요?",
  "지도에서 거래장소를 어떻게 찾나요?",
  "비밀번호를 잊어버렸어요",
  "회원가입/탈퇴는 어떻게 하나요?",
  "나의 거래 내역은 어디서 볼 수 있나요?"
];

const KNOWLEDGE_BASE = {
  "책 등록": {
    answer: "책 등록은 '책 거래 게시판'에서 '책 등록' 버튼을 눌러 진행할 수 있습니다. 책의 제목, 저자, 상태, 가격 등을 입력하시면 됩니다.",
    image: "/images/book-register-guide.png",
    image2: "/images/book-register-guide2.png"
  },
  "거래": {
    answer: "관심 있는 책의 게시글에서 판매자와 채팅으로 거래를 진행하세요. 채팅창에서 거래를 예약하고 거래를 수행하실 수 있습니다.",
    image: "/images/trade-guide.png",
    image2: "/images/trade-guide2.png"
  },
  "지도": {
    answer: "상단 메뉴의 '지도'를 클릭하면, 거래 가능한 장소가 지도에 표시됩니다. 원하는 장소를 클릭해 상세 정보를 확인할 수 있습니다.",
    image: "/images/map-guide.png"
  },
  "위치": {
    answer: "브라우저 위치 권한이 허용되어 있는지 확인해 주세요. 위치 권한이 꺼져 있으면 내 위치가 표시되지 않습니다.",
    image: "/images/location-permission.png"
  },
  "거래장소 추가": {
    answer: "현재는 거래장소 추가 기능을 지원하지 않습니다. 공식 거래장소만 이용해 주세요."
  },
  "거래 내역": {
    answer: "'나의 거래' 메뉴에서 내역을 확인할 수 있습니다."
  },
  "비밀번호": {
    answer: "로그인 화면의 '비밀번호 찾기'를 이용해 주세요. 회원가입 때 사용한 전자우편을 통해 비밀번호를 찾을 수 있습니다.",
    image: "/images/find-password.png"
  },
  "회원가입": {
    answer: "회원가입은 로그인 화면에서, 탈퇴는 '마이페이지'에서 가능합니다.",
    image: "/images/register-withdraw.png"
  },
  "학과 공지사항": {
    answer: "현재 학과 공지사항 자동 제공 기능을 지원하지 않습니다. 학교 홈페이지를 참고해 주세요."
  },
  "학교생활": {
    answer: "학식, 동아리, 시설 이용 등은 학교 공식 홈페이지 또는 커뮤니티를 참고해 주세요."
  }
};

function ChatBotPage() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요! 홍익대학교 책거래 플랫폼에 오신 것을 환영합니다. 궁금한 점이 있으시면 언제든 물어보세요!" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatAreaRef = useRef(null);

  useEffect(() => {
    if (chatAreaRef.current) {
      chatAreaRef.current.scrollTop = chatAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const findBestMatch = (userInput) => {
    const input = userInput.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    Object.keys(KNOWLEDGE_BASE).forEach(key => {
      const keyLower = key.toLowerCase();
      if (input.includes(keyLower) || keyLower.includes(input)) {
        const score = Math.max(input.length, keyLower.length) / Math.min(input.length, keyLower.length);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = key;
        }
      }
    });

    return bestMatch;
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage = input.trim();
    setMessages(prev => [...prev, { sender: "user", text: userMessage }]);
    setInput("");
    setIsTyping(true);

    // 타이핑 효과를 위한 지연
    await new Promise(resolve => setTimeout(resolve, 1000));

    const bestMatch = findBestMatch(userMessage);
    
    if (bestMatch) {
      const response = KNOWLEDGE_BASE[bestMatch];
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: response.answer, 
        image: response.image, 
        image2: response.image2 
      }]);
    } else {
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: "죄송해요, 해당 질문에 대한 답변을 찾을 수 없습니다. 다른 질문을 해보시거나 아래 제안사항을 참고해 주세요." 
      }]);
    }
    
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatBotContainer>
      <Title>AI 챗봇 도움말</Title>
      
      <ChatArea ref={chatAreaRef}>
        {messages.map((msg, idx) => (
          <MessageContainer key={idx} sender={msg.sender}>
            <Message sender={msg.sender}>
              <MessageSender sender={msg.sender}>
                <Avatar sender={msg.sender}>
                  {msg.sender === "bot" ? "AI" : "나"}
                </Avatar>
                {msg.sender === "bot" ? "AI 어시스턴트" : "나"}
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
        
        {isTyping && (
          <MessageContainer sender="bot">
            <Message sender="bot">
              <MessageSender sender="bot">
                <Avatar sender="bot">AI</Avatar>
                AI 어시스턴트
              </MessageSender>
              <TypingIndicator>
                <span></span>
                <span></span>
                <span></span>
              </TypingIndicator>
            </Message>
          </MessageContainer>
        )}
      </ChatArea>
      
      <InputContainer>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="궁금한 점을 자유롭게 입력해보세요..."
          rows={1}
        />
        <SendButton onClick={handleSend} disabled={!input.trim() || isTyping}>
          전송
        </SendButton>
      </InputContainer>
      
      <SuggestionsContainer>
        {SUGGESTIONS.map((suggestion, idx) => (
          <SuggestionButton 
            key={idx} 
            onClick={() => handleSuggestionClick(suggestion)}
          >
            {suggestion}
          </SuggestionButton>
        ))}
      </SuggestionsContainer>
    </ChatBotContainer>
  );
}

export default ChatBotPage; 