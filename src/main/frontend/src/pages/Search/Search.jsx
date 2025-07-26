import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { FaSearch, FaFilter, FaBook, FaUser, FaGraduationCap } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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

const SearchButton = styled.button`
  padding: 15px 25px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;

  &:hover {
    background: #0056b3;
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
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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

const BookAuthor = styled.p`
  color: #666;
  margin-bottom: 5px;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const BookSubject = styled.p`
  color: #888;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 5px;
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
      case 'FOR_SALE': return 'background: #d4edda; color: #155724;';
      case 'RESERVED': return 'background: #fff3cd; color: #856404;';
      case 'SOLD_OUT': return 'background: #f8d7da; color: #721c24;';
      default: return 'background: #e2e3e5; color: #383d41;';
    }
  }}
`;

const NoResults = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

// 백엔드 Enum을 프론트엔드 텍스트로 변환하는 헬퍼
const statusMap = {
  'FOR_SALE': '판매중',
  'RESERVED': '예약중',
  'SOLD_OUT': '판매완료'
};

const Search = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    // TODO: 필터 기능은 백엔드 API에 해당 파라미터가 추가된 후 구현
    sortBy: 'createdAt,desc' // 기본 정렬: 최신순
  });
  const [posts, setPosts] = useState([]); // [수정] books -> posts
  const [pageInfo, setPageInfo] = useState(null); // [추가] 페이지네이션 정보
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // [수정] API 호출 로직
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // API에 보낼 파라미터 구성
      const params = {
        page: 0, // TODO: 페이지네이션 UI 구현 시 현재 페이지 상태와 연결
        size: 20, // 한 번에 20개씩
        sort: filters.sortBy,
        // TODO: 백엔드에 검색 기능 추가 후, searchTerm 파라미터도 추가
        // query: searchTerm, 
      };

      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.content); // 실제 데이터는 content 배열에 담겨있음
      setPageInfo({ // 페이지 정보 저장
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        currentPage: response.data.number,
      });
    } catch (error) {
      console.error("게시글 목록을 불러오는 데 실패했습니다.", error);
      alert("게시글을 불러올 수 없습니다.");
    } finally {
      setLoading(false);
    }
  }, [filters.sortBy]); // 정렬 기준이 바뀔 때마다 함수를 새로 만듦

  // 컴포넌트가 처음 마운트될 때 게시글 목록을 불러옴
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]); // fetchPosts 함수가 변경될 때마다 실행

  // 검색 버튼 클릭 시 동작
  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: 현재 백엔드 API는 검색어(query) 파라미터를 지원하지 않음.
    // 백엔드에 검색 기능이 추가되면, 이 함수에서 fetchPosts를 다시 호출하도록 구현해야 함.
    alert('검색 기능은 현재 준비 중입니다!');
  };

  const handleBookClick = (postId) => {
    navigate(`/posts/${postId}`);
  };

  return (
    <>
      <div className="header-spacer" />
      <SearchContainer>
        <SearchHeader>
          <SearchTitle>책 마켓플레이스</SearchTitle>
          <SearchSubtitle>선배들의 지식을 저렴하게 얻어보세요!</SearchSubtitle>
        </SearchHeader>

        <SearchForm onSubmit={handleSearch}>
          <SearchInput
            type="text"
            placeholder="책 제목, 저자를 검색해보세요..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <SearchButton type="submit">
            <FaSearch />
          </SearchButton>
        </SearchForm>

        {/* TODO: 필터 기능은 백엔드 API가 준비되면 활성화 */}
        {/* <FilterSection> ... </FilterSection> */}

        <ResultsSection>
          <ResultsHeader>
            <ResultsCount>총 {pageInfo ? pageInfo.totalElements : 0}개의 게시글</ResultsCount>
            <SortSelect
              value={filters.sortBy}
              onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
            >
              <option value="createdAt,desc">최신순</option>
              <option value="price,asc">낮은 가격순</option>
              <option value="price,desc">높은 가격순</option>
              {/* TODO: 조회수순 정렬은 백엔드에 기능 추가 후 활성화 */}
            </SortSelect>
          </ResultsHeader>

          {loading ? (
            <NoResults>게시글을 불러오는 중...</NoResults>
          ) : posts.length > 0 ? (
            <BookGrid>
              {posts.map(post => (
                <BookCard key={post.postId} onClick={() => handleBookClick(post.postId)}>
                  <BookImage>
                    {post.thumbnailUrl ? (
                      <BookImageImg src={post.thumbnailUrl} alt={post.postTitle} />
                    ) : (
                      <FaBook size={40} />
                    )}
                  </BookImage>
                  <BookCardTitle>{post.postTitle}</BookCardTitle>
                  <BookSeller>
                    <FaUser size={12} />
                    {post.sellerNickname}
                  </BookSeller>
                  <BookPrice>{post.price.toLocaleString()}원</BookPrice>
                  <BookStatus status={post.status}>
                    {statusMap[post.status]}
                  </BookStatus>
                </BookCard>
              ))}
            </BookGrid>
          ) : (
            <NoResults>
              <FaBook size={60} style={{marginBottom: '20px', opacity: 0.5}} />
              <h3>등록된 게시글이 없습니다</h3>
              <p>첫 번째 판매글을 등록해보세요!</p>
            </NoResults>
          )}
        </ResultsSection>
        {/* TODO: 여기에 페이지네이션 버튼 UI를 추가 (예: 1, 2, 3, 다음 >) */}
      </SearchContainer>
    </>
  );
};

export default Search;