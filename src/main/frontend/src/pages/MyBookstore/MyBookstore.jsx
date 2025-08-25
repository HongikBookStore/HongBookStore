import React, { useState, useEffect, useCallback} from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaUser, FaClock, FaMoneyBillWave, FaChartLine, FaHeart, FaSearch, FaHandPaper, FaArrowRight, FaRegEye, FaExchangeAlt } from 'react-icons/fa';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import axios from 'axios';

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const BookstoreContainer = styled.div`
  width: 100%;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  padding-top: 0;
  @media (max-width: 900px) {
    padding: 16px 8px;
    padding-top: 0;
  }
  @media (max-width: 600px) {
    padding: 8px 2px;
    padding-top: 0;
  }
`;

const BookstoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
`;

const HeaderButtons = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const BookstoreTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const AddBookButton = styled.button`
  display: flex !important;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #007bff !important;
  color: white !important;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
  min-width: 120px;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 123, 255, 0.2);

  &:hover {
    background: #0056b3 !important;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.3);
  }
`;

const MyTransactionsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
  position: relative;
  z-index: 2;
  box-shadow: 0 2px 8px rgba(23, 162, 184, 0.2);

  &:hover {
    background: #138496;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(23, 162, 184, 0.3);
  }
`;

const TabSection = styled.div`
  margin-bottom: 30px;
`;

const TabList = styled.div`
  display: flex;
  border-bottom: 2px solid #e0e0e0;
  margin-bottom: 20px;
`;

const Tab = styled.button`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid transparent;
  color: ${props => props.$active ? '#007bff' : '#666'};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  margin-bottom: -2px;

  &:hover {
    color: #007bff;
  }

  ${props => props.$active && `
    border-bottom-color: #007bff;
    font-weight: 600;
  `}
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const BookCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }

  @media (max-width: 600px) {
    padding: 12px;
    font-size: 0.95rem;
  }
`;

const BookImage = styled.div`
  width: 100%;
  height: 200px;
  background: #f0f0f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: #999;
  overflow: hidden; /* 이미지가 컨테이너를 넘지 않도록 */
`;

/* BookImage 안에 들어갈 실제 이미지 스타일 */
const BookImageImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const BookCardTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 8px;
  color: #333;
`;

const BookMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 10px;
`;

const BookPrice = styled.div`
  font-size: 1.3rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 10px;
`;

const BookStatus = styled.span`
  padding: 4px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 600;
  
  ${props => {
    switch(props.$status) {
      case 'FOR_SALE': return 'background: #d4edda; color: #155724;';
      case 'RESERVED': return 'background: #fff3cd; color: #856404;';
      case 'SOLD_OUT': return 'background: #f8d7da; color: #721c24;';
      default: return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const BookActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;
  &:hover {
    background: #f8f9fa;
    border-color: #007bff;
    color: #007bff;
  }
  &.delete:hover {
    border-color: #dc3545;
    color: #dc3545;
  }
`;

const NoBooks = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const SectionContainer = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0f0f0;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  color: #333;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ViewMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 8px 16px;
  background: #f8f9fa;
  color: #007bff;
  border: 1px solid #dee2e6;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const FloatingHeartButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
  z-index: 2;

  &:hover {
    box-shadow: 0 8px 24px rgba(0,0,0,0.15);
    transform: scale(1.08);
  }

  svg {
    font-size: 1.7rem;
    color: #e91e63;
    transition: color 0.2s;
  }
`;

const CompactBookCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }
`;

const CompactBookImage = styled.div`
  width: 60px;
  height: 80px;
  background: #f0f0f0;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  flex-shrink: 0;
  overflow: hidden; /* 이미지가 컨테이너를 넘지 않도록 */
  
  /* 내부 이미지 스타일 */
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 6px;
  }
`;

const CompactBookInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CompactBookTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompactBookMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 0.8rem;
  margin-bottom: 5px;
`;

const CompactBookPrice = styled.div`
  font-size: 1.1rem;
  font-weight: bold;
  color: #007bff;
