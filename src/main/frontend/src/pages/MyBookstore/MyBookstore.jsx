import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaUser, FaClock, FaMoneyBillWave, FaChartLine, FaHeart, FaSearch, FaHandPaper, FaArrowRight, FaRegEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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

const StatsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
`;

const StatIcon = styled.div`
  font-size: 2rem;
  color: #007bff;
  margin-bottom: 10px;
`;

const StatNumber = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const StatLabel = styled.div`
  color: #666;
  font-size: 0.9rem;
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
  color: ${props => props.active ? '#007bff' : '#666'};
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s;
  margin-bottom: -2px;

  &:hover {
    color: #007bff;
  }

  ${props => props.active && `
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
    switch(props.status) {
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

const CompactBookCard = styled.div`
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
    switch(props.status) {
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

const CompactActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid #ddd;
  background: white;
  color: #666;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.8rem;
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

const MyBookstore = () => {
  const [activeTab, setActiveTab] = useState('selling');
  const [books, setBooks] = useState([]);
  const [stats, setStats] = useState({
    totalBooks: 0,
    sellingBooks: 0,
    soldBooks: 0,
    totalViews: 0
  });
  const navigate = useNavigate();

  // 임시 데이터
  const mockBooks = [
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
    }
  ];

  useEffect(() => {
    setBooks(mockBooks);
    setStats({
      totalBooks: mockBooks.length,
      sellingBooks: mockBooks.filter(book => book.status === 'SALE').length,
      soldBooks: mockBooks.filter(book => book.status === 'SOLD').length,
      totalViews: mockBooks.reduce((sum, book) => sum + book.views, 0)
    });
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
    navigate(`/bookstore/edit/${bookId}`);
  };

  const handleDeleteBook = (bookId) => {
    if (window.confirm('정말로 이 책을 삭제하시겠습니까?')) {
      setBooks(books.filter(book => book.id !== bookId));
    }
  };

  const handleViewBook = (bookId) => {
    navigate(`/marketplace/${bookId}`);
  };

  const handleAddBook = () => {
    navigate('/bookstore/add');
  };

  const filteredBooks = getFilteredBooks();

  return (
    <>
      <div className="header-spacer" />
      <BookstoreContainer>
        <BookstoreHeader>
          <BookstoreTitle>나의 책방</BookstoreTitle>
          <AddBookButton onClick={handleAddBook}>
            <FaPlus /> 책 등록하기
          </AddBookButton>
        </BookstoreHeader>

        <StatsSection>
          <StatCard>
            <StatIcon>
              <FaBook />
            </StatIcon>
            <StatNumber>{stats.totalBooks}</StatNumber>
            <StatLabel>전체 책</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FaMoneyBillWave />
            </StatIcon>
            <StatNumber>{stats.sellingBooks}</StatNumber>
            <StatLabel>판매중</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FaChartLine />
            </StatIcon>
            <StatNumber>{stats.soldBooks}</StatNumber>
            <StatLabel>판매완료</StatLabel>
          </StatCard>
          <StatCard>
            <StatIcon>
              <FaEye />
            </StatIcon>
            <StatNumber>{stats.totalViews}</StatNumber>
            <StatLabel>총 조회수</StatLabel>
          </StatCard>
        </StatsSection>

        <TabSection>
          <TabList>
            <Tab 
              active={activeTab === 'selling'} 
              onClick={() => setActiveTab('selling')}
            >
              판매중 ({stats.sellingBooks})
            </Tab>
            <Tab 
              active={activeTab === 'reserved'} 
              onClick={() => setActiveTab('reserved')}
            >
              예약중 ({books.filter(book => book.status === 'RESERVED').length})
            </Tab>
            <Tab 
              active={activeTab === 'sold'} 
              onClick={() => setActiveTab('sold')}
            >
              판매완료 ({stats.soldBooks})
            </Tab>
            <Tab 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')}
            >
              전체 ({stats.totalBooks})
            </Tab>
          </TabList>

          {filteredBooks.length > 0 ? (
            <BookGrid>
              {filteredBooks.map(book => (
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
                  
                  <BookStatus status={book.status}>
                    {book.status === 'SALE' ? '판매중' : 
                     book.status === 'RESERVED' ? '예약중' : '판매완료'}
                  </BookStatus>
                  
                  <BookActions>
                    <ActionButton onClick={() => handleViewBook(book.id)}>
                      <FaEye /> 보기
                    </ActionButton>
                    {book.status === 'SALE' && (
                      <ActionButton onClick={() => handleEditBook(book.id)}>
                        <FaEdit /> 수정
                      </ActionButton>
                    )}
                    <ActionButton 
                      className="delete" 
                      onClick={() => handleDeleteBook(book.id)}
                    >
                      <FaTrash /> 삭제
                    </ActionButton>
                  </BookActions>
                </BookCard>
              ))}
            </BookGrid>
          ) : (
            <NoBooks>
              <FaBook size={60} style={{marginBottom: '20px', opacity: 0.5}} />
              <h3>{activeTab === 'selling' ? '판매중인 책이 없습니다' : 
                   activeTab === 'reserved' ? '예약중인 책이 없습니다' :
                   activeTab === 'sold' ? '판매완료된 책이 없습니다' : '등록된 책이 없습니다'}</h3>
              <p>첫 번째 책을 등록해보세요!</p>
            </NoBooks>
          )}
        </TabSection>
      </BookstoreContainer>
    </>
  );
};

export default MyBookstore; 