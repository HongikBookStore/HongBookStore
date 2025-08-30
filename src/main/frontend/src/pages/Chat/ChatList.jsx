import React, { useState, useEffect, useMemo, useContext } from 'react';
import styled from 'styled-components';
import { FaArrowLeft, FaSearch, FaBook, FaExclamationCircle, FaCheckCircle } from 'react-icons/fa';
import SidebarMenu, { MainContent } from '../../components/SidebarMenu/SidebarMenu';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOrCreateChatRoom } from '../../api/chat';
import { AuthCtx } from '../../contexts/AuthContext';
import { createPeerReview } from '../../api/peerReviews';
import axios from 'axios';

/* ---------------------------- styled components ---------------------------- */

const PageWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  width: 100%;
`;

const ChatListContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 48px;
  @media (max-width: 900px) { padding-top: 32px; }
  @media (max-width: 600px) { padding-top: 20px; }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
  margin-bottom: 24px;
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s;
  &:hover { background: #5a6268; }
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const SearchContainer = styled.div`
  position: relative;
  width: 300px;
  @media (max-width: 768px) { width: 100%; }
  @media (max-width: 600px) { width: 100%; }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 40px 10px 15px;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 0.9rem;
  outline: none;
  transition: border-color 0.3s;
  &:focus { border-color: #007bff; }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 0.9rem;
`;

const TabButtonGroup = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 0 0 48px 0;
  @media (max-width: 600px) { gap: 8px; margin: 0 0 32px 0; }
`;

const TabButton = styled.button`
  padding: 6px 18px;
  border-radius: 16px;
  border: 1.5px solid ${props => props.$active ? '#1976d2' : '#e0e0e0'};
  background: ${props => props.$active ? '#1976d2' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  outline: none;
  box-shadow: none;
  &:hover {
    background: ${props => props.$active ? '#1565c0' : '#f5f5f5'};
    border-color: #1976d2;
    color: ${props => props.$active ? 'white' : '#1976d2'};
  }
  @media (max-width: 600px) { padding: 4px 12px; font-size: 0.9rem; }
`;

const ChatList = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const ChatItem = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: background 0.3s;
  position: relative;
  &:hover { background: #f8f9fa; }
  ${props => props.$isReserved && `
    background: #fff3cd;
    border-left: 4px solid #ffc107;
  `}
  ${props => props.$isCompleted && `
    background: #dcfce7;
    border-left: 4px solid #22c55e;
  `}
  ${props => props.$hasUnread && `
    background: #e3f2fd;
  `}
  @media (max-width: 600px) { padding: 15px; }
`;

const UserAvatar = styled.div`
  width: 50px; height: 50px; background: #007bff; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; color: white;
  font-weight: bold; font-size: 1.2rem; margin-right: 15px; flex-shrink: 0;
  @media (max-width: 600px) { width: 40px; height: 40px; font-size: 1rem; margin-right: 10px; }
`;

const ChatInfo = styled.div` flex: 1; min-width: 0; `;

const UserName = styled.div`
  font-weight: 600; color: #333; font-size: 1rem; margin-bottom: 5px;
  display: flex; align-items: center; gap: 8px;
`;

const BookTitle = styled.div`
  color: #666; font-size: 0.9rem; margin-bottom: 5px;
  display: flex; align-items: center; gap: 5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;

const LastMessage = styled.div`
  color: #999; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 200px;
  @media (max-width: 600px) { max-width: 150px; font-size: 0.85rem; }
`;

const ChatMeta = styled.div`
  display: flex; flex-direction: column; align-items: flex-end; gap: 5px;
  margin-left: 15px; margin-right: 60px;
  @media (max-width: 600px) { margin-left: 10px; margin-right: 40px; }
`;

const LastTime = styled.div` font-size: 0.8rem; color: #999; `;

const UnreadCount = styled.div`
  background: #dc3545; color: white; border-radius: 50%; width: 20px; height: 20px;
  display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600;
`;

const TradeStatus = styled.div`
  display: inline-block; margin-top: 4px; padding: 2px 12px; border-radius: 12px;
  font-size: 0.85rem; font-weight: 600; margin-left: 0; margin-bottom: 2px; vertical-align: middle;
  ${({ $status }) => {
    switch ($status) {
      case 'reserved':
        return 'background: #ffe066; color: #856404;';
      case 'completed':
        return `
          background: #bbf7d0;
          color: #166534;
          border: 1px solid #86efac;
        `;
      case 'in_progress':
      default:
        return 'background: #cce5ff; color: #004085;';
    }
  }}
`;

const EmptyState = styled.div`
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  height: 100%; color: #666; text-align: center; padding: 40px;
`;

const EmptyIcon = styled(FaBook)` font-size: 3rem; color: #ddd; margin-bottom: 20px; `;

const RowActions = styled.div`
  position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
  display: flex; gap: 6px;
`;

const SmallBtn = styled.button`
  padding: 4px 8px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;
  background: #f8f9fa; color: #333; font-size: 0.8rem;
  &:hover { background: #e9ecef; }
`;

/* ✅ 후기 완료 배지 */
const ReviewDoneBadge = styled.div`
  display: inline-flex; align-items: center; gap: 6px;
  padding: 4px 10px; border-radius: 999px; font-size: 0.8rem; font-weight: 700;
  background: #e8f5e9; color: #1b5e20; border: 1px solid #a5d6a7;
`;

// 후기 모달
const ModalOverlay = styled.div`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 2000;
`;
const ModalBox = styled.div`
  background: #fff; border-radius: 12px; width: 420px; max-width: 92vw;
  padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);
`;
const ModalTitle = styled.h3` margin: 0 0 10px; color: #333; `;
const ModalActions = styled.div` display: flex; gap: 8px; justify-content: flex-end; margin-top: 12px; `;
const ModalButton = styled.button`
  padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; cursor: pointer;
  background: #007bff; color: #fff;
  &.cancel { background: #6c757d; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

/* ---------------------------- 유틸 & 정규화 로직 ---------------------------- */

function safeLower(v) {
  return (v ?? '').toString().toLowerCase();
}

function normalizeTradeStatus(status, flags = {}) {
  const s = safeLower(status);
  if (s === 'reserved' || flags.isReserved) return 'reserved';
  if (s === 'completed' || flags.isCompleted) return 'completed';
  return 'in_progress';
}

function toTimestamp(anyTime) {
  if (!anyTime) return 0;
  const d1 = new Date(anyTime);
  if (!isNaN(d1.getTime())) return d1.getTime();
  const hhmm = /^(\d{1,2}):(\d{2})/.exec(String(anyTime));
  if (hhmm) {
    const h = parseInt(hhmm[1], 10), m = parseInt(hhmm[2], 10);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d.getTime();
  }
  return 0;
}

function formatDisplayTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  if (isNaN(d)) return '';
  const now = new Date();
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
  }
  return d.toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' });
}

function readMyId() {
  try {
    const u = localStorage.getItem('user');
    if (u) return JSON.parse(u).id;
  } catch {}
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload?.id || payload?.userId || null;
  } catch {}
  return null;
}

/** 서버 응답을 화면용 형태로 정규화 */
function normalizeRoom(raw, myId) {
  const id = raw.id ?? raw.roomId ?? raw.chatId;
  const buyerId = raw.buyerId ?? raw.buyer?.id;
  const sellerId = raw.sellerId ?? raw.seller?.id;
  const role = myId === sellerId ? 'seller' : (myId === buyerId ? 'buyer' : (raw.type || 'other'));

  const buyerName = raw.buyerName ?? raw.buyer?.username ?? raw.buyer?.name;
  const sellerName = raw.sellerName ?? raw.seller?.username ?? raw.seller?.name;
  const counterpartyName =
      role === 'seller' ? (buyerName || raw.userName) :
          role === 'buyer'  ? (sellerName || raw.userName) :
              (raw.userName || '상대방');

  const userAvatar = (counterpartyName || '?').slice(0, 1).toUpperCase();
  const bookTitle = raw.bookTitle ?? raw.postTitle ?? raw.title ?? '';

  const lastMsgObj = raw.lastMessage || {};
  const lastMessage = lastMsgObj.message ?? raw.lastMessage ?? '';
  const lastTimeRaw = raw.lastMessageAt ?? lastMsgObj.sentAt ?? raw.updatedAt ?? raw.lastTime;
  const lastTimeTs = toTimestamp(lastTimeRaw);
  const lastTime = formatDisplayTime(lastTimeTs);

  const tradeStatus = normalizeTradeStatus(raw.tradeStatus, {
    isReserved: raw.isReserved,
    isCompleted: raw.isCompleted
  });
  const unread = Number(raw.unreadCountForMe ?? raw.unreadCount ?? raw.unread ?? 0);

  return {
    id,
    buyerId,
    sellerId,
    role,
    userName: counterpartyName,
    userAvatar,
    bookTitle,
    lastMessage,
    lastTime,
    lastTimeTs,
    unreadCount: isNaN(unread) ? 0 : unread,
    salePostId: raw.salePostId ?? raw.postId,
    tradeStatus,
    isReserved: tradeStatus === 'reserved',
    // ✅ 서버가 이미 알려줄 수도 있는 필드(있으면 활용)
    hasMyReview: raw.hasMyReview === true || raw.myReviewedAt != null
  };
}

/* --------------------------------- 컴포넌트 -------------------------------- */

const ChatListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useContext(AuthCtx);
  const myId = user?.id ?? readMyId();

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all | seller | buyer
  const [searchTerm, setSearchTerm] = useState('');
  const [roomsRaw, setRoomsRaw] = useState([]);
  const [error, setError] = useState(null);
  const [reviewModal, setReviewModal] = useState({ open: false, postId: null, role: null });
  const [star, setStar] = useState(null);
  const [keywords, setKeywords] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 🔹 roomId -> reservation 객체(또는 null) 캐시
  const [reservationMap, setReservationMap] = useState({});

  // ✅ 내가 이미 작성한 후기 여부(로컬 캐시) — key: `${postId}:${role}`
  const [reviewDoneMap, setReviewDoneMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('reviewDoneMap') || '{}');
    } catch { return {}; }
  });
  const setReviewDone = (postId, role) => {
    const key = `${postId}:${role}`;
    setReviewDoneMap(prev => {
      const next = { ...prev, [key]: true };
      localStorage.setItem('reviewDoneMap', JSON.stringify(next));
      return next;
    });
  };

  // URL ?bookId=xxxxx 처리
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const bookId = urlParams.get('bookId');
    if (!bookId) return;
    (async () => {
      try {
        const res = await getOrCreateChatRoom(bookId);
        const room = await res.json();
        const rid = room?.id ?? room?.roomId;
        if (!rid) throw new Error('채팅방 ID 없음');
        navigate(`/chat/${rid}`, { replace: true });
      } catch (e) {
        console.error('채팅방 생성/조회 실패:', e);
        navigate('/chat', { replace: true });
      }
    })();
  }, [location.search, navigate]);

  // 내 채팅방 목록
  useEffect(() => {
    const fetchChatRooms = async () => {
      setError(null);
      setLoading(true);
      try {
        const token = localStorage.getItem('accessToken');
        const res = await fetch('/api/chat/rooms/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('채팅방 조회 실패');
        const data = await res.json();
        setRoomsRaw(Array.isArray(data) ? data : (data?.rooms || []));
      } catch (err) {
        console.error('❌ 채팅방 불러오기 실패:', err);
        setError(err);
        setRoomsRaw([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChatRooms();
  }, []);

  // 🔹 목록에 예약필드가 없을 수 있어서, 각 방의 예약상태를 보강
  useEffect(() => {
    if (!roomsRaw?.length) return;

    const ids = Array.from(
        new Set(
            roomsRaw.map(r => r.id ?? r.roomId ?? r.chatId).filter(Boolean)
        )
    );

    // 이미 조회한 방은 스킵
    const need = ids.filter(id => !(id in reservationMap));

    if (!need.length) return;

    const token = localStorage.getItem('accessToken') || '';
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // 동시성 제한(최대 4개씩)
    const maxConcurrency = 4;
    let cursor = 0;
    const nextBatch = () => need.slice(cursor, cursor + maxConcurrency);

    (async () => {
      const collected = {};
      while (cursor < need.length) {
        const batch = nextBatch();
        await Promise.all(
            batch.map(async (roomId) => {
              try {
                const res = await fetch(`/api/chat/rooms/${roomId}/reservation`, { headers });
                if (res.status === 204) {
                  collected[roomId] = null;
                  return;
                }
                if (!res.ok) {
                  collected[roomId] = null;
                  return;
                }
                const body = await res.json();
                collected[roomId] = body || null;
              } catch {
                collected[roomId] = null;
              }
            })
        );
        cursor += maxConcurrency;
      }
      if (Object.keys(collected).length) {
        setReservationMap(prev => ({ ...prev, ...collected }));
      }
    })();
  }, [roomsRaw, reservationMap]);

  // 화면용 정규화 목록 (예약맵 반영)
  const rooms = useMemo(() => {
    return roomsRaw.map(r => {
      const id = r.id ?? r.roomId ?? r.chatId;
      const rez = reservationMap[id];
      // 상태 보강
      const merged = {
        ...r,
        isReserved: r.isReserved ?? (rez?.status === 'CONFIRMED'),
        isCompleted: r.isCompleted ?? (rez?.status === 'COMPLETED')
      };
      return normalizeRoom(merged, myId);
    });
  }, [roomsRaw, reservationMap, myId]);

  // ✅ 순서 유지: 정렬 제거
  const filteredChatRooms = useMemo(() => {
    const tabFiltered = rooms.filter(chat => {
      if (activeTab === 'seller') return chat.role === 'seller';
      if (activeTab === 'buyer') return chat.role === 'buyer';
      return true; // all
    });

    const term = searchTerm.trim().toLowerCase();
    const searched = term
        ? tabFiltered.filter(chat =>
            (chat.userName || '').toLowerCase().includes(term) ||
            (chat.bookTitle || '').toLowerCase().includes(term)
        )
        : tabFiltered;

    return searched; // 정렬 없이 그대로 (백엔드 순서 유지)
  }, [rooms, activeTab, searchTerm]);

  const handleBack = () => navigate('/marketplace');

  const handleChatClick = (chatId) => {
    if (!chatId) return;
    navigate(`/chat/${chatId}`);
  };

  const handleSidebarMenu = (menu) => {
    switch (menu) {
      case 'booksale': navigate('/bookstore/add'); break;
      case 'wanted': navigate('/wanted'); break;
      case 'mybookstore': navigate('/bookstore'); break;
      case 'chat': navigate('/chat'); break;
      default: break;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'reserved': return '예약완료';
      case 'completed': return '거래완료';
      case 'in_progress':
      default: return '진행 중';
    }
  };

  // (유지) 추후 쓸 수 있는 API 헬퍼
  const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };
  const patchPostStatus = async (postId, status, buyerId) => {
    try {
      const payload = buyerId ? { status, buyerId } : { status };
      await axios.patch(`/api/posts/${postId}/status`, payload, { headers: getAuthHeader() });
      alert('상태가 변경되었습니다.');
    } catch (e) {
      console.error('상태 변경 실패', e);
      alert(e.response?.data?.message || '상태 변경 중 오류가 발생했습니다.');
    }
  };

  const openReviewForChat = (chat) => {
    if (chat.tradeStatus !== 'completed') return; // 버튼이 안 보이지만 방어
    if (!chat?.salePostId) {
      alert('연결된 판매글 정보를 확인할 수 없습니다.');
      return;
    }
    const role = chat.role === 'seller' ? 'BUYER' : (chat.role === 'buyer' ? 'SELLER' : null);
    if (!role) {
      alert('후기 대상을 결정할 수 없습니다.');
      return;
    }
    setReviewModal({ open: true, postId: chat.salePostId, role });
    setStar(null); setKeywords('');
  };

  const submitReview = async () => {
    if (!reviewModal.open || !reviewModal.postId || !reviewModal.role || !star) return;
    const ratingScore = Number(Number(star).toFixed(2));
    const ratingLabel = ratingScore < 1.5 ? 'worst' : ratingScore < 2.5 ? 'bad' : ratingScore < 3.5 ? 'good' : 'best';
    const kw = keywords.split(',').map(s => s.trim()).filter(Boolean);
    try {
      setSubmitting(true);
      await createPeerReview({
        postId: reviewModal.postId,
        ratingLabel,
        ratingScore,
        ratingKeywords: kw,
        role: reviewModal.role
      });
      // ✅ 로컬/화면 상태에 "후기 완료" 반영
      setReviewDone(reviewModal.postId, reviewModal.role);
      alert('후기가 저장되었습니다.');
      setReviewModal({ open: false, postId: null, role: null });
    } catch (e) {
      console.error('후기 저장 실패', e);
      alert(e.response?.data?.message || '후기 저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <PageWrapper>
        <SidebarMenu active="chat" onMenuClick={handleSidebarMenu} />
        <MainContent>
          <ChatListContainer>
            <Header>
              <HeaderLeft>
                <BackButton onClick={handleBack}><FaArrowLeft />뒤로</BackButton>
                <Title>거래 채팅</Title>
              </HeaderLeft>
              <SearchContainer>
                <SearchInput
                    type="text"
                    placeholder="사용자명 또는 책 제목으로 검색"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <SearchIcon />
              </SearchContainer>
            </Header>

            <TabButtonGroup>
              <TabButton $active={activeTab === 'all'} onClick={() => setActiveTab('all')}>전체</TabButton>
              <TabButton $active={activeTab === 'seller'} onClick={() => setActiveTab('seller')}>판매자</TabButton>
              <TabButton $active={activeTab === 'buyer'} onClick={() => setActiveTab('buyer')}>구매자</TabButton>
            </TabButtonGroup>

            <ChatList>
              {loading ? (
                  <div style={{ padding: 24, color: '#888' }}>불러오는 중...</div>
              ) : error ? (
                  <EmptyState>
                    <FaExclamationCircle style={{ color: '#f66', fontSize: '2rem', marginBottom: 12 }} />
                    <h3>채팅방을 불러오지 못했습니다</h3>
                    <p>잠시 후 다시 시도해 주세요.</p>
                  </EmptyState>
              ) : filteredChatRooms.length > 0 ? (
                  filteredChatRooms.map((chat) => {
                    const isCompleted = chat.tradeStatus === 'completed';
                    const counterpartyId =
                        chat.role === 'seller' ? chat.buyerId :
                            chat.role === 'buyer'  ? chat.sellerId : null;

                    // ✅ 후기 완료 여부 계산 (서버 필드 + 로컬 캐시)
                    const roleForReview = chat.role === 'seller' ? 'BUYER'
                        : chat.role === 'buyer'  ? 'SELLER'
                            : null;
                    const reviewKey = chat.salePostId && roleForReview ? `${chat.salePostId}:${roleForReview}` : null;
                    const alreadyReviewed = !!(chat.hasMyReview || (reviewKey && reviewDoneMap[reviewKey] === true));

                    return (
                        <ChatItem
                            key={chat.id}
                            onClick={() => handleChatClick(chat.id)}
                            $isReserved={chat.isReserved}
                            $isCompleted={isCompleted}
                            $hasUnread={chat.unreadCount > 0}
                        >
                          <UserAvatar>{chat.userAvatar}</UserAvatar>
                          <ChatInfo>
                            <UserName>{chat.userName}</UserName>
                            <BookTitle>
                              <FaBook style={{ color: '#666' }} />
                              {chat.bookTitle}
                            </BookTitle>
                            <TradeStatus $status={chat.tradeStatus}>{getStatusText(chat.tradeStatus)}</TradeStatus>
                            <LastMessage>{chat.lastMessage}</LastMessage>
                          </ChatInfo>

                          <ChatMeta>
                            <LastTime>{chat.lastTime || ''}</LastTime>
                            {chat.unreadCount > 0 && (
                                <UnreadCount>{chat.unreadCount > 99 ? '99+' : chat.unreadCount}</UnreadCount>
                            )}
                          </ChatMeta>

                          {/* ✅ 진행중/예약완료: 프로필만
                        ✅ 거래완료 & 후기 미작성: 후기 버튼
                        ✅ 거래완료 & 후기 작성: "후기 완료" 배지 */}
                          <RowActions onClick={(e) => e.stopPropagation()}>
                            {isCompleted && (alreadyReviewed ? (
                                <ReviewDoneBadge title="후기 작성 완료">
                                  <FaCheckCircle /> 후기 완료
                                </ReviewDoneBadge>
                            ) : (
                                <SmallBtn onClick={() => openReviewForChat(chat)}>후기</SmallBtn>
                            ))}
                            {counterpartyId && (
                                <SmallBtn onClick={() => navigate(`/users/${counterpartyId}`)}>프로필</SmallBtn>
                            )}
                          </RowActions>
                        </ChatItem>
                    );
                  })
              ) : (
                  <EmptyState>
                    <EmptyIcon />
                    <h3>채팅방이 없습니다</h3>
                    <p>책 거래를 시작하면 채팅방이 생성됩니다.</p>
                  </EmptyState>
              )}
            </ChatList>
          </ChatListContainer>

          {reviewModal.open && (
              <ModalOverlay>
                <ModalBox>
                  <ModalTitle>후기 남기기</ModalTitle>
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ marginBottom: 6, color: '#555' }}>별점(1~5)</div>
                    <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.5"
                        value={star ?? ''}
                        onChange={e => setStar(e.target.value ? Number(e.target.value) : null)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 8 }}
                    />
                  </div>
                  <div>
                    <div style={{ marginBottom: 6, color: '#555' }}>키워드(쉼표 구분, 선택)</div>
                    <input
                        type="text"
                        value={keywords}
                        onChange={e => setKeywords(e.target.value)}
                        placeholder="친절함, 시간엄수"
                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: 8 }}
                    />
                  </div>
                  <ModalActions>
                    <ModalButton className="cancel" onClick={() => setReviewModal({ open: false, postId: null, role: null })} disabled={submitting}>취소</ModalButton>
                    <ModalButton onClick={submitReview} disabled={!star || submitting}>{submitting ? '저장 중...' : '저장'}</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}
        </MainContent>
      </PageWrapper>
  );
};

export default ChatListPage;
