// src/pages/Wanted/WantedWrite.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import WarningModal from '../../components/WarningModal/WarningModal';
import { useWriting } from '../../contexts/WritingContext';

/* =========================
   헬퍼: userId 보장하기
   ========================= */
// JWT payload 파싱
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// localStorage에 userId가 없으면 JWT에서 복구하거나(없으면 프롬프트) 저장
async function ensureUserId() {
  let uid = localStorage.getItem('userId');
  if (uid) return uid;

  const token = localStorage.getItem('accessToken');
  if (token) {
    const payload = parseJwt(token);
    if (payload) {
      uid = String(
          payload.userId ?? payload.id ?? payload.user_id ?? payload.uid ?? payload.sub ?? ''
      );
      if (uid && uid !== 'undefined' && uid !== 'null') {
        localStorage.setItem('userId', uid);
        if (payload.nickname) localStorage.setItem('nickname', payload.nickname);
        return uid;
      }
    }
  }

  // 개발/테스트 편의용(운영 배포 시 제거 권장)
  const typed = window.prompt('userId가 없습니다. 테스트용 userId를 입력하세요', '1');
  if (typed) {
    localStorage.setItem('userId', typed);
    return typed;
  }
  return null;
}

// 인증 헤더
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// 공백 구분된 ISBN에서 우선순위 선택
const pickIsbn = (raw) => {
  const tokens = String(raw || '')
      .split(/\s+/)
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => t.replace(/[^\dXx]/g, ''));
  const isbn13 = tokens.find((t) => /^\d{13}$/.test(t));
  const isbn10 = tokens.find((t) => /^\d{9}[\dXx]$/.test(t));
  return isbn13 || isbn10 || tokens[0] || '';
};

// 카카오/알라딘 등 포맷을 표준 구조로
const toBookArray = (data) => {
  if (!data) return [];
  if (Array.isArray(data.documents)) return data.documents;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.results)) return data.results;
  if (Array.isArray(data)) return data;
  return [];
};
const normalizeBook = (doc) => ({
  title: doc?.title ?? '',
  author: Array.isArray(doc?.authors) ? doc.authors.filter(Boolean).join(', ') : (doc?.author ?? ''),
  publisher: doc?.publisher ?? '',
  isbn: pickIsbn(doc?.isbn),
  thumbnail: doc?.thumbnail ?? '',
});

/* -------------------- styled -------------------- */
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
  display: flex; align-items: center; gap: 15px; margin-bottom: 30px;
`;
const BackButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 10px 15px;
  background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.9rem;
  transition: background 0.3s;
  &:hover { background: #5a6268; }
`;
const WriteTitle = styled.h1` font-size: 2rem; color: #333; `;
const WriteForm = styled.form`
  background: white; border: 1px solid #e0e0e0; border-radius: 10px; padding: 30px; width: 100%; box-sizing: border-box;
  @media (max-width: 600px){ padding: 10px; }
`;
const FormSection = styled.div` margin-bottom: 25px; `;
const SectionTitle = styled.h3`
  display: flex; align-items: center; gap: 8px; font-size: 1.2rem; color: #333; margin-bottom: 15px;
`;
const FormGroup = styled.div` margin-bottom: 20px; `;
const Label = styled.label` display: block; font-weight: 600; color: #555; margin-bottom: 8px; `;
const Required = styled.span` color: #dc3545; margin-left: 5px; `;
const Input = styled.input`
  width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; outline: none; transition: border-color 0.3s; box-sizing: border-box;
  &:focus { border-color: #007bff; }
`;
const Select = styled.select`
  width: 100%; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; outline: none; background: white; transition: border-color 0.3s; box-sizing: border-box;
  &:focus { border-color: #007bff; }
`;
const TextArea = styled.textarea`
  width: 100%; min-height: 150px; padding: 12px 15px; border: 1px solid #ddd; border-radius: 5px; font-size: 1rem; outline: none; resize: vertical; font-family: inherit; transition: border-color 0.3s; box-sizing: border-box;
  &:focus { border-color: #007bff; }
`;
const ErrorMessage = styled.div` color: #dc3545; font-size: 0.9rem; margin-top: 5px; `;
const CancelButton = styled.button`
  padding: 12px 24px; background: #6c757d; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;
  transition: background 0.3s; &:hover { background: #5a6268; }
`;
const SubmitButton = styled.button`
  display: flex; align-items: center; gap: 8px; padding: 12px 24px; background: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 1rem;
  transition: background 0.3s;
  &:hover { background: #0056b3; }
  &:disabled { background: #ccc; cursor: not-allowed; }
`;
const InputTypeSelector = styled.div` margin-bottom: 1rem; `;
const InputTypeButtons = styled.div` display: flex; gap: 1rem; margin-bottom: 1rem; `;
const InputTypeButton = styled.button`
  padding: 0.75rem 1.5rem;
  border: 2px solid ${props => props.$active ? '#007bff' : '#ddd'};
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; transition: all 0.2s;
  &:hover { border-color: #007bff; background: ${props => props.$active ? '#0056b3' : '#f8f9ff'}; }
`;

