import React, { useState, useEffect, useCallback, useRef} from 'react';
import styled from 'styled-components';
import { FaBook, FaCamera, FaSave, FaArrowLeft, FaImage, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaInfoCircle, FaHeart, FaClock, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import WarningModal from '../../components/WarningModal/WarningModal';
import { useWriting } from '../../contexts/WritingContext';

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
  }
`;

const WriteContainer = styled.div`
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  box-sizing: border-box;
  padding-top: 96px;
  @media (max-width: 900px) {
    padding-top: 72px;
    padding: 1rem;
  }
  @media (max-width: 600px) {
    padding-top: 56px;
    padding: 0.5rem;
  }
`;

const WriteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const WriteTitle = styled.h1`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const WriteForm = styled.form`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;

const FormSection = styled.div`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 0.5rem;
`;

const Required = styled.span`
  color: #dc3545;
  margin-left: 0.25rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

const ToggleContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const ToggleOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid ${props => props.$checked ? '#007bff' : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$checked ? '#f8f9ff' : 'white'};

  &:hover {
    border-color: #007bff;
  }

  input[type="radio"], input[type="checkbox"] {
    display: none;
  }
`;

const ToggleText = styled.span`
  font-size: 0.9rem;
  color: ${props => props.$checked ? '#007bff' : '#666'};
  font-weight: ${props => props.$checked ? '600' : 'normal'};
`;

const ImageSection = styled.div`
  margin-bottom: 1.5rem;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #f8f9fa;

  &:hover {
    border-color: #007bff;
    background: #f0f8ff;
  }
`;

const ImageUploadIcon = styled.div`
  font-size: 2rem;
  color: #999;
  margin-bottom: 1rem;
`;

const ImageUploadText = styled.p`
  color: #666;
  margin-bottom: 0.5rem;
`;

const ImageUploadButton = styled.button`
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const ImagePreview = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImagePreviewItem = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
`;

const ImagePreviewImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #dc3545;
  font-size: 0.8rem;
  transition: background 0.2s;

  &:hover {
    background: white;
  }
`;

const ConditionSection = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const ConditionOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  background: white;

  &:hover {
    border-color: #007bff;
  }

  input[type="radio"] {
    display: none;
  }

  input[type="radio"]:checked + span {
    color: #007bff;
    font-weight: 600;
  }

  input[type="radio"]:checked ~ & {
    border-color: #007bff;
    background: #f8f9ff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const CancelButton = styled.button`
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #5a6268;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const HelpText = styled.div`
  color: #666;
  font-size: 0.85rem;
  margin-top: 0.25rem;
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const SwitchButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.9rem;
  min-width: 100px;

  &.active {
    border-color: #007bff;
    background: #007bff;
    color: white;
  }

  &:hover {
    border-color: #007bff;
  }
`;

const SwitchLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  margin-right: 0.5rem;
`;

const PriceRecommendation = styled.div`
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #007bff;
`;

const RecommendationText = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
`;

const DiscountText = styled.div`
  font-size: 0.85rem;
  color: #007bff;
  font-weight: 500;
`;

const OriginalPriceInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  margin-bottom: 0.5rem;

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
  }
`;

const InputTypeSelector = styled.div`
  margin-bottom: 1rem;
`;

const InputTypeButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputTypeButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.$active ? '#007bff' : '#ddd'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background: ${props => props.$active ? '#0056b3' : '#f8f9ff'};
  }
`;

const BookSearchModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const BookSearchContent = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const BookList = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const BookItem = styled.div`
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background: #f8f9ff;
  }

  &.selected {
    border-color: #007bff;
    background: #e3f2fd;
  }
`;

const BookItemTitle = styled.div`
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 0.25rem;
`;

const BookInfo = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
`;

const ModalButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &.primary {
    background: #007bff;
    color: white;

    &:hover {
      background: #0056b3;
    }
  }

  &.secondary {
    background: #6c757d;
    color: white;

    &:hover {
      background: #5a6268;
    }
  }
`;

const SelectedBookDisplay = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border: 2px solid #007bff;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const DiscountInfo = styled.div`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.25rem;
`;

const ButtonSection = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
`;

const SaveDraftButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #218838;
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const InfoButton = styled.button`
  background: none;
  border: none;
  color: #007bff;
  cursor: pointer;
  margin-left: 0.5rem;
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  padding: 0;
  transition: color 0.2s;
  &:hover {
    color: #0056b3;
  }
`;

const InfoModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const InfoModalContent = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2rem 1.5rem;
  min-width: 320px;
  max-width: 90vw;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  text-align: center;
`;

const InfoTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
  font-size: 0.98rem;
  th, td {
    border: 1px solid #eee;
    padding: 0.5rem 0.75rem;
  }
  th {
    background: #f8f9fa;
    font-weight: 600;
  }
`;

const InfoModalClose = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: #0056b3;
  }
`;

const RecommendButton = styled.button`
  margin-left: 0.5rem;
  padding: 0.3rem 0.8rem;
  background: #f1f3f9;
  color: #007bff;
  border: 1px solid #cce1ff;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  &:hover {
    background: #e3f0ff;
    color: #0056b3;
  }
`;

const InfoDescription = styled.div`
  margin-bottom: 1rem;
  text-align: left;
`;

const InfoNote = styled.div`
  margin-top: 1rem;
  text-align: left;
`;

// 책 검색 버튼 스타일
const BookSearchButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const CircleIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
`;

// 프론트엔드 상태값 -> 백엔드 Enum 값으로 변환
const CONDITION_MAP = {
  '상': 'HIGH',
  '중': 'MEDIUM',
  '하': 'LOW'
};

// 상수 추출
const MAX_IMAGES = 3;
const DRAFT_STORAGE_KEY = 'postWriteDraft';
const DRAFT_EXPIRY_HOURS = 24;

