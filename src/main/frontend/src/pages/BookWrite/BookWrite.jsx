import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaCamera, FaSave, FaArrowLeft, FaImage, FaTimes, FaCheck, FaSearch, FaMoneyBillWave, FaInfoCircle, FaHeart, FaClock, FaUser } from 'react-icons/fa';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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

const ToggleText = styled.span`
  font-size: 0.9rem;
  color: #666;
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
  border: 2px solid ${props => props.active ? '#007bff' : '#ddd'};
  background: ${props => props.active ? '#007bff' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.2s;

  &:hover {
    border-color: #007bff;
    background: ${props => props.active ? '#0056b3' : '#f8f9ff'};
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

const BookTitle = styled.div`
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

const CircleIconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
`;

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

const BookWrite = () => {
  console.log('BookWrite 컴포넌트 렌더링 시작');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { startWriting, stopWriting, setUnsavedChanges } = useWriting();
  
  // mock 데이터 (실제로는 API 호출)
  const mockMyBooks = [
    {
      id: '1',
      bookType: 'official',
      title: '자바의 정석',
      isbn: '9788966262472',
      author: '남궁성',
      mainCategory: '전공',
      subCategory: '공과대학',
      detailCategory: '컴퓨터공학과',
      writingCondition: '상',
      tearCondition: '상',
      waterCondition: '상',
      originalPrice: '30000',
      price: '15000',
      description: '자바 프로그래밍 기초부터 고급까지 다루는 책입니다.'
    },
    {
      id: '2',
      bookType: 'official',
      title: '스프링 부트 실전 활용',
      isbn: '9788966262489',
      author: '김영한',
      mainCategory: '전공',
      subCategory: '공과대학',
      detailCategory: '컴퓨터공학과',
      writingCondition: '중',
      tearCondition: '상',
      waterCondition: '상',
      originalPrice: '35000',
      price: '20000',
      description: '스프링 부트를 활용한 웹 개발 실전 가이드'
    },
    // ... 필요한 만큼 추가 ...
  ];

  const [formData, setFormData] = useState({
    bookType: 'official',
    title: '',
    isbn: '',
    author: '',
    mainCategory: '',
    subCategory: '',
    detailCategory: '',
    writingCondition: '',
    tearCondition: '',
    waterCondition: '',
    originalPrice: '',
    price: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputType, setInputType] = useState('title'); // 'title' or 'isbn'
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // 컴포넌트 마운트 시 글쓰기 시작
  useEffect(() => {
    console.log('BookWrite 컴포넌트 마운트됨');
    startWriting('sale');
    
    // 컴포넌트 언마운트 시 글쓰기 종료
    return () => {
      console.log('BookWrite 컴포넌트 언마운트됨');
      stopWriting();
    };
  }, [startWriting, stopWriting]);

  // 폼 데이터 변경 감지
  useEffect(() => {
    const hasChanges = Object.values(formData).some(value => 
      value && value.toString().trim() !== ''
    ) || images.length > 0;
    setHasUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges);
  }, [formData, images, setUnsavedChanges]);

  // 브라우저 뒤로가기/앞으로가기 감지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    // 브라우저 뒤로가기/앞으로가기 감지
    const handlePopState = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        setPendingNavigation('/marketplace'); // 기본적으로 마켓플레이스로 이동
        setShowWarningModal(true);
        // 히스토리 상태를 다시 추가하여 뒤로가기 방지
        window.history.pushState(null, '', window.location.pathname);
      }
    };

    // 임시저장 이벤트 처리
    const handleSaveDraftEvent = async () => {
      try {
        await handleSaveDraft();
      } catch (error) {
        console.error('임시저장 실패:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('saveDraft', handleSaveDraftEvent);
    
    // 페이지 로드 시 히스토리 상태 추가
    window.history.pushState(null, '', window.location.pathname);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('saveDraft', handleSaveDraftEvent);
    };
  }, [hasUnsavedChanges]);

  // 수정 모드일 때 기존 데이터 불러오기
  useEffect(() => {
    if (isEdit) {
      // id 타입을 문자열로 변환해서 비교
      const found = mockMyBooks.find(book => String(book.id) === String(id));
      if (found) {
        setFormData({
          bookType: found.bookType || 'official',
          title: found.title || '',
          isbn: found.isbn || '',
          author: found.author || '',
          mainCategory: found.mainCategory || '',
          subCategory: found.subCategory || '',
          detailCategory: found.detailCategory || '',
          writingCondition: found.writingCondition || '',
          tearCondition: found.tearCondition || '',
          waterCondition: found.waterCondition || '',
          originalPrice: found.originalPrice || '',
          price: found.price || '',
          description: found.description || ''
        });
      }
    }
  }, [id, isEdit]);

  // 할인율 계산 함수
  const calculateDiscountRate = () => {
    let totalDiscount = 0;
    
    // 필기 상태 (15% 가중치)
    if (formData.writingCondition === '상') totalDiscount += 0.15 * 0.15;
    else if (formData.writingCondition === '중') totalDiscount += 0.15 * 0.35;
    else if (formData.writingCondition === '하') totalDiscount += 0.15 * 0.55;
    
    // 찢어짐 정도 (35% 가중치)
    if (formData.tearCondition === '상') totalDiscount += 0.35 * 0.15;
    else if (formData.tearCondition === '중') totalDiscount += 0.35 * 0.35;
    else if (formData.tearCondition === '하') totalDiscount += 0.35 * 0.55;
    
    // 물흘림 정도 (50% 가중치)
    if (formData.waterCondition === '상') totalDiscount += 0.5 * 0.15;
    else if (formData.waterCondition === '중') totalDiscount += 0.5 * 0.35;
    else if (formData.waterCondition === '하') totalDiscount += 0.5 * 0.55;
    
    // 중고책 기본 할인 10% 추가
    totalDiscount += 0.1;
    
    return Math.round(totalDiscount * 100);
  };

  // 추천 가격 계산
  // 현재는 책 상태(필기, 찢어짐, 물흘림)를 기준으로 할인율을 계산하여 추천 가격을 산정합니다.
  // 
  // 할인율 계산 기준:
  // - 필기 상태: 없음(0%) ~ 많음(15%)
  // - 찢어짐 정도: 없음(0%) ~ 심함(10%)
  // - 물흘림 정도: 없음(0%) ~ 심함(10%)
  // - 최대 할인율: 35%
  //
  // TODO: 실제 구현 시에는 시장 가격 데이터베이스나 
  // 유사 책의 거래 이력을 참고하여 더 정확한 추천 가격을 제공해야 합니다.
  const getRecommendedPrice = () => {
    if (!formData.originalPrice) return null;
    const discountRate = calculateDiscountRate();
    const originalPrice = parseInt(formData.originalPrice);
    const recommendedPrice = Math.round(originalPrice * (1 - discountRate / 100));
    return { discountRate, recommendedPrice };
  };

  // 원가 변경 시 추천 가격 자동 계산
  const handleOriginalPriceChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({ ...prev, originalPrice: value }));
    
    // 추천 가격 자동 설정 제거 - 사용자가 직접 입력하도록 함
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // 에러 메시지 제거
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (images.length + files.length > 3) {
      alert('최대 3개까지만 업로드 가능합니다.');
      return;
    }
    
    const newImages = files.map(file => ({
      id: Date.now() + Math.random(),
      file,
      preview: URL.createObjectURL(file)
    }));
    
    setImages(prev => [...prev, ...newImages]);
  };

  const handleRemoveImage = (imageId) => {
    setImages(prev => {
      const imageToRemove = prev.find(img => img.id === imageId);
      if (imageToRemove) {
        URL.revokeObjectURL(imageToRemove.preview);
      }
      return prev.filter(img => img.id !== imageId);
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim() && !formData.isbn.trim()) {
      newErrors.title = '책 제목 또는 ISBN을 입력해주세요';
    }

    if (!formData.author.trim()) {
      newErrors.author = '저자를 입력해주세요';
    }

    if (!formData.mainCategory) {
      newErrors.mainCategory = '대분류를 선택해주세요';
    }

    if (!formData.writingCondition) {
      newErrors.writingCondition = '필기 상태를 선택해주세요';
    }

    if (!formData.tearCondition) {
      newErrors.tearCondition = '찢어짐 정도를 선택해주세요';
    }

    if (!formData.waterCondition) {
      newErrors.waterCondition = '물흘림 정도를 선택해주세요';
    }

    if (!formData.originalPrice || parseInt(formData.originalPrice) <= 0) {
      newErrors.originalPrice = '원가를 입력해주세요';
    }

    if (!formData.price || parseInt(formData.price) <= 0) {
      newErrors.price = '희망 가격을 입력해주세요';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (isEdit) {
        alert('책이 성공적으로 수정되었습니다!');
        stopWriting();
        navigate('/mybookstore');
      } else {
        alert('책이 성공적으로 등록되었습니다!');
        stopWriting();
        navigate('/marketplace');
      }
    } catch (error) {
      console.error(isEdit ? '수정 실패:' : '등록 실패:', error);
      alert(isEdit ? '수정에 실패했습니다. 다시 시도해주세요.' : '등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      alert('임시저장되었습니다!');
      stopWriting(); // 글쓰기 종료
    } catch (error) {
      console.error('임시저장 실패:', error);
      alert('임시저장에 실패했습니다.');
    }
  };

  // 안전한 네비게이션 함수
  const safeNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowWarningModal(true);
    } else {
      navigate(path);
    }
  };

  // 경고 모달에서 나가기 선택
  const handleConfirmExit = () => {
    setShowWarningModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    } else {
      // pendingNavigation이 없으면 기본적으로 마켓플레이스로 이동
      navigate('/marketplace');
    }
  };

  // 경고 모달에서 취소 선택
  const handleCancelExit = () => {
    setShowWarningModal(false);
    setPendingNavigation(null);
  };

  // 임시저장 후 나가기
  const handleSaveDraftAndExit = async () => {
    try {
      await handleSaveDraft();
      setShowWarningModal(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      } else {
        // pendingNavigation이 없으면 기본적으로 마켓플레이스로 이동
        navigate('/marketplace');
      }
    } catch (error) {
      console.error('임시저장 실패:', error);
      // 임시저장 실패 시에도 나가기
      setShowWarningModal(false);
      if (pendingNavigation) {
        navigate(pendingNavigation);
        setPendingNavigation(null);
      } else {
        // pendingNavigation이 없으면 기본적으로 마켓플레이스로 이동
        navigate('/marketplace');
      }
    }
  };

  const handleCancel = () => {
    safeNavigate('/marketplace');
  };

  // 책 검색 함수
  const handleBookSearch = async () => {
    if (!searchQuery.trim()) return;
    
    // 임시 검색 결과 (실제로는 API 호출)
    const mockResults = [
      {
        isbn: '9788966262472',
        title: '자바의 정석',
        author: '남궁성',
        publisher: '도우출판',
        publishedDate: '2016-01-15'
      },
      {
        isbn: '9788994492032',
        title: '자바의 정석 (기초편)',
        author: '남궁성',
        publisher: '도우출판',
        publishedDate: '2015-03-20'
      },
      {
        isbn: '9788966262489',
        title: '자바의 정석 (고급편)',
        author: '남궁성',
        publisher: '도우출판',
        publishedDate: '2016-02-10'
      }
    ].filter(book => 
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.isbn.includes(searchQuery)
    );
    
    setSearchResults(mockResults);
  };

  // 책 선택 함수
  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setFormData(prev => ({
      ...prev,
      title: book.title,
      isbn: book.isbn,
      author: book.author
    }));
  };

  // 책 검색 모달 닫기
  const handleCloseBookSearch = () => {
    setShowBookSearch(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 책 검색 모달 열기
  const handleOpenBookSearch = () => {
    setShowBookSearch(true);
  };

  console.log('BookWrite 컴포넌트 렌더링 완료');

  const recommended = getRecommendedPrice();

  return (
    <>
      <div className="header-spacer" />
      <WriteContainer>
        <WriteHeader>
          <BackButton onClick={handleCancel}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>
          <WriteTitle>{isEdit ? '책 판매 수정' : '책 판매 등록'}</WriteTitle>
        </WriteHeader>

        <WriteForm onSubmit={handleSubmit}>
          {/* 1. 책 종류 */}
          <FormSection>
            <SectionTitle>
              <FaBook /> 책 종류
            </SectionTitle>
            <SwitchContainer>
              <SwitchLabel>책 종류:</SwitchLabel>
              <SwitchButton
                type="button"
                className={formData.bookType === 'official' ? 'active' : ''}
                onClick={() => setFormData(prev => ({ ...prev, bookType: 'official' }))}
              >
                정식 도서
              </SwitchButton>
              <SwitchButton
                type="button"
                className={formData.bookType === 'printed' ? 'active' : ''}
                onClick={() => setFormData(prev => ({ ...prev, bookType: 'printed' }))}
              >
                제본
              </SwitchButton>
            </SwitchContainer>
          </FormSection>

          {/* 2. 책 제목 또는 ISBN */}
          <FormSection>
            <SectionTitle>책 정보</SectionTitle>
            
            <InputTypeSelector>
              <Label>입력 방식 선택 <Required>*</Required></Label>
              <InputTypeButtons>
                <InputTypeButton
                  type="button"
                  active={inputType === 'title'}
                  onClick={() => setInputType('title')}
                >
                  책 제목으로 입력
                </InputTypeButton>
                <InputTypeButton
                  type="button"
                  active={inputType === 'isbn'}
                  onClick={() => setInputType('isbn')}
                >
                  ISBN으로 검색
                </InputTypeButton>
              </InputTypeButtons>
            </InputTypeSelector>

            {inputType === 'title' ? (
              <FormGroup>
                <Label>
                  책 제목 <Required>*</Required>
                </Label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="책 제목을 입력해주세요"
                />
                {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
              </FormGroup>
            ) : (
              <FormGroup>
                <Label>
                  ISBN 검색 <Required>*</Required>
                </Label>
                {selectedBook ? (
                  <SelectedBookDisplay>
                    <BookTitle>{selectedBook.title}</BookTitle>
                    <BookInfo>
                      저자: {selectedBook.author} | 출판사: {selectedBook.publisher} | ISBN: {selectedBook.isbn}
                    </BookInfo>
                    <button
                      type="button"
                      onClick={() => setSelectedBook(null)}
                      style={{
                        marginTop: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        background: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        cursor: 'pointer'
                      }}
                    >
                      다시 선택
                    </button>
                  </SelectedBookDisplay>
                ) : (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input
                      type="text"
                      placeholder="ISBN 또는 책 제목으로 검색"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button
                      type="button"
                      onClick={handleOpenBookSearch}
                      style={{
                        padding: '0.75rem 1rem',
                        background: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaSearch />
                    </button>
                  </div>
                )}
                {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
              </FormGroup>
            )}

            <FormGroup>
              <Label>
                저자명 <Required>*</Required>
              </Label>
              <Input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleInputChange}
                placeholder="저자명을 입력해주세요"
              />
              {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
            </FormGroup>
          </FormSection>

          {/* 3. 사진 등록 */}
          <FormSection>
            <SectionTitle>
              <FaCamera /> 사진 등록
            </SectionTitle>
            
            <ImageSection>
              {images.length < 3 && (
                <ImageUploadArea onClick={() => document.getElementById('imageInput').click()}>
                  <ImageUploadIcon>
                    <FaImage />
                  </ImageUploadIcon>
                  <ImageUploadText>클릭하여 사진을 업로드하세요 (최대 3개)</ImageUploadText>
                  <ImageUploadButton type="button">
                    사진 선택
                  </ImageUploadButton>
                </ImageUploadArea>
              )}
              
              <input
                id="imageInput"
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
              
              {images.length > 0 && (
                <ImagePreview>
                  {images.map(image => (
                    <ImagePreviewItem key={image.id}>
                      <ImagePreviewImg src={image.preview} alt="책 사진" />
                      <RemoveImageButton onClick={() => handleRemoveImage(image.id)}>
                        <FaTimes />
                      </RemoveImageButton>
                    </ImagePreviewItem>
                  ))}
                </ImagePreview>
              )}
            </ImageSection>
          </FormSection>

          {/* 4. 카테고리 */}
          <FormSection>
            <SectionTitle>카테고리</SectionTitle>
            
            <FormGroup>
              <Label>
                대분류 <Required>*</Required>
              </Label>
              <Select
                name="mainCategory"
                value={formData.mainCategory}
                onChange={handleInputChange}
              >
                <option value="">대분류를 선택해주세요</option>
                {Object.keys(CATEGORIES).map(mainCategory => (
                  <option key={mainCategory} value={mainCategory}>{mainCategory}</option>
                ))}
              </Select>
              {errors.mainCategory && <ErrorMessage>{errors.mainCategory}</ErrorMessage>}
            </FormGroup>

            {formData.mainCategory && (
              <FormGroup>
                <Label>중분류</Label>
                <Select
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleInputChange}
                >
                  <option value="">중분류를 선택해주세요</option>
                  {Object.keys(CATEGORIES[formData.mainCategory]).map(subCategory => (
                    <option key={subCategory} value={subCategory}>{subCategory}</option>
                  ))}
                </Select>
              </FormGroup>
            )}

            {formData.mainCategory && formData.subCategory && (
              <FormGroup>
                <Label>소분류</Label>
                <Select
                  name="detailCategory"
                  value={formData.detailCategory}
                  onChange={handleInputChange}
                >
                  <option value="">소분류를 선택해주세요</option>
                  {CATEGORIES[formData.mainCategory][formData.subCategory]?.map(detailCategory => (
                    <option key={detailCategory} value={detailCategory}>{detailCategory}</option>
                  ))}
                </Select>
              </FormGroup>
            )}
          </FormSection>

          {/* 5. 책 상태 */}
          <FormSection>
            <SectionTitle>책 상태</SectionTitle>
            
            <FormGroup>
              <Label>
                필기 상태 <Required>*</Required>
              </Label>
              <ToggleContainer>
                <ToggleOption>
                  <input
                    type="radio"
                    name="writingCondition"
                    value="상"
                    checked={formData.writingCondition === '상'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>상 (깨끗함)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="writingCondition"
                    value="중"
                    checked={formData.writingCondition === '중'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>중 (약간 필기)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="writingCondition"
                    value="하"
                    checked={formData.writingCondition === '하'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>하 (많이 필기)</ToggleText>
                </ToggleOption>
              </ToggleContainer>
              {errors.writingCondition && <ErrorMessage>{errors.writingCondition}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                찢어짐 정도 <Required>*</Required>
              </Label>
              <ToggleContainer>
                <ToggleOption>
                  <input
                    type="radio"
                    name="tearCondition"
                    value="상"
                    checked={formData.tearCondition === '상'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>상 (깨끗함)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="tearCondition"
                    value="중"
                    checked={formData.tearCondition === '중'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>중 (약간 찢어짐)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="tearCondition"
                    value="하"
                    checked={formData.tearCondition === '하'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>하 (많이 찢어짐)</ToggleText>
                </ToggleOption>
              </ToggleContainer>
              {errors.tearCondition && <ErrorMessage>{errors.tearCondition}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                물기 상태 <Required>*</Required>
              </Label>
              <ToggleContainer>
                <ToggleOption>
                  <input
                    type="radio"
                    name="waterCondition"
                    value="상"
                    checked={formData.waterCondition === '상'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>상 (깨끗함)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="waterCondition"
                    value="중"
                    checked={formData.waterCondition === '중'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>중 (약간 물기)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="waterCondition"
                    value="하"
                    checked={formData.waterCondition === '하'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>하 (많이 물기)</ToggleText>
                </ToggleOption>
              </ToggleContainer>
              {errors.waterCondition && <ErrorMessage>{errors.waterCondition}</ErrorMessage>}
            </FormGroup>
          </FormSection>

          {/* 6. 가격 정보 */}
          <FormSection>
            <SectionTitle>
              <FaMoneyBillWave /> 가격 정보
            </SectionTitle>
            
            <FormGroup>
              <Label>
                원가 <Required>*</Required>
              </Label>
              <Input
                type="number"
                name="originalPrice"
                value={formData.originalPrice}
                onChange={handleOriginalPriceChange}
                placeholder="원가를 입력해주세요"
                min="0"
              />
              {errors.originalPrice && <ErrorMessage>{errors.originalPrice}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>
                판매가 <Required>*</Required>
              </Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="판매가를 입력해주세요"
                min="0"
              />
              {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
              
              {formData.originalPrice && recommended && (
                <DiscountInfo>
                  할인율: {recommended.discountRate}%
                  ({(formData.originalPrice - recommended.recommendedPrice).toLocaleString()}원 할인)
                  <br />
                  추천가: <b>{recommended.recommendedPrice.toLocaleString()}원</b>
                  <RecommendButton
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, price: recommended.recommendedPrice }))}
                  >
                    추천 가격으로 입력
                  </RecommendButton>
                  <InfoButton type="button" onClick={() => setShowInfoModal(true)} title="추천 거래 가격 산정 기준 안내">
                    <FaInfoCircle />
                  </InfoButton>
                </DiscountInfo>
              )}
            </FormGroup>
          </FormSection>

          {/* 7. 상세 설명 */}
          <FormSection>
            <SectionTitle>상세 설명</SectionTitle>
            
            <FormGroup>
              <Label>상세 설명</Label>
              <TextArea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="책에 대한 상세한 설명을 입력해주세요 (선택사항)"
              />
            </FormGroup>
          </FormSection>

          {/* 버튼 영역 */}
          <ButtonSection>
            <ButtonGroup>
              <CancelButton type="button" onClick={handleCancel}>
                취소
              </CancelButton>
              <SaveDraftButton type="button" onClick={handleSaveDraft}>
                <FaSave /> 임시저장
              </SaveDraftButton>
              <SubmitButton type="submit" disabled={loading}>
                {loading ? (isEdit ? '수정 중...' : '등록 중...') : (isEdit ? '수정하기' : '등록하기')}
              </SubmitButton>
            </ButtonGroup>
          </ButtonSection>
        </WriteForm>
      </WriteContainer>

      {/* 책 검색 모달 */}
      {showBookSearch && (
        <BookSearchModal>
          <BookSearchContent>
            <h3>책 검색</h3>
            <SearchInput
              type="text"
              placeholder="ISBN 또는 책 제목으로 검색하세요"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleBookSearch()}
            />
            <button
              onClick={handleBookSearch}
              style={{
                padding: '0.5rem 1rem',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginBottom: '1rem'
              }}
            >
              검색
            </button>
            
            {searchResults.length > 0 && (
              <BookList>
                {searchResults.map((book, index) => (
                  <BookItem
                    key={index}
                    onClick={() => handleBookSelect(book)}
                    className={selectedBook?.isbn === book.isbn ? 'selected' : ''}
                  >
                    <BookTitle>{book.title}</BookTitle>
                    <BookInfo>
                      저자: {book.author} | 출판사: {book.publisher} | ISBN: {book.isbn}
                    </BookInfo>
                  </BookItem>
                ))}
              </BookList>
            )}
            
            <ModalButtons>
              <ModalButton
                type="button"
                className="secondary"
                onClick={handleCloseBookSearch}
              >
                취소
              </ModalButton>
              <ModalButton
                type="button"
                className="primary"
                onClick={() => {
                  if (selectedBook) {
                    handleCloseBookSearch();
                  }
                }}
                disabled={!selectedBook}
              >
                선택 완료
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
        showSaveDraft={true}
      />

      {/* 정보 모달 */}
      {showInfoModal && (
        <InfoModalOverlay onClick={() => setShowInfoModal(false)}>
          <InfoModalContent onClick={e => e.stopPropagation()}>
            <h3>📚 추천 거래 가격 산정 기준표</h3>
            <InfoDescription>
              <p>원가 대비 최대 할인율을 기준으로 추천 가격을 계산합니다.</p>
              <p>각 항목별 할인율이 누적되어 적용됩니다.</p>
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
                <li>각 항목의 상태는 '상/중/하'로 평가됩니다</li>
                <li>할인율은 원가에서 차감되어 추천가가 계산됩니다</li>
                <li>실제 판매가는 자유롭게 설정 가능합니다</li>
              </ul>
            </InfoNote>
            <InfoModalClose onClick={() => setShowInfoModal(false)}>확인</InfoModalClose>
          </InfoModalContent>
        </InfoModalOverlay>
      )}
    </>
  );
};

export default BookWrite; 