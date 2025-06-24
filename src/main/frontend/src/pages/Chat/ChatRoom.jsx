import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaUser, FaBook, FaArrowLeft, FaEllipsisV } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const ChatContainer = styled.div`
  max-width: 1600px;
  width: 100vw;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 0;
  @media (max-width: 900px) {
    padding-top: 0;
  }
  @media (max-width: 600px) {
    padding-top: 0;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #5a6268;
  }
`;

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const BookTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const MenuButton = styled.button`
  padding: 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  border-radius: 5px;
  transition: background 0.3s;

  &:hover {
    background: #e9ecef;
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (max-width: 600px) {
    padding: 8px;
    gap: 8px;
  }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  
  ${props => props.isOwn ? `
    align-self: flex-end;
    background: #007bff;
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: #f1f3f4;
    color: #333;
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.8rem;
  color: ${props => props.isOwn ? 'rgba(255,255,255,0.7)' : '#999'};
  margin-top: 5px;
  text-align: ${props => props.isOwn ? 'right' : 'left'};
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 15px;
  align-self: center;
  max-width: 80%;
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  @media (max-width: 600px) {
    padding: 8px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
  max-height: 100px;
  min-height: 44px;

  &:focus {
    border-color: #007bff;
  }
`;

const SendButton = styled.button`
  padding: 12px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const NoMessages = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
`;

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  // 임시 데이터
  const mockChatData = {
    id: id || '1',
    user: {
      name: '김학생',
      avatar: null
    },
    book: {
      title: '자바의 정석',
      price: 15000
    }
  };

  const mockMessages = [
    {
      id: 1,
      type: 'system',
      content: '채팅이 시작되었습니다.',
      timestamp: '2024-01-15 14:30'
    },
    {
      id: 2,
      type: 'message',
      content: '안녕하세요! 자바의 정석 책에 대해 문의드립니다.',
      sender: 'other',
      timestamp: '2024-01-15 14:31'
    },
    {
      id: 3,
      type: 'message',
      content: '안녕하세요! 어떤 점이 궁금하신가요?',
      sender: 'own',
      timestamp: '2024-01-15 14:32'
    },
    {
      id: 4,
      type: 'message',
      content: '책 상태가 어떤가요? 하이라이트나 메모가 있나요?',
      sender: 'other',
      timestamp: '2024-01-15 14:33'
    },
    {
      id: 5,
      type: 'message',
      content: '거의 새책 상태이고, 하이라이트는 없습니다. 깨끗하게 보관했어요.',
      sender: 'own',
      timestamp: '2024-01-15 14:35'
    }
  ];

  useEffect(() => {
    setMessages(mockMessages);
    scrollToBottom();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    
    const message = {
      id: Date.now(),
      type: 'message',
      content: newMessage.trim(),
      sender: 'own',
      timestamp: new Date().toLocaleString('ko-KR')
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setLoading(false);

    // 실제로는 API 호출하여 메시지 전송
    console.log('메시지 전송:', message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      '가격 협의 가능': '가격 협의 가능하신가요?',
      '책 상태 확인': '책 상태를 더 자세히 알 수 있을까요?',
      '거래 방법': '어떤 방법으로 거래하시나요?',
      '배송 가능': '배송도 가능하신가요?'
    };

    setNewMessage(quickMessages[action]);
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <>
      <div className="header-spacer" />
      <ChatContainer>
        <ChatHeader>
          <HeaderLeft>
            <BackButton onClick={handleBack}>
              <FaArrowLeft /> 뒤로가기
            </BackButton>
            <ChatInfo>
              <UserAvatar>
                <FaUser />
              </UserAvatar>
              <UserInfo>
                <UserName>{mockChatData.user.name}</UserName>
                <BookTitle>
                  <FaBook size={12} />
                  {mockChatData.book.title} - {mockChatData.book.price.toLocaleString()}원
                </BookTitle>
              </UserInfo>
            </ChatInfo>
          </HeaderLeft>
          <HeaderRight>
            <MenuButton>
              <FaEllipsisV />
            </MenuButton>
          </HeaderRight>
        </ChatHeader>

        <ChatMessages>
          {messages.length > 0 ? (
            messages.map(message => (
              <MessageGroup key={message.id}>
                {message.type === 'system' ? (
                  <SystemMessage>{message.content}</SystemMessage>
                ) : (
                  <Message isOwn={message.sender === 'own'}>
                    {message.content}
                    <MessageTime isOwn={message.sender === 'own'}>
                      {formatTime(message.timestamp)}
                    </MessageTime>
                  </Message>
                )}
              </MessageGroup>
            ))
          ) : (
            <NoMessages>
              <FaUser size={40} style={{marginBottom: '15px', opacity: 0.5}} />
              <h3>아직 메시지가 없습니다</h3>
              <p>첫 번째 메시지를 보내보세요!</p>
            </NoMessages>
          )}
          <div ref={messagesEndRef} />
        </ChatMessages>

        <ChatInput>
          <InputContainer>
            <MessageInput
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              rows={1}
            />
            <SendButton 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || loading}
            >
              <FaPaperPlane />
            </SendButton>
          </InputContainer>
          
          <QuickActions>
            <QuickActionButton onClick={() => handleQuickAction('가격 협의 가능')}>
              가격 협의 가능
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('책 상태 확인')}>
              책 상태 확인
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('거래 방법')}>
              거래 방법
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('배송 가능')}>
              배송 가능
            </QuickActionButton>
          </QuickActions>
        </ChatInput>
      </ChatContainer>
    </>
  );
};

export default ChatRoom; 