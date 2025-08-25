import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { 
  FaArrowLeft, 
  FaQrcode, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUser, 
  FaBook, 
  FaMoneyBillWave,
  FaTimes,
  FaCheck,
  FaRoute,
  FaSyncAlt,
  FaCalendarAlt,
  FaLocationArrow,
  FaRegClock,
  FaCheckCircle,
  FaList
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import wowWorst from '../../assets/wow/wow_worst.png';
import wowBad from '../../assets/wow/wow_bad.png';
import wowGood from '../../assets/wow/wow_good.png';
import wowBest from '../../assets/wow/wow_best.png';
import axios from 'axios';
import { createPeerReview } from '../../api/peerReviews';

const TransactionsContainer = styled.div`
  max-width: 1200px;
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

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 30px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #5a6268;
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: #333;
  margin: 0;
`;

const TransactionCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CompactTransactionCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  }
`;

const CompactCardContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const BookImage = styled.div`
  width: 60px;
  height: 80px;
  background: #f8f9fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 0.8rem;
  flex-shrink: 0;
`;

const CompactBookInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CompactBookTitle = styled.h4`
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 6px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const CompactMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  color: #666;
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

const CompactMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const CompactPrice = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
`;

const CompactStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => {
    switch (props.status) {
      case 'RESERVED': return '#e3f2fd';
      case 'COMPLETED': return '#e8f5e8';
      case 'CANCELLED': return '#ffebee';
      default: return '#f5f5f5';
    }
  }};
  color: ${props => {
    switch (props.status) {
      case 'RESERVED': return '#1976d2';
      case 'COMPLETED': return '#2e7d32';
      case 'CANCELLED': return '#d32f2f';
      default: return '#666';
    }
  }};
`;

const CompactActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const CompactActionButton = styled.button`
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 4px;

  &.primary {
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  }

  &.secondary {
    background: #6c757d;
    color: white;
    &:hover { background: #545b62; }
  }

  &.danger {
    background: #dc3545;
    color: white;
    &:hover { background: #c82333; }
  }

  &:disabled {
    background: #e9ecef;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const DetailModal = styled.div`
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
  padding: 20px;
`;

const DetailModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
`;

const DetailModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const DetailModalTitle = styled.h2`
  margin: 0;
  color: #333;
  font-size: 1.5rem;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
  padding: 4px;
  border-radius: 4px;

  &:hover {
    background: #f5f5f5;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 12px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  color: #666;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &.active {
    border-color: #007bff;
    background: #007bff;
    color: white;
  }

  &:hover {
    border-color: #007bff;
    color: #007bff;
    
    &.active {
      color: white;
    }
  }
`;

const FilterCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.8rem;
  font-weight: 600;
  min-width: 20px;
  text-align: center;
`;

const TransactionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
`;

const BookInfo = styled.div`
  flex: 1;
`;

const BookTitle = styled.h3`
  font-size: 1.4rem;
  color: #333;
  margin: 0 0 8px 0;
`;

const TransactionMeta = styled.div`
  display: flex;
  gap: 20px;
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 16px;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #007bff;
  margin-bottom: 16px;
`;

const TransactionContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const QRCodeSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  opacity: ${props => props.style?.opacity || 1};
  pointer-events: ${props => props.style?.pointerEvents || 'auto'};
`;

const QRCodeContainer = styled.div`
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
`;

const QRCodeTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1rem;
`;

const RegenerateButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;

  &:hover {
    background: #138496;
  }
`;

const RouteSection = styled.div`
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
`;

const RouteTitle = styled.h4`
  margin: 0 0 12px 0;
  color: #333;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LocationInfo = styled.div`
  margin-bottom: 16px;
`;

const LocationName = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
`;

const LocationAddress = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const RouteInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 6px;
  margin-bottom: 8px;
`;

const RouteIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #007bff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
`;

const RouteDetails = styled.div`
  flex: 1;
`;

const RouteType = styled.div`
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
`;

const RouteDescription = styled.div`
  color: #666;
  font-size: 0.9rem;
`;

const RouteTime = styled.div`
  color: #007bff;
  font-weight: bold;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &.reserve-cancel {
    background: #ffc107;
    color: #212529;
    &:hover {
      background: #e0a800;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  color: #ddd;
  margin-bottom: 20px;
`;

// 사유 입력 모달 styled-components
const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
`;
const ModalBox = styled.div`
  background: #fff; border-radius: 10px; padding: 32px 24px 24px 24px; min-width: 320px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px;
`;
const ModalTitle = styled.h3`
  margin: 0 0 8px 0; font-size: 1.2rem; color: #333;
`;
const ModalTextarea = styled.textarea`
  width: 100%; min-height: 60px; border: 1px solid #ccc; border-radius: 6px; padding: 8px;
  font-size: 1rem; resize: vertical;
`;
const ModalActions = styled.div`
  display: flex; gap: 12px; justify-content: flex-end;
