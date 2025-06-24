import React, { useState } from 'react';
import styled from 'styled-components';
import { FaBook, FaGraduationCap, FaTag, FaMoneyBillWave, FaSave, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const WriteContainer = styled.div`
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

const WriteHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 15px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #5a6268;
  }
`;

const WriteTitle = styled.h1`
  font-size: 2rem;
  color: #333;
`;

const WriteForm = styled.form`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 30px;
  width: 100%;
  box-sizing: border-box;
  @media (max-width: 600px) {
    padding: 10px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 25px;
`;

const SectionTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
`;

const Required = styled.span`
  color: #dc3545;
  margin-left: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  background: white;
  transition: border-color 0.3s;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 150px;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 5px;
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

const TagSection = styled.div`
  margin-bottom: 20px;
`;

const TagInput = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const TagInputField = styled.input`
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 0.9rem;
`;

const AddTagButton = styled.button`
  padding: 8px 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #218838;
  }
`;

const TagsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const TagItem = styled.span`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  background: #e9ecef;
  color: #495057;
  border-radius: 15px;
  font-size: 0.9rem;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  margin-left: 5px;

  &:hover {
    color: #c82333;
  }
`;

const PriceRangeSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 15px;
  justify-content: flex-end;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
`;

const CancelButton = styled.button`
  padding: 12px 24px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;

  &:hover {
    background: #5a6268;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;
  transition: background 0.3s;

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
  font-size: 0.9rem;
  margin-top: 5px;
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

const WantedWrite = () => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    condition: '',
    price: '',
    mainCategory: '',
    subCategory: '',
    detailCategory: '',
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMajorChange = (e) => {
    const mainCategory = e.target.value;
    const firstSub = Object.keys(CATEGORIES[mainCategory])[0];
    const firstDetail = CATEGORIES[mainCategory][firstSub][0];
    setFormData(prev => ({
      ...prev,
      mainCategory,
      subCategory: firstSub,
      detailCategory: firstDetail
    }));
  };
  const handleSubChange = (e) => {
    const subCategory = e.target.value;
    const firstDetail = CATEGORIES[formData.mainCategory][subCategory][0];
    setFormData(prev => ({
      ...prev,
      subCategory,
      detailCategory: firstDetail
    }));
  };
  const handleDetailChange = (e) => {
    setFormData(prev => ({ ...prev, detailCategory: e.target.value }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
    if (!formData.author.trim()) newErrors.author = '저자를 입력해주세요';
    if (!formData.condition) newErrors.condition = '상태를 선택해주세요';
    if (!formData.price || parseInt(formData.price) <= 0) newErrors.price = '희망 가격을 입력해주세요';
    if (!formData.mainCategory || !formData.subCategory || !formData.detailCategory) newErrors.category = '카테고리를 선택해주세요';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // 실제로는 API 호출
    alert('구해요 글이 등록되었습니다!');
    navigate('/wanted');
  };

  const handleCancel = () => {
    navigate('/wanted');
  };

  return (
    <>
      <div className="header-spacer" />
      <WriteContainer>
        <WriteHeader>
          <BackButton onClick={handleCancel}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>
          <WriteTitle>구해요 글 작성</WriteTitle>
        </WriteHeader>
        <WriteForm onSubmit={handleSubmit}>
          <FormSection>
            <SectionTitle>
              <FaBook /> 기본 정보
            </SectionTitle>
            <FormGroup>
              <Label>제목 <Required>*</Required></Label>
              <Input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="원하는 책의 제목을 입력해주세요" />
              {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>저자 <Required>*</Required></Label>
              <Input type="text" name="author" value={formData.author} onChange={handleInputChange} placeholder="저자를 입력해주세요" />
              {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>상태 <Required>*</Required></Label>
              <Select name="condition" value={formData.condition} onChange={handleInputChange}>
                <option value="">상태를 선택해주세요</option>
                <option value="상">상</option>
                <option value="중">중</option>
                <option value="하">하</option>
              </Select>
              {errors.condition && <ErrorMessage>{errors.condition}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>희망 가격 <Required>*</Required></Label>
              <Input type="number" name="price" value={formData.price} onChange={handleInputChange} placeholder="희망 가격을 입력해주세요" min="0" />
              {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
            </FormGroup>
            <FormGroup>
              <Label>카테고리 <Required>*</Required></Label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Select value={formData.mainCategory} onChange={handleMajorChange}>
                  <option value="">대분류</option>
                  {Object.keys(CATEGORIES).map(main => (
                    <option key={main} value={main}>{main}</option>
                  ))}
                </Select>
                {formData.mainCategory && (
                  <Select value={formData.subCategory} onChange={handleSubChange}>
                    <option value="">중분류</option>
                    {Object.keys(CATEGORIES[formData.mainCategory]).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </Select>
                )}
                {formData.subCategory && CATEGORIES[formData.mainCategory]?.[formData.subCategory]?.length > 0 && (
                  <Select value={formData.detailCategory} onChange={handleDetailChange}>
                    <option value="">소분류</option>
                    {CATEGORIES[formData.mainCategory][formData.subCategory].map(detail => (
                      <option key={detail} value={detail}>{detail}</option>
                    ))}
                  </Select>
                )}
              </div>
              {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
            </FormGroup>
          </FormSection>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
            <SubmitButton type="submit">등록</SubmitButton>
          </div>
        </WriteForm>
      </WriteContainer>
    </>
  );
};

export default WantedWrite; 