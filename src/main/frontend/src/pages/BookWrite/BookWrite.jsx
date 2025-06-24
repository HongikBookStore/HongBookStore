import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBook, FaCamera, FaSave, FaArrowLeft, FaImage, FaTimes, FaCheck } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    bookType: 'official', // 'official' | 'printed'
    title: '',
    isbn: '',
    author: '',
    mainCategory: '', // 대분류
    subCategory: '', // 중분류
    detailCategory: '', // 소분류
    writingCondition: '', // 필기 상태
    tearCondition: '', // 찢어짐 정도
    waterCondition: '', // 물흘림 정도
    originalPrice: '', // 원가
    price: '', // 희망 가격
    location: 'campus', // 'campus' | 'offcampus'
    negotiable: false
  });
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

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
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('책 등록:', { ...formData, images });
      alert('책이 성공적으로 등록되었습니다!');
      navigate('/bookstore');
    } catch (error) {
      console.error('책 등록 실패:', error);
      alert('책 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('임시저장:', { ...formData, images });
      alert('임시저장되었습니다!');
    } catch (error) {
      console.error('임시저장 실패:', error);
      alert('임시저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 사라집니다. 정말 나가시겠습니까?')) {
      navigate('/bookstore');
    }
  };

  return (
    <>
      <div className="header-spacer" />
      <WriteContainer>
        <WriteHeader>
          <BackButton onClick={handleCancel}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>
          <WriteTitle>책 판매 등록</WriteTitle>
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
            
            <FormGroup>
              <Label>
                책 제목 또는 ISBN <Required>*</Required>
              </Label>
              <Input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="책 제목 또는 ISBN을 입력해주세요"
              />
              <HelpText>책 제목 또는 ISBN 중 하나를 입력해주세요</HelpText>
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>

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
                물흘림 정도 <Required>*</Required>
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
                  <ToggleText>중 (약간 물흘림)</ToggleText>
                </ToggleOption>
                <ToggleOption>
                  <input
                    type="radio"
                    name="waterCondition"
                    value="하"
                    checked={formData.waterCondition === '하'}
                    onChange={handleInputChange}
                  />
                  <ToggleText>하 (많이 물흘림)</ToggleText>
                </ToggleOption>
              </ToggleContainer>
              {errors.waterCondition && <ErrorMessage>{errors.waterCondition}</ErrorMessage>}
            </FormGroup>
          </FormSection>

          {/* 6. 거래 희망 가격 */}
          <FormSection>
            <SectionTitle>거래 정보</SectionTitle>
            
            <FormGroup>
              <Label>
                원가 <Required>*</Required>
              </Label>
              <OriginalPriceInput
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
                희망 가격 <Required>*</Required>
              </Label>
              <Input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="희망 가격을 입력해주세요"
                min="0"
              />
              {formData.originalPrice && formData.writingCondition && formData.tearCondition && formData.waterCondition && (
                <PriceRecommendation>
                  <RecommendationText>
                    📊 상태 기반 가격 추천:
                  </RecommendationText>
                  <DiscountText>
                    {getRecommendedPrice()?.discountRate}% 할인 적용 → {getRecommendedPrice()?.recommendedPrice?.toLocaleString()}원 추천
                  </DiscountText>
                </PriceRecommendation>
              )}
              {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
            </FormGroup>

            {/* 7. 거래 지역 */}
            <FormGroup>
              <Label>거래 지역</Label>
              <SwitchContainer>
                <SwitchLabel>거래 지역:</SwitchLabel>
                <SwitchButton
                  type="button"
                  className={formData.location === 'campus' ? 'active' : ''}
                  onClick={() => setFormData(prev => ({ ...prev, location: 'campus' }))}
                >
                  교내
                </SwitchButton>
                <SwitchButton
                  type="button"
                  className={formData.location === 'offcampus' ? 'active' : ''}
                  onClick={() => setFormData(prev => ({ ...prev, location: 'offcampus' }))}
                >
                  교외
                </SwitchButton>
              </SwitchContainer>
            </FormGroup>

            {/* 8. 네고 여부 */}
            <FormGroup>
              <Label>가격 협의</Label>
              <SwitchContainer>
                <SwitchLabel>가격 협의:</SwitchLabel>
                <SwitchButton
                  type="button"
                  className={formData.negotiable ? 'active' : ''}
                  onClick={() => setFormData(prev => ({ ...prev, negotiable: !prev.negotiable }))}
                >
                  {formData.negotiable ? '가능' : '불가능'}
                </SwitchButton>
              </SwitchContainer>
            </FormGroup>
          </FormSection>

          <ButtonGroup>
            <CancelButton type="button" onClick={handleCancel}>
              취소
            </CancelButton>
            <SaveButton type="button" onClick={handleSaveDraft} disabled={loading}>
              <FaSave />
              임시저장
            </SaveButton>
            <SubmitButton type="submit" disabled={loading}>
              <FaCheck />
              {loading ? '등록 중...' : '책 등록하기'}
            </SubmitButton>
          </ButtonGroup>
        </WriteForm>
      </WriteContainer>
    </>
  );
};

export default BookWrite; 