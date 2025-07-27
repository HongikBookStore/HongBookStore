import { useState, useEffect, useRef, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SidebarMenu from '../../components/SidebarMenu/SidebarMenu';
import { SearchButton, FilterButton } from '../../components/ui';
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



const SortButton = styled.button`
  padding: 8px 16px;
  background: ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-secondary)'};
  border: 1px solid ${props => props.active ? 'var(--primary)' : 'var(--border-medium)'};
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
  margin-right: 8px;

  &:hover {
    background: ${props => props.active ? 'var(--primary-dark)' : 'var(--gray-50)'};
    border-color: var(--primary);
    color: ${props => props.active ? 'white' : 'var(--primary)'};
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

const FilterRadioGroup = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: row;
  align-items: center;
`;

const FilterRadio = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:hover {
    background: #F9FAFB;
  }

  input[type="radio"] {
    width: 1.2rem;
    height: 1.2rem;
    accent-color: var(--primary);
    cursor: pointer;
  }
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
  background: #ff6b6b;
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

// 인기 도서 데이터 (좋아요 수와 조회수를 기준으로 인기 도서 생성)
const POPULAR_BOOKS = [
  {
    id: 101,
    title: '컴퓨터구조론',
    author: '홍길동',
    category: { major: '공과대학', sub: '컴퓨터공학' },
    price: 15000,
    status: 'available',
    image: '',
    views: 250,
    createdAt: '2024-06-20',
    likes: 15,
    discountRate: 10,
    location: '교내'
  },
  {
    id: 102,
    title: '전자회로',
    author: '이공학',
    category: { major: '공과대학', sub: '전자전기공학' },
    price: 18000,
    status: 'available',
    image: '',
    views: 200,
    createdAt: '2024-06-19',
    likes: 12,
    discountRate: 15,
    location: '교외'
  },
  {
    id: 103,
    title: '경영학원론',
    author: '김경영',
    category: { major: '경영대학', sub: '' },
    price: 12000,
    status: 'available',
    image: '',
    views: 180,
    createdAt: '2024-06-18',
    likes: 10,
    discountRate: 20,
    location: '교내'
  },
  {
    id: 104,
    title: '미적분학',
    author: '박수학',
    category: { major: '사범대학', sub: '수학교육과' },
    price: 14000,
    status: 'available',
    image: '',
    views: 160,
    createdAt: '2024-06-17',
    likes: 8,
    discountRate: 12,
    location: '교내'
  },
  {
    id: 105,
    title: '영어회화',
    author: '최영어',
    category: { major: '문과대학', sub: '영어영문학과' },
    price: 10000,
    status: 'available',
    image: '',
    views: 140,
    createdAt: '2024-06-16',
    likes: 7,
    discountRate: 25,
    location: '교외'
  },
  {
    id: 106,
    title: '디자인사',
    author: '정디자인',
    category: { major: '미술대학', sub: '시각디자인전공' },
    price: 16000,
    status: 'available',
    image: '',
    views: 120,
    createdAt: '2024-06-15',
    likes: 6,
    discountRate: 18,
    location: '교내'
  },
  {
    id: 107,
    title: '건축학개론',
    author: '한건축',
    category: { major: '건축도시대학', sub: '건축학전공' },
    price: 20000,
    status: 'available',
    image: '',
    views: 110,
    createdAt: '2024-06-14',
    likes: 5,
    discountRate: 8,
    location: '교내'
  },
  {
    id: 108,
    title: '화학공학실험',
    author: '최화학',
    category: { major: '공과대학', sub: '화학공학' },
    price: 18000,
    status: 'available',
    image: '',
    views: 100,
    createdAt: '2024-06-13',
    likes: 4,
    discountRate: 15,
    location: '교외'
  }
];

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

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const Marketplace = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState(''); // 실제 검색어 입력용
  const [sortBy, setSortBy] = useState('createdAt');
  const [selectedMainCategory, setSelectedMainCategory] = useState('전체');
  const [selectedSubCategory, setSelectedSubCategory] = useState('전체');
  const [selectedDetailCategory, setSelectedDetailCategory] = useState('전체');
  const [isLoading, setIsLoading] = useState(true);
  const [likedBooks, setLikedBooks] = useState(new Set());
  const [activeSubMenu, setActiveSubMenu] = useState('booksale');
  const [filterOpen, setFilterOpen] = useState(false);
  const [locationFilter, setLocationFilter] = useState('전체');
  const [showAllPopularBooks, setShowAllPopularBooks] = useState(false);
  const [showAllRecentBooks, setShowAllRecentBooks] = useState(false);
  const filterRef = useRef();
  const [pendingMainCategory, setPendingMainCategory] = useState('전체');
  const [pendingSubCategory, setPendingSubCategory] = useState('전체');
  const [pendingDetailCategory, setPendingDetailCategory] = useState('전체');

  // API 데이터를 저장할 상태
  const [posts, setPosts] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 검색 및 필터 상태
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('createdAt,desc'); // 백엔드 API와 정렬값 맞추기

  // API 호출 로직
  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        page: 0, // TODO: 페이지네이션 UI 구현 시 현재 페이지 상태와 연결
        size: 12, // 한 번에 12개씩
        sort: sortBy,
        // TODO: 백엔드에 검색 기능 추가 후, 검색어 파라미터도 추가
        // query: searchInput, 
      };
      const response = await axios.get('/api/posts', { params });
      setPosts(response.data.content);
      setPageInfo({
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
        currentPage: response.data.number,
      });
    } catch (error) {
      console.error("게시글 목록을 불러오는 데 실패했습니다.", error);
    } finally {
      setIsLoading(false);
    }
  }, [sortBy]); // 정렬 기준이 바뀔 때마다 API를 다시 호출

  // 컴포넌트가 처음 마운트되거나, 정렬 기준이 바뀔 때 API 호출
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleBookClick = (postId) => {
    navigate(`/posts/${postId}`);
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
    const selectedValue = e.target.value;
    setPendingMainCategory(selectedValue);
    
    if (selectedValue === '전체') {
      setPendingSubCategory('');
      setPendingDetailCategory('');
    } else {
      const firstSub = Object.keys(CATEGORIES[selectedValue])[0];
      setPendingSubCategory(firstSub);
      setPendingDetailCategory(CATEGORIES[selectedValue][firstSub][0]);
    }
  };

  const handlePendingSubChange = (e) => {
    const selectedValue = e.target.value;
    setPendingSubCategory(selectedValue);
    
    if (selectedValue === '') {
      setPendingDetailCategory('');
    } else {
      setPendingDetailCategory(CATEGORIES[pendingMainCategory][selectedValue][0]);
    }
  };

  const handlePendingDetailChange = (e) => {
    setPendingDetailCategory(e.target.value);
  };

  const handleApplyCategory = () => {
    setSelectedMainCategory(pendingMainCategory);
    setSelectedSubCategory(pendingSubCategory);
    setSelectedDetailCategory(pendingDetailCategory);
  };

  const handleSearch = () => {
    // TODO: 백엔드에 검색 기능이 추가되면, 여기서 fetchPosts를 다시 호출
    setSearchQuery(searchInput);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // 로딩 상태일 때 스켈레톤 UI를 보여주는 함수
  const renderSkeletonCards = (count = 8) => (
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

  // 실제 데이터를 받아와서 책 카드를 그리는 함수
  const renderBookCard = (post) => (
    <BookCard key={post.postId} onClick={() => handleBookClick(post.postId)}>
      <BookImage className="book-image">
        <img src={post.thumbnailUrl} alt={post.postTitle} />
      </BookImage>
      {/* <LikeButton /> */}
      <BookInfo>
        <BookCardTitle>{post.postTitle}</BookCardTitle>
        <BookSeller>{post.sellerNickname}</BookSeller>
        <BookPrice>
          {post.price.toLocaleString()}원
        </BookPrice>
        {/* TODO: 상세 DTO가 아니므로, 할인율, 책 상태 등은 표시할 수 없어. 필요하다면 목록 DTO에 추가해야 해. */}
      </BookInfo>
    </BookCard>
  );

  // 검색 필터링 함수
  const filterBooksBySearch = (books, query) => {
    if (!query.trim()) return books;
    
    const searchTerms = query.toLowerCase().trim().split(' ').filter(term => term.length > 0);
    
    return books.filter(book => {
      const title = book.title.toLowerCase();
      const author = book.author.toLowerCase();
      
      // 모든 검색어가 제목이나 저자에 포함되어야 함
      return searchTerms.every(term => 
        title.includes(term) || author.includes(term)
      );
    });
  };

  // 필터링 및 정렬
  const searchFilteredBooks = filterBooksBySearch(MOCK_BOOKS, searchQuery);
  const filteredBooks = searchFilteredBooks.filter(book => {
    const matchesMain = selectedMainCategory === '전체' || book.category?.main === selectedMainCategory;
    const matchesSub = selectedSubCategory && selectedSubCategory !== '' ? book.category?.sub === selectedSubCategory : true;
    const matchesDetail = selectedDetailCategory && selectedDetailCategory !== '' ? book.category?.detail === selectedDetailCategory : true;
    const matchesLocation = locationFilter === '전체' || book.location === locationFilter;
    return matchesMain && matchesSub && matchesDetail && matchesLocation;
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

  // 학과 필터링 함수
  const filterBooksByCategory = (books) => {
    if (selectedMainCategory === '전체') {
      return books;
    }
    
    return books.filter(book => {
      const matchesMain = book.category?.main === selectedMainCategory;
      const matchesSub = selectedSubCategory && selectedSubCategory !== '' ? book.category?.sub === selectedSubCategory : true;
      const matchesDetail = selectedDetailCategory && selectedDetailCategory !== '' ? book.category?.detail === selectedDetailCategory : true;
      return matchesMain && matchesSub && matchesDetail;
    });
  };

  // 최근 등록된 책 리스트 (학과 필터 적용)
  const recentBooks = [...MOCK_BOOKS].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const filteredRecentBooks = filterBooksByCategory(recentBooks);
  const displayedRecentBooks = showAllRecentBooks ? filteredRecentBooks : filteredRecentBooks.slice(0, 6);

  // 인기 도서 리스트 (학과 필터 적용)
  const filteredPopularBooks = filterBooksByCategory(POPULAR_BOOKS);
  const displayedPopularBooks = showAllPopularBooks ? filteredPopularBooks : filteredPopularBooks.slice(0, 6);

  return (
    <MarketplaceContainer>
      <Header>
        <Title>책거래게시판</Title>
      </Header>
      <PageWrapper>
        <SidebarMenu active={activeSubMenu} onMenuClick={handleSubMenuClick} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Controls>
            <SearchBar>
              <SearchIcon />
              <input
                type="text"
                placeholder="책 제목이나 저자를 검색해보세요"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={handleKeyPress}
              />
              <SearchButton onClick={handleSearch}>
                검색
              </SearchButton>
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
                      <option value="createdAt">최신 순</option>
                      <option value="likes">인기 순</option>
                      <option value="price">낮은 가격 순</option>
                      <option value="price">상태 순</option>

                    </FilterSelect>
                  </FilterSection>
                </FilterPopover>
              )}
            </div>
          </Controls>

          {/* 카테고리 선택 및 적용 영역 */}
          <CategoryContainer>
            <CategorySelect value={pendingMainCategory} onChange={handlePendingMajorChange}>
              <option value="전체">전체</option>
              {Object.keys(CATEGORIES).map(mainCategory => (
                <option key={mainCategory} value={mainCategory}>{mainCategory}</option>
              ))}
            </CategorySelect>
            {pendingMainCategory && pendingMainCategory !== '전체' && (
              <CategorySelect value={pendingSubCategory} onChange={handlePendingSubChange}>
                <option value="">전체</option>
                {Object.keys(CATEGORIES[pendingMainCategory]).map(subCategory => (
                  <option key={subCategory} value={subCategory}>{subCategory}</option>
                ))}
              </CategorySelect>
            )}
            {pendingSubCategory && pendingSubCategory !== '' && CATEGORIES[pendingMainCategory]?.[pendingSubCategory]?.length > 0 && (
              <CategorySelect value={pendingDetailCategory} onChange={handlePendingDetailChange}>
                <option value="">전체</option>
                {CATEGORIES[pendingMainCategory][pendingSubCategory].map(detailCategory => (
                  <option key={detailCategory} value={detailCategory}>{detailCategory}</option>
                ))}
              </CategorySelect>
            )}
            <button style={{marginLeft: '1rem', padding: '0.5rem 1.5rem', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, fontSize: '1rem', cursor: 'pointer'}} onClick={handleApplyCategory}>적용</button>
          </CategoryContainer>

          {/* 검색 결과가 있을 때는 검색 결과만 표시 */}
          {searchQuery && (
            <SearchResultsSection>
              <SearchResultsHeader>
                <BackButton onClick={handleBackToMarketplace}>
                  <span className="icon">←</span>
                  책 거래 게시판으로 돌아가기
                </BackButton>
                <SearchResultsTitle>
                  <span className="search-term">"{searchQuery}"</span> 검색 결과
                  <span className="result-count"> ({sortedBooks.length}개)</span>
                </SearchResultsTitle>
              </SearchResultsHeader>
              
              {isLoading ? (
                renderSkeletonCards()
              ) : sortedBooks.length > 0 ? (
                <BookGrid>
                  {sortedBooks.map(renderBookCard)}
                </BookGrid>
              ) : (
                <NoResultsMessage>
                  <div className="icon">🔍</div>
                  <div className="title">검색 결과가 없습니다</div>
                  <div className="description">
                    <strong>"{searchQuery}"</strong>에 대한 검색 결과를 찾을 수 없습니다.<br />
                    다른 키워드로 검색하거나 카테고리를 변경해보세요.
                  </div>
                </NoResultsMessage>
              )}
            </SearchResultsSection>
          )}

          {/* 검색 중이 아닐 때만 인기 도서와 최근 등록된 책 표시 */}
          {!searchQuery && (
            <>
              {/* 인기 도서 리스트 */}
              <SectionContainer>
                <SectionHeader>
                  <PopularSectionTitle>
                    {selectedMainCategory === '전체' ? (
                      '인기 도서'
                    ) : (
                      <>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                          {selectedDetailCategory || selectedSubCategory || selectedMainCategory}
                        </span>
                        {' '}인기 도서
                      </>
                    )}
                  </PopularSectionTitle>
                </SectionHeader>
                <PopularBooksGrid>
                  {displayedPopularBooks.map(renderBookCard)}
                </PopularBooksGrid>
                <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '3rem' }}>
                  <ViewMoreButton onClick={() => setShowAllPopularBooks(prev => !prev)}>
                    {showAllPopularBooks ? '더보기 취소' : '더보기'}
                  </ViewMoreButton>
                </div>
              </SectionContainer>

              {/* 최근 등록된 책 리스트 */}
              <SectionContainer>
                <SectionHeader>
                  <SectionTitle>
                    {selectedMainCategory === '전체' ? (
                      '최근 등록된 책'
                    ) : (
                      <>
                        <span style={{ color: 'var(--primary)', fontWeight: '700' }}>
                          {selectedDetailCategory || selectedSubCategory || selectedMainCategory}
                        </span>
                        {' '}최근 등록된 책
                      </>
                    )}
                  </SectionTitle>
                </SectionHeader>
                <BookGrid>
                  {displayedRecentBooks.map(renderBookCard)}
                </BookGrid>
                <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '3rem' }}>
                  <ViewMoreButton onClick={() => setShowAllRecentBooks(prev => !prev)}>
                    {showAllRecentBooks ? '더보기 취소' : '더보기'}
                  </ViewMoreButton>
                </div>
              </SectionContainer>
            </>
          )}
        </div>
      </PageWrapper>
    </MarketplaceContainer>
  );
};

export default Marketplace; 