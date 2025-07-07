import { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

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

  input {
    width: 100%;
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

const FilterButton = styled.button`
  padding: 1.25rem 2rem;
  background: var(--surface);
  border: 2px solid var(--border);
  border-radius: var(--radius-xl);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text);
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  box-shadow: var(--shadow-sm);
  min-width: 140px;
  justify-content: center;

  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }

  &:active {
    transform: translateY(0);
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
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  padding: 1.5rem;
  z-index: 10;
  min-width: 220px;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
`;

const FilterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
`;

const FilterRadioGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const FilterRadio = styled.label`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.95rem;
  cursor: pointer;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  font-size: 1rem;
  background: var(--surface);
  color: var(--text);
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
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: var(--shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border);

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, var(--primary), var(--secondary));
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-xl);
    border-color: var(--primary);

    &::before {
      transform: scaleX(1);
    }
  }

  &:hover .book-image {
    transform: scale(1.05);
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

const BookInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
`;

const BookTitle = styled.h3`
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
  background: linear-gradient(135deg, #ff6b6b, #ff8e8e);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.8rem;
  font-weight: 600;
  margin-left: 0.5rem;
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
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: ${shimmer} 1.5s infinite;
  border-radius: 12px;
  margin-bottom: 1rem;
`;

const SkeletonText = styled.div`
  height: 1rem;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
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

const SubMenuContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.6s ease-out 0.3s backwards;
  background: var(--surface);
  border-radius: var(--radius-xl);
  padding: 1.5rem;
  box-shadow: var(--shadow);
  border: 1px solid var(--border);

  @media (max-width: 768px) {
    gap: 0.75rem;
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }
`;

const SubMenuButton = styled.button`
  background: ${props => props.$active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent'};
  color: ${props => props.$active ? 'white' : 'var(--text)'};
  border: 2px solid ${props => props.$active ? 'transparent' : 'var(--border)'};
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: ${props => props.$active ? 'var(--shadow-lg)' : 'none'};
  min-width: 140px;
  text-align: center;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    ${props => !props.$active && `
      border-color: var(--primary);
      color: var(--primary);
      background: rgba(124, 58, 237, 0.05);
    `}
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
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

const SectionContainer = styled.div`
  background: #f8f9fa;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 1rem;
  background: linear-gradient(135deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

// 할인율에 따른 책 상태 반환 함수
// 현재는 할인율을 기준으로 책 상태를 자동 판단하고 있습니다:
// - 할인율 20% 이하: 상 (좋은 상태)
// - 할인율 21-40%: 중 (보통 상태)  
// - 할인율 41% 이상: 하 (낮은 상태)
// 
// TODO: 실제 구현 시에는 사용자가 직접 책 상태를 평가할 수 있도록 
// 별도의 상태 입력 필드를 제공해야 합니다.
const getBookCondition = (discountRate) => {
  if (discountRate <= 20) return { text: '상', color: '#28a745', bgColor: '#d4edda' };
  if (discountRate <= 40) return { text: '중', color: '#ffc107', bgColor: '#fff3cd' };
  return { text: '하', color: '#dc3545', bgColor: '#f8d7da' };
};

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

const MOCK_BOOKS = [
  {
    id: 1,
    title: '컴퓨터구조론',
    author: '홍길동',
    category: { major: '공과대학', sub: '컴퓨터공학' },
    price: 18000,
    status: 'available',
    image: '',
    views: 120,
    createdAt: '2024-06-25',
    likes: 5,
    discountRate: 8,
    location: '교내'
  },
  {
    id: 2,
    title: '전자회로',
    author: '이공학',
    category: { major: '공과대학', sub: '전자전기공학' },
    price: 15000,
    status: 'available',
    image: '',
    views: 80,
    createdAt: '2024-06-24',
    likes: 2,
    discountRate: 15,
    location: '교외'
  },
  {
    id: 3,
    title: '경영학원론',
    author: '김경영',
    category: { major: '경영대학', sub: '' },
    price: 12000,
    status: 'available',
    image: '',
    views: 60,
    createdAt: '2024-06-23',
    likes: 10,
    discountRate: 25,
    location: '교내'
  },
  {
    id: 4,
    title: '신소재공학개론',
    author: '박신소',
    category: { major: '공과대학', sub: '신소재공학' },
    price: 17000,
    status: 'available',
    image: '',
    views: 30,
    createdAt: '2024-06-22',
    likes: 1,
    discountRate: 40,
    location: '교외'
  },
  {
    id: 5,
    title: '화학공학실험',
    author: '최화학',
    category: { major: '공과대학', sub: '화학공학' },
    price: 20000,
    status: 'available',
    image: '',
    views: 50,
    createdAt: '2024-06-21',
    likes: 3,
    discountRate: 55,
    location: '교내'
  }
];

const Marketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedMainCategory, setSelectedMainCategory] = useState('전공');
  const [selectedSubCategory, setSelectedSubCategory] = useState('경영대학');
  const [selectedDetailCategory, setSelectedDetailCategory] = useState('경영학과');
  const [isLoading, setIsLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState(new Set());
  const [activeSubMenu, setActiveSubMenu] = useState('booksale');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState('전체');
  const filterRef = useRef();
  const [pendingMainCategory, setPendingMainCategory] = useState(selectedMainCategory);
  const [pendingSubCategory, setPendingSubCategory] = useState(selectedSubCategory);
  const [pendingDetailCategory, setPendingDetailCategory] = useState(selectedDetailCategory);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // 필터 팝업 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setFilterOpen(false);
      }
    };
    if (filterOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterOpen]);

  const toggleLike = (bookId) => {
    setLikedBooks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookId)) {
        newSet.delete(bookId);
      } else {
        newSet.add(bookId);
      }
      return newSet;
    });
  };

  const handleBookClick = (bookId) => {
    navigate(`/book/${bookId}`);
  };

  const handleSubMenuClick = (menu) => {
    setActiveSubMenu(menu);
    switch (menu) {
      case 'booksale':
        navigate('/bookstore/add');
        break;
      case 'wanted':
        navigate('/wanted');
        break;
      case 'mybookstore':
        navigate('/bookstore');
        break;
      case 'chat':
        navigate('/chat');
        break;
      default:
        break;
    }
  };

  const handlePendingMajorChange = (e) => {
    setPendingMainCategory(e.target.value);
    const firstSub = Object.keys(CATEGORIES[e.target.value])[0];
    setPendingSubCategory(firstSub);
    setPendingDetailCategory(CATEGORIES[e.target.value][firstSub][0]);
  };

  const handlePendingSubChange = (e) => {
    setPendingSubCategory(e.target.value);
    setPendingDetailCategory(CATEGORIES[pendingMainCategory][e.target.value][0]);
  };

  const handlePendingDetailChange = (e) => {
    setPendingDetailCategory(e.target.value);
  };

  const handleApplyCategory = () => {
    setSelectedMainCategory(pendingMainCategory);
    setSelectedSubCategory(pendingSubCategory);
    setSelectedDetailCategory(pendingDetailCategory);
  };

  const renderSkeletonCards = (count = 6) => (
    <LoadingGrid>
      {Array.from({ length: count }, (_, index) => (
        <SkeletonCard key={index}>
          <SkeletonImage />
          <SkeletonText />
          <SkeletonText />
          <SkeletonText />
        </SkeletonCard>
      ))}
    </LoadingGrid>
  );

  const renderBookCard = (book) => (
    <BookCard key={book.id} onClick={() => handleBookClick(book.id)}>
      <BookImage className="book-image">
        {book.title}
      </BookImage>
      <LikeButton
          $liked={likedBooks.has(book.id)}
          onClick={(e) => {
            e.stopPropagation();
            toggleLike(book.id);
          }}
      />
      <BookInfo>
        <BookTitle>{book.title}</BookTitle>
        <BookAuthor>{book.author}</BookAuthor>
        <BookPrice>
          <CurrentPrice>{book.price.toLocaleString()}원</CurrentPrice>
          {book.discountRate > 0 && (
            <>
              <OriginalPrice>{(book.price / (1 - book.discountRate / 100)).toLocaleString()}원</OriginalPrice>
              <DiscountBadge>{book.discountRate}% 할인</DiscountBadge>
            </>
          )}
        </BookPrice>
        <BookMeta>
          <Condition
              $bgColor={getBookCondition(book.discountRate).bgColor}
              $color={getBookCondition(book.discountRate).color}
          >
            {getBookCondition(book.discountRate).text}
          </Condition>
          <Location>{book.location}</Location>
        </BookMeta>
      </BookInfo>
    </BookCard>
  );

  // 필터링 및 정렬
  const filteredBooks = MOCK_BOOKS.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMain = selectedMainCategory === '전체' || book.category?.main === selectedMainCategory;
    const matchesSub = !selectedSubCategory || book.category?.sub === selectedSubCategory;
    const matchesDetail = !selectedDetailCategory || book.category?.detail === selectedDetailCategory;
    const matchesLocation = locationFilter === '전체' || book.location === locationFilter;
    return matchesSearch && matchesMain && matchesSub && matchesDetail && matchesLocation;
  });

  const sortedBooks = [...filteredBooks].sort((a, b) => {
    if (sortBy === 'createdAt') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === 'likes') {
      return b.likes - a.likes;
    } else if (sortBy === 'price') {
      return a.price - b.price;
    }
    return 0;
  });

  // 최근 등록된 책 리스트 (최신 5권)
  const recentBooks = [...MOCK_BOOKS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <MarketplaceContainer>
      <Header>
        <Title>책거래게시판</Title>
        <Description>
          홍익대학교 학생들과 함께하는 중고책 거래 플랫폼입니다.
          필요한 교재를 찾거나 사용하지 않는 책을 판매해보세요.
        </Description>
      </Header>

      <SubMenuContainer>
        <SubMenuButton
            $active={activeSubMenu === 'booksale'}
            onClick={() => handleSubMenuClick('booksale')}
        >
          책 판매 글쓰기
        </SubMenuButton>
        <SubMenuButton
            $active={activeSubMenu === 'wanted'}
            onClick={() => handleSubMenuClick('wanted')}
        >
          구하기 게시판
        </SubMenuButton>
        <SubMenuButton
            $active={activeSubMenu === 'mybookstore'}
            onClick={() => handleSubMenuClick('mybookstore')}
        >
          나의 책방
        </SubMenuButton>

        <SubMenuButton
            $active={activeSubMenu === 'chat'}
            onClick={() => handleSubMenuClick('chat')}
        >
          거래 채팅
        </SubMenuButton>
      </SubMenuContainer>

      <Controls>
        <SearchBar>
          <SearchIcon />
          <input
            type="text"
            placeholder="책 제목이나 저자를 검색해보세요"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchBar>
        <div style={{ position: 'relative' }}>
          <FilterButton onClick={() => setFilterOpen(v => !v)}>
            <FilterIcon />
            필터
          </FilterButton>
          {filterOpen && (
            <FilterPopover ref={filterRef}>
              <FilterSection>
                <FilterLabel>거래 지역</FilterLabel>
                <FilterRadioGroup>
                  <FilterRadio>
                    <input type="radio" name="location" value="전체" checked={locationFilter === '전체'} onChange={() => setLocationFilter('전체')} /> 전체
                  </FilterRadio>
                  <FilterRadio>
                    <input type="radio" name="location" value="교내" checked={locationFilter === '교내'} onChange={() => setLocationFilter('교내')} /> 교내
                  </FilterRadio>
                  <FilterRadio>
                    <input type="radio" name="location" value="교외" checked={locationFilter === '교외'} onChange={() => setLocationFilter('교외')} /> 교외
                  </FilterRadio>
                </FilterRadioGroup>
              </FilterSection>
              <FilterSection>
                <FilterLabel>정렬 기준</FilterLabel>
                <FilterSelect value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="createdAt">등록 순</option>
                  <option value="likes">인기 순</option>
                  <option value="price">낮은 가격 순</option>
                </FilterSelect>
              </FilterSection>
            </FilterPopover>
          )}
        </div>
      </Controls>

      <CategoryContainer>
        <CategorySelect value={pendingMainCategory} onChange={handlePendingMajorChange}>
          {Object.keys(CATEGORIES).map(mainCategory => (
            <option key={mainCategory} value={mainCategory}>{mainCategory}</option>
          ))}
        </CategorySelect>
        {pendingMainCategory && (
          <CategorySelect value={pendingSubCategory} onChange={handlePendingSubChange}>
            {Object.keys(CATEGORIES[pendingMainCategory]).map(subCategory => (
              <option key={subCategory} value={subCategory}>{subCategory}</option>
            ))}
          </CategorySelect>
        )}
        {pendingSubCategory && CATEGORIES[pendingMainCategory]?.[pendingSubCategory]?.length > 0 && (
          <CategorySelect value={pendingDetailCategory} onChange={handlePendingDetailChange}>
            {CATEGORIES[pendingMainCategory][pendingSubCategory].map(detailCategory => (
              <option key={detailCategory} value={detailCategory}>{detailCategory}</option>
            ))}
          </CategorySelect>
        )}
        <button style={{marginLeft: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}} onClick={handleApplyCategory}>적용</button>
      </CategoryContainer>

      {/* 최근 등록된 책 리스트 */}
      <SectionContainer>
        <SectionTitle>최근 등록된 책</SectionTitle>
        <BookGrid>
          {recentBooks.map(renderBookCard)}
        </BookGrid>
      </SectionContainer>

      {isLoading ? (
        renderSkeletonCards()
      ) : (
        <BookGrid>
          {sortedBooks.map(renderBookCard)}
        </BookGrid>
      )}
    </MarketplaceContainer>
  );
};

export default Marketplace; 