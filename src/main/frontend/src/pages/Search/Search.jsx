import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaBook, FaUser, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Container, Grid, Card, CardTitle, CardMeta, MetaLabel, MetaValue } from '../../components/ui';

const SearchContainer = styled.div`
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

const SearchHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

const SearchTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 10px;
`;

const SearchSubtitle = styled.p`
  font-size: 1.1rem;
  color: #666;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 15px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
  }
`;



const FilterSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
`;

const FilterTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  color: #333;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.label`
  font-weight: 600;
  color: #555;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FilterSelect = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
`;

const FilterInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
`;

const ResultsSection = styled.div`
  margin-top: 30px;
`;

const ResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ResultsCount = styled.p`
  color: #666;
  font-size: 1.1rem;
`;

const SortSelect = styled.select`
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
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

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    subject: '',
    priceMin: '',
    priceMax: '',
    status: '',
    sortBy: 'createdAt'
  });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
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
      image: null
    },
    {
      id: 2,
      title: '스프링 부트 실전 활용',
      author: '김영한',
      subject: '프로그래밍',
      price: 20000,
      status: 'SALE',
      image: null
    },
    {
      id: 3,
      title: '알고리즘 문제 해결 전략',
      author: '구종만',
      subject: '알고리즘',
      price: 18000,
      status: 'RESERVED',
      image: null
    }
  ];

  useEffect(() => {
    setBooks(mockBooks);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      const filtered = mockBooks.filter(book => 
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setBooks(filtered);
      setLoading(false);
    }, 500);
  };

  const handleBookClick = (bookId) => {
    navigate(`/marketplace/${bookId}`);
  };

  return (
    <>
      <div className="header-spacer" />
      <SearchContainer>
        <SearchHeader>
          <SearchTitle>책 검색</SearchTitle>
          <SearchSubtitle>원하는 책을 찾아보세요</SearchSubtitle>
        </SearchHeader>

        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="책 제목, 저자, 과목을 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </SearchForm>

        <FilterSection>
          <FilterTitle>
            <FaFilter /> 필터
          </FilterTitle>
          <FilterGrid>
            <FilterGroup>
              <FilterLabel>
                <FaGraduationCap /> 과목
              </FilterLabel>
              <FilterSelect
                value={filters.subject}
                onChange={(e) => setFilters({...filters, subject: e.target.value})}
              >
                <option value="">전체</option>
                <option value="프로그래밍">프로그래밍</option>
                <option value="알고리즘">알고리즘</option>
                <option value="수학">수학</option>
                <option value="영어">영어</option>
              </FilterSelect>
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>최소 가격</FilterLabel>
              <FilterInput
                type="number"
                placeholder="0"
                value={filters.priceMin}
                onChange={(e) => setFilters({...filters, priceMin: e.target.value})}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>최대 가격</FilterLabel>
              <FilterInput
                type="number"
                placeholder="무제한"
                value={filters.priceMax}
                onChange={(e) => setFilters({...filters, priceMax: e.target.value})}
              />
            </FilterGroup>

            <FilterGroup>
              <FilterLabel>상태</FilterLabel>
              <FilterSelect
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">전체</option>
                <option value="SALE">판매중</option>
                <option value="RESERVED">예약중</option>
                <option value="SOLD">판매완료</option>
              </FilterSelect>
            </FilterGroup>
          </FilterGrid>
        </FilterSection>

        <ResultsSection>
          <ResultsHeader>
            <ResultsCount>총 {books.length}개의 결과</ResultsCount>
            <SortSelect
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="createdAt">최신순</option>
              <option value="price">가격순</option>
              <option value="title">제목순</option>
            </SortSelect>
          </ResultsHeader>

          {loading ? (
            <NoResults>검색 중...</NoResults>
          ) : books.length > 0 ? (
            <Grid>
              {books.map(book => (
                <Card key={book.id} onClick={() => handleBookClick(book.id)}>
                  <Card.Image>
                    {book.image ? (
                      <img src={book.image} alt={book.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                    ) : (
                      <FaBook size={40} />
                    )}
                  </Card.Image>
                  <CardTitle>{book.title}</CardTitle>
                  <CardMeta>
                    <MetaLabel>
                      <FaUser size={12} />
                      {book.author}
                    </MetaLabel>
                    <MetaValue>
                      <FaGraduationCap size={12} />
                      {book.subject}
                    </MetaValue>
                  </CardMeta>
                  <BookPrice>{book.price.toLocaleString()}원</BookPrice>
                  <BookStatus status={book.status}>
                    {book.status === 'SALE' ? '판매중' : 
                     book.status === 'RESERVED' ? '예약중' : '판매완료'}
                  </BookStatus>
                </Card>
              ))}
            </Grid>
          ) : (
            <NoResults>
              <FaBook size={60} style={{marginBottom: '20px', opacity: 0.5}} />
              <h3>검색 결과가 없습니다</h3>
              <p>다른 검색어를 시도해보세요</p>
            </NoResults>
          )}
        </ResultsSection>
      </SearchContainer>
    </>
  );
};

export default Search; 