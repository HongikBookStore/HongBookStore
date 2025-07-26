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

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
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
  max-height: 300px;
  object-fit: cover;
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
  cursor: pointer;
  
  &:hover {
    transform: scale(1.02);
    box-shadow: var(--shadow-lg);
  }
`;

const ImageModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10001;
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalImage = styled.img`
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  animation: ${scaleIn} 0.3s ease-out;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-normal);
  
  &:hover {
    background: white;
    transform: scale(1.1);
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

const BackButton = styled.button`
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
    label: "홍북스토어는 무엇인가요?", 
    answer: "홍북스토어는 홍익대학교 학생들을 위한 중고책 거래 플랫폼입니다. 교재, 전공서적, 일반도서 등을 안전하게 거래할 수 있어요. 홍익대학교 이메일로만 가입 가능합니다."
  },
  { 
    label: "책을 팔고 싶어요.", 
    answer: "책을 팔고 싶으시다면 '책 거래 게시판'에서 '책 등록' 버튼을 눌러 진행하세요. 책 제목, 저자, 출판사, 상태, 가격, 설명을 입력하고 사진을 첨부하면 됩니다. 등록 후에는 구매 문의가 올 때까지 기다리시면 됩니다!",
    image: "/images/book-register-guide.png",
    image2: "/images/book-register-guide2.png"
  },
  { 
    label: "책을 사고 싶어요.", 
    answer: "책을 사고 싶으시다면 '책 거래 게시판'에서 원하는 책을 찾아보세요. 마음에 드는 책이 있으면 해당 게시글에서 판매자와 채팅으로 거래를 진행하세요. 채팅창에서 거래를 예약하고 거래를 수행하실 수 있습니다. 거래 완료 후에는 서로 평가를 남겨주세요!",
    image: "/images/trade-guide.png",
    image2: "/images/trade-guide2.png"
  },
  { 
    label: "구하기 게시판이 궁금해요.", 
    answer: "구하기 게시판은 원하는 책을 찾지 못했을 때 사용하는 기능입니다. 원하는 책의 제목, 저자, 출판사, 희망 가격을 작성하면 해당 책을 가지고 있는 판매자가 연락을 해드릴 수 있어요. 책을 찾기 어려울 때 활용해보세요!"
  },
  { 
    label: "나의 책방이 궁금해요.", 
    answer: "나의 책방에서는 내가 등록한 책들을 관리할 수 있습니다. 등록한 책의 상태를 수정하거나 삭제할 수 있고, 구매 문의가 온 책들을 확인할 수 있어요. 또한 내가 관심을 표시한 책들도 함께 볼 수 있습니다."
  },
  { 
    label: "거래 채팅이 궁금해요.", 
    answer: "거래 채팅은 판매자와 구매자가 직접 소통할 수 있는 기능입니다. 책에 관심이 있거나 구매하고 싶다면 해당 게시글에서 채팅을 시작할 수 있어요. 채팅을 통해 책 상태를 더 자세히 확인하거나 거래 장소와 시간을 정할 수 있습니다."
  },
  { 
    label: "거래 내역은 어디서 볼 수 있나요?", 
    answer: "'나의 거래' 메뉴에서 구매/판매 내역을 모두 확인할 수 있습니다. 거래 상태(진행중, 완료, 취소)도 함께 표시됩니다."
  },
  { 
    label: "거래 약속을 잊어버렸어요.", 
    answer: "거래 약속을 잊어버리셨다면 '나의 거래'에서 확인할 수 있습니다. 진행중인 거래를 클릭하면 채팅 내용과 함께 정한 거래 장소와 시간을 다시 확인할 수 있어요. 거래 전에 꼭 한 번 더 확인해보세요!"
  },
  { 
    label: "안전한 거래 방법이 궁금해요.", 
    answer: "거래는 안전한 공공장소에서 진행하세요. 개인 거래는 피해주세요. 또한 거래 전에 책 상태를 꼼꼼히 확인하고, 거래 후에는 서로 평가를 남겨주세요."
  },
  { 
    label: "거래 후 문제가 생겼어요.", 
    answer: "거래 후 문제가 발생하면 '나의 거래'에서 해당 거래를 찾아 신고할 수 있습니다. 사진과 함께 구체적인 문제 상황을 설명해주세요. 다만 운영진이 모든 문제를 해결해드릴 수는 없으니, 거래 전에 책 상태를 꼼꼼히 확인하시는 것을 권장합니다."
  },
  { 
    label: "책 가격은 어떻게 정하나요?", 
    answer: "책 등록 시 책 상태(새책, 깨끗함, 보통, 낡음)를 선택하면 자동으로 적절한 가격이 추천됩니다. 또한 '구하기 게시판'에서 비슷한 책의 수요를 확인해보시면 도움이 됩니다."
  },
  { 
    label: "지도 기능이 궁금해요.", 
    answer: "지도는 학교 생활에 필요한 장소들을 이용자들끼리 정보를 공유하는 기능입니다. 도서관, 카페, 식당, 편의점 등 학교 주변의 유용한 장소들을 분류하고 평가할 수 있어요. 다른 학생들이 추천한 장소들을 확인하고, 직접 좋은 장소를 공유할 수도 있습니다!"
  },
  { 
    label: "계정 관련 문제가 있어요.", 
    answer: "어떤 계정 관련 문제인지 선택해 주세요.",
    subOptions: [
      {
        label: "회원 탈퇴",
        answer: "회원 탈퇴는 '마이페이지' → '회원 탈퇴'에서 진행할 수 있습니다. 탈퇴 시 모든 데이터가 삭제되니 신중하게 결정해 주세요.",
        image: "/images/register-withdraw.png"
      },
      {
        label: "아이디 찾기",
        answer: "아이디 찾기는 로그인 페이지에서 '아이디 찾기' 버튼을 클릭하여 진행할 수 있습니다. 홍익대학교 이메일로 가입하신 이메일 주소를 입력해 주세요.",
        image: "/images/find-password.png"
      },
      {
        label: "비밀번호 찾기",
        answer: "비밀번호 찾기는 로그인 페이지에서 '비밀번호 찾기' 버튼을 클릭하여 진행할 수 있습니다. 홍익대학교 이메일로 임시 비밀번호를 발송해 드립니다.",
        image: "/images/find-password.png"
      },
      {
        label: "재학생 인증",
        answer: "재학생 인증은 '마이페이지'에서 별도로 진행하세요. g.hongik.ac.kr 이메일을 입력하여 인증할 수 있습니다. 인증을 완료해야 중고 거래 등의 서비스를 제한 없이 이용할 수 있어요."
      }
    ]
  },
  { 
    label: "지도에서 내 위치가 안 나와요.", 
    answer: "브라우저 위치 권한이 허용되어 있는지 확인해 주세요. 위치 권한이 꺼져 있으면 내 위치가 표시되지 않습니다. 설정에서 위치 권한을 허용해주세요."
  },
  { 
    label: "거래 장소 추천 시 내 위치가 실제와 달라요.", 
    answer: "내 위치가 실제 위치와 다르게 표시된다면 '마이페이지'에서 나의 위치를 추가하여 직접 설정할 수 있습니다. 정확한 위치를 설정하면 더 정확한 거래 장소 추천을 받을 수 있어요!"
  }
];

const ChatBotContent = ({ onClose, messages, setMessages, onReset }) => {
  const [currentOptions, setCurrentOptions] = useState(OPTIONS);
  const [optionHistory, setOptionHistory] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  const handleCloseImageModal = () => {
    setSelectedImage(null);
  };

  const handleOptionClick = (option) => {
    if (option.subOptions) {
      // 서브 옵션이 있는 경우
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: option.label },
        { sender: "bot", text: option.answer }
      ]);
      setCurrentOptions(option.subOptions);
      setOptionHistory((prev) => [...prev, { options: OPTIONS, message: option.label }]);
    } else {
      // 일반 옵션인 경우
      setMessages((prev) => [
        ...prev,
        { sender: "user", text: option.label },
        { sender: "bot", text: option.answer, image: option.image, image2: option.image2 }
      ]);
    }
  };

  const handleBackClick = () => {
    if (optionHistory.length > 0) {
      const lastHistory = optionHistory[optionHistory.length - 1];
      setCurrentOptions(lastHistory.options);
      setOptionHistory((prev) => prev.slice(0, -1));
      
      // 마지막 사용자 메시지와 봇 응답 제거
      setMessages((prev) => prev.slice(0, -2));
    }
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
                    onClick={() => handleImageClick(msg.image)}
                  />
                </ImageContainer>
              )}
              {msg.image2 && (
                <ImageContainer>
                  <StyledImage 
                    src={msg.image2} 
                    alt="안내 이미지 2"
                    onClick={() => handleImageClick(msg.image2)}
                  />
                </ImageContainer>
              )}
            </Message>
          </MessageContainer>
        ))}
      </ChatArea>
      
      {optionHistory.length > 0 && (
        <BackButton onClick={handleBackClick}>
          ← 뒤로가기
        </BackButton>
      )}
      
      <OptionsContainer>
        {currentOptions.map((option, idx) => (
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

      {selectedImage && (
        <ImageModal onClick={handleCloseImageModal}>
          <ModalImage 
            src={selectedImage} 
            alt="확대된 이미지"
            onClick={(e) => e.stopPropagation()}
          />
          <CloseButton onClick={handleCloseImageModal}>×</CloseButton>
        </ImageModal>
      )}
    </>
  );
};

export default ChatBotContent; 