/* --- 검색 모달 스타일 --- */
const BookSearchModal = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const BookSearchContent = styled.div`
  background: white; border-radius: 12px; padding: 2rem; width: 90%; max-width: 640px; max-height: 80vh; overflow-y: auto;
`;
const SearchInput = styled.input`
  width: 100%; padding: 1rem; border: 2px solid #ddd; border-radius: 8px; font-size: 1rem; margin-bottom: 0.75rem;
  &:focus{ outline: none; border-color: #007bff; }
`;
const BookList = styled.div` max-height: 420px; overflow-y: auto; `;
const BookItem = styled.div`
  display:flex; gap:12px; align-items:flex-start;
  padding: 0.9rem; border: 1px solid #ddd; border-radius: 10px; margin-bottom: 0.5rem; cursor: pointer; transition: all .2s;
  &:hover { border-color: #007bff; background: #f8f9ff; }
`;
const BookTitle = styled.div` font-weight: 700; font-size: 1.05rem; margin-bottom: 0.15rem; `;
const BookInfo = styled.div` color: #666; font-size: 0.9rem; `;
const ModalButtons = styled.div` display:flex; gap: 0.5rem; justify-content:flex-end; margin-top: 1rem; `;
const ModalButton = styled.button`
  padding: 0.6rem 1rem; border: none; border-radius: 8px; font-weight: 700; cursor: pointer;
  &.secondary { background:#6c757d; color:#fff; } &.secondary:hover{ background:#5a6268; }
`;
const SelectedBookDisplay = styled.div`
  padding: 1rem; background: #f8f9fa; border: 2px solid #007bff; border-radius: 8px; margin-bottom: 1rem;
`;

/* -------------------- 카테고리 -------------------- */
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

