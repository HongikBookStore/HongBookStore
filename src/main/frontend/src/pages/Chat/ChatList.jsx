import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaBook } from 'react-icons/fa';
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
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
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
  border: 1.5px solid ${props => props.$active ? '#1976d2' : '#e0e0e0'};
  background: ${props => props.$active ? '#1976d2' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background: ${props => props.$active ? '#1565c0' : '#f5f5f5'};
    border-color: #1976d2;
    color: ${props => props.$active ? 'white' : '#1976d2'};
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
  position: relative;
  &:hover {
    background: #f8f9fa;
  }
  ${({ $isReserved }) => $isReserved && `
    background: #fff3cd;
    border-left: 4px solid #ffc107;
  `}
  ${({ $hasUnread }) => $hasUnread && `
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
`;

const ChatInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
  font-size: 1rem;
  margin-bottom: 5px;
`;

const BookTitle = styled.div`
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const LastMessage = styled.div`
  color: #999;
  font-size: 0.9rem;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  margin-left: 15px;
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
`;

const TradeStatus = styled.div`
  display: inline-block;
  margin-top: 4px;
  padding: 2px 12px;
  border-radius: 12px;
  font-size: 0.85rem;
  font-weight: 600;
  ${({ $status }) => {
    switch ($status) {
      case 'reserved': return 'background: #ffe066; color: #856404;';
      case 'completed': return 'background: #b6fcd5; color: #155724;';
      default: return 'background: #cce5ff; color: #004085;';
    }
  }}
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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

  useEffect(() => {
    setChatRooms([ /* ...mock data... */ ]);
  }, []);

  const handleBack = () => navigate('/marketplace');
  const handleChatClick = (id) => navigate(`/chat/${id}`);
  const getStatusText = (status) => status === 'reserved' ? '예약완료' : status === 'completed' ? '거래완료' : '진행 중';

  const filtered = chatRooms.filter(room => {
    const matchTab = activeTab === 'all' || room.type === activeTab;
    const matchSearch = room.userName.includes(searchTerm) || room.bookTitle.includes(searchTerm);
    return matchTab && matchSearch;
  });

  return (
      <ChatListContainer>
        <Header>
          <HeaderLeft>
            <BackButton onClick={handleBack}><FaArrowLeft />뒤로</BackButton>
            <Title>거래 채팅</Title>
          </HeaderLeft>
          <SearchContainer>
            <SearchInput value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            <SearchIcon />
          </SearchContainer>
        </Header>

        <TabButtonGroup>
          <TabButton $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>전체</TabButton>
          <TabButton $active={activeTab === 'seller'} onClick={() => setActiveTab('seller')}>판매자</TabButton>
          <TabButton $active={activeTab === 'buyer'} onClick={() => setActiveTab('buyer')}>구매자</TabButton>
        </TabButtonGroup>

        <ChatList>
          {filtered.length > 0 ? filtered.map(chat => (
              <ChatItem
                  key={chat.id}
                  onClick={() => handleChatClick(chat.id)}
                  $isReserved={chat.isReserved}
                  $hasUnread={chat.unreadCount > 0}
              >
                <UserAvatar>{chat.userAvatar}</UserAvatar>
                <ChatInfo>
                  <UserName>{chat.userName}</UserName>
                  <BookTitle><FaBook />{chat.bookTitle}</BookTitle>
                  <TradeStatus $status={chat.tradeStatus}>{getStatusText(chat.tradeStatus)}</TradeStatus>
                  <LastMessage>{chat.lastMessage}</LastMessage>
                </ChatInfo>
                <ChatMeta>
                  <LastTime>{chat.lastTime}</LastTime>
                  {chat.unreadCount > 0 && <UnreadCount>{chat.unreadCount}</UnreadCount>}
                </ChatMeta>
              </ChatItem>
          )) : (
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