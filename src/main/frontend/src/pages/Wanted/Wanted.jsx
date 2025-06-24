import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch, FaUser, FaClock, FaBook, FaGraduationCap, FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WantedContainer = styled.div`
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

const WantedHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const WantedTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
`;

const WriteButton = styled.button`
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

const SearchButton = styled.button`
  padding: 12px 20px;
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
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: ${props => props.active ? '#0056b3' : '#f8f9fa'};
  }
`;

const WantedList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  width: 100%;
  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 8px;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const WantedCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
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

const MetaLabel = styled.span`
  font-weight: 600;
  color: #333;
  min-width: 80px;
`;

const MetaValue = styled.span`
  color: #444;
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

  return (
    <>
      <div className="header-spacer" />
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
              placeholder="원하는 책을 검색해보세요..."
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
            active={activeFilter === 'all'} 
            onClick={() => handleFilter('all')}
          >
            전체
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'programming'} 
            onClick={() => handleFilter('programming')}
          >
            프로그래밍
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'algorithm'} 
            onClick={() => handleFilter('algorithm')}
          >
            알고리즘
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'math'} 
            onClick={() => handleFilter('math')}
          >
            수학
          </FilterButton>
          <FilterButton 
            active={activeFilter === 'english'} 
            onClick={() => handleFilter('english')}
          >
            영어
          </FilterButton>
        </FilterSection>

        {loading ? (
          <NoWanted>검색 중...</NoWanted>
        ) : wantedPosts.length > 0 ? (
          <WantedList>
            {wantedPosts.map(post => (
              <WantedCard key={post.id}>
                <WantedHeaderRow>
                  <div style={{flex: 1}}>
                    <WantedTitleText>{post.title}</WantedTitleText>
                    <MetaRow>
                      <MetaLabel>저자</MetaLabel>
                      <MetaValue>{post.author}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>상태</MetaLabel>
                      <MetaValue>{post.condition}</MetaValue>
                    </MetaRow>
                    <MetaRow>
                      <MetaLabel>희망 가격</MetaLabel>
                      <MetaValue>{post.price.toLocaleString()}원</MetaValue>
                    </MetaRow>
                    <CategoryRow>
                      <MetaLabel>카테고리</MetaLabel> <MetaValue>{post.category.split('>').pop().trim()}</MetaValue>
                    </CategoryRow>
                  </div>
                </WantedHeaderRow>
              </WantedCard>
            ))}
          </WantedList>
        ) : (
          <NoWanted>등록된 글이 없습니다.</NoWanted>
        )}
      </WantedContainer>
    </>
  );
};

export default Wanted; 