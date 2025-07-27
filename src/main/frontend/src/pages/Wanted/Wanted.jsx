import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaUser, FaClock, FaBook, FaGraduationCap, FaEye } from 'react-icons/fa';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import { useNavigate } from 'react-router-dom';
import { Grid, Card, CardTitle, CardMeta, MetaLabel, MetaValue, FilterSection, FilterButton, SearchButton } from '../../components/ui';

const WantedContainer = styled.div`
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

const WantedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  z-index: 1;
`;

const WantedTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const WriteButton = styled.button`
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

const SearchSection = styled.div`
  background: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 30px;
`;

const SearchForm = styled.form`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 20px;
  border: 1px solid #ddd;
  border-radius: 25px;
  font-size: 1rem;
  outline: none;

  &:focus {
    border-color: #007bff;
  }
`;





const WantedHeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
`;

const WantedTitleText = styled.h3`
  font-size: 1.3rem;
  color: #333;
  margin-bottom: 8px;
  flex: 1;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.3rem;
`;



const CategoryRow = styled.div`
  margin-top: 0.7rem;
  padding-top: 0.7rem;
  border-top: 1px solid #f0f0f0;
  font-size: 0.98rem;
  color: #666;
  word-break: break-all;
`;

const WantedContent = styled.div`
  color: #555;
  line-height: 1.6;
  margin-bottom: 15px;
`;

const WantedTags = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Tag = styled.span`
  padding: 4px 12px;
  background: #e9ecef;
  color: #495057;
  border-radius: 15px;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const WantedFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f0f0f0;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #666;
`;

const ViewCount = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  color: #888;
  font-size: 0.9rem;
`;

const NoWanted = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const Wanted = () => {
  const [wantedPosts, setWantedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 임시 데이터
  const mockWantedPosts = [
    {
      id: 1,
      title: '자바의 정석 3판',
      author: '남궁성',
      condition: '상',
      price: 15000,
      category: '전공 > 공과대학 > 컴퓨터공학과',
    },
    {
      id: 2,
      title: '스프링 부트 입문',
      author: '최범균',
      condition: '중',
      price: 18000,
      category: '전공 > 공과대학 > 전자전기공학부',
    },
    {
      id: 3,
      title: '알고리즘 문제 해결 전략',
      author: '구종만',
      condition: '하',
      price: 20000,
      category: '전공 > 공과대학 > 컴퓨터공학과',
    }
  ];

  useEffect(() => {
    setWantedPosts(mockWantedPosts);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 실제로는 API 호출
    setTimeout(() => {
      const filtered = mockWantedPosts.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setWantedPosts(filtered);
      setLoading(false);
    }, 500);
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    // 실제로는 API 호출로 필터링
  };

  const handlePostClick = (postId) => {
    navigate(`/wanted/${postId}`);
  };

  const handleWriteClick = () => {
    navigate('/wanted/write');
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

  return (
    <PageWrapper>
      <SidebarMenu active="wanted" onMenuClick={handleSidebarMenu} />
      <MainContent>
        <WantedContainer>
          <WantedHeader>
            <WantedTitle>구해요 게시판</WantedTitle>
            <WriteButton onClick={handleWriteClick}>
              <FaPlus /> 글쓰기
            </WriteButton>
          </WantedHeader>

          <SearchSection>
            <SearchForm onSubmit={handleSearch}>
              <SearchInput
                type="text"
                placeholder="책의 제목이나 저자명을 검색해보세요."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <SearchButton type="submit">
                <FaSearch />
              </SearchButton>
            </SearchForm>
          </SearchSection>

          <FilterSection>
            <FilterButton 
              $active={activeFilter === 'all'} 
              onClick={() => handleFilter('all')}
            >
              전체
            </FilterButton>
            <FilterButton 
              $active={activeFilter === 'programming'} 
              onClick={() => handleFilter('programming')}
            >
              프로그래밍
            </FilterButton>
            <FilterButton 
              $active={activeFilter === 'algorithm'} 
              onClick={() => handleFilter('algorithm')}
            >
              알고리즘
            </FilterButton>
            <FilterButton 
              $active={activeFilter === 'math'} 
              onClick={() => handleFilter('math')}
            >
              수학
            </FilterButton>
            <FilterButton 
              $active={activeFilter === 'english'} 
              onClick={() => handleFilter('english')}
            >
              영어
            </FilterButton>
          </FilterSection>

          {loading ? (
            <NoWanted>검색 중...</NoWanted>
          ) : wantedPosts.length > 0 ? (
            <Grid>
              {wantedPosts.map(post => (
                <Card key={post.id}>
                  <CardTitle>{post.title}</CardTitle>
                  <CardMeta>
                        <MetaLabel>저자</MetaLabel>
                        <MetaValue>{post.author}</MetaValue>
                  </CardMeta>
                  <CardMeta>
                        <MetaLabel>상태</MetaLabel>
                        <MetaValue>{post.condition}</MetaValue>
                  </CardMeta>
                  <CardMeta>
                        <MetaLabel>희망 가격</MetaLabel>
                        <MetaValue>{post.price.toLocaleString()}원</MetaValue>
                  </CardMeta>
                  <CardMeta>
                    <MetaLabel>카테고리</MetaLabel>
                    <MetaValue>{post.category.split('>').pop().trim()}</MetaValue>
                  </CardMeta>
                </Card>
              ))}
            </Grid>
          ) : (
            <NoWanted>등록된 글이 없습니다.</NoWanted>
          )}
        </WantedContainer>
      </MainContent>
    </PageWrapper>
  );
};

export default Wanted; 