import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaSearch } from 'react-icons/fa';
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

/* 카드 전체를 클릭 영역으로 만들기 위한 래퍼 */
const ClickableCard = styled.div`
  cursor: pointer;
  outline: none;
  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(13, 110, 253, .4);
    border-radius: 12px;
  }
`;

const Wanted = () => {
  const [wantedPosts, setWantedPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 목록 불러오기
  useEffect(() => {
    async function fetchWanted() {
      try {
        const res = await fetch('/api/wanted'); // Vite 프록시 또는 절대 URL 사용
        const contentType = res.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');

        if (!res.ok) {
          const errTxt = isJson ? JSON.stringify(await res.json()).slice(0, 500) : (await res.text()).slice(0, 500);
          throw new Error(`구해요 목록 요청 실패(${res.status}) ${errTxt}`);
        }

        const payload = isJson ? await res.json() : null;

        // 서버 응답이 ApiResponse 형태일 수도 있고, Page 그대로일 수도 있어 둘 다 지원
        // 1) { success, data: { content: [...] } }
        // 2) { content: [...] }
        let list = [];
        if (payload?.data?.content) {
          list = payload.data.content;
        } else if (payload?.content) {
          list = payload.content;
        } else if (Array.isArray(payload)) {
          list = payload;
        }

        setWantedPosts(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('구해요 목록 불러오기 실패', e);
        setWantedPosts([]);
      }
    }
    fetchWanted();
  }, []);

  // 검색(클라이언트 임시 필터) — 실제 연동 시 서버 쿼리 파라미터로 교체
  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 실제 사용 시: /api/wanted?query=... 같은 식으로 백엔드와 합의
      const keyword = searchTerm.trim().toLowerCase();
      if (!keyword) {
        setLoading(false);
        return;
      }
      const filtered = wantedPosts.filter(p =>
          (p.title || '').toLowerCase().includes(keyword) ||
          (p.author || '').toLowerCase().includes(keyword) ||
          (p.category || '').toLowerCase().includes(keyword)
      );
      setWantedPosts(filtered);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (filter) => {
    setActiveFilter(filter);
    // TODO: 실제로는 API 호출 (예: /api/wanted?tag=programming)
  };

  const handlePostClick = (postId) => {
    if (!postId) return;
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
                  {wantedPosts.map((post) => {
                    const priceNum = Number(post?.price ?? 0);
                    const priceText = Number.isFinite(priceNum) ? `${priceNum.toLocaleString()}원` : '-';
                    const categoryLast = (post?.category || '').split('>').pop()?.trim() || '';

                    return (
                        <ClickableCard
                            key={post.id}
                            role="button"
                            tabIndex={0}
                            onClick={() => handlePostClick(post.id)}
                            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handlePostClick(post.id)}
                        >
                          <Card>
                            <CardTitle>{post.title || '-'}</CardTitle>

                            <CardMeta>
                              <MetaLabel>저자</MetaLabel>
                              <MetaValue>{post.author || '-'}</MetaValue>
                            </CardMeta>

                            <CardMeta>
                              <MetaLabel>상태</MetaLabel>
                              <MetaValue>{post.condition || '-'}</MetaValue>
                            </CardMeta>

                            <CardMeta>
                              <MetaLabel>희망 가격</MetaLabel>
                              <MetaValue>{priceText}</MetaValue>
                            </CardMeta>

                            <CardMeta>
                              <MetaLabel>카테고리</MetaLabel>
                              <MetaValue>{categoryLast}</MetaValue>
                            </CardMeta>
                          </Card>
                        </ClickableCard>
                    );
                  })}
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
