import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaEllipsisV, FaBook, FaUser, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const ChatListContainer = styled.div`
  max-width: 1600px;
  width: 100vw;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 48px;
  @media (max-width: 900px) {
    padding-top: 32px;
  }
  @media (max-width: 600px) {
    padding-top: 20px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  margin-bottom: 24px;
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

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  @media (max-width: 600px) {
    width: 200px;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 0.9rem;
`;

const TabButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 0 0 48px 0;
`;

const TabButton = styled.button`
  padding: 6px 18px;
  border-radius: 16px;
  border: 1.5px solid ${props => props.active ? '#1976d2' : '#e0e0e0'};
  background: ${props => props.active ? '#1976d2' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  box-shadow: none;
  &:hover {
    background: ${props => props.active ? '#1565c0' : '#f5f5f5'};
    border-color: #1976d2;
    color: ${props => props.active ? 'white' : '#1976d2'};
  }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.3s;
  position: relative;

  &:hover {
    background: #f8f9fa;
  }

  ${props => props.isReserved && `
    background: #fff3cd;
    border-left: 4px solid #ffc107;
  `}

  ${props => props.hasUnread && `
    background: #e3f2fd;
  `}
`;

const UserAvatar = styled.div`
  width: 50px;
  height: 50px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 1.2rem;
  margin-right: 15px;
  flex-shrink: 0;
`;

const ChatInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BookTitle = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  color: #999;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  margin-left: 15px;
  margin-right: 60px;
`;

const LastTime = styled.div`
  font-size: 0.8rem;
  color: #999;
`;

const UnreadCount = styled.div`
  background: #dc3545;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
`;

const TradeStatus = styled.div`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-left: 0;
  margin-bottom: 2px;
  vertical-align: middle;
  ${({ status }) => {
    switch (status) {
      case 'reserved':
        return 'background: #ffe066; color: #856404;';
      case 'completed':
        return 'background: #b6fcd5; color: #155724;';
      case 'in_progress':
      default:
        return 'background: #cce5ff; color: #004085;';
    }
  }}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #666;
  text-align: center;
  padding: 40px;
`;

const EmptyIcon = styled(FaBook)`
  font-size: 3rem;
  color: #ddd;
  margin-bottom: 20px;
`;

const ChatListPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatRooms, setChatRooms] = useState([]);

  // 임시 데이터 - 실제로는 API에서 가져올 데이터
  useEffect(() => {
    const mockChatRooms = [
      {
        id: 1,
        userId: 'user123',
        userName: '김철수',
        userAvatar: '김',
        bookTitle: '자바의 정석',
        lastMessage: '안녕하세요! 책 상태가 어떤가요?',
        lastTime: '14:30',
        unreadCount: 2,
        tradeStatus: 'reserved',
        isReserved: true,
        type: 'buyer' // 내가 구매자
      },
      {
        id: 2,
        userId: 'user456',
        userName: '이영희',
        userAvatar: '이',
        bookTitle: '알고리즘 문제 해결 전략',
        lastMessage: '네, 거래 완료되었습니다.',
        lastTime: '12:15',
        unreadCount: 0,
        tradeStatus: 'completed',
        isReserved: false,
        type: 'seller' // 내가 판매자
      },
      {
        id: 3,
        userId: 'user789',
        userName: '박민수',
        userAvatar: '박',
        bookTitle: '스프링 부트 실전 활용',
        lastMessage: '가격 흥정 가능한가요?',
        lastTime: '09:45',
        unreadCount: 1,
        tradeStatus: 'in_progress',
        isReserved: false,
        type: 'buyer'
      },
      {
        id: 4,
        userId: 'user101',
        userName: '최지영',
        userAvatar: '최',
        bookTitle: '데이터베이스 시스템',
        lastMessage: '오늘 오후에 만나서 거래하시죠',
        lastTime: '08:20',
        unreadCount: 0,
        tradeStatus: 'reserved',
        isReserved: true,
        type: 'seller'
      }
    ];
    setChatRooms(mockChatRooms);
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reserved':
        return '예약완료';
      case 'completed':
        return '거래완료';
      case 'in_progress':
      default:
        return '진행 중';
    }
  };

  const filteredChatRooms = chatRooms
    .filter(chat => {
      if (activeTab === 'seller') return chat.type === 'seller';
      if (activeTab === 'buyer') return chat.type === 'buyer';
      return true;
    })
    .filter(chat => 
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.bookTitle.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      // 예약된 채팅방을 상단에 고정
      if (a.isReserved && !b.isReserved) return -1;
      if (!a.isReserved && b.isReserved) return 1;
      
      // 최근 메시지 순으로 정렬 (시간 기준)
      const timeA = new Date(`2024-01-01 ${a.lastTime}`);
      const timeB = new Date(`2024-01-01 ${b.lastTime}`);
      return timeB - timeA;
    });

  return (
    <ChatListContainer>
      <Header>
        <HeaderLeft>
          <BackButton onClick={handleBack}>
            <FaArrowLeft />
            뒤로
          </BackButton>
          <Title>거래 채팅</Title>
        </HeaderLeft>
        <SearchContainer>
          <SearchInput
            type="text"
            placeholder="사용자명 또는 책 제목으로 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchIcon />
        </SearchContainer>
      </Header>

      <TabButtonGroup>
        <TabButton active={activeTab === 'all'} onClick={() => setActiveTab('all')}>전체</TabButton>
        <TabButton active={activeTab === 'seller'} onClick={() => setActiveTab('seller')}>판매자</TabButton>
        <TabButton active={activeTab === 'buyer'} onClick={() => setActiveTab('buyer')}>구매자</TabButton>
      </TabButtonGroup>

      <ChatList>
        {filteredChatRooms.length > 0 ? (
          filteredChatRooms.map((chat) => (
            <ChatItem
              key={chat.id}
              onClick={() => handleChatClick(chat.id)}
              isReserved={chat.isReserved}
              hasUnread={chat.unreadCount > 0}
            >
              <UserAvatar>
                {chat.userAvatar}
              </UserAvatar>
              <ChatInfo>
                <UserName>
                  {chat.userName}
                </UserName>
                <BookTitle>
                  <FaBook style={{ color: '#666' }} />
                  {chat.bookTitle}
                </BookTitle>
                <TradeStatus status={chat.tradeStatus}>
                  {getStatusText(chat.tradeStatus)}
                </TradeStatus>
                <LastMessage>{chat.lastMessage}</LastMessage>
              </ChatInfo>
              <ChatMeta>
                <LastTime>{chat.lastTime}</LastTime>
                {chat.unreadCount > 0 && (
                  <UnreadCount>{chat.unreadCount}</UnreadCount>
                )}
              </ChatMeta>
            </ChatItem>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon />
            <h3>채팅방이 없습니다</h3>
            <p>책 거래를 시작하면 채팅방이 생성됩니다.</p>
          </EmptyState>
        )}
      </ChatList>
    </ChatListContainer>
  );
};

export default ChatListPage; 