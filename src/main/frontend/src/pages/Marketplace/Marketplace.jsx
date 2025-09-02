import React, { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import { SearchButton as OriginalSearchButton, FilterButton as OriginalFilterButton } from '../../components/ui';
import axios from 'axios';

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const MarketplaceContainer = styled.div`
  padding: 8rem 2rem 4rem;
  max-width: 1440px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  padding-top: 96px;
  @media (max-width: 900px) {
    padding-top: 72px;
  }
  @media (max-width: 600px) {
    padding-top: 56px;
    padding-left: 0.5rem;
    padding-right: 0.5rem;
  }
`;

const Header = styled.div`
  margin-bottom: 3rem;
  text-align: center;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Title = styled.h1`
  font-size: 3rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  position: relative;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const Description = styled.p`
  font-size: 1.25rem;
  color: var(--text-light);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.7;
  padding-bottom: 0.3em;
  word-break: keep-all;
`;

const Controls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.6s ease-out 0.2s backwards;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const SearchBar = styled.div`
  flex: 1;
  max-width: 500px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  input {
    flex: 1;
    padding: 1.25rem 1.5rem;
    padding-left: 4rem;
    border: 2px solid var(--border);
    border-radius: var(--radius-xl);
    font-size: 1.1rem;
    transition: var(--transition);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    color: var(--text);

    &::placeholder {
      color: var(--text-light);
      font-weight: 400;
    }

    &:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
      transform: translateY(-1px);
    }

    &:hover {
      border-color: var(--primary);
      box-shadow: var(--shadow);
    }
  }
`;

const SearchButton = styled(OriginalSearchButton)``;
const FilterButton = styled(OriginalFilterButton)``;

const SearchIcon = styled.div`
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: var(--shadow-sm);

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border: 2px solid white;
    border-radius: 50%;
    position: relative;
  }

  &::after {
    content: '';
    width: 2px;
    height: 6px;
    background: white;
    position: absolute;
    bottom: 6px;
    right: 6px;
    transform: rotate(45deg);
  }
`;

const FilterIcon = styled.div`
  width: 20px;
  height: 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: currentColor;
    border-radius: 2px;
    box-shadow: 0 6px 0 currentColor, 0 12px 0 currentColor;
  }
`;

const FilterPopover = styled.div`
  position: absolute;
  top: 110%;
  right: 0;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 1rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 1.5rem;
  z-index: 10;
  min-width: 240px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${fadeIn} 0.3s ease-out;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: #1F2937;
  margin-bottom: 0.5rem;
`;

const FilterSelect = styled.select`
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  border: 1.5px solid #E5E7EB;
  font-size: 0.95rem;
  font-weight: 500;
  background: white;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;

  &:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:hover {
    border-color: #D1D5DB;
  }
`;

const PriceInputGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PriceInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #E5E7EB;
  border-radius: 0.75rem;
  font-size: 0.95rem;
  text-align: right;
  -moz-appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;

const FilterApplyButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
`;

const CategoryContainer = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    gap: 0.75rem;
    width: 100%;
    justify-content: flex-start;
  }
`;

const CategorySelect = styled.select`
  padding: 0.75rem 1rem;
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
  min-width: 150px;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
  }

  &:hover {
    border-color: var(--primary);
  }

  @media (max-width: 768px) {
    min-width: 120px;
    font-size: 0.9rem;
  }
`;

const BookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;
  animation: ${fadeIn} 0.6s ease-out 0.4s backwards;

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const BookCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-color: var(--primary);
  }
`;

const BookImage = styled.div`
  width: 100%;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.2rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s ease;
  box-shadow: var(--shadow-sm);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 12px;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: transform 0.6s ease;
  }

  &:hover::after {
    transform: translateX(100%);
  }
`;

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const BookCardTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const BookSeller = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
  font-weight: 500;
`;

const BookAuthor = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-light);
  font-weight: 500;