// 카테고리 데이터
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

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// 카카오/다음 책 검색 응답을 내부 표준 구조로 정규화
const toBookArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data.documents)) return data.documents;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
};

// 공백 구분된 ISBN에서 우선순위 선택
const pickIsbn = (raw) => {
  const tokens = String(raw || '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.replace(/[^\dXx]/g, '')); // 숫자/검증문자만
  const isbn13 = tokens.find((t) => /^\d{13}$/.test(t));
  const isbn10 = tokens.find((t) => /^\d{9}[\dXx]$/.test(t));
  return isbn13 || isbn10 || tokens[0] || '';
};

// 문서 → 화면/상태에서 쓰는 표준 속성으로 매핑
const normalizeBook = (doc) => ({
  title: doc?.title ?? '',
  author: Array.isArray(doc?.authors) ? doc.authors.filter(Boolean).join(', ') : (doc?.author ?? ''), // UI는 문자열 사용
  publisher: doc?.publisher ?? '',
  isbn: pickIsbn(doc?.isbn),
  thumbnail: doc?.thumbnail ?? '',
});

const PostWrite = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // WritingContext 사용
  const { startWriting, stopWriting, setUnsavedChanges } = useWriting() || {
    startWriting: () => {},
    stopWriting: () => {},
    setUnsavedChanges: () => {},
  };

  // 모든 필드 명시적으로 정의
  const [formData, setFormData] = useState({
    // Book 정보
    isbn: '',
    bookTitle: '',
    author: '',
    publisher: '',
    originalPrice: '',

    // SalePost 정보
    postTitle: '',
    postContent: '',
    price: '',
    writingCondition: '상',
    tearCondition: '상',
    waterCondition: '상',
    negotiable: true,
  });

  const [images, setImages] = useState([]); // 다중 이미지 파일 관리
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [inputType, setInputType] = useState('search'); // 'search' or 'custom'
  const [unknownOriginalPrice, setUnknownOriginalPrice] = useState(false); // custom 모드에서 정가 없음/모름
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false); // 검색 로딩 상태

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // DOM 접근 대신 ref 사용 (StrictMode/SSR 안전)
  const imageInputRef = useRef(null);

  // 최신 변경 상태/함수 접근을 위한 ref (이벤트 리스너 안정화)
  const hasUnsavedChangesRef = useRef(false);
  useEffect(() => { 
    hasUnsavedChangesRef.current = hasUnsavedChanges; 
  }, [hasUnsavedChanges]);

  const clearErrors = useCallback((fieldName) => {
    setErrors(prev => {
      if (prev[fieldName]) {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      }
      return prev;
    });
  }, []);

  // 임시저장 로직을 별도 함수로 분리
  const loadDraftData = useCallback(() => {
    if (isEdit) return;
    
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (!savedDraft) return;

      const draftData = JSON.parse(savedDraft);
      const draftAge = new Date() - new Date(draftData.timestamp);
      const expiryTime = DRAFT_EXPIRY_HOURS * 60 * 60 * 1000;
      
      if (draftAge < expiryTime) {
        const shouldLoad = window.confirm('임시저장된 내용이 있어! 불러올까? 💾');
        if (shouldLoad) {
          const { timestamp, ...dataWithoutTimestamp } = draftData;
          setFormData(prev => ({
            ...prev,
            ...dataWithoutTimestamp,
          }));
          if (draftData.images) {
            setImages(draftData.images);
          }
          console.log('임시저장된 데이터 불러옴');
        } else {
          localStorage.removeItem(DRAFT_STORAGE_KEY);
        }
      } else {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
      }
    } catch (error) {
      console.error('임시저장 데이터 파싱 오류:', error);
      localStorage.removeItem(DRAFT_STORAGE_KEY);
    }
  }, [isEdit]);

  // 컴포넌트 마운트 시 글쓰기 시작 및 임시저장 데이터 불러오기
  useEffect(() => {
    console.log('PostWrite 컴포넌트 마운트됨');
    startWriting('sale');
    loadDraftData();
    
    return () => {
      console.log('PostWrite 컴포넌트 언마운트됨');
      stopWriting();
    };
  }, [startWriting, stopWriting, loadDraftData]);

  // 등록 방식 전환 시 custom -> search로 변경되면 정가 없음 플래그 해제
  useEffect(() => {
    if (inputType === 'search' && unknownOriginalPrice) {
      setUnknownOriginalPrice(false);
    }
  }, [inputType, unknownOriginalPrice]);

  // 폼 데이터 변경 감지
  useEffect(() => {
    const hasChanges = Object.values(formData).some(value => 
      value && value.toString().trim() !== ''
    ) || images.length > 0;
    setHasUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges);
  }, [formData, images, setUnsavedChanges]);

  // 메모리 누수 방지: unmount 시 blob URL 해제 (catch 바인딩 및 유효성 검사 추가)
const imagesRef = useRef(images);
useEffect(() => { imagesRef.current = images; }, [images]);

