import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaEllipsisV, FaBook, FaUser, FaExclamationCircle } from 'react-icons/fa';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrCreateChatRoom } from '../../api/chat';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const ChatListContainer = styled.div`
  width: 100%;
  max-width: 1600px;
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
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
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
  @media (max-width: 768px) {
    width: 100%;
  }
  @media (max-width: 600px) {
    width: 100%;
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
  
  @media (max-width: 600px) {
    gap: 8px;
    margin: 0 0 32px 0;
  }
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
  
  @media (max-width: 600px) {
    padding: 4px 12px;
    font-size: 0.9rem;
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
  
  @media (max-width: 600px) {
    padding: 15px;
  }
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
  
  @media (max-width: 600px) {
    width: 40px;
    height: 40px;
    font-size: 1rem;
    margin-right: 10px;
  }
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
  
  @media (max-width: 600px) {
    max-width: 150px;
    font-size: 0.85rem;
  }
`;

const ChatMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  margin-left: 15px;
  margin-right: 60px;
  
  @media (max-width: 600px) {
    margin-left: 10px;
    margin-right: 40px;
  }
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
  const [loading, setLoading] = useState(true);   // ✅ 추가
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [chatRooms, setChatRooms] = useState([]);
  const [error, setError] = useState(null);  // ✅ 이거 추가

  // URL 파라미터에서 bookId 확인 및 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const bookId = urlParams.get('bookId');
    
    if (bookId) {
      // bookId가 있으면 해당 책에 대한 채팅방을 생성하거나 조회
      const handleBookChat = async () => {
        try {
          const response = await getOrCreateChatRoom(bookId);
          const chatRoom = await response.json();
          
          // 생성된 또는 기존 채팅방으로 이동
          navigate(`/chat/${chatRoom.id}`, { replace: true });
        } catch (error) {
          console.error('채팅방 생성/조회 실패:', error);
          // 에러 발생 시 URL에서 bookId 파라미터 제거
          navigate('/chat', { replace: true });
        }
      };
      
      handleBookChat();
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const fetchChatRooms = async () => {
      setError(null);              // ✅ 시작 시 초기화(선택)
      try {
        const token = localStorage.getItem("accessToken");
        const res = await fetch("/api/chat/rooms/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("채팅방 조회 실패");
        const data = await res.json();
        setChatRooms(data);
      } catch (err) {
        console.error("❌ 채팅방 불러오기 실패:", err);
        setError(err);             // ✅ 여기서 상태에 저장
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, []);

  const handleBack = () => {
    navigate('/marketplace');
  };

  const handleChatClick = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleSidebarMenu = (menu) => {
    switch(menu) {
      case 'booksale':
        navigate('/bookstore/add'); break;
      case 'wanted':
        navigate('/wanted'); break;
      case 'mybookstore':
        navigate('/bookstore'); break;
      case 'chat':
        navigate('/chat'); break;
      default: break;
    }
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
          (chat.userName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (chat.bookTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
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
    <PageWrapper>
      <SidebarMenu active="chat" onMenuClick={handleSidebarMenu} />
      <MainContent>
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
            {loading ? (
                <div style={{ padding: 24, color: '#888' }}>불러오는 중...</div>
            ) : error ? (
                // (선택) 에러 처리
                <EmptyState>
                  <FaExclamationCircle style={{ color: '#f66', fontSize: '2rem', marginBottom: 12 }} />
                  <h3>채팅방을 불러오지 못했습니다</h3>
                  <p>잠시 후 다시 시도해 주세요.</p>
                </EmptyState>
            ) : filteredChatRooms.length > 0 ? (
                filteredChatRooms.map((chat) => (
                    <ChatItem
                        key={chat.id}
                        onClick={() => handleChatClick(chat.id)}
                        isReserved={chat.isReserved}
                        hasUnread={chat.unreadCount > 0}
                    >
                      <UserAvatar>{chat.userAvatar}</UserAvatar>
                      <ChatInfo>
                        <UserName>{chat.userName}</UserName>
                        <BookTitle>
                          <FaBook style={{ color: '#666' }} />
                          {chat.bookTitle}
                        </BookTitle>
                        <TradeStatus $status={chat.tradeStatus}>{getStatusText(chat.tradeStatus)}</TradeStatus>
                        <LastMessage>{chat.lastMessage}</LastMessage>
                      </ChatInfo>
                      <ChatMeta>
                        <LastTime>{chat.lastTime || ''}</LastTime>
                        <div style={{ fontSize: '0.75rem', color: '#ccc' }}>{chat.salePostId}번포스트</div>
                        {chat.unreadCount > 0 && <UnreadCount>{chat.unreadCount}</UnreadCount>}
                      </ChatMeta>
                    </ChatItem>
                ))
            ) : (
                // ✅ 로딩이 끝났고, 정말로 0개일 때만 빈 상태 표시
                <EmptyState>
                  <EmptyIcon />
                  <h3>채팅방이 없습니다</h3>
                  <p>책 거래를 시작하면 채팅방이 생성됩니다.</p>
                </EmptyState>
            )}
          </ChatList>
        </ChatListContainer>
      </MainContent>
    </PageWrapper>
  );
};

export default ChatListPage; 