`;
const ModalButton = styled.button`
  padding: 8px 18px; border: none; border-radius: 6px; font-size: 1rem; cursor: pointer;
  background: #007bff; color: #fff; &:hover { background: #0056b3; }
  &.cancel { background: #ccc; color: #333; &:hover { background: #aaa; } }
`;

const StarRow = styled.div`
  display: flex; gap: 8px; margin: 16px 0 8px 0; justify-content: center;
`;
const Star = styled.span`
  font-size: 2.5rem; cursor: pointer; transition: color 0.2s;
  color: ${props => props.selected ? '#FFD600' : '#e0e0e0'};
  filter: drop-shadow(0 1px 2px rgba(0,0,0,0.08));
  &:hover { color: #FFD600; }
`;
const StarLabelRow = styled.div`
  display: flex; gap: 38px; justify-content: center; margin-bottom: 8px; font-size: 1.05rem; color: #555;
`;
const Stepper = styled.div`
  text-align: center; font-size: 0.98rem; color: #007bff; margin-bottom: 10px; font-weight: 600;
`;

// 별점 0~5 스케일로 전송 (소수 2자리까지 지원)
const ratingOptions = [
  { label: '최악', value: 'worst', score: 1.00, star: 1 },
  { label: '별로', value: 'bad', score: 2.00, star: 2 },
  { label: '좋아', value: 'good', score: 3.00, star: 3 },
  { label: '최고', value: 'best', score: 5.00, star: 5 },
];
const ratingKeywords = {
  best: ['약속 시간을 잘 지켜요', '답장이 빨라요', '책이 사진과 동일해요', '친절해요', '가격 협상이 원활해요', '거래 장소에 일찍 도착해요'],
  good: ['약속 시간을 잘 지켜요', '답장이 빨라요', '책이 사진과 동일해요', '친절해요', '가격 협상이 원활해요', '거래 장소에 일찍 도착해요'],
  bad: ['약속 시간을 잘 지키지 않아요', '답장이 느려요', '책이 사진과 달라요', '불친절해요', '가격 협상이 어려워요', '거래 장소에 늦게 와요'],
  worst: ['약속 시간을 전혀 안 지켜요', '연락이 잘 안 돼요', '책 상태가 매우 나빠요', '불친절해요', '거래가 불쾌했어요'],
};

const RatingModalBox = styled(ModalBox)` min-width: 340px; `;
const RatingOption = styled.button`
  padding: 12px 18px; border: 2px solid #eee; border-radius: 8px; background: #fafafa;
  font-size: 1.1rem; margin-bottom: 8px; cursor: pointer; width: 100%;
  color: #333; font-weight: 600;
  &.selected { border-color: #007bff; background: #e6f0ff; color: #007bff; }
`;
const KeywordList = styled.div` display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; `;
const KeywordChip = styled.button`
  background: #f0f0f0; border: 1.5px solid #ccc; border-radius: 16px; padding: 6px 14px;
  font-size: 0.98rem; cursor: pointer; color: #333;
  &.selected { background: #007bff; color: #fff; border-color: #007bff; }
`;

const WowRow = styled.div`
  display: flex; gap: 18px; margin: 16px 0 8px 0; justify-content: center;
`;
const WowFace = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
`;
const WowImg = styled.img`
  width: 72px; height: 72px; border-radius: 50%; border: 3px solid transparent;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  transition: border 0.2s, box-shadow 0.2s;
  border-color: ${props => props.selected ? '#007bff' : 'transparent'};
  &:hover { border-color: #007bff; }
`;
const WowLabel = styled.div`
  margin-top: 6px; font-size: 1.08rem; color: #333; font-weight: 500;
`;

// 거래별 예약 정보 폼
const TransactionReservationForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  margin-bottom: 1.2rem;
  background: #f8f9fa;
  border-radius: 10px;
  padding: 14px 16px;
`;
const TransactionReservationLabel = styled.label`
  font-weight: 600;
  color: #2351e9;
  margin-bottom: 0.1rem;
  font-size: 0.98rem;
`;
const TransactionReservationInput = styled.input`
  padding: 0.5rem 0.8rem;
  border: 1.2px solid #e0e0e0;
  border-radius: 0.7rem;
  font-size: 1rem;
  font-family: 'Pretendard', 'Noto Sans', sans-serif;
  font-weight: 500;
`;
const TransactionReservationSaveBtn = styled.button`
  margin-top: 0.3rem;
  padding: 0.5rem 1.1rem;
  background: var(--primary);
  color: #fff;
  border: none;
  border-radius: 0.8rem;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: 0.2s;
  &:hover { background: var(--primary-dark); }
`;

// 인증 토큰을 가져오는 헬퍼 함수
const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

const MyTransactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, type: '', transactionId: null });
  const [reason, setReason] = useState('');
  const [ratingModal, setRatingModal] = useState({ open: false, transactionId: null });
  const [selectedRating, setSelectedRating] = useState(null); // 라벨: worst/bad/good/best
  const [starRating, setStarRating] = useState(null); // 숫자 별점: 0.5 단위 1.00~5.00
  const [selectedKeywords, setSelectedKeywords] = useState([]);
  const [reviewModal, setReviewModal] = useState({ open: false, review: null });
  const [reservation, setReservation] = useState({ place: '', date: '', time: '' });
  const [editReservationId, setEditReservationId] = useState(null);
  const [editReservation, setEditReservation] = useState({ place: '', date: '', time: '' });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('reserved'); // 'reserved', 'completed', 'all'
  // 구매자 선택 모달 상태
  const [buyerModal, setBuyerModal] = useState({ open: false, postId: null });
  const [buyerCandidates, setBuyerCandidates] = useState([]); // {buyerId, salePostId, buyerNickname, buyerProfileImageUrl}
  const [selectedBuyerId, setSelectedBuyerId] = useState(null);
  const [buyerLoading, setBuyerLoading] = useState(false);
  const [buyerError, setBuyerError] = useState('');
  const [confirmingBuyer, setConfirmingBuyer] = useState(false);

  // API 호출 함수
  const fetchMyPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/posts/my', { headers: getAuthHeader() });
      setTransactions(response.data);
    } catch (error) {
      console.error("내 판매글 목록을 불러오는 데 실패했습니다.", error);
      // TODO: 401 Unauthorized 에러 시 로그인 페이지로 리다이렉트 처리
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 내 판매글 목록을 불러옴
  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]);

  // 거래 상태 변경 핸들러
  const handleStatusChange = async (postId, status) => {
    if (!window.confirm(`정말로 이 거래를 '${status === 'SOLD_OUT' ? '거래완료' : '예약취소'}' 상태로 변경하시겠습니까?`)) {
      return;
    }
    // SOLD_OUT이면 구매자 선택 모달을 띄워 buyerId 포함 패치
    if (status === 'SOLD_OUT') {
      setBuyerModal({ open: true, postId });
      setSelectedBuyerId(null);
      setBuyerError('');
      setBuyerLoading(true);
      try {
        // 내 채팅방에서 해당 게시글과 연결된 후보 구매자들을 수집
        const res = await axios.get('/api/chat/rooms/me', { headers: getAuthHeader() });
        const rooms = Array.isArray(res.data) ? res.data : [];
        const candidates = rooms
          .filter(r => r.salePostId === postId)
          .map(r => ({ buyerId: r.buyerId, salePostId: r.salePostId, buyerNickname: r.buyerNickname, buyerProfileImageUrl: r.buyerProfileImageUrl }))
          // 중복 buyerId 제거
          .filter((v, i, arr) => arr.findIndex(x => x.buyerId === v.buyerId) === i);
        setBuyerCandidates(candidates);
        setBuyerLoading(false);
      } catch (e) {
        console.error('채팅방 목록 조회 실패', e);
        setBuyerCandidates([]);
        setBuyerError(e.response?.data?.message || '채팅방 정보를 불러오지 못했습니다. 직접 구매자 ID를 입력해 주세요.');
        setBuyerLoading(false);
      }
      return;
    }
    try {
      await axios.patch(`/api/posts/${postId}/status`, { status }, { headers: getAuthHeader() });
      alert('상태가 성공적으로 변경되었습니다.');
      fetchMyPosts();
    } catch (error) {
      console.error('상태 변경에 실패했습니다.', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  const closeBuyerModal = () => {
    setBuyerModal({ open: false, postId: null });
    setBuyerCandidates([]);
    setSelectedBuyerId(null);
  };

  const handleConfirmBuyer = async () => {
    if (!selectedBuyerId) {
      alert('구매자를 선택해 주세요.');
      return;
    }
    try {
      setConfirmingBuyer(true);
      await axios.patch(`/api/posts/${buyerModal.postId}/status`,
        { status: 'SOLD_OUT', buyerId: selectedBuyerId },
        { headers: getAuthHeader() }
      );
      alert('거래완료로 변경되었습니다.');
      closeBuyerModal();
      fetchMyPosts();
    } catch (error) {
      console.error('구매자 지정 실패', error);
      alert(error.response?.data?.message || '구매자 지정 중 오류가 발생했습니다.');
    } finally {
      setConfirmingBuyer(false);
    }
  };

  const handleBack = () => {
    navigate('/my-bookstore');
  };

  const regenerateQRCode = (transactionId) => {
    // QR 코드 재생성 로직
    const newQRCode = `transaction_${transactionId}_qr_code_data_${Date.now()}`;
    setTransactions(prev => 
      prev.map(t => 
        t.id === transactionId 
          ? { ...t, qrCode: newQRCode }
          : t
      )
    );
  };

  // 모달 열기/닫기
  const openReasonModal = (type, transactionId) => { setModal({ open: true, type, transactionId }); setReason(''); };
  const closeModal = () => { setModal({ open: false, type: '', transactionId: null }); setReason(''); };

  // 사유 입력 후 취소/예약취소
  const handleReasonSubmit = () => {
    if (!reason.trim()) return;
    if (modal.type === 'cancel') {
      setTransactions(prev => prev.map(t => t.id === modal.transactionId ? { ...t, status: 'CANCELLED', reason } : t));
    } else if (modal.type === 'reserve-cancel') {
      setTransactions(prev => prev.map(t => t.id === modal.transactionId ? { ...t, status: 'RESERVATION_CANCELLED', reason } : t));
    }
    closeModal();
  };

  // 기존 핸들러에서 모달로 변경
  const handleCancelReservation = (transactionId) => { openReasonModal('reserve-cancel', transactionId); };

  // 필터링 및 정렬 로직
  const allTransactions = transactions;
  
  const getFilteredTransactions = () => {
    if (!allTransactions || allTransactions.length === 0) {
      return [];
    }
    
    let filtered = [];
    
    switch (activeFilter) {
      case 'reserved':
        filtered = allTransactions.filter(t => t.status === 'RESERVED');
        // 예약된 거래: 가까운 거래 일자 순으로 정렬
        return filtered.sort((a, b) => {
          const dateA = new Date(`${a.reservationDate} ${a.reservationTime}`);
          const dateB = new Date(`${b.reservationDate} ${b.reservationTime}`);
          return dateA - dateB;
        });
      case 'completed':
        filtered = allTransactions.filter(t => t.status === 'COMPLETED');
        // 완료된 거래: 최근 거래한 일자 순으로 정렬
        return filtered.sort((a, b) => {
          const dateA = new Date(a.completedDate);
          const dateB = new Date(b.completedDate);
          return dateB - dateA; // 최신순
        });
      case 'all':
        // 전체 거래: 예약된 거래는 예약일순, 완료된 거래는 완료일순
        const reserved = allTransactions.filter(t => t.status === 'RESERVED').sort((a, b) => {
          const dateA = new Date(`${a.reservationDate} ${a.reservationTime}`);
          const dateB = new Date(`${b.reservationDate} ${b.reservationTime}`);
          return dateA - dateB;
        });
        const completed = allTransactions.filter(t => t.status === 'COMPLETED').sort((a, b) => {
          const dateA = new Date(a.completedDate);
          const dateB = new Date(b.completedDate);
          return dateB - dateA;
        });
        return [...reserved, ...completed];
      default:
        return filtered;
    }
  };

  const sortedTransactions = getFilteredTransactions();
  
  // 필터별 개수 계산
  const getFilterCounts = () => {
    if (!allTransactions || allTransactions.length === 0) {
      return { reserved: 0, completed: 0, all: 0 };
    }
    const reserved = allTransactions.filter(t => t.status === 'RESERVED').length;
    const completed = allTransactions.filter(t => t.status === 'COMPLETED').length;
    const all = allTransactions.length;
    return { reserved, completed, all };
  };

  // 평가 모달 열기/닫기
  const openRatingModal = (transactionId) => {
    setRatingModal({ open: true, transactionId });
    setSelectedRating(null);
    setStarRating(null);
    setSelectedKeywords([]);
  };
  const closeRatingModal = () => {
    setRatingModal({ open: false, transactionId: null });
    setSelectedRating(null);
    setStarRating(null);
    setSelectedKeywords([]);
  };

  // 평가 제출 (백엔드 후기 생성 연동)
  const handleRatingSubmit = async () => {
    if (!starRating) return;
    const tx = transactions.find(t => t.id === ratingModal.transactionId);
    if (!tx) {
      closeRatingModal();
      return;
    }
    const postId = tx.postId ?? tx.id; // API 형태에 따라 postId 또는 id 사용
    const getLabelForStar = (s) => {
      if (s == null) return null;
      if (s < 1.5) return 'worst';
      if (s < 2.5) return 'bad';
      if (s < 3.5) return 'good';
      return 'best';
    };
    const label = getLabelForStar(starRating);
    const payload = {
      postId,
      ratingLabel: label,
      ratingScore: Number(Number(starRating).toFixed(2)),
      ratingKeywords: selectedKeywords,
    };
    try {
      // 내 판매글 기준 화면이므로, 내가 판매자 → 구매자에 대한 후기 생성 (role=BUYER)
      await createPeerReview({
        postId,
        ratingLabel: label,
        ratingScore: payload.ratingScore,
        ratingKeywords: selectedKeywords,
        role: 'BUYER'
      });
      // 로컬 UI 업데이트
      setTransactions(prev => prev.map(t =>
        (t.id === ratingModal.transactionId)
          ? {
              ...t,
              myReview: {
                rating: label,
                ratingScore: payload.ratingScore,
                ratingKeywords: selectedKeywords
              }
            }
          : t
      ));
    } catch (e) {
      console.error('후기 저장 실패', e);
      alert(e.response?.data?.message || '후기 저장 중 오류가 발생했습니다.');
    } finally {
      closeRatingModal();
    }
  };

  // 거래 완료 버튼 핸들러 수정
  const handleCompleteTransaction = (transactionId) => {
    const tx = transactions.find(t => t.id === transactionId);
    if (tx && tx.myReview) {
      // 평가 완료된 경우 후기 모달 오픈
      openReviewModal(tx.theirReview);
      return;
    }
    openRatingModal(transactionId);
  };

  // 거래 후기 버튼 클릭 시 theirReview 모달 표시
  const openReviewModal = (review) => setReviewModal({ open: true, review });
  const closeReviewModal = () => setReviewModal({ open: false, review: null });

  // 거래별 예약 정보 저장
  const handleTransactionReservationChange = (id, e) => {
    const { name, value } = e.target;
    setTransactions(prev => prev.map(t => t.id === id ? { ...t, [name]: value } : t));
  };
  const handleTransactionReservationSave = (id, e) => {
    e.preventDefault();
    const tx = transactions.find(t => t.id === id);
    if (tx) {
      // 거래별 예약 정보 localStorage에 저장 (key: transaction_{id}_reservation)
      localStorage.setItem(`transaction_${id}_reservation`, JSON.stringify({
        place: tx.location?.name || '',
        date: tx.reservationDate || '',
        time: tx.reservationTime || ''
      }));
      alert('예약 정보가 저장되었습니다!');
    }
  };

  // 거래별 예약 정보 불러오기
  useEffect(() => {
    setTransactions(prev => prev.map(t => {
      const saved = localStorage.getItem(`transaction_${t.id}_reservation`);
      if (saved) {
        const { place, date, time } = JSON.parse(saved);
        return {
          ...t,
          location: { ...t.location, name: place },
          reservationDate: date,
          reservationTime: time
        };
      }
      return t;
    }));
  }, []);

  const handleEditReservationClick = (transaction) => {
    setEditReservationId(transaction.id);
    setEditReservation({
      place: transaction.location?.name || '',
      date: transaction.reservationDate || '',
      time: transaction.reservationTime || ''
    });
  };
  const handleEditReservationChange = e => {
    const { name, value } = e.target;
    setEditReservation(prev => ({ ...prev, [name]: value }));
  };
  const handleEditReservationSave = (id, e) => {
    e.preventDefault();
    setTransactions(prev => prev.map(t => t.id === id ? {
      ...t,
      location: { ...t.location, name: editReservation.place },
      reservationDate: editReservation.date,
      reservationTime: editReservation.time
    } : t));
    localStorage.setItem(`transaction_${id}_reservation`, JSON.stringify(editReservation));
    setEditReservationId(null);
    alert('예약 정보가 저장되었습니다!');
  };
  const handleEditReservationCancel = () => {
    setEditReservationId(null);
  };

  const openDetailModal = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedTransaction(null);
    setShowDetailModal(false);
  };

  return (
    <>
      <div className="header-spacer" />
      <TransactionsContainer>
        <Header>
          <BackButton onClick={handleBack}>
            <FaArrowLeft /> 뒤로가기
          </BackButton>
          <PageTitle>나의 거래</PageTitle>
        </Header>

        <FilterContainer>
          <FilterButton 
            className={activeFilter === 'reserved' ? 'active' : ''}
            onClick={() => setActiveFilter('reserved')}
          >
            <FaRegClock />
            예약된 거래
            <FilterCount>{getFilterCounts().reserved}</FilterCount>
          </FilterButton>
          <FilterButton 
            className={activeFilter === 'completed' ? 'active' : ''}
            onClick={() => setActiveFilter('completed')}
          >
            <FaCheckCircle />
            완료된 거래
            <FilterCount>{getFilterCounts().completed}</FilterCount>
          </FilterButton>
          <FilterButton 
            className={activeFilter === 'all' ? 'active' : ''}
            onClick={() => setActiveFilter('all')}
          >
            <FaList />
            전체 거래
            <FilterCount>{getFilterCounts().all}</FilterCount>
          </FilterButton>
        </FilterContainer>

        {sortedTransactions.length > 0 ? (
          sortedTransactions.map(transaction => (
            <CompactTransactionCard key={transaction.id} onClick={() => openDetailModal(transaction)}>
              <CompactCardContent>
                <BookImage>
                  <FaBook size={24} />
                </BookImage>
                <CompactBookInfo>
                  <CompactBookTitle>{transaction.bookTitle}</CompactBookTitle>
                  <CompactMeta>
                    <CompactMetaItem>
                      <FaUser />
                      {transaction.buyer}
                    </CompactMetaItem>
                    <CompactMetaItem>
                      <FaCalendarAlt />
                      {transaction.status === 'COMPLETED' ? transaction.completedDate : transaction.reservationDate}
                    </CompactMetaItem>
                    <CompactMetaItem>
                      <FaClock />
                      {transaction.status === 'COMPLETED' ? '완료' : transaction.reservationTime}
                    </CompactMetaItem>
                  </CompactMeta>
                  <CompactPrice>{transaction.price.toLocaleString()}원</CompactPrice>
                </CompactBookInfo>
                <CompactStatus status={transaction.status}>
                  {transaction.status === 'RESERVED' && '예약됨'}
                  {transaction.status === 'COMPLETED' && '완료'}
                  {transaction.status === 'CANCELLED' && '취소됨'}
                </CompactStatus>
              </CompactCardContent>
              <CompactActions onClick={(e) => e.stopPropagation()}>
                <CompactActionButton 
                  className="primary"
                  onClick={() => navigate(`/chat/${transaction.buyerId}`)}
                >
                  <FaUser /> 채팅
                </CompactActionButton>
                {transaction.status === 'RESERVED' ? (
                  <>
                    <CompactActionButton 
                      className="secondary"
                      onClick={() => handleCompleteTransaction(transaction.id)}
                      disabled={!!transaction.myReview}
                    >
                      <FaCheck /> {transaction.myReview ? '후기' : '완료'}
                    </CompactActionButton>
                    <CompactActionButton 
                      className="danger"
                      onClick={() => handleCancelReservation(transaction.id)}
                    >
                      <FaTimes /> 취소
                    </CompactActionButton>
                  </>
                ) : (
                  <CompactActionButton 
                    className="secondary"
                    onClick={() => handleCompleteTransaction(transaction.id)}
                  >
                    <FaCheck /> 후기
                  </CompactActionButton>
                )}
              </CompactActions>
            </CompactTransactionCard>
          ))
        ) : (
          <EmptyState>
            <EmptyIcon>
              {activeFilter === 'reserved' && <FaRegClock />}
              {activeFilter === 'completed' && <FaCheckCircle />}
              {activeFilter === 'all' && <FaList />}
            </EmptyIcon>
            <h3>
              {activeFilter === 'reserved' && '예약된 거래가 없습니다'}
              {activeFilter === 'completed' && '완료된 거래가 없습니다'}
              {activeFilter === 'all' && '거래 내역이 없습니다'}
            </h3>
            <p>
              {activeFilter === 'reserved' && '채팅방에서 예약을 진행하면 여기서 확인할 수 있습니다.'}
              {activeFilter === 'completed' && '거래를 완료하면 여기서 확인할 수 있습니다.'}
              {activeFilter === 'all' && '채팅방에서 거래를 진행하면 여기서 확인할 수 있습니다.'}
            </p>
          </EmptyState>
        )}
      </TransactionsContainer>

      {modal.open && (
        <ModalOverlay>
          <ModalBox>
            <ModalTitle>취소 사유를 입력하세요</ModalTitle>
            <ModalTextarea value={reason} onChange={e => setReason(e.target.value)} placeholder="사유를 입력하세요..." />
            <ModalActions>
              <ModalButton className="cancel" onClick={closeModal}>취소</ModalButton>
              <ModalButton onClick={handleReasonSubmit} disabled={!reason.trim()}>확인</ModalButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      )}

      {ratingModal.open && (
        <ModalOverlay>
          <RatingModalBox>
            <Stepper>1 / 2단계</Stepper>
            <ModalTitle>별점을 선택해 주세요 (0.5 단위)</ModalTitle>
            <StarRow>
              {[1,2,3,4,5].map(n => (
                <Star key={n}
                  selected={starRating != null && Math.floor(starRating) >= n}
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const half = x < rect.width / 2;
                    const s = half ? n - 0.5 : n;
                    setStarRating(s);
                    const lbl = s < 1.5 ? 'worst' : s < 2.5 ? 'bad' : s < 3.5 ? 'good' : 'best';
                    setSelectedRating(lbl);
                    setSelectedKeywords([]);
                  }}
                  title={`${n}번째 별 (왼쪽 클릭: ${n - 0.5}★, 오른쪽 클릭: ${n}★)`}
                >★</Star>
              ))}
            </StarRow>
            {starRating != null && (
              <div style={{textAlign:'center', color:'#333', marginBottom:8}}>
                선택한 별점: <b>{Number(starRating).toFixed(2)}★</b> · 라벨: <b>{selectedRating}</b>
              </div>
            )}
            {starRating != null && (
              <>
                <Stepper>2 / 2단계</Stepper>
                <div style={{marginTop:12, fontWeight:500, color:'#333'}}>키워드를 선택해 주세요 (복수 선택 가능)</div>
                <KeywordList>
                  {ratingKeywords[selectedRating]?.map(kw => (
                    <KeywordChip
                      key={kw}
                      className={selectedKeywords.includes(kw) ? 'selected' : ''}
                      onClick={() => setSelectedKeywords(selectedKeywords.includes(kw)
                        ? selectedKeywords.filter(k => k !== kw)
                        : [...selectedKeywords, kw])}
                    >
                      {kw}
                    </KeywordChip>
                  ))}
                </KeywordList>
              </>
            )}
            <ModalActions>
              <ModalButton className="cancel" onClick={closeRatingModal}>취소</ModalButton>
              <ModalButton onClick={handleRatingSubmit} disabled={!(starRating != null)}>확인</ModalButton>
            </ModalActions>
          </RatingModalBox>
        </ModalOverlay>
      )}

      {reviewModal.open && reviewModal.review && (
        <ModalOverlay>
          <RatingModalBox>
            <ModalTitle>상대방이 남긴 거래 후기</ModalTitle>
            <div style={{marginBottom:8}}>
              <b>평가:</b> {ratingOptions.find(r => r.value === reviewModal.review.rating)?.label} ({Number(reviewModal.review.ratingScore).toFixed(2)}★)
            </div>
            {reviewModal.review.ratingKeywords && reviewModal.review.ratingKeywords.length > 0 && (
              <div style={{marginTop:6, fontSize:'0.96rem'}}>
                <b>키워드:</b> {reviewModal.review.ratingKeywords.join(', ')}
              </div>
            )}
            <ModalActions>
              <ModalButton onClick={closeReviewModal}>닫기</ModalButton>
            </ModalActions>
          </RatingModalBox>
        </ModalOverlay>
      )}

      {/* 구매자 선택 모달 */}
      {buyerModal.open && (
        <ModalOverlay>
          <RatingModalBox>
            <ModalTitle>구매자 선택</ModalTitle>
            {buyerLoading ? (
              <div style={{margin:'8px 0 16px', color:'#555'}}>후보를 불러오는 중...</div>
            ) : buyerCandidates.length === 0 ? (
              <div style={{margin:'8px 0 16px', color:'#555'}}>
                연결된 채팅방에서 구매자 후보를 찾지 못했습니다. 아래에 구매자 ID를 직접 입력해 주세요.
              </div>
            ) : (
              <div style={{margin:'8px 0 16px'}}>
                아래 후보 중 구매자를 선택해 주세요.
              </div>
            )}
            {buyerError && (
              <div style={{margin:'0 0 12px', color:'#d32f2f'}}>{buyerError}</div>
            )}
            {!buyerLoading && buyerCandidates.length > 0 && (
              <div style={{display:'flex', flexDirection:'column', gap:8, maxHeight:180, overflowY:'auto', marginBottom:12}}>
                {buyerCandidates.map(c => (
                  <label key={c.buyerId} style={{display:'flex', alignItems:'center', gap:8}}>
                    <input type="radio" name="buyer" value={c.buyerId}
                      checked={selectedBuyerId === c.buyerId}
                      onChange={() => setSelectedBuyerId(c.buyerId)} />
                    {c.buyerProfileImageUrl ? (
                      <img src={c.buyerProfileImageUrl} alt="buyer" style={{width:28,height:28,borderRadius:'50%',objectFit:'cover',border:'1px solid #eee'}} />
                    ) : (
                      <span style={{width:28,height:28,borderRadius:'50%',background:'#eee',display:'inline-flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#666'}}>👤</span>
                    )}
                    <span>구매자 ID: {c.buyerId}{c.buyerNickname ? ` (닉네임: ${c.buyerNickname})` : ''}</span>
                  </label>
                ))}
              </div>
            )}
            <div style={{marginBottom:12}}>
              <input
                type="number"
                placeholder="직접 입력: 구매자 ID"
                value={selectedBuyerId ?? ''}
                onChange={e => setSelectedBuyerId(e.target.value ? Number(e.target.value) : null)}
                style={{width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:8}}
              />
            </div>
            <ModalActions>
              <ModalButton className="cancel" onClick={closeBuyerModal} disabled={confirmingBuyer}>취소</ModalButton>
              <ModalButton onClick={handleConfirmBuyer} disabled={!selectedBuyerId || confirmingBuyer}>
                {confirmingBuyer ? '처리 중...' : '확인'}
              </ModalButton>
            </ModalActions>
          </RatingModalBox>
        </ModalOverlay>
      )}

      {/* 상세 보기 모달 */}
      {showDetailModal && selectedTransaction && (
        <DetailModal onClick={closeDetailModal}>
          <DetailModalContent onClick={(e) => e.stopPropagation()}>
            <DetailModalHeader>
              <DetailModalTitle>거래 상세 정보</DetailModalTitle>
              <CloseButton onClick={closeDetailModal}>×</CloseButton>
            </DetailModalHeader>
            
            <TransactionCard>
              <TransactionHeader>
                <BookInfo>
                  <BookTitle>{selectedTransaction.bookTitle}</BookTitle>
                  <TransactionMeta>
                    <MetaItem>
                      <FaUser />
                      구매자: {selectedTransaction.buyer}
                    </MetaItem>
                    <MetaItem>
                      <FaCalendarAlt />
                      예약일: {selectedTransaction.reservationDate}
                    </MetaItem>
                    <MetaItem>
                      <FaClock />
                      예약시간: {selectedTransaction.reservationTime}
                    </MetaItem>
                  </TransactionMeta>
                  <Price>{selectedTransaction.price.toLocaleString()}원</Price>
                </BookInfo>
              </TransactionHeader>

              <TransactionContent>
                <QRCodeSection style={selectedTransaction.myReview ? { opacity: 0.5, pointerEvents: 'none' } : {}}>
                  <QRCodeTitle>
                    <FaQrcode /> 결제 QR 코드
                  </QRCodeTitle>
                  <QRCodeContainer>
                    <QRCode value={selectedTransaction.qrCode} size={120} />
                  </QRCodeContainer>
                  <RegenerateButton onClick={() => regenerateQRCode(selectedTransaction.id)} disabled={!!selectedTransaction.myReview}>
                    <FaSyncAlt /> QR 코드 재생성
                  </RegenerateButton>
                  {selectedTransaction.myReview && (
                    <div style={{color:'#dc3545', marginTop:8, fontWeight:500, fontSize:'0.97rem'}}>
                      거래가 완료되어 QR코드를 사용할 수 없습니다
                    </div>
                  )}
                </QRCodeSection>

                <RouteSection>
                  <RouteTitle>
                    <FaRoute /> 약속 장소 경로
                  </RouteTitle>
                  <LocationInfo>
                    <LocationName>{selectedTransaction.location.name}</LocationName>
                    <LocationAddress>{selectedTransaction.location.address}</LocationAddress>
                  </LocationInfo>
                  <RouteInfo>
                    <RouteIcon>
                      {selectedTransaction.route.type === '지하철' && <FaRoute />}
                      {selectedTransaction.route.type === '버스' && <FaRoute />}
                      {selectedTransaction.route.type === '도보' && <FaLocationArrow />}
                    </RouteIcon>
                    <RouteDetails>
                      <RouteType>{selectedTransaction.route.type}</RouteType>
                      <RouteDescription>{selectedTransaction.route.description}</RouteDescription>
                    </RouteDetails>
                    <RouteTime>{selectedTransaction.route.duration}</RouteTime>
                  </RouteInfo>
                </RouteSection>
              </TransactionContent>

              <ActionButtons>
                <ActionButton 
                  className="reserve-cancel"
                  onClick={() => handleCancelReservation(selectedTransaction.id)}
                >
                  <FaTimes /> 예약 취소
                </ActionButton>
                <ActionButton 
                  className="complete"
                  onClick={() => handleCompleteTransaction(selectedTransaction.id)}
                  disabled={!!selectedTransaction.myReview}
                >
                  <FaCheck /> {selectedTransaction.myReview ? '거래 후기' : '거래 완료'}
                </ActionButton>
                <ActionButton 
                  className="chat"
                  onClick={() => navigate(`/chat/${selectedTransaction.buyerId}`)}
                >
                  <FaUser /> 채팅방으로 가기
                </ActionButton>
              </ActionButtons>

              {selectedTransaction.reason && (
                <div style={{background:'#fff3cd', color:'#856404', borderRadius:6, padding:'10px 14px', marginBottom:10, fontSize:'0.97rem'}}>
                  <b>취소/예약취소 사유:</b> {selectedTransaction.reason}
                </div>
              )}

              {selectedTransaction.rating && (
                <div style={{background:'#e6f0ff', color:'#007bff', borderRadius:6, padding:'10px 14px', marginBottom:10, fontSize:'0.97rem'}}>
                  <b>평가:</b> {ratingOptions.find(r => r.value === selectedTransaction.rating)?.label} ({Number(selectedTransaction.ratingScore).toFixed(2)}★)
                  {selectedTransaction.ratingKeywords && selectedTransaction.ratingKeywords.length > 0 && (
                    <div style={{marginTop:6, fontSize:'0.96rem'}}>
                      <b>키워드:</b> {selectedTransaction.ratingKeywords.join(', ')}
                    </div>
                  )}
                </div>
              )}

              {/* 예약 정보 표시 및 수정 */}
              {editReservationId === selectedTransaction.id ? (
                <TransactionReservationForm onSubmit={e => handleEditReservationSave(selectedTransaction.id, e)}>
                  <TransactionReservationLabel>거래 장소</TransactionReservationLabel>
                  <TransactionReservationInput name="place" value={editReservation.place} onChange={handleEditReservationChange} placeholder="거래 장소를 입력하세요" />
                  <TransactionReservationLabel>예약 일자</TransactionReservationLabel>
                  <TransactionReservationInput name="date" value={editReservation.date} onChange={handleEditReservationChange} placeholder="예: 2024-07-01" type="date" />
                  <TransactionReservationLabel>예약 시간</TransactionReservationLabel>
                  <TransactionReservationInput name="time" value={editReservation.time} onChange={handleEditReservationChange} placeholder="예: 14:00" type="time" />
                  <div style={{display:'flex', gap:'0.5rem', marginTop:'0.5rem'}}>
                    <TransactionReservationSaveBtn type="submit">저장</TransactionReservationSaveBtn>
                    <TransactionReservationSaveBtn type="button" style={{background:'#ccc', color:'#333'}} onClick={handleEditReservationCancel}>취소</TransactionReservationSaveBtn>
                  </div>
                </TransactionReservationForm>
              ) : (
                <div style={{margin:'0.7rem 0 1.2rem 0', background:'#f8f9fa', borderRadius:'10px', padding:'14px 16px'}}>
                  <div style={{fontWeight:600, color:'#2351e9', fontSize:'0.98rem'}}>거래 장소</div>
                  <div style={{marginBottom:'0.3rem'}}>{selectedTransaction.location?.name || '-'}</div>
                  <div style={{fontWeight:600, color:'#2351e9', fontSize:'0.98rem'}}>예약 일자</div>
                  <div style={{marginBottom:'0.3rem'}}>{selectedTransaction.reservationDate || '-'}</div>
                  <div style={{fontWeight:600, color:'#2351e9', fontSize:'0.98rem'}}>예약 시간</div>
                  <div style={{marginBottom:'0.3rem'}}>{selectedTransaction.reservationTime || '-'}</div>
                  <TransactionReservationSaveBtn type="button" onClick={() => handleEditReservationClick(selectedTransaction)} style={{marginTop:'0.7rem'}}>예약 정보 수정</TransactionReservationSaveBtn>
                </div>
              )}
            </TransactionCard>
          </DetailModalContent>
        </DetailModal>
      )}
    </>
  );
};

export default MyTransactions; 