useEffect(() => {
  return () => {
    imagesRef.current.forEach((img) => {
      // 업로드된(url) 이미지는 건너뛰고, blob URL만 해제
      const url = img?.preview;
      if (!url || img.isUploaded) return;
      if (typeof url !== 'string' || !url.startsWith('blob:')) return;

      try {
        URL.revokeObjectURL(url);
      } catch (err) {
        // 오류 객체 바인딩 및 조용한 로깅
        // (프로덕션에서 소음 줄이고, 개발 중엔 원인 파악 가능)
        if (typeof console !== 'undefined') {
          console.debug('[cleanup] revokeObjectURL 실패:', err);
        }
      }
    });
  };
}, []);

  // handleSaveDraft를 선선언하여 TDZ 오류 방지 + 안정화 ref 제공
  // 임시저장 함수
  const handleSaveDraft = useCallback(async () => {
    try {
      const draftData = {
        ...formData,
        images: images,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draftData));
      console.log('임시저장 완료:', draftData);

      // TODO: 서버 임시저장 API 구현 시 추가
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setHasUnsavedChanges(false);
      setUnsavedChanges(false);
      alert('게시글을 임시저장했어! 📂');
    } catch (error) {
      console.error('임시저장 실패:', error);
      alert('임시저장에 실패했어! 😅');
    }
  }, [formData, images, setUnsavedChanges]);
  const handleSaveDraftRef = useRef(handleSaveDraft);
  useEffect(() => { handleSaveDraftRef.current = handleSaveDraft; }, [handleSaveDraft]);

  // 브라우저 이벤트 처리 로직
  // 최신 상태는 ref로 읽어 재등록 없이 안정 동작
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChangesRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setPendingNavigation('/marketplace');
        setShowWarningModal(true);
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    const handleSaveDraftEvent = async () => {
      await handleSaveDraft();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('saveDraft', handleSaveDraftEvent);
    
    window.history.pushState(null, '', window.location.pathname);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('saveDraft', handleSaveDraftEvent);
    };
  }, []);

  // 수정 모드
  useEffect(() => {
    if (!isEdit) return;

    const fetchPostForEdit = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/posts/${id}`, {
          headers: getAuthHeader()
        });
        const postData = response.data;
        
        // API 응답 데이터를 formData 형태로 변환
        setFormData({
          isbn: postData.isbn || '',
          bookTitle: postData.bookTitle || '',
          author: postData.author || '',
          publisher: postData.publisher || '',
          originalPrice: postData.originalPrice?.toString() || '',

          postTitle: postData.postTitle || '',
          postContent: postData.postContent || '',
          price: postData.price?.toString() || '',
          writingCondition: Object.keys(CONDITION_MAP).find(key => CONDITION_MAP[key] === postData.writingCondition) || '상',
          tearCondition: Object.keys(CONDITION_MAP).find(key => CONDITION_MAP[key] === postData.tearCondition) || '상',
          waterCondition: Object.keys(CONDITION_MAP).find(key => CONDITION_MAP[key] === postData.waterCondition) || '상',
          negotiable: postData.negotiable ?? true,
        });

        if (postData.postImageUrls?.length > 0) {
          setImages(postData.postImageUrls.map((url, index) => ({ 
            id: `uploaded_${index}_${Date.now()}`, 
            preview: url, 
            isUploaded: true 
          })));
        }
        
        setInputType(postData.isbn ? 'search' : 'custom');
      } catch (error) {
        console.error("수정할 게시글 정보를 불러오는 데 실패했습니다.", error);
        alert("게시글 정보를 불러올 수 없어! 🥺");
        navigate('/marketplace');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPostForEdit();
  }, [id, isEdit, navigate]);

  // 할인율 계산 함수
  const calculateDiscountRate = useCallback(() => {
    const WEIGHTS = {
      writing: 0.15,    // 15% 가중치
      tear: 0.35,       // 35% 가중치  
      water: 0.50,      // 50% 가중치
    };

    const DISCOUNT_RATES = {
      '상': 0.15,
      '중': 0.35,  
      '하': 0.55,
    };

    const BASE_DISCOUNT = 0.1; // 중고책 기본 할인 10%

    let totalDiscount = 0;
    
    totalDiscount += WEIGHTS.writing * DISCOUNT_RATES[formData.writingCondition];
    totalDiscount += WEIGHTS.tear * DISCOUNT_RATES[formData.tearCondition];
    totalDiscount += WEIGHTS.water * DISCOUNT_RATES[formData.waterCondition];
    totalDiscount += BASE_DISCOUNT;
    
    return Math.round(totalDiscount * 100);
  }, [formData.writingCondition, formData.tearCondition, formData.waterCondition]);

  // 추천 가격 계산
  // 현재는 책 상태(필기, 찢어짐, 물흘림)를 기준으로 할인율을 계산하여 추천 가격을 산정합니다.
  // 
  // 할인율 계산 기준:
  // - 필기 상태: 없음(0%) ~ 많음(15%)
  // - 찢어짐 정도: 없음(0%) ~ 심함(10%)
  // - 물흘림 정도: 없음(0%) ~ 심함(10%)
  //
  // TODO: 실제 구현 시에는 시장 가격 데이터베이스나 유사 책의 거래 이력을 참고하여 더 정확한 추천 가격을 제공
  const getRecommendedPrice = useCallback(() => {
    if (!formData.originalPrice) return null;
    
    const originalPrice = parseInt(formData.originalPrice, 10);
    if (Number.isNaN(originalPrice) || originalPrice <= 0) return null;
    
    const discountRate = calculateDiscountRate();
    const recommendedPrice = Math.round(originalPrice * (1 - discountRate / 100));
    
    return { discountRate, recommendedPrice };
  }, [formData.originalPrice, calculateDiscountRate]);

  // 입력 핸들러
  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    clearErrors(name);
  }, [clearErrors]);

  // 원가 변경 핸들러
  const handleOriginalPriceChange = useCallback((e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, originalPrice: value }));
    clearErrors('originalPrice');
  }, [clearErrors]);

        
  // 이미지 업로드 핸들러
  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}개까지 업로드할 수 있어! 📸`);
      return;
    }

    // 이미지 검증
    const validFiles = files.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB 제한
      
      if (!isValidType) {
        alert(`${file.name}은(는) 이미지 파일이 아니야! 🖼️`);
        return false;
      }
      if (!isValidSize) {
        alert(`${file.name}은(는) 5MB를 초과해! 더 작은 파일로 올려줘 📏`);
        return false;
      }
      return true;
    });

    const newImages = validFiles.map(file => ({
      id: `${Date.now()}_${file.name}`,
      file,
      preview: URL.createObjectURL(file)
    }));

    setImages(prev => [...prev, ...newImages]);
    // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
    if (imageInputRef.current) imageInputRef.current.value = '';
  }, [images.length]);

  // 이미지 삭제 핸들러
  const handleRemoveImage = useCallback((imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      // 메모리 누수 방지를 위해 URL 해제
      if (imageToRemove && imageToRemove.preview && !imageToRemove.isUploaded) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  }, []);

  // 책 검색 함수
  const handleBookSearch = useCallback(async () => {
    if (!searchQuery.trim()) {
      alert('검색어를 입력해줘! 🔍');
      return;
    }

    setSearchLoading(true);
    try {
      const response = await axios.get('/api/search/books', { 
        params: { query: searchQuery.trim() },
        headers: getAuthHeader()
      });
      
      const raw = response?.data;
      const results = toBookArray(raw).map(normalizeBook);
      setSearchResults(results);
      
      if (results.length === 0) {
        alert('검색 결과가 없어! 다른 키워드로 시도해봐 📚');
      }
    } catch (error) {
      console.error("책 검색 실패:", error);
      alert("책 검색 중 오류가 발생했어! 다시 시도해줘 😅");
      setSearchResults([]); // 실패 시에도 배열 보장
    } finally {
      setSearchLoading(false);
    }
  }, [searchQuery]);

  // 책 선택 함수
  const handleBookSelect = useCallback((book) => {
    setFormData(prev => ({
      ...prev,
      isbn: book.isbn || '',
      bookTitle: book.title || '',
      author: book.author || '',
      publisher: book.publisher || '',
    }));
    
    // 모달 닫을 때 검색 상태 초기화
    setShowBookSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  }, []);

  // 폼 검증 로직
  const validateForm = useCallback(() => {
    const newErrors = {};

    // 검색 모드에서는 isbn 유무만 체크 (정규화로 항상 문자열 보장)
    if (inputType === 'search' && !formData.isbn.trim()) {
      newErrors.bookTitle = '책을 검색에서 선택해줘! (ISBN 필요) 📚';
    }

    // 책 정보 검증 (custom 모드에서만 필수)
    if (inputType === 'custom') {
      if (!formData.bookTitle.trim()) {
        newErrors.bookTitle = '책 제목을 입력해줘! 📖';
      }
      if (!formData.author.trim()) {
        newErrors.author = '저자를 입력해줘! ✍️';
      }
    }

    // 판매글 정보 검증
    if (!formData.postTitle.trim()) {
      newErrors.postTitle = '글 제목을 입력해줘! 📝';
    } else if (formData.postTitle.trim().length < 5) {
      newErrors.postTitle = '글 제목은 최소 5자 이상 입력해줘! 📏';
    }

    // 가격 검증
    const originalPrice = parseInt(formData.originalPrice, 10);
    const price = parseInt(formData.price, 10);

    // 원가 필수 여부: 검색 모드에서는 필수, 직접 입력(custom)에서는 선택
    if (inputType === 'search') {
      if (!formData.originalPrice || Number.isNaN(originalPrice) || originalPrice <= 0) {
        newErrors.originalPrice = '원가를 올바르게 입력해줘! 💰';
      }
    } else {
      // custom 모드: 사용자가 원가를 적어준 경우에만 유효성 검사
      if (!unknownOriginalPrice && formData.originalPrice) {
        if (Number.isNaN(originalPrice) || originalPrice <= 0) {
          newErrors.originalPrice = '원가를 올바르게 입력해줘! 💰';
        }
      }
    }

    if (!formData.price || Number.isNaN(price) || price <= 0) {
      newErrors.price = '판매가를 올바르게 입력해줘! 💵';
    } else if (formData.originalPrice && !Number.isNaN(originalPrice) && price > originalPrice) { // 원가가 있을 때만 비교
      newErrors.price = '판매가가 원가보다 클 수 없어! 🤔';
    }

    // 상태 검증
    if (!['상', '중', '하'].includes(formData.writingCondition)) {
      newErrors.writingCondition = '필기 상태를 선택해줘! ✏️';
    }

    if (!['상', '중', '하'].includes(formData.tearCondition)) {
      newErrors.tearCondition = '찢어짐 정도를 선택해줘! 📄';
    }

    if (!['상', '중', '하'].includes(formData.waterCondition)) {
      newErrors.waterCondition = '물기 상태를 선택해줘! 💧';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // 제출 핸들러
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      alert('입력 정보를 다시 확인해줘! 🔍');
      return;
    }

    setLoading(true);

    try {
      if (isEdit) {
        // 수정 로직 (기본 정보 PATCH)
        const payload = {
          postTitle: formData.postTitle.trim(),
          postContent: formData.postContent.trim(),
          price: parseInt(formData.price, 10),
          writingCondition: CONDITION_MAP[formData.writingCondition],
          tearCondition: CONDITION_MAP[formData.tearCondition],
          waterCondition: CONDITION_MAP[formData.waterCondition],
          negotiable: formData.negotiable,
        };

        await axios.patch(`/api/posts/${id}`, payload, { headers: getAuthHeader() });

        // 새로 추가된 이미지가 있으면 별도 업로드 엔드포인트 호출
        const newImageFiles = images.filter(img => img.file && !img.isUploaded).map(img => img.file);
        if (newImageFiles.length > 0) {
          const fd = new FormData();
          newImageFiles.forEach(f => fd.append('images', f));

          // 디버그 출력
          try {
            for (const [k, v] of fd.entries()) {
              console.debug('[edit-upload] part', k, v && v.name ? v.name : v);
            }
          } catch {}

          await axios.post(`/api/posts/${id}/images`, fd, { headers: { ...getAuthHeader() } });
        }

        alert('게시글이 성공적으로 수정됐어! 🎉');
        // 임시저장 데이터 삭제
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        navigate(`/posts/${id}`);

      } else {
        // 생성 로직
        const apiData = new FormData();
        let endpoint = '';
        let requestJson = {};

        const baseData = {
          bookTitle: formData.bookTitle.trim(),
          author: formData.author.trim(),
          publisher: formData.publisher.trim(),
          postTitle: formData.postTitle.trim(),
          postContent: formData.postContent.trim(),
          price: parseInt(formData.price, 10),
          writingCondition: CONDITION_MAP[formData.writingCondition],
          tearCondition: CONDITION_MAP[formData.tearCondition],
          waterCondition: CONDITION_MAP[formData.waterCondition],
          negotiable: formData.negotiable,
        };

        if (inputType === 'search') {
          endpoint = '/api/posts';
          requestJson = {
            ...baseData,
            isbn: formData.isbn.trim(),
            originalPrice: parseInt(formData.originalPrice, 10),
          };
        } else {
          endpoint = '/api/posts/custom';
          // custom 모드: 원가는 선택 사항. 입력이 없거나 '정가 없음/모름'이면 0으로 전송
          const parsedOriginal = parseInt(formData.originalPrice, 10);
          requestJson = {
            ...baseData,
            originalPrice: (!unknownOriginalPrice && formData.originalPrice && !Number.isNaN(parsedOriginal) && parsedOriginal > 0)
              ? parsedOriginal
              : 0,
          };
        }

        // JSON 파트는 명시적으로 파일명을 지정해 Content-Type 힌트를 강화합니다.
        apiData.append(
          'request',
          new Blob([JSON.stringify(requestJson)], { type: 'application/json' }),
          'request.json'
        );

        // 새 이미지만 전송
        images.forEach(img => {
          if (img.file && !img.isUploaded) {
            apiData.append('images', img.file);
          }
        });

        // 디버그: 전송되는 FormData 내용을 콘솔에서 확인 (개발 편의)
        try {
          for (const [k, v] of apiData.entries()) {
            if (k === 'images' && v && typeof v === 'object') {
              console.debug('[upload] part', k, (v.name || ''), (v.type || ''), (v.size || ''));
            } else if (k === 'request') {
              console.debug('[upload] part', k, '(JSON)');
            } else {
              console.debug('[upload] part', k, v);
            }
          }
        } catch {}

        await axios.post(endpoint, apiData, { 
          // Content-Type은 브라우저가 boundary 포함해 자동 설정하도록 둡니다.
          headers: { 
            ...getAuthHeader()
          } 
        });

        alert('게시글이 성공적으로 등록됐어! 🎉');
        // 임시저장 데이터 삭제
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        navigate('/marketplace');
      }
    } catch (error) {
      console.error("게시글 처리 중 오류 발생:", error);
      const serverMessage = error.response?.data?.message;

      if (error.response?.status === 401) {
        alert(serverMessage || '로그인이 필요해! 다시 로그인해줘 🔐');
        navigate('/login');
      } else if (error.response?.status === 403) {
        alert(serverMessage || '권한이 없어! 😥');
      } else if (error.response?.status === 400) {
        // 용량 초과, 잘못된 포맷 등 서버 메시지를 우선 표시
        alert(serverMessage || '입력 정보에 문제가 있어! 다시 확인해줘 📝');
      } else if (error.response?.status === 415) {
        alert(serverMessage || '업로드 형식이 올바르지 않아! multipart/form-data로 다시 시도해줘 📎');
      } else {
        alert(serverMessage || '오류가 발생했어! 잠시 후 다시 시도해줘 🔄');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, images, isEdit, id, inputType, validateForm, navigate]);

  // 안전한 네비게이션 함수
  const safeNavigate = useCallback((path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowWarningModal(true);
    } else {
      navigate(path);
    }
  }, [hasUnsavedChanges, navigate]);

  // 모달 처리 함수들
  const handleConfirmExit = useCallback(() => {
    setShowWarningModal(false);
    const targetPath = pendingNavigation || '/marketplace';
    navigate(targetPath);
    setPendingNavigation(null);
  }, [navigate, pendingNavigation]);

  const handleCancelExit = useCallback(() => {
    setShowWarningModal(false);
    setPendingNavigation(null);
  }, []);

  const handleSaveDraftAndExit = useCallback(async () => {
    try {
      await handleSaveDraft();
      setShowWarningModal(false);
      const targetPath = pendingNavigation || '/marketplace';
      navigate(targetPath);
      setPendingNavigation(null);
    } catch (error) {
      console.error('임시저장 후 나가기 실패:', error);
      // 임시저장 실패해도 나가기는 진행
      setShowWarningModal(false);
      const targetPath = pendingNavigation || '/marketplace';
      navigate(targetPath);
      setPendingNavigation(null);
    }
  }, [handleSaveDraft, navigate, pendingNavigation]);

  // 취소 핸들러
  const handleCancel = useCallback((e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    safeNavigate('/marketplace');
  }, [safeNavigate]);

  // 책 검색 모달 제어 함수들
  const handleCloseBookSearch = useCallback(() => {
    setShowBookSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    setSearchLoading(false);
  }, []);

  const handleOpenBookSearch = useCallback(() => {
    setShowBookSearch(true);
  }, []);

  // 조건 상태별 체크 여부 확인 함수
  const isConditionChecked = useCallback((conditionType, value) => {
    return formData[conditionType] === value;
  }, [formData]);

  // 네고 상태 체크 함수
  const isNegotiableChecked = useCallback((isNegotiable) => {
    return formData.negotiable === isNegotiable;
  }, [formData.negotiable]);

  console.log('PostWrite 컴포넌트 렌더링 완료');

  const recommended = getRecommendedPrice();

  // 로딩 중일 때 로딩 화면 표시
  if (loading && isEdit) {
    return (
      <WriteContainer>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>게시글 정보를 불러오는 중... ⏳</p>
        </div>
      </WriteContainer>
    );
  }

  return (
    <>
      <div className="header-spacer" />
      <WriteContainer>
        <WriteHeader>
          <BackButton onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setPendingNavigation('/marketplace');
            setShowWarningModal(true);
          }}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>
          <WriteTitle>{isEdit ? '판매글 수정' : '판매글 등록'}</WriteTitle>
        </WriteHeader>

        <WriteForm onSubmit={handleSubmit}>
          {!isEdit && (
            <FormSection>
              <SectionTitle><FaBook /> 등록 방식</SectionTitle>
              <InputTypeButtons>
                <InputTypeButton type="button" $active={inputType === 'search'} onClick={() => setInputType('search')}>ISBN / 책 제목 검색</InputTypeButton>
                <InputTypeButton type="button" $active={inputType === 'custom'} onClick={() => setInputType('custom')}>직접 입력 (제본 등)</InputTypeButton>
              </InputTypeButtons>
            </FormSection>
          )}

          {/* --- 책 정보 섹션 --- */}
          <FormSection>
            <SectionTitle>📖 책 정보</SectionTitle>
            {inputType === 'search' ? (
              <>
                {!isEdit && (
                  <FormGroup>
                    <Label>책 검색 <Required>*</Required></Label>
                    <button type="button" onClick={() => setShowBookSearch(true)}>책 검색하기</button>
                  </FormGroup>
                )}
                {/* 선택된 책 정보 표시 */}
                {formData.bookTitle && (
                  <SelectedBookDisplay>
                    <BookItemTitle>{formData.bookTitle}</BookItemTitle>
                    <BookInfo>저자: {formData.author} | 출판사: {formData.publisher}</BookInfo>
                  </SelectedBookDisplay>
                )}
              </>
            ) : (
              <>
                {/* 직접 입력 폼 */}
                <FormGroup>
                  <Label>책 제목 <Required>*</Required></Label>
                  <Input 
                    name="bookTitle" 
                    value={formData.bookTitle} 
                    onChange={handleInputChange}
                    placeholder="책 제목을 입력해줘"
                  />
                  {errors.bookTitle && <ErrorMessage>{errors.bookTitle}</ErrorMessage>}
                </FormGroup>
                <FormGroup>
                  <Label>저자 <Required>*</Required></Label>
                  <Input 
                    name="author" 
                    value={formData.author} 
                    onChange={handleInputChange}
                    placeholder="저자를 입력해줘"
                  />
                  {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
                </FormGroup>
                <FormGroup>
                  <Label>출판사</Label>
                  <Input 
                    name="publisher" 
                    value={formData.publisher} 
                    onChange={handleInputChange}
                    placeholder="출판사를 입력해줘"
                  />
                </FormGroup>
              </>
            )}
          </FormSection>

          <FormSection>
            <SectionTitle><FaCamera /> 실물 사진 등록 (최대 {MAX_IMAGES}장)</SectionTitle>
            <input 
              id="imageInput" 
              ref={imageInputRef}
              type="file" 
              multiple 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{ display: 'none' }} 
            />
            {images.length < MAX_IMAGES && (
              <ImageUploadArea onClick={() => imageInputRef.current?.click()}>
                <ImageUploadIcon><FaImage /></ImageUploadIcon>
                <ImageUploadText>클릭해서 사진을 업로드해줘! 📷</ImageUploadText>
                <HelpText>최대 {MAX_IMAGES}장, 각 파일당 5MB 이하</HelpText>
              </ImageUploadArea>
            )}
            {images.length > 0 && (
              <ImagePreview>
                {images.map(image => (
                  <ImagePreviewItem key={image.id}>
                    <ImagePreviewImg src={image.preview} alt="미리보기" />
                    <RemoveImageButton onClick={() => handleRemoveImage(image.id)}>
                      <FaTimes />
                    </RemoveImageButton>
                  </ImagePreviewItem>
                ))}
              </ImagePreview>
            )}
          </FormSection>

          {/* --- 판매글 정보 섹션 --- */}
          <FormSection>
            <SectionTitle>📝 판매글 정보</SectionTitle>
            <FormGroup>
              <Label>글 제목 <Required>*</Required></Label>
              <Input 
                name="postTitle" 
                value={formData.postTitle} 
                onChange={handleInputChange}
                placeholder="판매글 제목을 입력해줘 (최소 5자)"
              />
              {errors.postTitle && <ErrorMessage>{errors.postTitle}</ErrorMessage>}
            </FormGroup>

            {/* ... (책 상태, 가격 협의 등 다른 폼 그룹들) ... */}

            <FormGroup>
              <Label>필기 상태 <Required>*</Required></Label>
              <ToggleContainer>
                {['상', '중', '하'].map(condition => (
                  <ToggleOption 
                    key={condition} 
                    $checked={isConditionChecked('writingCondition', condition)}
                  >
                    <input
                      type="radio"
                      name="writingCondition"
                      value={condition}
                      checked={isConditionChecked('writingCondition', condition)}
                      onChange={handleInputChange}
                    />
                    <ToggleText $checked={isConditionChecked('writingCondition', condition)}>
                      {condition} ({condition === '상' ? '깨끗함' : condition === '중' ? '약간 필기' : '많이 필기'})
                    </ToggleText>
                  </ToggleOption>
                ))}
              </ToggleContainer>
              {errors.writingCondition && <ErrorMessage>{errors.writingCondition}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>찢어짐 정도 <Required>*</Required></Label>
              <ToggleContainer>
                {['상', '중', '하'].map(condition => (
                  <ToggleOption 
                    key={condition}
                    $checked={isConditionChecked('tearCondition', condition)}
                  >
                    <input
                      type="radio"
                      name="tearCondition"
                      value={condition}
                      checked={isConditionChecked('tearCondition', condition)}
                      onChange={handleInputChange}
                    />
                    <ToggleText $checked={isConditionChecked('tearCondition', condition)}>
                      {condition} ({condition === '상' ? '깨끗함' : condition === '중' ? '약간 찢어짐' : '많이 찢어짐'})
                    </ToggleText>
                  </ToggleOption>
                ))}
              </ToggleContainer>
              {errors.tearCondition && <ErrorMessage>{errors.tearCondition}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>물기 상태 <Required>*</Required></Label>
              <ToggleContainer>
                {['상', '중', '하'].map(condition => (
                  <ToggleOption 
                    key={condition}
                    $checked={isConditionChecked('waterCondition', condition)}
                  >
                    <input
                      type="radio"
                      name="waterCondition"
                      value={condition}
                      checked={isConditionChecked('waterCondition', condition)}
                      onChange={handleInputChange}
                    />
                    <ToggleText $checked={isConditionChecked('waterCondition', condition)}>
                      {condition} ({condition === '상' ? '깨끗함' : condition === '중' ? '약간 물기' : '많이 물기'})
                    </ToggleText>
                  </ToggleOption>
                ))}
              </ToggleContainer>
              {errors.waterCondition && <ErrorMessage>{errors.waterCondition}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>네고 가능 여부</Label>
              <ToggleContainer>
                <ToggleOption $checked={isNegotiableChecked(true)}>
                  <input
                    type="radio"
                    name="negotiable"
                    value={true}
                    checked={isNegotiableChecked(true)}
                    onChange={(e) => setFormData(prev => ({ ...prev, negotiable: true }))}
                  />
                  <ToggleText $checked={isNegotiableChecked(true)}>네고 가능 💬</ToggleText>
                </ToggleOption>
                <ToggleOption $checked={isNegotiableChecked(false)}>
                  <input
                    type="radio"
                    name="negotiable"
                    value={false}
                    checked={isNegotiableChecked(false)}
                    onChange={(e) => setFormData(prev => ({ ...prev, negotiable: false }))}
                  />
                  <ToggleText $checked={isNegotiableChecked(false)}>네고 불가 🚫</ToggleText>
                </ToggleOption>
              </ToggleContainer>
            </FormGroup>

            <FormGroup>
              <Label>
                원가 {inputType === 'search' && <Required>*</Required>}
              </Label>
              {inputType === 'custom' && (
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={{ fontSize: '0.9rem', color: 'var(--text-light)' }}>
                    <input
                      type="checkbox"
                      checked={unknownOriginalPrice}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setUnknownOriginalPrice(checked);
                        if (checked) {
                          setFormData(prev => ({ ...prev, originalPrice: '' }));
                          clearErrors('originalPrice');
                        }
                      }}
                      style={{ marginRight: '0.5rem' }}
                    />
                    정가 없음/모름
                  </label>
                </div>
              )}
              <Input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleOriginalPriceChange}
                placeholder={inputType === 'custom' ? '정가를 입력해줘 (선택)' : '정가를 입력해줘'}
                min="0"
                disabled={inputType === 'custom' && unknownOriginalPrice}
              />
              {errors.originalPrice && <ErrorMessage>{errors.originalPrice}</ErrorMessage>}
              <HelpText>{inputType === 'custom' ? '정가가 없는 프린트물 등은 체크 후 생략 가능해!' : '책의 정가를 입력해줘'}</HelpText>
            </FormGroup>

            <FormGroup>
              <Label>판매가 <Required>*</Required></Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder={
                  inputType === 'custom'
                    ? (unknownOriginalPrice
                        ? '정가 없음/모름 — 시장가격과 상태를 고려해 판매가를 입력해줘'
                        : '추천가 미제공 — 책 상태를 고려해 판매가를 입력해줘')
                    : '추천가를 참고해 판매가를 입력해줘'
                }
                min="0"
              />
              {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
              
              {inputType === 'search' && formData.originalPrice && recommended && (
                <DiscountInfo>
                  할인율: {recommended.discountRate}% 
                  ({(parseInt(formData.originalPrice) - recommended.recommendedPrice).toLocaleString()}원 할인)
                  <br />
                  <strong>추천가: {recommended.recommendedPrice.toLocaleString()}원</strong>
                  <RecommendButton
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      price: recommended.recommendedPrice.toString() 
                    }))}
                  >
                    추천 가격으로 입력 ✨
                  </RecommendButton>
                  <InfoButton 
                    type="button" 
                    onClick={() => setShowInfoModal(true)} 
                    title="추천 거래 가격 산정 기준 안내"
                  >
                    <FaInfoCircle />
                  </InfoButton>
                </DiscountInfo>
              )}

              {inputType === 'custom' && (
                <HelpText>
                  직접 입력에서는 추천가가 제공되지 않습니다. 책 상태와 시장 가격을 고려해 합리적인 금액을 입력해 주세요.
                </HelpText>
              )}
            </FormGroup>

            <FormGroup>
              <Label>상세 설명</Label>
              <TextArea
                name="postContent"
                value={formData.postContent}
                onChange={handleInputChange}
                placeholder="책 상태나 거래 방법 등 자세한 설명을 써줘! 📝 예: 필기는 연필로 되어있어서 지우개로 지울 수 있어! T동에서 직거래 가능해!"
              />
              <HelpText>구매자가 궁금해할 만한 내용을 상세히 적어주면 좋아! 🤗</HelpText>
            </FormGroup>
          </FormSection>

          {/* 버튼 영역 */}
          <ButtonSection>
            <ButtonGroup>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>

              {!isEdit && (
                <SaveDraftButton type="button" onClick={handleSaveDraft}>
                  <FaSave /> 임시저장
                </SaveDraftButton>
              )}

              <SubmitButton type="submit" disabled={loading}>
                {loading ? (
                  isEdit ? '수정 중... ⏳' : '등록 중... ⏳'
                ) : (
                  isEdit ? '수정하기 ✅' : '등록하기 🚀'
                )}
              </SubmitButton>
            </ButtonGroup>
          </ButtonSection>
        </WriteForm>
      </WriteContainer>

      {/* 책 검색 모달 */}
      {showBookSearch && (
        <BookSearchModal>
          <BookSearchContent>
            <h3>📚 책 검색</h3>
            <SearchInput
              type="text"
              placeholder="ISBN 또는 책 제목으로 검색해줘!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !searchLoading && handleBookSearch()}
            />
            <BookSearchButton 
              type="button"
              onClick={handleBookSearch}
              disabled={searchLoading}
            >
              <FaSearch /> {searchLoading ? '검색 중... ⏳' : '검색하기'}
            </BookSearchButton>
            
            {searchLoading && (
              <div style={{ textAlign: 'center', padding: '1rem' }}>
                검색 중이야... 잠시만 기다려줘! ⏳
              </div>
            )}
            
            <BookList>
              {(Array.isArray(searchResults) ? searchResults : []).map((book, index) => (
                <BookItem key={index} onClick={() => handleBookSelect(book)}>
                  {/* 썸네일이 있으면 보여주고, 없어도 문제없도록 */}
                  {book.thumbnail && (
                    <img
                      src={book.thumbnail}
                      alt={book.title}
                      style={{ width: 48, height: 70, objectFit: 'cover', marginRight: 8, borderRadius: 4 }}
                    />
                  )}
                  <div>
                    <BookItemTitle>{book.title}</BookItemTitle>
                    <BookInfo>
                      저자: {book.author || '정보 없음'} | 출판사: {book.publisher || '정보 없음'}
                    </BookInfo>
                    {book.isbn && <BookInfo>ISBN: {book.isbn}</BookInfo>}
                  </div>
                </BookItem>
              ))}
            </BookList>
            
            <ModalButtons>
              <ModalButton 
                type="button" 
                className="secondary" 
                onClick={handleCloseBookSearch}
              >
                닫기
              </ModalButton>
            </ModalButtons>
          </BookSearchContent>
        </BookSearchModal>
      )}

      {/* 경고 모달 */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={handleCancelExit}
        onConfirm={handleConfirmExit}
        onCancel={handleCancelExit}
        onSaveDraft={handleSaveDraftAndExit}
        type="sale"
        showSaveDraft={!isEdit} // 수정 모드에서는 임시저장 버튼 숨김
      />

      {/* 정보 모달 */}
      {showInfoModal && (
        <InfoModalOverlay onClick={() => setShowInfoModal(false)}>
          <InfoModalContent onClick={e => e.stopPropagation()}>
            <h3>📚 추천 거래 가격 산정 기준표</h3>
            <InfoDescription>
              <p>원가 대비 책 상태를 종합적으로 평가해서 추천 가격을 계산해줘! 🤖</p>
              <p>각 항목별 할인율이 누적되어 적용돼.</p>
            </InfoDescription>
            <InfoTable>
              <thead>
                <tr>
                  <th>평가 항목</th>
                  <th>가중치</th>
                  <th>상태별 할인율</th>
                  <th>상세 설명</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>필기 상태</strong></td>
                  <td>15%</td>
                  <td>상: 2.25% / 중: 5.25% / 하: 8.25%</td>
                  <td>연필, 펜 등으로 필기된 정도에 따라 할인</td>
                </tr>
                <tr>
                  <td><strong>찢어짐 정도</strong></td>
                  <td>35%</td>
                  <td>상: 5.25% / 중: 12.25% / 하: 19.25%</td>
                  <td>책장, 표지 등의 찢어짐 정도에 따라 할인</td>
                </tr>
                <tr>
                  <td><strong>물흘림 정도</strong></td>
                  <td>50%</td>
                  <td>상: 7.5% / 중: 17.5% / 하: 27.5%</td>
                  <td>물에 젖은 흔적이나 얼룩 정도에 따라 할인</td>
                </tr>
                <tr style={{backgroundColor: '#f8f9fa'}}>
                  <td><strong>중고책 기본 할인</strong></td>
                  <td>-</td>
                  <td>10%</td>
                  <td>새책이 아닌 모든 중고책에 기본 적용</td>
                </tr>
                <tr style={{backgroundColor: '#e3f2fd', fontWeight: 'bold'}}>
                  <td colSpan={2}><strong>최대 총 할인율</strong></td>
                  <td><strong>약 65%</strong></td>
                  <td><strong>모든 상태가 '하'일 때</strong></td>
                </tr>
              </tbody>
            </InfoTable>
            <InfoNote>
              <p><strong>💡 참고사항:</strong></p>
              <ul>
                <li>각 항목의 상태는 '상/중/하'로 평가해줘</li>
                <li>할인율은 원가에서 차감되어 추천가가 계산돼</li>
                <li>실제 판매가는 자유롭게 설정할 수 있어!</li>
                <li>이 기준은 참고용이니까 시장 상황에 맞게 조정해도 좋아 📊</li>
              </ul>
            </InfoNote>
            <InfoModalClose onClick={() => setShowInfoModal(false)}>
              확인 👍
            </InfoModalClose>
          </InfoModalContent>
        </InfoModalOverlay>
      )}
    </>
  );
};

export default PostWrite; 
