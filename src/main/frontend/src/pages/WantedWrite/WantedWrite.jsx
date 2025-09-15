// src/pages/Wanted/WantedWrite.jsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaBook, FaArrowLeft, FaSearch } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import api from '../../lib/api';
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

// 가격 한도(백엔드와 통일)
const PRICE_MIN = 0;
const PRICE_MAX = 1_000_000_000;
const clampInt = (val, min, max) => {
  if (val === '' || val === null || typeof val === 'undefined') return '';
  let n = Math.floor(Number(val));
  if (!Number.isFinite(n)) return '';
  if (n < min) n = min;
  if (n > max) n = max;
  return String(n);
};

// 카테고리 트리: 서버에서 동적으로 로드 (폴백은 기존 상수)
const mapServerTree = (nodes) => Array.isArray(nodes) ? nodes.map(n => ({ name: n.name, children: mapServerTree(n.children || []) })) : [];

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
const getCategories = (t) => ({
  [t('wantedWrite.category.major')]: {
    [t('categories.major.경영대학')]: [t('departments.경영학부')],
    [t('categories.major.공과대학')]: [t('departments.전자전기공학부'), t('departments.신소재공학전공'), t('departments.화학공학전공'), t('departments.컴퓨터공학과'), t('departments.산업데이터공학과'), t('departments.기계시스템디자인공학과'), t('departments.건설환경공학과')],
    [t('categories.major.법과대학')]: [t('departments.법학부')],
    [t('categories.major.미술대학')]: [t('departments.동양학과'), t('departments.회화과'), t('departments.판화과'), t('departments.조소과'), t('departments.시각디자인전공'), t('departments.산업디자인전공'), t('departments.금속조형디자인과'), t('departments.도예유리과'), t('departments.목조형가구학과'), t('departments.섬유미술패션디자인과'), t('departments.예술학과')],
    [t('categories.major.디자인,예술경영학부')]: [t('departments.디자인경영전공'), t('departments.예술경영전공')],
    [t('categories.major.공연예술학부')]: [t('departments.뮤지컬전공'), t('departments.실용음악전공')],
    [t('categories.major.경제학부')]: [t('departments.경제학전공')],
    [t('categories.major.사범대학')]: [t('departments.수학교육과'), t('departments.국어교육과'), t('departments.영어교육과'), t('departments.역사교육과'), t('departments.교육학과')],
    [t('categories.major.문과대학')]: [t('departments.영어영문학과'), t('departments.독어독문학과'), t('departments.불어불문학과'), t('departments.국어국문학과')],
    [t('categories.major.건축도시대학')]: [t('departments.건축학전공'), t('departments.실내건축학전공'), t('departments.도시공학과')]
  },
  [t('wantedWrite.category.general')]: {
    [t('categories.general.ABEEK 교양')]: [t('departments.ABEEK 교양')],
    [t('categories.general.인문계열')]: [t('departments.인문계열')],
    [t('categories.general.영어계열')]: [t('departments.영어계열')],
    [t('categories.general.사회계열')]: [t('departments.사회계열')],
    [t('categories.general.제2외국어계열')]: [t('departments.제2외국어계열')],
    [t('categories.general.자연계열')]: [t('departments.자연계열')],
    [t('categories.general.예체능계열')]: [t('departments.예체능계열')],
    [t('categories.general.교직')]: [t('departments.교직')]
  }
});