export default function WantedWrite() {
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',            // 검색으로 채움(현재 API 전송 X)
    author: '',
    condition: '',
    price: '',
    mainCategory: '',
    subCategory: '',
    detailCategory: '',
    content: '',         // ✅ 본문
  });
  const [errors, setErrors] = useState({});
  const [inputType, setInputType] = useState('title'); // 'title' | 'search'
  const [showBookSearch, setShowBookSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [showWarningModal, setShowWarningModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();
  const { startWriting, stopWriting, setUnsavedChanges } = useWriting();
  const { id } = useParams();
  const isEdit = Boolean(id);

  useEffect(() => {
    startWriting('wanted');
    return () => { stopWriting(); };
  }, [startWriting, stopWriting]);

  useEffect(() => {
    const hasChanges = Object.values(formData).some(v => v && v.toString().trim() !== '');
    setHasUnsavedChanges(hasChanges);
    setUnsavedChanges(hasChanges);
  }, [formData, setUnsavedChanges]);

  useEffect(() => {
    const beforeUnload = (e) => { if (hasUnsavedChanges) { e.preventDefault(); e.returnValue = ''; } };
    const onPop = () => {
      if (hasUnsavedChanges) {
        setPendingNavigation('/wanted');
        setShowWarningModal(true);
        window.history.pushState(null, '', window.location.pathname);
      }
    };
    window.addEventListener('beforeunload', beforeUnload);
    window.addEventListener('popstate', onPop);
    window.history.pushState(null, '', window.location.pathname);
    return () => {
      window.removeEventListener('beforeunload', beforeUnload);
      window.removeEventListener('popstate', onPop);
    };
  }, [hasUnsavedChanges]);

  // 수정 모드: 기존 데이터 가져오기(필요 시)
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetch(`/api/wanted/${id}`);
        if (!res.ok) throw new Error('상세 불러오기 실패');
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json() : null;
        const detail = json?.data || json || {};

        // 카테고리 역매핑
        let mainCategory = detail.category || '';
        if (!mainCategory) mainCategory = detail.department ? '전공' : '교양';
        let subCategory = '';
        let detailCategory = '';
        if (mainCategory === '전공' && detail.department) {
          for (const [sub, list] of Object.entries(CATEGORIES['전공'])) {
            if (list.includes(detail.department)) { subCategory = sub; detailCategory = detail.department; break; }
          }
        }

        setFormData(prev => ({
          ...prev,
          title: detail.title || '',
          isbn: detail.isbn || '',
          author: detail.author || '',
          condition: detail.condition || '',
          price: detail.price != null ? String(detail.price) : '',
          mainCategory,
          subCategory,
          detailCategory,
          content: detail.content || '',
        }));

        // 수정 진입 시 입력 방식은 수동으로(선택 사항)
        setInputType('title');
      } catch (e) {
        console.error(e);
      }
    })();
  }, [isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMajorChange = (e) => {
    const mainCategory = e.target.value;
    const firstSub = mainCategory ? Object.keys(CATEGORIES[mainCategory])[0] : '';
    const firstDetail = mainCategory && firstSub ? CATEGORIES[mainCategory][firstSub][0] : '';
    setFormData(prev => ({ ...prev, mainCategory, subCategory: firstSub || '', detailCategory: firstDetail || '' }));
  };
  const handleSubChange = (e) => {
    const subCategory = e.target.value;
    const firstDetail = formData.mainCategory && subCategory ? CATEGORIES[formData.mainCategory][subCategory][0] : '';
    setFormData(prev => ({ ...prev, subCategory, detailCategory: firstDetail || '' }));
  };
  const handleDetailChange = (e) => { setFormData(prev => ({ ...prev, detailCategory: e.target.value })); };

  /* ---------- 책 검색 로직 (이식) ---------- */
  const openSearch = () => setShowBookSearch(true);
  const closeSearch = () => { setShowBookSearch(false); setSearchQuery(''); setSearchResults([]); setSearchLoading(false); };

  const handleBookSearch = async () => {
    if (!searchQuery.trim()) { alert('검색어를 입력해줘! 🔍'); return; }
    setSearchLoading(true);
    try {
      const res = await axios.get('/api/search/books', {
        params: { query: searchQuery.trim() },
        headers: getAuthHeader()
      });
      const results = toBookArray(res?.data).map(normalizeBook);
      setSearchResults(results);
      if (results.length === 0) alert('검색 결과가 없어! 다른 키워드로 시도해봐 📚');
    } catch (err) {
      console.error('책 검색 실패:', err);
      alert('책 검색 중 오류가 발생했어! 다시 시도해줘 😅');
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookSelect = (book) => {
    setFormData(prev => ({
      ...prev,
      title: book.title || '',
      isbn: book.isbn || '',
      author: book.author || '',
    }));
    closeSearch();
  };

  const validateForm = () => {
    const newErrors = {};

    if (inputType === 'search') {
      if (!formData.title.trim()) newErrors.title = '책을 검색해서 선택해줘! 📚';
      if (!formData.author.trim()) newErrors.author = '저자 정보가 필요해! 📘';
      // isbn은 현재 서버 전송은 안 하지만, 있으면 좋음
    } else {
      if (!formData.title.trim()) newErrors.title = '제목을 입력해주세요';
      if (!formData.author.trim()) newErrors.author = '저자를 입력해주세요';
    }

    if (!formData.condition) newErrors.condition = '상태를 선택해주세요';
    const priceNum = Number(formData.price);
    if (!priceNum || priceNum <= 0) newErrors.price = '희망 가격을 입력해주세요';
    if (!formData.mainCategory || !formData.subCategory || !formData.detailCategory) newErrors.category = '카테고리를 선택해주세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 실제 API 연동: 등록/수정
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    // 이전 에러 초기화
    setErrors({});

    const token = localStorage.getItem('accessToken');
    const userId = await ensureUserId(); // ✅ userId 보장
    if (!userId) { alert('로그인이 필요합니다. (userId가 없습니다)'); return; }

    // ✅ 백엔드 규격에 맞게 전송
    const topCategory = formData.mainCategory || '교양';
    const dept =
        topCategory === '전공'
            ? (formData.detailCategory || formData.subCategory || '').trim()
            : '';

    const basePayload = {
      title: formData.title.trim(),
      author: formData.author.trim(),
      condition: formData.condition,
      price: Number(formData.price),
      category: topCategory,
      content: formData.content?.trim() || ''
      // ⚠️ 서버 준비되면 다음 줄의 주석 해제(현재는 보내지 않음)
      // ,isbn: formData.isbn?.trim() || ''
    };
    const payload = (topCategory === '전공' && dept)
        ? { ...basePayload, department: dept }
        : basePayload;

    try {
      setSubmitting(true);
      const url = isEdit ? `/api/wanted/${id}` : '/api/wanted';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': String(userId),
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const ct = res.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          const json = await res.json().catch(() => null);
          const success = json?.success;
          const message = json?.message || '';
          const data = json?.data || null; // ModerationErrorDTO 가능
          if (res.status === 400 && success === false && data && data.field) {
            const lvl = data.predictionLevel ? ` (${data.predictionLevel}${typeof data.malicious === 'number' ? 
                `, ${Math.round(data.malicious * 100)}%` : ''})` : '';
            const fieldMsg = (message || '부적절한 표현이 감지되었습니다.') + lvl;
            setErrors(prev => ({ ...prev, [data.field]: fieldMsg }));
            // 해당 필드로 포커스 이동(가능한 경우)
            const el = document.querySelector(`[name="${data.field}"]`);
            if (el && typeof el.focus === 'function') el.focus();
            return; // 모더레이션 에러는 알림창 없이 필드 에러로 처리
          }
          // 그 외 JSON 에러 메시지
          throw new Error(message || `요청 실패 (${res.status})`);
        } else {
          const txt = await res.text();
          throw new Error(`요청 실패 (${res.status}) ${txt}`);
        }
      }

      if (!isEdit) { await res.json().catch(() => ({})); }

      stopWriting();
      setUnsavedChanges(false);
      setHasUnsavedChanges(false);
      navigate(isEdit ? '/mybookstore' : '/wanted');
    } catch (err) {
      console.error(err);
      // 이미 필드 에러로 처리된 경우(alert 생략) → errors에 메시지가 들어감
      if (!Object.values(errors).some(Boolean)) {
        alert(isEdit ? '수정 중 오류가 발생했습니다.' : '등록 중 오류가 발생했습니다.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  // 안전 네비게이션
  const safeNavigate = (path) => {
    if (hasUnsavedChanges) {
      setPendingNavigation(path);
      setShowWarningModal(true);
    } else {
      navigate(path);
    }
  };
  const handleConfirmExit = () => {
    setShowWarningModal(false);
    if (pendingNavigation) {
      navigate(pendingNavigation);
      setPendingNavigation(null);
    } else {
      navigate('/wanted');
    }
  };
  const handleCancelExit = () => { setShowWarningModal(false); setPendingNavigation(null); };
  const handleCancel = () => { safeNavigate('/wanted'); };

  return (
      <>
        <div className="header-spacer" />
        <WriteContainer>
          <WriteHeader>
            <BackButton onClick={handleCancel}><FaArrowLeft /> 뒤로가기</BackButton>
            <WriteTitle>구해요 글 작성</WriteTitle>
          </WriteHeader>

          <WriteForm onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle><FaBook /> 기본 정보</SectionTitle>

              <InputTypeSelector>
                <Label>입력 방식 선택 <Required>*</Required></Label>
                <InputTypeButtons>
                  <InputTypeButton
                      type="button"
                      $active={inputType === 'title'}
                      onClick={() => setInputType('title')}
                  >
                    직접 입력(제목/저자)
                  </InputTypeButton>
                  <InputTypeButton
                      type="button"
                      $active={inputType === 'search'}
                      onClick={() => setInputType('search')}
                  >
                    ISBN/제목으로 검색
                  </InputTypeButton>
                </InputTypeButtons>
              </InputTypeSelector>

              {inputType === 'title' ? (
                  <>
                    <FormGroup>
                      <Label>제목 <Required>*</Required></Label>
                      <Input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder="원하는 책의 제목을 입력해주세요"
                      />
                      {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                    </FormGroup>

                    <FormGroup>
                      <Label>저자 <Required>*</Required></Label>
                      <Input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          placeholder="저자를 입력해주세요"
                      />
                      {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
                    </FormGroup>
                  </>
              ) : (
                  <>
                    <FormGroup>
                      <Label>책 검색 <Required>*</Required></Label>
                      <button
                          type="button"
                          onClick={openSearch}
                          style={{
                            padding: '0.75rem 1rem',
                            background: '#007bff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                      >
                        <FaSearch /> 책 검색하기
                      </button>
                    </FormGroup>

                    {formData.title && (
                        <SelectedBookDisplay>
                          <BookTitle>{formData.title}</BookTitle>
                          <BookInfo>
                            저자: {formData.author || '-'} {formData.isbn ? `| ISBN: ${formData.isbn}` : ''}
                          </BookInfo>
                          <button
                              type="button"
                              onClick={() => { setFormData(prev => ({ ...prev, title: '', author: '', isbn: '' })); }}
                              style={{
                                marginTop: '0.5rem',
                                padding: '0.35rem 0.7rem',
                                background: '#dc3545',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                                cursor: 'pointer'
                              }}
                          >
                            다시 선택
                          </button>
                        </SelectedBookDisplay>
                    )}

                    {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                    {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
                  </>
              )}

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
                <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="희망 가격을 입력해주세요"
                    min="0"
                />
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

              {/* ✅ 요청 내용 */}
              <FormGroup>
                <Label>요청 내용</Label>
                <TextArea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder={`예) 교양 수업 과제로 급하게 필요합니다.\n가능하면 밑줄/필기 적은 책이면 좋겠어요.`}
                />
              </FormGroup>
            </FormSection>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <CancelButton type="button" onClick={handleCancel}>취소</CancelButton>
              <SubmitButton type="submit" disabled={submitting}>
                {isEdit ? (submitting ? '수정 중...' : '수정') : (submitting ? '등록 중...' : '등록')}
              </SubmitButton>
            </div>
          </WriteForm>
        </WriteContainer>

        {/* 책 검색 모달 */}
        {showBookSearch && (
            <BookSearchModal>
              <BookSearchContent>
                <h3>📚 책 검색</h3>
                <SearchInput
                    type="text"
                    placeholder="ISBN 또는 책 제목으로 검색하세요"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !searchLoading && handleBookSearch()}
                />
                <button
                    onClick={handleBookSearch}
                    disabled={searchLoading}
                    style={{
                      padding: '0.6rem 1rem',
                      background: '#007bff',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      marginBottom: '0.8rem',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                >
                  <FaSearch /> {searchLoading ? '검색 중...' : '검색'}
                </button>

                <BookList>
                  {(Array.isArray(searchResults) ? searchResults : []).map((book, idx) => (
                      <BookItem key={idx} onClick={() => handleBookSelect(book)}>
                        {book.thumbnail && (
                            <img
                                src={book.thumbnail}
                                alt={book.title}
                                style={{ width: 48, height: 70, objectFit: 'cover', borderRadius: 4 }}
                            />
                        )}
                        <div>
                          <BookTitle>{book.title}</BookTitle>
                          <BookInfo>저자: {book.author || '정보 없음'} | 출판사: {book.publisher || '정보 없음'}</BookInfo>
                          {book.isbn && <BookInfo>ISBN: {book.isbn}</BookInfo>}
                        </div>
                      </BookItem>
                  ))}
                </BookList>

                <ModalButtons>
                  <ModalButton type="button" className="secondary" onClick={closeSearch}>
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
            type="wanted"
            showSaveDraft={false}
        />
      </>
  );
}