`;

const BookPrice = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  flex-wrap: wrap;
`;

const LikeCount = styled.span`
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.9rem;
  color: var(--text-light);
  &::before { content: '❤'; color: #ff4757; }
`;

const SkeletonCard = styled.div`
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

const SkeletonImage = styled.div`
  width: 100%;
  height: 200px;
  background: rgba(240, 240, 240, 0.8);
  animation: ${shimmer} 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const SkeletonText = styled.div`
  height: 1rem;
  background: rgba(240, 240, 240, 0.8);
  animation: ${shimmer} 1.5s infinite;
  border-radius: var(--radius-sm);
  margin-bottom: 0.5rem;

  &:nth-child(2) {
    width: 70%;
  }

  &:nth-child(3) {
    width: 50%;
  }
`;

const CurrentPrice = styled.span`
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--primary);
`;

const OriginalPrice = styled.span`
  font-size: 0.9rem;
  color: var(--text-light);
  text-decoration: line-through;
`;

const DiscountBadge = styled.span`
  background: #ff6b6b;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
`;

const LikeButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: ${props => props.$liked ? '#ff4757' : '#666'};
  box-shadow: var(--shadow);
  z-index: 2;

  &:hover {
    background: white;
    transform: scale(1.1);
    box-shadow: var(--shadow-lg);
  }

  &::before {
    content: ${props => props.$liked ? '"❤️"' : '"🤍"'};
    font-size: 1.2rem;
  }
`;

const BookMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
`;

const Condition = styled.span`
  background: ${props => props.$bgColor};
  color: ${props => props.$color};
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  border: 1px solid ${props => props.$color}20;
`;

const Location = styled.span`
  color: var(--text-light);
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;

  &::before {
    content: '📍';
  }
`;

const LoadingGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  width: 100%;

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--text-light);
  font-size: 1.1rem;
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 2px dashed var(--border);
  margin: 2rem 0;

  .icon {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: var(--text-light);
  }

  .title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--text);
  }

  .description {
    color: var(--text-light);
    line-height: 1.6;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 3rem;
  gap: 0.5rem;
`;

const PageButton = styled.button`
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: ${props => props.$active ? 'var(--primary)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--text)'};
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: ${props => props.$active ? '600' : '400'};
  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const SectionContainer = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
`;

const PopularSectionTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
`;

// ✅ 상태 딱지
const StatusBadge = styled.div`
  position: absolute;
  right: 1rem;
  top: 3.5rem;        /* 하트 버튼(40px) 아래로 살짝 내려 배치 */
  z-index: 1;
  pointer-events: none;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: -0.2px;
  ${({ $variant }) => $variant === 'reserved' ? `
    background: #ffe066;
    color: #614b00;
    border: 1px solid #ffd43b;
  ` : `
    background: #bbf7d0;
    color: #166534;
    border: 1px solid #86efac;
  `}
`;

// 할인율에 따른 책 상태 반환 (UI용 예시)
const getBookCondition = (discountRate) => {
  if (discountRate <= 20) return { text: '상', color: '#28a745', bgColor: '#d4edda' };
  if (discountRate <= 40) return { text: '중', color: '#ffc107', bgColor: '#fff3cd' };
  return { text: '하', color: '#dc3545', bgColor: '#f8d7da' };
};

// 에러 메시지 컴포넌트
const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #dc3545;
  background: #fff5f5;
  border: 1px solid #fed7d7;
  border-radius: 1rem;
  margin: 2rem 0;
  font-size: 1rem;
  line-height: 1.5;
`;

// 로딩 메시지 컴포넌트
const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-light);
  font-size: 1.1rem;
`;

const CATEGORIES = {
  '전공': {
    '경영대학': ['경영학부'],
    '공과대학': ['전자전기공학부', '신소재공학전공', '화학공학전공', '컴퓨터공학과', '산업데이터공학과', '기계시스템디자인공학과', '건설환경공학과'],
    '법과대학': ['법학부'],
    '미술대학': ['동양학과', '회화과', '판화과', '조소과', '시각디자인전공', '산업디자인전공', '금속조형디자인과', '도예유리과', '목조형가구학과', '섬유미술패션디자인과', '예술학과'],
    '디자인,예술경영학부': ['디자인경영전공', '예술경영전공'],
    '공연예술학부': ['뮤지컬전공', '실용음악전공'],
    '경제학부': ['경제학전공'],
    '사범대학': ['수학교육과', '국어교육과', '영어교육과', '역사교육과', '교육학과'],
    '문과대학': ['영어영문학과', '독어독문학과', '불어불문학과', '국어국문학과'],
    '건축도시대학': ['건축학전공', '실내건축학전공', '도시공학과']
  },
  '교양': {
    'ABEEK 교양': ['ABEEK 교양'],
    '인문계열': ['인문계열'],
    '영어계열': ['영어계열'],
    '사회계열': ['사회계열'],
    '제2외국어계열': ['제2외국어계열'],
    '자연계열': ['자연계열'],
    '예체능계열': ['예체능계열'],
    '교직': ['교직']
  }
};

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ViewMoreButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  position: relative;
  overflow: hidden;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(124, 58, 237, 0.3);
  }

  &:active {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(124, 58, 237, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  &:hover::before {
    left: 100%;
  }
`;

const PopularBooksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;

  @media (max-width: 900px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 1.5rem;
  }
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const SearchResultsSection = styled.div`
  margin-top: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
`;

const SearchResultsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--border);
`;

const SearchResultsTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;

  .search-term {
    color: var(--primary);
    font-weight: 800;
  }

  .result-count {
    color: var(--text-light);
    font-weight: 400;
    font-size: 1rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    transform: translateY(-1px);
  }

  .icon {
    font-size: 1.1rem;
  }
`;

// 인증 토큰 헬퍼
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 이미지 Fallback
const BookImageWithFallback = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);
  useEffect(() => { if (src) setHasError(false); }, [src]);
  return (
      <BookImage className="book-image">
        {src && !hasError ? (
            <img src={src} alt={alt} onError={() => setHasError(true)} />
        ) : (
            <div style={{ color: 'white', textAlign: 'center' }}>📚<br/>이미지 없음</div>
        )}
      </BookImage>
  );
};

/* ✅ 여러 API 케이스를 흡수하는 상태 정규화 */
const normalizePostStatus = (post) => {
  const raw =
      (post.status ??
          post.tradeStatus ??
          post.saleStatus ??
          post.postStatus ??
          post.state ??
          '').toString().toLowerCase();

  // boolean/flag 우선 반영
  if (post.isCompleted === true) return 'sold_out';
  if (post.isReserved === true) return 'reserved';

  if (!raw) return null;
  if (['sold_out','soldout','completed','complete','done','ended','closed','sold-out'].includes(raw)) return 'sold_out';
  if (['reserved','reservation','booked','holding','hold','on_hold'].includes(raw)) return 'reserved';
  return null;
};

const Marketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // API 데이터 상태
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [likedPostIds, setLikedPostIds] = useState(new Set());
  const [error, setError] = useState('');

  // 검색어 입력 상태
  const [searchQuery, setSearchQuery] = useState('');

  // 검색 및 필터 상태
  const [searchParams, setSearchParams] = useState({
    query: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: 'createdAt,desc',
  });

  // 임시 필터
  const [tempFilters, setTempFilters] = useState({ minPrice: '', maxPrice: '' });
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef();
  const observerRef = useRef();

  const fetchMyLikes = useCallback(async () => {
    if (!localStorage.getItem('accessToken')) return;
    try {
      const response = await axios.get('/api/my/likes', { headers: getAuthHeader() });
      const likedIds = new Set(response.data.map(post => post.postId));
      setLikedPostIds(likedIds);
    } catch (error) {
      console.error("찜 목록을 불러오는 데 실패했습니다.", error);
    }
  }, []);

  const fetchPosts = useCallback(async (params, pageToFetch = 0) => {
    setIsLoading(true);
    if (pageToFetch === 0) setError('');
    try {
      const activeParams = {
        page: pageToFetch,
        size: 12,
        sort: params.sort,
      };
      if (params.query) activeParams.query = params.query;
      if (params.category) activeParams.category = params.category;
      if (params.minPrice) activeParams.minPrice = params.minPrice;
      if (params.maxPrice) activeParams.maxPrice = params.maxPrice;

      const response = await axios.get('/api/posts', {
        params: activeParams,
        timeout: 10000
      });

      setPosts(prev => pageToFetch === 0 ? response.data.content : [...prev, ...response.data.content]);
      setHasMore(!response.data.last);
      setPage(pageToFetch + 1);
    } catch (error) {
      console.error("게시글 목록을 불러오는 데 실패했습니다.", error);
      if (error.code === 'ECONNABORTED') {
        setError('요청 시간이 초과되었어요. 네트워크 상태를 확인해주세요 📡');
      } else if (error.response?.status === 404) {
        setError('해당 페이지를 찾을 수 없어요 🤔');
      } else if (error.response?.status >= 500) {
        setError('서버에 문제가 발생했어요. 잠시 후 다시 시도해주세요 🛠️');
      } else {
        setError('게시글을 불러오는 중 오류가 발생했어요. 잠시 후 다시 시도해주세요 😅');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    setPosts([]);
    setPage(0);
    setHasMore(true);
    fetchPosts(searchParams, 0);
  }, [searchParams, fetchPosts]);

  useEffect(() => {
    fetchMyLikes();
  }, [fetchMyLikes]);

  useEffect(() => {
    const currentObserverRef = observerRef.current;
    const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoading) {
            fetchPosts(searchParams, page);
          }
        },
        { threshold: 0.5 }
    );
    if (currentObserverRef) observer.observe(currentObserverRef);
    return () => {
      if (currentObserverRef) observer.unobserve(currentObserverRef);
    };
  }, [hasMore, isLoading, fetchPosts, searchParams, page]);

  const handleLikeToggle = async (e, postId) => {
    e.stopPropagation();
    if (!localStorage.getItem('accessToken')) {
      alert("로그인이 필요한 기능이에요! 😊");
      navigate('/login');
      return;
    }

    const isLiked = likedPostIds.has(postId);
    setLikedPostIds(prev => {
      const newSet = new Set(prev);
      if (isLiked) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
    setPosts(prev => prev.map(p => {
      if (p.postId !== postId) return p;
      const current = p.likeCount ?? 0;
      const next = isLiked ? Math.max(0, current - 1) : current + 1;
      return { ...p, likeCount: next };
    }));
    if (searchParams.sort === 'likeCount,desc') {
      setPosts(prev => {
        const next = [...prev];
        next.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
        return next;
      });
    }

    try {
      if (isLiked) {
        await axios.delete(`/api/posts/${postId}/like`, {
          headers: getAuthHeader(),
          timeout: 5000
        });
      } else {
        await axios.post(`/api/posts/${postId}/like`, null, {
          headers: getAuthHeader(),
          timeout: 5000
        });
      }
    } catch (error) {
      console.error("찜 처리 실패:", error);
      setLikedPostIds(prev => {
        const newSet = new Set(prev);
        if (isLiked) newSet.add(postId);
        else newSet.delete(postId);
        return newSet;
      });
      setPosts(prev => prev.map(p => {
        if (p.postId !== postId) return p;
        const current = p.likeCount ?? 0;
        const next = isLiked ? current + 1 : Math.max(0, current - 1);
        return { ...p, likeCount: next };
      }));
      if (searchParams.sort === 'likeCount,desc') {
        setPosts(prev => {
          const next = [...prev];
          next.sort((a, b) => (b.likeCount ?? 0) - (a.likeCount ?? 0));
          return next;
        });
      }
      alert("찜하기 처리 중 오류가 발생했어요. 다시 시도해주세요! 😅");
    }
  };

  const handleBookClick = (postId) => navigate(`/posts/${postId}`);
  const handleSearch = (e) => { e.preventDefault(); setSearchParams(prev => ({ ...prev, query: searchQuery })); };
  const handleSearchInputChange = (e) => setSearchQuery(e.target.value);
  const handleSortChange = (e) => setSearchParams(prev => ({...prev, sort: e.target.value}));
  const handleCategoryChange = (e) => setSearchParams(prev => ({...prev, category: e.target.value}));
  const handleApplyFilters = () => {
    setSearchParams(prev => ({ ...prev, minPrice: tempFilters.minPrice, maxPrice: tempFilters.maxPrice }));
    setFilterOpen(false);
  };

  const renderSkeletonCards = (count = 4) => (
      <LoadingGrid>
        {Array.from({ length: count }, (_, index) => (
            <SkeletonCard key={`skeleton-${index}`}>
              <SkeletonImage />
              <SkeletonText />
              <SkeletonText />
              <SkeletonText />
            </SkeletonCard>
        ))}
      </LoadingGrid>
  );

  const renderCategoryOptions = () => {
    const options = [];
    Object.keys(CATEGORIES).forEach(majorCategory => {
      Object.keys(CATEGORIES[majorCategory]).forEach(college => {
        CATEGORIES[majorCategory][college].forEach(department => {
          options.push(
              <option key={`${majorCategory}-${college}-${department}`} value={department}>
                {majorCategory} &gt; {college} &gt; {department}
              </option>
          );
        });
      });
    });
    return options;
  };

  // ✅ 상태 딱지 포함 카드 렌더링
  const renderBookCard = (post) => {
    const normStatus = normalizePostStatus(post); // 'reserved' | 'sold_out' | null
    const badgeText = normStatus === 'reserved' ? '예약중' : normStatus === 'sold_out' ? '거래완료' : null;

    return (
        <BookCard key={post.postId} onClick={() => handleBookClick(post.postId)}>
          <BookImageWithFallback src={post.thumbnailUrl} alt={post.postTitle} />

          {/* 하트 버튼 */}
          <LikeButton
              $liked={likedPostIds.has(post.postId)}
              onClick={(e) => handleLikeToggle(e, post.postId)}
          />

          {/* ✅ 상태 배지 (오른쪽 위, 하트 아래) */}
          {badgeText && (
              <StatusBadge $variant={normStatus}>
                {badgeText}
              </StatusBadge>
          )}

          <BookInfo>
            <BookCardTitle>
              {post.postTitle}
              {post.hasToxicContent && (
                <span style={{
                  marginLeft: 6,
                  display: 'inline-block',
                  padding: '2px 6px',
                  borderRadius: 6,
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  background: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeeba'
                }}>주의</span>
              )}
            </BookCardTitle>
            {post.author && <BookAuthor>{post.author}</BookAuthor>}
            <BookPrice>
              {post.price?.toLocaleString() || '0'}원
              <LikeCount>{(post.likeCount ?? 0).toLocaleString()}</LikeCount>
            </BookPrice>
          </BookInfo>
        </BookCard>
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [filterOpen]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchParams(prev => ({ ...prev, query: searchQuery }));
    }
  };

  return (
      <MarketplaceContainer>
        <Header>
          <Title>책거래게시판</Title>
          <Description>선배들의 지식을 저렴하게 얻어보세요! 📚</Description>
        </Header>
        <PageWrapper>
          <SidebarMenu active={'bookstore/add'} onMenuClick={(menu) => navigate(`/${menu}`)} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <Controls>
              <SearchBar as="form" onSubmit={handleSearch}>
                <SearchIcon />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyDown={handleSearchKeyPress}
                    placeholder="책 제목, 저자, 글 제목으로 검색"
                />
                <SearchButton type="submit">검색</SearchButton>
              </SearchBar>
              <div style={{ position: 'relative' }} ref={filterRef}>
                <FilterButton onClick={() => setFilterOpen(v => !v)}>
                  <FilterIcon />
                  필터 및 정렬
                </FilterButton>
                {filterOpen && (
                    <FilterPopover>
                      <FilterSection>
                        <FilterLabel>정렬 기준</FilterLabel>
                        <FilterSelect value={searchParams.sort} onChange={handleSortChange}>
                          <option value="createdAt,desc">최신순</option>
                          <option value="price,asc">낮은 가격순</option>
                          <option value="price,desc">높은 가격순</option>
                          <option value="views,desc">조회순</option>
                          <option value="likeCount,desc">많이 찜한 순</option>
                        </FilterSelect>
                      </FilterSection>
                      <FilterSection>
                        <FilterLabel>가격 범위</FilterLabel>
                        <PriceInputGroup>
                          <PriceInput
                              type="number"
                              placeholder="최소 금액"
                              value={tempFilters.minPrice}
                              onChange={e => setTempFilters(p => ({...p, minPrice: e.target.value}))}
                          />
                          <span>~</span>
                          <PriceInput
                              type="number"
                              placeholder="최대 금액"
                              value={tempFilters.maxPrice}
                              onChange={e => setTempFilters(p => ({...p, maxPrice: e.target.value}))}
                          />
                        </PriceInputGroup>
                      </FilterSection>
                      <FilterApplyButton onClick={handleApplyFilters}>적용하기</FilterApplyButton>
                    </FilterPopover>
                )}
              </div>
            </Controls>

            <CategoryContainer>
              <CategorySelect onChange={handleCategoryChange} value={searchParams.category}>
                <option value="">전체 카테고리</option>
                {renderCategoryOptions()}
              </CategorySelect>
            </CategoryContainer>

            {error && (
                <ErrorMessage>
                  <div>{error}</div>
                  <button
                      onClick={() => {
                        setError('');
                        fetchPosts(searchParams, 0);
                      }}
                      style={{
                        marginTop: '1rem',
                        padding: '0.5rem 1rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer'
                      }}
                  >
                    다시 시도하기
                  </button>
                </ErrorMessage>
            )}

            {posts.length > 0 && <BookGrid>{posts.map(renderBookCard)}</BookGrid>}

            {isLoading && posts.length === 0 && (
                <LoadingMessage>
                  <div>📖 책들을 찾고 있어요...</div>
                </LoadingMessage>
            )}

            {!isLoading && posts.length === 0 && !error && (
                <NoResultsMessage>
                  <div className="icon">🔍</div>
                  <div className="title">검색 결과가 없어요</div>
                  <div className="description">
                    다른 키워드로 검색하거나 필터를 변경해보세요.<br/>
                    혹시 새로운 책을 등록해보는 건 어떨까요? 😊
                  </div>
                </NoResultsMessage>
            )}

            {isLoading && posts.length > 0 && (
                <>
                  {renderSkeletonCards(4)}
                  <LoadingMessage>
                    <div>📚 더 많은 책들을 불러오고 있어요...</div>
                  </LoadingMessage>
                </>
            )}

            <div
                ref={observerRef}
                style={{
                  height: '50px',
                  display: hasMore ? 'block' : 'none'
                }}
            />

            {!hasMore && posts.length > 0 && (
                <div style={{
                  textAlign: 'center',
                  padding: '2rem',
                  color: 'var(--text-light)',
                  borderTop: '1px solid var(--border)',
                  marginTop: '2rem'
                }}>
                  🎉 모든 책을 다 보셨네요! 새로운 책들이 올라오면 알려드릴게요.
                </div>
            )}
          </div>
        </PageWrapper>
      </MarketplaceContainer>
  );
};

export default Marketplace;