export default function WantedWrite() {
  const { t } = useTranslation();
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
  // 카테고리 트리: 상태로 보관하지 않고 계산값으로 사용

  const navigate = useNavigate();
  const { startWriting, stopWriting, setUnsavedChanges } = useWriting();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // CATEGORIES를 트리 형태로 변환
  const CATEGORIES = getCategories(t);
  const catTree = Object.entries(CATEGORIES).map(([mainName, subCategories]) => ({
    name: mainName,
    children: Object.entries(subCategories).map(([subName, details]) => ({
      name: subName,
      children: details.map(detailName => ({ name: detailName }))
    }))
  }));

  useEffect(() => {
    startWriting('wanted');
    return () => {
      stopWriting(); 
    };
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
        if (!res.ok) throw new Error(t('wantedWrite.error.loadDetail'));
        const ct = res.headers.get('content-type') || '';
        const json = ct.includes('application/json') ? await res.json() : null;
        const detail = json?.data || json || {};

        // 카테고리 역매핑
        let mainCategory = detail.category || '';
        if (!mainCategory) mainCategory = detail.department ? t('wantedWrite.category.major') : t('wantedWrite.category.general');
        let subCategory = '';
        let detailCategory = '';
        if (mainCategory === t('wantedWrite.category.major') && detail.department) {
          for (const [sub, list] of Object.entries(CATEGORIES[t('wantedWrite.category.major')])) {
            if (list.includes(detail.department)) { subCategory = sub; detailCategory = detail.department; break; }
          }
        } else if (mainCategory === t('wantedWrite.category.general')) {
          for (const [sub, list] of Object.entries(CATEGORIES[t('wantedWrite.category.general')])) {
            if (list.includes(detail.category || '')) { subCategory = sub; detailCategory = detail.category || ''; break; }
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
        alert(t('wantedWrite.error.loadDetail'));
      }
    })();
  }, [isEdit, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let next = value;
    if (name === 'price') {
      next = clampInt(value, PRICE_MIN, PRICE_MAX);
    }
    setFormData(prev => ({ ...prev, [name]: next }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleMajorChange = (e) => {
    const mainCategory = e.target.value;
    const mainNode = (catTree || []).find(m => m.name === mainCategory);
    const firstSub = mainNode?.children?.[0]?.name || '';
    const firstDetail = firstSub ? (mainNode.children.find(s => s.name === firstSub)?.children?.[0]?.name || '') : '';
    setFormData(prev => ({ ...prev, mainCategory, subCategory: firstSub || '', detailCategory: firstDetail || '' }));
  };
  const handleSubChange = (e) => {
    const subCategory = e.target.value;
    const mainNode = (catTree || []).find(m => m.name === formData.mainCategory);
    const firstDetail = subCategory ? (mainNode?.children?.find(s => s.name === subCategory)?.children?.[0]?.name || '') : '';
    setFormData(prev => ({ ...prev, subCategory, detailCategory: firstDetail || '' }));
  };
  const handleDetailChange = (e) => { setFormData(prev => ({ ...prev, detailCategory: e.target.value })); };

  /* ---------- 책 검색 로직 (이식) ---------- */
  const openSearch = () => setShowBookSearch(true);
  const closeSearch = () => { setShowBookSearch(false); setSearchQuery(''); setSearchResults([]); setSearchLoading(false); };

  const handleBookSearch = async () => {
    if (!searchQuery.trim()) { alert(t('wantedWrite.search.enterQuery')); return; }
    setSearchLoading(true);
    try {
      const res = await axios.get('/api/search/books', {
        params: { query: searchQuery.trim() },
        headers: getAuthHeader()
      });
      const results = toBookArray(res?.data).map(normalizeBook);
      setSearchResults(results);
      if (results.length === 0) alert(t('wantedWrite.search.noResults'));
    } catch (err) {
      alert(t('wantedWrite.search.error'));
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleBookSelect = (book) => {
    const mainCategory = book.category || '';
    if (!mainCategory) {
      const mainCategory = book.department ? t('wantedWrite.category.major') : t('wantedWrite.category.general');
      let subCategory = '';
      let detailCategory = '';
      if (mainCategory === t('wantedWrite.category.major') && book.department) {
        for (const [sub, list] of Object.entries(CATEGORIES[t('wantedWrite.category.major')])) {
          if (list.includes(book.department)) { subCategory = sub; detailCategory = book.department; break; }
        }
      } else if (mainCategory === t('wantedWrite.category.general')) {
        for (const [sub, list] of Object.entries(CATEGORIES[t('wantedWrite.category.general')])) {
          if (list.includes(book.category || '')) { subCategory = sub; detailCategory = book.category || ''; break; }
        }
      }
      setFormData(prev => ({ ...prev, mainCategory, subCategory, detailCategory }));
    } else {
      setFormData(prev => ({ ...prev, mainCategory }));
    }
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

    // 제목/본문 최소 입력 보장: 두 항목 모두 비어있으면 에러
    if (!formData.title.trim() && !formData.content.trim()) {
      newErrors.title = t('wantedWrite.validation.titleRequired');
    }

    if (!formData.condition) newErrors.condition = t('wantedWrite.validation.conditionRequired');
    const priceNum = Number(formData.price);
    if (formData.price === '' || Number.isNaN(priceNum) || priceNum < PRICE_MIN || priceNum > PRICE_MAX) {
      newErrors.price = t('wantedWrite.validation.priceRequired');
    }
    if (!formData.mainCategory || !formData.subCategory || !formData.detailCategory) newErrors.category = t('wantedWrite.validation.categoryRequired');

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
    if (!userId) { alert(t('wantedWrite.error.loginRequired')); return; }

    // ✅ 백엔드 규격에 맞게 전송 (원본 한국어 값 사용)
    const topCategory = formData.mainCategory || t('wantedWrite.category.general');
    const dept =
        topCategory === t('wantedWrite.category.major')
            ? (formData.detailCategory || formData.subCategory || '').trim()
            : '';

    // 번역된 카테고리를 원본 한국어 값으로 역매핑
    const originalCategory = topCategory === t('wantedWrite.category.major') ? '전공' : '교양';
    const originalDept = dept; // department는 이미 원본 한국어 값

    const basePayload = {
      title: formData.title.trim(),
      author: (formData.author || '').trim(),
      condition: formData.condition,
      price: Number(formData.price),
      category: originalCategory,
      content: formData.content?.trim() || ''
      // ⚠️ 서버 준비되면 다음 줄의 주석 해제(현재는 보내지 않음)
      // ,isbn: formData.isbn?.trim() || ''
    };
    const payload = (topCategory === t('wantedWrite.category.major') && dept)
        ? { ...basePayload, department: originalDept }
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
            const fieldMsg = (message || t('wantedWrite.validation.inappropriateContent')) + lvl;
            setErrors(prev => ({ ...prev, [data.field]: fieldMsg }));
            // 해당 필드로 포커스 이동(가능한 경우)
            const el = document.querySelector(`[name="${data.field}"]`);
            if (el && typeof el.focus === 'function') el.focus();
            return; // 모더레이션 에러는 알림창 없이 필드 에러로 처리
          }
          // 그 외 JSON 에러 메시지
          throw new Error(message || t('wantedWrite.error.requestFailed'));
        } else {
          const txt = await res.text();
          throw new Error(t('wantedWrite.error.requestFailed'));
        }
      }

      if (!isEdit) { await res.json().catch(() => ({})); }

      stopWriting();
      setUnsavedChanges(false);
      setHasUnsavedChanges(false);
      alert(isEdit ? t('wantedWrite.success.update') : t('wantedWrite.success.create'));
      navigate(isEdit ? `/wanted/${id}` : '/wanted', { replace: false });
    } catch (err) {
      // 이미 필드 에러로 처리된 경우(alert 생략) → errors에 메시지가 들어감
      if (!Object.values(errors).some(Boolean)) {
        alert(isEdit ? t('wantedWrite.error.updateFailed') : t('wantedWrite.error.createFailed'));
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
            <BackButton onClick={handleCancel}><FaArrowLeft /> {t('wantedWrite.back')}</BackButton>
            <WriteTitle>{t('wantedWrite.title')}</WriteTitle>
          </WriteHeader>

          <WriteForm onSubmit={handleSubmit}>
            <FormSection>
              <SectionTitle><FaBook /> {t('wantedWrite.basicInfo')}</SectionTitle>

              <InputTypeSelector>
                <Label>{t('wantedWrite.inputMethod')} <Required>*</Required></Label>
                <InputTypeButtons>
                  <InputTypeButton
                      type="button"
                      $active={inputType === 'title'}
                      onClick={() => setInputType('title')}
                  >
                    {t('wantedWrite.inputType.manual')}
                  </InputTypeButton>
                  <InputTypeButton
                      type="button"
                      $active={inputType === 'search'}
                      onClick={() => setInputType('search')}
                  >
                    {t('wantedWrite.inputType.search')}
                  </InputTypeButton>
                </InputTypeButtons>
              </InputTypeSelector>

              {inputType === 'title' ? (
                  <>
                    <FormGroup>
                      <Label>{t('wantedWrite.titleLabel')} <Required>*</Required></Label>
                      <Input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          placeholder={t('wantedWrite.titlePlaceholder')}
                      />
                      {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                    </FormGroup>

                    <FormGroup>
                      <Label>{t('wantedWrite.authorLabel')} <Required>*</Required></Label>
                      <Input
                          type="text"
                          name="author"
                          value={formData.author}
                          onChange={handleInputChange}
                          placeholder={t('wantedWrite.authorPlaceholder')}
                      />
                      {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
                    </FormGroup>
                  </>
              ) : (
                  <>
                    <FormGroup>
                      <Label>{t('wantedWrite.search.title')} <Required>*</Required></Label>
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
                        <FaSearch /> {t('wantedWrite.search.button')}
                      </button>
                    </FormGroup>

                    {formData.title && (
                        <SelectedBookDisplay>
                          <BookTitle>{formData.title}</BookTitle>
                          <BookInfo>
                            {t('wantedWrite.authorLabel')}: {formData.author || '-'} {formData.isbn ? `| ISBN: ${formData.isbn}` : ''}
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
                            {t('wantedWrite.search.reselect')}
                          </button>
                        </SelectedBookDisplay>
                    )}

                    {errors.title && <ErrorMessage>{errors.title}</ErrorMessage>}
                    {errors.author && <ErrorMessage>{errors.author}</ErrorMessage>}
                  </>
              )}

              <FormGroup>
                <Label>{t('wantedWrite.condition.label')} <Required>*</Required></Label>
                <Select name="condition" value={formData.condition} onChange={handleInputChange}>
                  <option value="">{t('wantedWrite.condition.select')}</option>
                  <option value="HIGH">{t('wantedWrite.condition.high')}</option>
                  <option value="MEDIUM">{t('wantedWrite.condition.medium')}</option>
                  <option value="LOW">{t('wantedWrite.condition.low')}</option>
                </Select>
                {errors.condition && <ErrorMessage>{errors.condition}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>{t('wantedWrite.price.label')} <Required>*</Required></Label>
                <Input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder={t('wantedWrite.price.placeholder')}
                    min={PRICE_MIN}
                    max={PRICE_MAX}
                    step={1}
                />
                {errors.price && <ErrorMessage>{errors.price}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>{t('wantedWrite.category.label')} <Required>*</Required></Label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Select value={formData.mainCategory} onChange={handleMajorChange}>
                    <option value="">{t('wantedWrite.category.mainCategory')}</option>
                    {(catTree && catTree.length
                        ? catTree.map(n => n.name)
                        : Object.keys(CATEGORIES)
                    ).map(main => (
                        <option key={main} value={main}>{main}</option>
                    ))}
                  </Select>
                  {formData.mainCategory && (
                      <Select value={formData.subCategory} onChange={handleSubChange}>
                        <option value="">{t('wantedWrite.category.subCategory')}</option>
                        {(() => {
                          const mainNode = (catTree || []).find(m => m.name === formData.mainCategory);
                          const subs = (mainNode?.children || []).map(s => s.name);
                          const fallback = Object.keys(CATEGORIES[formData.mainCategory] || {});
                          return (subs.length ? subs : fallback).map(sub => (
                              <option key={sub} value={sub}>{sub}</option>
                          ));
                        })()}
                      </Select>
                  )}
                  {formData.subCategory && (
                      <Select value={formData.detailCategory} onChange={handleDetailChange}>
                        <option value="">{t('wantedWrite.category.detailCategory')}</option>
                        {(() => {
                          const mainNode = (catTree || []).find(m => m.name === formData.mainCategory);
                          const subNode = mainNode?.children?.find(s => s.name === formData.subCategory);
                          const details = (subNode?.children || []).map(d => d.name);
                          const fallback = (CATEGORIES[formData.mainCategory]?.[formData.subCategory] || []);
                          return (details.length ? details : fallback).map(detail => (
                              <option key={detail} value={detail}>{detail}</option>
                          ));
                        })()}
                      </Select>
                  )}
                </div>
                {errors.category && <ErrorMessage>{errors.category}</ErrorMessage>}
              </FormGroup>

              {/* ✅ 요청 내용 */}
              <FormGroup>
                <Label>{t('wantedWrite.content.label')}</Label>
                <TextArea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder={t('wantedWrite.content.placeholder')}
                />
              </FormGroup>
            </FormSection>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <CancelButton type="button" onClick={handleCancel}>{t('common.cancel')}</CancelButton>
              <SubmitButton type="submit" disabled={submitting}>
                {isEdit ? (submitting ? t('wantedWrite.button.updating') : t('wantedWrite.button.update')) : (submitting ? t('wantedWrite.button.registering') : t('wantedWrite.button.register'))}
              </SubmitButton>
            </div>
          </WriteForm>
        </WriteContainer>

        {/* 책 검색 모달 */}
        {showBookSearch && (
            <BookSearchModal>
              <BookSearchContent>
                <h3>📚 {t('wantedWrite.search.modalTitle')}</h3>
                
                {/* ISBN 입력 가이드 */}
                <div style={{
                  background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
                  border: '1px solid #bbdefb',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  marginBottom: '16px',
                  fontSize: '13px',
                  color: '#1976d2'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '14px' }}>💡</span>
                    <span>ISBN은 <strong>하이픈(-) 없이</strong> 숫자만 입력하세요</span>
                  </div>
                </div>

                <SearchInput
                    type="text"
                    placeholder={t('wantedWrite.search.inputPlaceholder')}
                    value={searchQuery}
                    onChange={(e) => {
                      // ISBN 입력 시 자동으로 하이픈 제거
                      const value = e.target.value.replace(/-/g, '');
                      setSearchQuery(value);
                    }}
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
                  <FaSearch /> {searchLoading ? t('wantedWrite.button.searching') : t('wantedWrite.button.search')}
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
                          <BookInfo>{t('wantedWrite.search.author')}: {book.author || t('wantedWrite.search.noInfo')} | {t('wantedWrite.search.publisher')}: {book.publisher || t('wantedWrite.search.noInfo')}</BookInfo>
                          {book.isbn && <BookInfo>ISBN: {book.isbn}</BookInfo>}
                        </div>
                      </BookItem>
                  ))}
                </BookList>

                <ModalButtons>
                  <ModalButton type="button" className="secondary" onClick={closeSearch}>
                    {t('common.close')}
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
