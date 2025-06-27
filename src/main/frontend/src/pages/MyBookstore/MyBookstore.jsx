import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaUser, FaClock, FaMoneyBillWave, FaChartLine, FaHeart, FaSearch, FaHandPaper, FaArrowRight, FaRegEye, FaExchangeAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';

const BookstoreContainer = styled.div`
  max-width: 1600px;
  width: 100vw;
  margin: 0 auto;
  padding: 32px;
  box-sizing: border-box;
  padding-top: 24px;
  @media (max-width: 900px) {
    padding: 16px 8px;
    padding-top: 16px;
  }
  @media (max-width: 600px) {
    padding: 8px 2px;
    padding-top: 12px;
  }
`;

const BookstoreHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;

  &:hover {
    background: #218838;
  }
`;

const MyTransactionsButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #6f42c1;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;

  &:hover {
    background: #5a32a3;
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
`;

const BookTitle = styled.h3`
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
      case 'SALE': return 'background: #d4edda; color: #155724;';
      case 'RESERVED': return 'background: #fff3cd; color: #856404;';
      case 'SOLD': return 'background: #f8d7da; color: #721c24;';
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
      case 'SALE': return 'background: #d4edda; color: #155724;';
      case 'RESERVED': return 'background: #fff3cd; color: #856404;';
      case 'SOLD': return 'background: #f8d7da; color: #721c24;';
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

const MyBookstore = () => {
  const [activeTab, setActiveTab] = useState('selling');
  const [books, setBooks] = useState([]);
  const [showAllMyBooks, setShowAllMyBooks] = useState(false);
  const [showAllWishlist, setShowAllWishlist] = useState(false);
  const [showAllRecent, setShowAllRecent] = useState(false);
  const [showAllWanted, setShowAllWanted] = useState(false);
  const navigate = useNavigate();

  // 임시 데이터 - 내가 등록한 책
  const mockMyBooks = [
    {
      id: 1,
      title: '자바의 정석',
      author: '남궁성',
      subject: '프로그래밍',
      price: 15000,
      status: 'SALE',
      createdAt: '2024-01-10',
      views: 45,
      image: null
    },
    {
      id: 2,
      title: '스프링 부트 실전 활용',
      author: '김영한',
      subject: '프로그래밍',
      price: 20000,
      status: 'RESERVED',
      createdAt: '2024-01-08',
      views: 32,
      image: null
    },
    {
      id: 3,
      title: '알고리즘 문제 해결 전략',
      author: '구종만',
      subject: '알고리즘',
      price: 18000,
      status: 'SOLD',
      createdAt: '2024-01-05',
      views: 28,
      image: null
    },
    {
      id: 4,
      title: '리액트를 다루는 기술',
      author: '김민준',
      subject: '프론트엔드',
      price: 22000,
      status: 'SALE',
      createdAt: '2024-01-03',
      views: 15,
      image: null
    },
    {
      id: 5,
      title: 'Node.js 교과서',
      author: '조현영',
      subject: '백엔드',
      price: 25000,
      status: 'SALE',
      createdAt: '2024-01-01',
      views: 8,
      image: null
    }
  ];

  // 임시 데이터 - 찜한 책
  const mockWishlist = [
    {
      id: 101,
      title: '클린 코드',
      author: '로버트 C. 마틴',
      price: 30000,
      status: 'SALE',
      createdAt: '2024-01-12',
      image: null
    },
    {
      id: 102,
      title: '함께 자라기',
      author: '김창준',
      price: 18000,
      status: 'SALE',
      createdAt: '2024-01-11',
      image: null
    },
    {
      id: 103,
      title: '객체지향의 사실과 오해',
      author: '조영호',
      price: 22000,
      status: 'SALE',
      createdAt: '2024-01-10',
      image: null
    },
    {
      id: 104,
      title: '테스트 주도 개발',
      author: '켄트 벡',
      price: 28000,
      status: 'SALE',
      createdAt: '2024-01-09',
      image: null
    }
  ];

  // 임시 데이터 - 최근 본 책
  const mockRecentBooks = [
    {
      id: 201,
      title: '모던 자바스크립트',
      author: '이웅모',
      price: 35000,
      viewedAt: '2024-01-15 14:30',
      image: null
    },
    {
      id: 202,
      title: '파이썬 알고리즘',
      author: '박상현',
      price: 25000,
      viewedAt: '2024-01-15 13:15',
      image: null
    },
    {
      id: 203,
      title: '데이터베이스 설계',
      author: '김연희',
      price: 32000,
      viewedAt: '2024-01-15 12:45',
      image: null
    },
    {
      id: 204,
      title: 'Docker 입문',
      author: '이재홍',
      price: 28000,
      viewedAt: '2024-01-15 11:20',
      image: null
    },
    {
      id: 205,
      title: 'Git 완벽 가이드',
      author: '전병진',
      price: 22000,
      viewedAt: '2024-01-15 10:30',
      image: null
    }
  ];

  // 임시 데이터 - 구해요 글
  const mockWantedPosts = [
    {
      id: 301,
      title: '자바의 정석 구합니다',
      author: '김학생',
      budget: '15000원',
      createdAt: '2024-01-15',
      status: 'ACTIVE'
    },
    {
      id: 302,
      title: '스프링 관련 책 구해요',
      author: '이학생',
      budget: '20000원',
      createdAt: '2024-01-14',
      status: 'ACTIVE'
    },
    {
      id: 303,
      title: '알고리즘 책 구합니다',
      author: '박학생',
      budget: '18000원',
      createdAt: '2024-01-13',
      status: 'ACTIVE'
    },
    {
      id: 304,
      title: '프론트엔드 책 구해요',
      author: '최학생',
      budget: '25000원',
      createdAt: '2024-01-12',
      status: 'ACTIVE'
    }
  ];

  useEffect(() => {
    setBooks(mockMyBooks);
  }, []);

  const getFilteredBooks = () => {
    switch(activeTab) {
      case 'selling':
        return books.filter(book => book.status === 'SALE');
      case 'reserved':
        return books.filter(book => book.status === 'RESERVED');
      case 'sold':
        return books.filter(book => book.status === 'SOLD');
      default:
        return books;
    }
  };

  const handleEditBook = (bookId) => {
    navigate(`/bookwrite/${bookId}`);
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('이 책을 삭제하시겠습니까?')) {
      setBooks(books.filter(book => book.id !== bookId));
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/marketplace/${bookId}`);
  };

  const handleAddBook = () => {
    navigate('/book-write');
  };

  const handleMyTransactions = () => {
    navigate('/my-transactions');
  };

  const handleRemoveFromWishlist = (bookId) => {
    if (window.confirm('찜을 해제하시겠습니까?')) {
      // 실제로는 API 호출
      console.log('찜 목록에서 제거:', bookId);
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

  return (
    <>
      <div className="header-spacer" />
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
            <SectionTitle>
              <FaBook />
              내가 등록한 책 ({mockMyBooks.length})
            </SectionTitle>
            <ViewMoreButton onClick={() => setShowAllMyBooks(!showAllMyBooks)}>
              {showAllMyBooks ? '접기' : '더보기'}
              <FaArrowRight style={{ transform: showAllMyBooks ? 'rotate(90deg)' : 'none' }} />
            </ViewMoreButton>
          </SectionHeader>

          <TabSection>
            <TabList>
              <Tab 
                $active={activeTab === 'selling'} 
                onClick={() => setActiveTab('selling')}
              >
                판매중 ({books.filter(book => book.status === 'SALE').length})
              </Tab>
              <Tab 
                $active={activeTab === 'reserved'} 
                onClick={() => setActiveTab('reserved')}
              >
                예약중 ({books.filter(book => book.status === 'RESERVED').length})
              </Tab>
              <Tab 
                $active={activeTab === 'sold'} 
                onClick={() => setActiveTab('sold')}
              >
                판매완료 ({books.filter(book => book.status === 'SOLD').length})
              </Tab>
              <Tab 
                $active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
              >
                전체 ({books.length})
              </Tab>
            </TabList>

            {filteredBooks.length > 0 ? (
              <BookGrid>
                {(showAllMyBooks ? filteredBooks : filteredBooks.slice(0, 3)).map(book => (
                  <BookCard key={book.id}>
                    <BookImage>
                      {book.image ? (
                        <img src={book.image} alt={book.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                      ) : (
                        <FaBook size={40} />
                      )}
                    </BookImage>
                    
                    <BookTitle>{book.title}</BookTitle>
                    
                    <BookMeta>
                      <span>
                        <FaUser size={12} /> {book.author}
                      </span>
                      <span>
                        <FaClock size={12} /> {book.createdAt}
                      </span>
                      <span>
                        <FaEye size={12} /> {book.views}
                      </span>
                    </BookMeta>
                    
                    <BookPrice>{book.price.toLocaleString()}원</BookPrice>
                    
                    <BookStatus $status={book.status}>
                      {book.status === 'SALE' ? '판매중' : 
                       book.status === 'RESERVED' ? '예약중' : '판매완료'}
                    </BookStatus>
                    
                    <BookActions>
                      <ActionButton 
                        onClick={() => handleViewBook(book.id)}
                      >
                        <FaSearch /> 보기
                      </ActionButton>
                      {book.status === 'SALE' && (
                        <ActionButton 
                          onClick={() => handleEditBook(book.id)}
                        >
                          <FaEdit /> 수정
                        </ActionButton>
                      )}
                      <ActionButton 
                        className="delete" 
                        onClick={() => {
                          if (window.confirm('삭제하시겠습니까?')) handleDeleteBook(book.id);
                        }}
                      >
                        <FaTrash /> 삭제
                      </ActionButton>
                    </BookActions>
                  </BookCard>
                ))}
              </BookGrid>
            ) : (
              <NoBooks>
                <EmptyIcon>
                  <FaBook />
                </EmptyIcon>
                <h3>등록된 책이 없습니다</h3>
                <p>첫 번째 책을 등록해보세요!</p>
              </NoBooks>
            )}
          </TabSection>
        </SectionContainer>

        {/* 2. 찜한 책 */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>
              <FaHeart />
              찜한 책 ({mockWishlist.length})
            </SectionTitle>
            <ViewMoreButton onClick={() => setShowAllWishlist(!showAllWishlist)}>
              {showAllWishlist ? '접기' : '더보기'}
              <FaArrowRight style={{ transform: showAllWishlist ? 'rotate(90deg)' : 'none' }} />
            </ViewMoreButton>
          </SectionHeader>

          {mockWishlist.length > 0 ? (
            <CompactList>
              {(showAllWishlist ? mockWishlist : mockWishlist.slice(0, 3)).map(book => (
                <CompactBookCard key={book.id}>
                  <CompactBookImage>
                    {book.image ? (
                      <img src={book.image} alt={book.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <FaBook size={20} />
                    )}
                  </CompactBookImage>
                  <CompactBookInfo>
                    <CompactBookTitle>{book.title}</CompactBookTitle>
                    <CompactBookMeta>
                      <span><FaUser size={10} /> {book.author}</span>
                      <span><FaClock size={10} /> {book.createdAt}</span>
                    </CompactBookMeta>
                    <CompactBookPrice>{book.price.toLocaleString()}원</CompactBookPrice>
                  </CompactBookInfo>
                  <CompactBookStatus $status={book.status}>
                    {book.status === 'SALE' ? '판매중' : '예약중'}
                  </CompactBookStatus>
                  <CompactBookActions>
                    <ActionButton onClick={() => handleViewBook(book.id)}>
                      <FaSearch /> 보기
                    </ActionButton>
                    <ActionButton className="delete" onClick={() => handleRemoveFromWishlist(book.id)}>
                      <FaHeart /> 찜 해제
                    </ActionButton>
                  </CompactBookActions>
                </CompactBookCard>
              ))}
            </CompactList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <FaHeart />
              </EmptyIcon>
              <h3>찜한 책이 없습니다</h3>
              <p>마켓플레이스에서 책을 찜해보세요!</p>
            </EmptyState>
          )}
        </SectionContainer>

        {/* 3. 최근 본 책 */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>
              <FaRegEye />
              최근 본 책 ({mockRecentBooks.length})
            </SectionTitle>
            <ViewMoreButton onClick={() => setShowAllRecent(!showAllRecent)}>
              {showAllRecent ? '접기' : '더보기'}
              <FaArrowRight style={{ transform: showAllRecent ? 'rotate(90deg)' : 'none' }} />
            </ViewMoreButton>
          </SectionHeader>

          {mockRecentBooks.length > 0 ? (
            <CompactList>
              {(showAllRecent ? mockRecentBooks : mockRecentBooks.slice(0, 3)).map(book => (
                <CompactBookCard key={book.id}>
                  <CompactBookImage>
                    {book.image ? (
                      <img src={book.image} alt={book.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <FaBook size={20} />
                    )}
                  </CompactBookImage>
                  
                  <CompactBookInfo>
                    <CompactBookTitle>{book.title}</CompactBookTitle>
                    <CompactBookMeta>
                      <span><FaUser size={10} /> {book.author}</span>
                      <span><FaClock size={10} /> {book.viewedAt}</span>
                    </CompactBookMeta>
                    <CompactBookPrice>{book.price.toLocaleString()}원</CompactBookPrice>
                  </CompactBookInfo>
                  
                  <CompactBookActions>
                    <ActionButton onClick={() => handleViewBook(book.id)}>
                      <FaSearch /> 보기
                    </ActionButton>
                  </CompactBookActions>
                </CompactBookCard>
              ))}
            </CompactList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <FaRegEye />
              </EmptyIcon>
              <h3>최근 본 책이 없습니다</h3>
              <p>마켓플레이스에서 책을 둘러보세요!</p>
            </EmptyState>
          )}
        </SectionContainer>

        {/* 4. 구해요 글 */}
        <SectionContainer>
          <SectionHeader>
            <SectionTitle>
              <FaHandPaper />
              내가 등록한 구해요 글 ({mockWantedPosts.length})
            </SectionTitle>
            <ViewMoreButton onClick={() => setShowAllWanted(!showAllWanted)}>
              {showAllWanted ? '접기' : '더보기'}
              <FaArrowRight style={{ transform: showAllWanted ? 'rotate(90deg)' : 'none' }} />
            </ViewMoreButton>
          </SectionHeader>

          {mockWantedPosts.length > 0 ? (
            <CompactList>
              {(showAllWanted ? mockWantedPosts : mockWantedPosts.slice(0, 3)).map(wanted => (
                <WantedCard key={wanted.id}>
                  <WantedIcon>
                    <FaHandPaper />
                  </WantedIcon>
                  
                  <WantedInfo>
                    <WantedTitle>{wanted.title}</WantedTitle>
                    <WantedMeta>
                      <span><FaUser size={10} /> {wanted.author}</span>
                      <span><FaClock size={10} /> {wanted.createdAt}</span>
                    </WantedMeta>
                  </WantedInfo>
                  
                  <WantedBudget>{wanted.budget}</WantedBudget>
                  
                  <CompactBookActions>
                    <ActionButton onClick={() => handleEditWanted(wanted.id)}>
                      <FaEdit /> 수정
                    </ActionButton>
                    <ActionButton className="delete" onClick={() => handleDeleteWanted(wanted.id)}>
                      <FaTrash /> 삭제
                    </ActionButton>
                  </CompactBookActions>
                </WantedCard>
              ))}
            </CompactList>
          ) : (
            <EmptyState>
              <EmptyIcon>
                <FaHandPaper />
              </EmptyIcon>
              <h3>등록한 구해요 글이 없습니다</h3>
              <p>원하는 책을 구해요에 등록해보세요!</p>
            </EmptyState>
          )}
        </SectionContainer>
      </BookstoreContainer>
    </>
  );
};

export default MyBookstore; 