`;

const CompactBookStatus = styled.span`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  
  ${props => {
    switch(props.$status) {
      case 'FOR_SALE': return 'background: #d4edda; color: #155724;';
      case 'RESERVED': return 'background: #fff3cd; color: #856404;';
      case 'SOLD_OUT': return 'background: #f8d7da; color: #721c24;';
      default: return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const CompactBookActions = styled.div`
  display: flex;
  gap: 5px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px dashed #dee2e6;
`;

const EmptyIcon = styled.div`
  font-size: 2rem;
  color: #ccc;
  margin-bottom: 10px;
`;

const CompactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const WantedCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
  }
`;

const WantedIcon = styled.div`
  width: 50px;
  height: 50px;
  background: #fff3cd;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #856404;
  flex-shrink: 0;
`;

const WantedInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const WantedTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 5px;
  color: #333;
`;

const WantedMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  color: #666;
  font-size: 0.8rem;
`;

const WantedBudget = styled.div`
  font-size: 1rem;
  font-weight: bold;
  color: #28a745;
`;

const CircleIconButton = styled.button`
  background: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  cursor: pointer;
  font-size: 1.3rem;
  margin: 0 4px;
  position: relative;
  transition: box-shadow 0.2s, background 0.2s, color 0.2s, transform 0.15s;

  &:hover {
    background: #f8f9fa;
    box-shadow: 0 4px 16px rgba(0,0,0,0.13);
    transform: scale(1.08);
  }

  &::before {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 120%;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: opacity 0.3s, visibility 0.3s;
    z-index: 1000;
    margin-bottom: 5px;
    pointer-events: none;
  }
  &:hover::before {
    opacity: 1;
    visibility: visible;
  }
`;

/* 로딩 스피너 컴포넌트 */
const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  color: #666;
  font-size: 1.1rem;
`;

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 백엔드 Enum을 프론트엔드 텍스트로 변환하는 헬퍼
const statusMap = {
  'FOR_SALE': '판매중',
  'RESERVED': '예약중',
  'SOLD_OUT': '판매완료'
};

const MyBookstore = () => {
  const [activeTab, setActiveTab] = useState('all'); // 기본 탭을 '전체'로
  const [myPosts, setMyPosts] = useState([]);

  const [showAllMyBooks, setShowAllMyBooks] = useState(false);
  const [wishlist, setWishlist] = useState([]); // 찜 목록 상태
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllWanted, setShowAllWanted] = useState(false);
  const [loading, setLoading] = useState({ myPosts: true, wishlist: true });
  const [error, setError] = useState({ myPosts: null, wishlist: null }); // 에러 상태 관리
  const navigate = useNavigate();

  // 내 판매글 목록을 불러오는 API 호출 함수
  const fetchMyPosts = useCallback(async () => {
    setLoading(prev => ({ ...prev, myPosts: true }));
    setError(prev => ({ ...prev, myPosts: null })); // 에러 초기화
    try {
      const response = await axios.get('/api/my/posts', { headers: getAuthHeader() });
      setMyPosts(response.data);
    } catch (error) {
      console.error("내 판매글 목록을 불러오는 데 실패했습니다.", error);
      setError(prev => ({ ...prev, myPosts: '내 판매글을 불러오는 데 실패했습니다.' })); // 에러 상태 설정
    } finally {
      setLoading(prev => ({ ...prev, myPosts: false }));
    }
  }, []);

  // 내 찜 목록을 불러오는 API 호출 함수
  const fetchWishlist = useCallback(async () => {
    setLoading(prev => ({ ...prev, wishlist: true }));
    setError(prev => ({ ...prev, wishlist: null })); // 에러 초기화
    try {
      const response = await axios.get('/api/my/likes', { headers: getAuthHeader() });
      setWishlist(response.data);
    } catch (error) {
      console.error("찜 목록을 불러오는 데 실패했습니다.", error);
      setError(prev => ({ ...prev, wishlist: '찜 목록을 불러오는 데 실패했습니다.' })); // 에러 상태 설정
    } finally {
      setLoading(prev => ({ ...prev, wishlist: false }));
    }
  }, []);

  // 컴포넌트 마운트 시 API 호출
  useEffect(() => {
    fetchMyPosts();
    fetchWishlist();
  }, [fetchMyPosts, fetchWishlist]);

  // 탭에 따라 게시글을 필터링하는 함수
  const getFilteredBooks = () => {
    if (activeTab === 'all') return myPosts;
    // 백엔드 status (FOR_SALE, RESERVED, SOLD_OUT)와 프론트엔드 탭(selling, reserved, sold)을 매핑
    const statusMapping = {
      selling: 'FOR_SALE',
      reserved: 'RESERVED',
      sold: 'SOLD_OUT'
    };
    return myPosts.filter(post => post.status === statusMapping[activeTab]);
  };

  const handleEditBook = (postId) => {
    navigate(`/postwrite/${postId}`);
  };

  // 게시글 삭제 핸들러
  const handleDeleteBook = async (postId) => {
    if (window.confirm('이 책을 정말 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다.')) {
      try {
        await axios.delete(`/api/posts/${postId}`, { headers: getAuthHeader() });
        alert("게시글이 삭제되었습니다.");
        fetchMyPosts(); // 목록 새로고침
      } catch (error) {
        console.error("게시글 삭제에 실패했습니다.", error);
        alert("게시글 삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleViewBook = (postId) => navigate(`/posts/${postId}`);

  const handleAddBook = () => {
    navigate('/book-write');
  };

  const handleMyTransactions = () => {
    navigate('/my-transactions');
  };

  // 찜 해제 핸들러
  const handleRemoveFromWishlist = async (postId) => {
    if (window.confirm('찜을 해제하시겠습니까?')) {
      try {
        await axios.delete(`/api/posts/${postId}/like`, { headers: getAuthHeader() });
        alert("찜이 해제되었습니다.");
        fetchWishlist(); // 찜 목록 새로고침
      } catch (error) {
        console.error("찜 해제에 실패했습니다.", error);
        alert("찜 해제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleViewWanted = (wantedId) => {
    navigate(`/wanted/${wantedId}`);
  };

  const handleEditWanted = (wantedId) => {
    navigate(`/wantedwrite/${wantedId}`);
  };

  const handleDeleteWanted = (wantedId) => {
    if (window.confirm('이 구해요 글을 삭제하시겠습니까?')) {
      // 실제로는 API 호출
      console.log('구해요 글 삭제:', wantedId);
    }
  };

  const filteredBooks = getFilteredBooks();

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

  return (
    <PageWrapper>
      <SidebarMenu active="mybookstore" onMenuClick={handleSidebarMenu} />
      <MainContent>
        <BookstoreContainer>
          <BookstoreHeader>
            <BookstoreTitle>나의 책방</BookstoreTitle>
            <HeaderButtons>
              <MyTransactionsButton onClick={handleMyTransactions}>
                <FaExchangeAlt /> 나의 거래
              </MyTransactionsButton>
              <AddBookButton onClick={handleAddBook}>
                <FaPlus /> 책 등록하기
              </AddBookButton>
            </HeaderButtons>
          </BookstoreHeader>

          {/* 1. 내가 등록한 책 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle><FaBook /> 내가 등록한 책</SectionTitle>
              <ViewMoreButton onClick={() => setShowAllMyBooks(!showAllMyBooks)}>
                {showAllMyBooks ? '접기' : '더보기'}
                <FaArrowRight style={{ transform: showAllMyBooks ? 'rotate(90deg)' : 'none' }} />
              </ViewMoreButton>
            </SectionHeader>

            <TabSection>
              <TabList>
                <Tab $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>
                  전체 ({myPosts.length})
                </Tab>
                <Tab $active={activeTab === 'selling'} onClick={() => setActiveTab('selling')}>
                  판매중 ({myPosts.filter(p => p.status === 'FOR_SALE').length})
                </Tab>
                <Tab $active={activeTab === 'reserved'} onClick={() => setActiveTab('reserved')}>
                  예약중 ({myPosts.filter(p => p.status === 'RESERVED').length})
                </Tab>
                <Tab $active={activeTab === 'sold'} onClick={() => setActiveTab('sold')}>
                  판매완료 ({myPosts.filter(p => p.status === 'SOLD_OUT').length})
                </Tab>
              </TabList>

              {/* 로딩과 에러 상태를 더 명확하게 처리 */}
              {loading.myPosts ? (
                <LoadingSpinner>
                  <FaBook style={{ marginRight: '8px' }} />
                  목록을 불러오는 중...
                </LoadingSpinner>
              ) : error.myPosts ? (
                <EmptyState>
                  <EmptyIcon><FaBook /></EmptyIcon>
                  <h3>{error.myPosts}</h3>
                  <button onClick={fetchMyPosts} style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    다시 시도
                  </button>
                </EmptyState>
              ) : filteredBooks.length > 0 ? (
                <BookGrid>
                  {filteredBooks.map(post => (
                    <BookCard key={post.postId}>
                      <BookImage>
                        {post.thumbnailUrl ? (
                          <BookImageImg src={post.thumbnailUrl} alt={post.bookTitle} />
                        ) : (
                          <FaBook size={40} />
                        )}
                      </BookImage>
                      
                      <BookCardTitle>{post.bookTitle}</BookCardTitle>
                      
                      <BookMeta>
                        <span>
                          <FaClock size={12} /> {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                        {/* <span><FaEye size={12} /> {post.views}</span> */}
                      </BookMeta>
                      
                      <BookPrice>{post.price.toLocaleString()}원</BookPrice>
                      
                      <BookStatus $status={post.status}>
                        {statusMap[post.status]}
                      </BookStatus>
                      
                      <BookActions>
                        <ActionButton onClick={() => handleViewBook(post.postId)}>
                          <FaSearch /> 보기
                        </ActionButton>
                        {post.status === 'FOR_SALE' && (
                          <ActionButton onClick={() => handleEditBook(post.postId)}>
                            <FaEdit /> 수정
                          </ActionButton>
                        )}
                        <ActionButton className="delete" onClick={() => handleDeleteBook(post.postId)}>
                          <FaTrash /> 삭제
                        </ActionButton>
                      </BookActions>
                    </BookCard>
                  ))}
                </BookGrid>
              ) : (
                <NoBooks>
                  <EmptyIcon><FaBook /></EmptyIcon>
                  {/* 탭에 따른 메시지 조건 수정 */}
                  <h3>{activeTab === 'all' ? '등록한 책이 없습니다' : `${statusMap[activeTab] || '해당 상태'}인 책이 없습니다`}</h3>
                </NoBooks>
              )}
            </TabSection>
          </SectionContainer>

          {/* 2. 찜한 책 */}
          <SectionContainer>
            <SectionHeader>
              <SectionTitle><FaHeart /> 찜한 책 ({Array.isArray(wishlist) ? wishlist.length : 0})</SectionTitle> {/* 배열 체크 추가 */}
            </SectionHeader>
            {/* 수정: 로딩과 에러 상태를 더 명확하게 처리 */}
            {loading.wishlist ? (
              <LoadingSpinner>
                <FaHeart style={{ marginRight: '8px' }} />
                찜 목록을 불러오는 중...
              </LoadingSpinner>
            ) : error.wishlist ? (
              <EmptyState>
                <EmptyIcon><FaHeart /></EmptyIcon>
                <h3>{error.wishlist}</h3>
                <button onClick={fetchWishlist} style={{ marginTop: '10px', padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  다시 시도
                </button>
              </EmptyState>
            ) : Array.isArray(wishlist) && wishlist.length > 0 ? (
              // 배열 체크 추가
              <CompactList>
                {wishlist.map(item => (
                  <CompactBookCard key={item.postId}>
                    <CompactBookImage>
                      {item.thumbnailUrl ? <img src={item.thumbnailUrl} alt={item.postTitle} /> : <FaBook size={20} />}
                    </CompactBookImage>
                    <CompactBookInfo>
                      <CompactBookTitle>{item.postTitle}</CompactBookTitle>
                      <CompactBookMeta>
                        <span><FaUser size={10} /> {item.sellerNickname}</span>
                        <span><FaClock size={10} /> {new Date(item.createdAt).toLocaleDateString()}</span>
                      </CompactBookMeta>
                      <CompactBookPrice>{item.price.toLocaleString()}원</CompactBookPrice>
                    </CompactBookInfo>
                    <BookActions>
                      <ActionButton onClick={() => handleViewBook(item.postId)}><FaEye /> 보기</ActionButton>
                      <ActionButton className="delete" onClick={() => handleRemoveFromWishlist(item.postId)}><FaHeart /> 찜 해제</ActionButton>
                    </BookActions>
                  </CompactBookCard>
                ))}
              </CompactList>
            ) : (
              <EmptyState>
                <EmptyIcon><FaHeart /></EmptyIcon>
                <h3>찜한 책이 없습니다</h3>
              </EmptyState>
            )}
          </SectionContainer>

          {/* TODO: 최근 본 책, 구해요 글 섹션은 각각의 API가 만들어진 후에 연동 */}

          {/* 3. 최근 본 책 */}
          

          {/* 4. 구해요 글 */}
          
        </BookstoreContainer>
      </MainContent>
    </PageWrapper>
  );
};

export default MyBookstore; 