import React, { useState, useEffect, useRef, useContext } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaUser, FaBook, FaArrowLeft, FaSignOutAlt, FaCalendarAlt, FaRegClock, FaCheckCircle, FaEye, FaExclamationCircle, FaMapMarkerAlt, FaRoute, FaQrcode, FaDownload } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import Stomp from 'stompjs';
import QRCode from 'react-qr-code';
import { AuthCtx } from '../../contexts/AuthContext';

/* ----------------------------- styled components ----------------------------- */

const ChatContainer = styled.div`
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  overflow: hidden;
  box-sizing: border-box;
  padding-top: 0;
  @media (max-width: 900px) { padding-top: 0; }
  @media (max-width: 600px) { padding-top: 0; }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  min-width: 0;
  overflow: hidden;
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

const ChatInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const UserAvatar = styled.div`
  width: 40px;
  height: 40px;
  background: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const UserName = styled.div`
  font-weight: 600;
  color: #333;
`;

const BookTitle = styled.div`
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 5px;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  flex-shrink: 0;
  overflow-x: auto;
  padding-left: 10px;
  @media (max-width: 768px) { gap: 5px; }
`;

const ChatMenuButton = styled.button`
  background: ${props => props.active ? 'var(--primary)' : 'var(--surface)'};
  color: ${props => props.active ? 'white' : 'var(--text)'};
  border: 2px solid ${props => props.active ? 'transparent' : 'var(--border)'};
  border-radius: var(--radius-lg);
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: ${props => props.active ? 'var(--shadow-lg)' : 'none'};
  min-width: 120px;
  text-align: center;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 10px;
  margin-right: 0;
  height: 44px;
  flex-shrink: 0;
  &::before {
    content: '';
    position: absolute; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(255, 255, 255, 0.1);
    transform: translateX(-100%);
    transition: 0.6s;
  }
  &:hover::before { transform: translateX(100%); }
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(0, 123, 255, 0.05);
  }
  &:active { transform: translateY(0); }
  &:disabled {
    color: #bbb;
    background: #f5f5f5;
    border-color: #eee;
    cursor: not-allowed;
  }
  @media (max-width: 768px) {
    min-width: 100px; font-size: 0.9rem; padding: 0.6rem 0.8rem; margin-left: 5px;
  }
  @media (max-width: 600px) {
    min-width: 80px; font-size: 0.85rem; padding: 0.5rem 0.6rem; margin-left: 3px;
  }
`;

const ExitButton = styled(ChatMenuButton)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.2);
  &:hover {
    background: #ef4444; color: white; border-color: #ef4444;
    transform: translateY(-2px); box-shadow: var(--shadow-lg);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (max-width: 600px) { padding: 8px; gap: 8px; }
`;

const MessageGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Message = styled.div`
  max-width: 70%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  position: relative;
  ${props => props.isOwn ? `
    align-self: flex-end; background: #007bff; color: white; border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start; background: #f1f3f4; color: #333; border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
  ${props => props.isOwn ? `
    align-self: flex-end; text-align: right;
  ` : `
    align-self: flex-start; text-align: left;
  `}
`;

const SystemMessage = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin: 10px 0;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 15px;
  align-self: center;
  max-width: 80%;
  &.cancel {
    color: #d32f2f; background: #fff0f0; border: 1px solid #ffcdd2; font-weight: 600;
  }
`;

const ChatInput = styled.div`
  padding: 20px; border-top: 1px solid #e0e0e0; background: #f8f9fa;
  @media (max-width: 600px) { padding: 8px; }
`;

const InputContainer = styled.div`
  display: flex; gap: 10px; align-items: flex-end;
`;

const MessageStatus = styled.div`
  display: flex; align-items: center; gap: 4px; font-size: 0.7rem; margin-top: 2px;
  ${props => props.isOwn ? `
    align-self: flex-end; justify-content: flex-end;
  ` : `
    align-self: flex-start; justify-content: flex-start;
  `}
`;

const StatusIcon = styled.span`
  color: ${props => {
    if (props.$status === 'sending') return '#ffa726';
    if (props.$status === 'read') return '#2196f3';
    if (props.$status === 'failed') return '#f44336';
    return '#9e9e9e';
  }};
  font-size: 0.8rem;
`;

const RetryButton = styled.button`
  background: none; border: none; color: #f44336; cursor: pointer; padding: 2px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; transition: background 0.2s;
  &:hover { background: rgba(244, 67, 54, 0.1); }
`;

const ProfanityWarning = styled.div`
  background: #fff3cd; border: 1px solid #ffeaa7; color: #856404;
  padding: 8px 12px; border-radius: 8px; margin-bottom: 10px;
  display: flex; align-items: center; gap: 8px; font-size: 0.9rem;
`;

const MessageInput = styled.textarea`
  flex: 1; padding: 12px 16px; border: 1px solid ${p => p.hasProfanity ? '#f44336' : '#ddd'};
  border-radius: 20px; resize: none; font-family: inherit; font-size: 1rem; outline: none; transition: border-color 0.3s;
  max-height: 100px; min-height: 44px;
  &:focus { border-color: ${p => p.hasProfanity ? '#f44336' : '#007bff'}; }
`;

const SendButton = styled.button`
  padding: 12px 16px; background: ${p => p.disabled ? '#ccc' : '#007bff'}; color: white;
  border: none; border-radius: 50%; cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.3s; display: flex; align-items: center; justify-content: center;
  width: 44px; height: 44px;
  &:hover { background: ${p => p.disabled ? '#ccc' : '#0056b3'}; }
`;

const QuickActions = styled.div`
  display: flex; gap: 10px; margin-top: 10px; flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px; background: white; border: 1px solid #ddd; border-radius: 15px;
  cursor: pointer; font-size: 0.9rem; transition: all 0.3s;
  &:hover { background: #007bff; color: white; border-color: #007bff; }
`;

const NoMessages = styled.div`
  text-align: center; color: #666; padding: 40px 20px;
`;

const ModalOverlay = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff; border-radius: 12px; padding: 32px 24px 24px 24px; min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15); display: flex; flex-direction: column; gap: 18px;
`;

const ModalTitle = styled.div`
  font-size: 1.1rem; font-weight: 600; margin-bottom: 8px;
`;

const ModalTextarea = styled.textarea`
  width: 100%; min-height: 60px; border: 1px solid #ddd; border-radius: 8px; padding: 10px; font-size: 1rem; resize: none;
`;

const ModalActions = styled.div`
  display: flex; gap: 10px; justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 8px 16px; border-radius: 8px; border: none; background: #007bff; color: #fff; font-weight: 600; cursor: pointer;
  &:hover { background: #0056b3; }
  &[data-variant='cancel'] {
    background: #ccc; color: #333; &:hover { background: #bbb; }
  }
`;

const ReportRadio = styled.label`
  display: flex; align-items: center; gap: 8px; padding: 8px 0; cursor: pointer; font-size: 0.9rem;
  &:hover { color: #007bff; }
`;

const RadioInput = styled.input`
  margin: 0; cursor: pointer;
`;

const RetryModalOverlay = styled(ModalOverlay)``;

const RetryModalBox = styled.div`
  background: #fff; border-radius: 12px; padding: 24px; min-width: 320px; box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  display: flex; flex-direction: column; gap: 16px; text-align: center;
`;

const RetryModalTitle = styled.div`
  font-size: 1.1rem; font-weight: 600; color: #333;
`;

const RetryModalMessage = styled.div`
  font-size: 0.95rem; color: #666; line-height: 1.4;
`;

const RetryModalActions = styled.div`
  display: flex; gap: 10px; justify-content: center; margin-top: 8px;
`;

const RetryModalButton = styled.button`
  padding: 8px 20px; border-radius: 8px; border: none; font-weight: 600; cursor: pointer; transition: background 0.2s;
  &.cancel { background: #f1f3f4; color: #333; &:hover { background: #e8eaed; } }
  &.confirm { background: #007bff; color: white; &:hover { background: #0056b3; } }
`;

const ReserveModalBox = styled(ModalBox)`
  min-width: 380px; max-width: 95vw;
`;

const PlaceList = styled.div`
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
`;

const PlaceItem = styled.button`
  background: #f5f8ff;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary)' : '#e0e0e0'};
  color: ${({ selected }) => selected ? 'var(--primary)' : '#333'};
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex; align-items: center; gap: 0.5rem;
  &:hover { border-color: var(--primary); color: var(--primary); background: #eaf0ff; }
`;

const DateList = styled.div`
  display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem;
`;

const DateItem = styled.button`
  background: #f5f8ff;
  border: 2px solid ${({ selected }) => selected ? 'var(--primary)' : '#e0e0e0'};
  color: ${({ selected }) => selected ? 'var(--primary)' : '#333'};
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;
  display: flex; align-items: center; gap: 0.75rem;
  &:hover { border-color: var(--primary); color: var(--primary); background: #eaf0ff; }
`;

/* ✅ 강수확률 미니 막대 스타일 */
const MiniBarWrap = styled.div`
  height: 70px; width: 10px; border-radius: 6px;
  background: linear-gradient(#eaf3ff, #f3f4f6);
  display:flex; align-items:flex-end; padding: 2px; margin-right: 8px;
`;
const MiniBar = styled.div`
  width:100%; border-radius:4px; background:#1d4ed8; transition: height .4s;
`;

/* QR 모달 */
const QRModal = styled.div`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem;
`;
const QRModalContent = styled.div`
  background: white; border-radius: 12px; padding: 2rem; max-width: 400px; width: 100%;
  text-align: center; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
`;
const QRCodeContainer = styled.div`
  display: flex; justify-content: center; margin: 1.5rem 0; padding: 1rem; background: #f8f9fa; border-radius: 8px;
`;
const QRCodeInfo = styled.div` margin: 1rem 0; text-align: left; `;
const QRCodeInfoItem = styled.div`
  display: flex; justify-content: space-between; margin: 0.5rem 0; padding: 0.5rem 0; border-bottom: 1px solid #e0e0e0;
  &:last-child { border-bottom: none; }
`;
const QRCodeLabel = styled.span` font-weight: 600; color: #333; `;
const QRCodeValue = styled.span` color: #666; `;
const QRCodeActions = styled.div` display: flex; gap: 1rem; margin-top: 1.5rem; justify-content: center; `;
const QRCodeButton = styled.button`
  display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border: none; border-radius: 8px;
  cursor: pointer; font-size: 0.9rem; font-weight: 600; transition: all 0.2s;
  &.download { background: #007bff; color: white; &:hover { background: #0056b3; } }
  &.close { background: #6c757d; color: white; &:hover { background: #5a6268; } }
`;
const QRCodeQuestion = styled.div` margin: 1rem 0; padding: 1rem; background: #e3f2fd; border-radius: 8px; border-left: 4px solid #2196f3; `;
const QRCodeQuestionText = styled.div` font-weight: 600; color: #1976d2; margin-bottom: 0.5rem; `;
const QRCodeQuestionDescription = styled.div` font-size: 0.9rem; color: #424242; `;

/* ---------------------------------- hooks ---------------------------------- */
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

/* ----------------------------- component start ------------------------------ */

const ChatRoom = ({ roomId, username, myId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [isReserved, setIsReserved] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showReportExitModal, setShowReportExitModal] = useState(false);
  const [hovered, setHovered] = useState('');
  const [hasProfanity, setHasProfanity] = useState(false);
  const [profanityWarning, setProfanityWarning] = useState('');
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [retryMessageId, setRetryMessageId] = useState(null);
  const [showReserveModal, setShowReserveModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showRoute, setShowRoute] = useState(false);
  const [reserveConfirmed, setReserveConfirmed] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showQRQuestion, setShowQRQuestion] = useState(false);
  const [qrCodeGenerated, setQrCodeGenerated] = useState(false);
  const width = useWindowWidth();
  const [receiverId, setReceiverId] = useState(null);
  const [senderId, setSenderId] = useState(null);
  const [salePostId, setSalePostId] = useState(null);
  const stompClient = useRef(null);
  const { user } = useContext(AuthCtx);
  const currentUserId = user?.id;

  // ✅ 날씨 상태
  const [weeklyWeather, setWeeklyWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  // 버튼 텍스트 반응형
  const getLabel = (type) => {
    if (width <= 600) return '';
    if (width <= 900) {
      switch (type) {
        case 'report': return '신고';
        case 'reserve': return '예약';
        case 'reserve-cancel': return '예약 취소';
        case 'complete': return '완료';
        case 'complete-cancel': return '완료 취소';
        default: return '';
      }
    }
    switch (type) {
      case 'report': return '신고하기';
      case 'reserve': return '예약하기';
      case 'reserve-cancel': return '예약 취소하기';
      case 'complete': return '거래 완료';
      case 'complete-cancel': return '거래 완료 취소';
      default: return '';
    }
  };

  // 아이콘 색상
  const iconColor = (activeColor, isActive, isHover) => {
    if (isActive || isHover) return activeColor;
    return '#bbb';
  };

  /* -------------------------- 채팅방/메시지 로딩 -------------------------- */
  useEffect(() => {
    async function loadRoomInfo() {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const res = await fetch(`/api/chat/rooms/${chatId}`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('채팅방 정보 불러오기 실패');

        const room = await res.json();

        const userJson = localStorage.getItem('user');
        const myUsername = userJson ? JSON.parse(userJson).username : null;
        const myIdLocal = userJson ? JSON.parse(userJson).id : null;
        if (!myUsername || !myIdLocal) return;

        let sender = null, receiver = null;
        if (myIdLocal === room.buyerId) { sender = room.buyerId; receiver = room.sellerId; }
        else if (myIdLocal === room.sellerId) { sender = room.sellerId; receiver = room.buyerId; }
        else return;

        setSenderId(sender);
        setReceiverId(receiver);
        setSalePostId(room.salePostId);
      } catch (err) {
        console.error('❌ 채팅방 정보 불러오기 실패:', err);
      }
    }
    loadRoomInfo();
  }, [chatId]);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!chatId || !token) return;

    const loadPreviousMessages = async () => {
      try {
        const res = await fetch(`/api/chat/room/${chatId}/messages`, { headers: { Authorization: `Bearer ${token}` }});
        if (!res.ok) throw new Error('이전 메시지 불러오기 실패');
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error("❌ 이전 메시지 로딩 실패:", err);
      }
    };
    loadPreviousMessages();
  }, [chatId]);

  /* -------------------------------- STOMP -------------------------------- */
  useEffect(() => {
    const stomp = Stomp.over(new WebSocket("ws://localhost:8080/ws-stomp/websocket"));
    stomp.debug = (str) => console.log('[STOMP]', str);

    stomp.connect({}, () => {
      stomp.subscribe(`/sub/chat/room/${chatId}`, (message) => {
        const newMessage = JSON.parse(message.body);
        setMessages(prev => [...prev, newMessage]);
      });
      stompClient.current = stomp;
    });

    return () => {
      try { stomp.disconnect(() => {}); } catch {}
    };
  }, [chatId, username]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !receiverId || !stompClient.current?.connected) return;

    const msgPayload = {
      roomId: chatId,
      salePostId,
      senderId,
      receiverId,
      message: newMessage.trim(),
      sentAt: new Date().toISOString()
    };

    stompClient.current.send("/pub/chat.sendMessage", {}, JSON.stringify(msgPayload));
    setNewMessage('');
  };

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleRetryClick = (messageId) => { setRetryMessageId(messageId); setShowRetryModal(true); };
  const handleRetryConfirm = async () => { if (retryMessageId) { setShowRetryModal(false); /* TODO: 재전송 */ setRetryMessageId(null);} };
  const handleRetryCancel = () => { setShowRetryModal(false); setRetryMessageId(null); };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setNewMessage(text);
    if (detectProfanity(text)) {
      setHasProfanity(true);
      setProfanityWarning('부적절한 표현이 감지되었습니다. 다른 표현으로 작성해주세요.');
    } else {
      setHasProfanity(false);
      setProfanityWarning('');
    }
  };

  const handleQuickAction = (action) => {
    const quickMessages = {
      '가격 협의 가능': '가격 협의 가능하신가요?',
      '책 상태 확인': '책 상태를 더 자세히 알 수 있을까요?'
    };
    setNewMessage(quickMessages[action]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleBack = () => { navigate('/chat'); };
  const formatTime = (timestamp) => { const date = new Date(timestamp); return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }); };

  /* -------------------------------- 예약/신고 -------------------------------- */
  const handleReserve = () => { setShowReserveModal(true); };
  const handleReserveConfirm = () => {
    setIsReserved(true);
    setReserveConfirmed(true);
    setShowReserveModal(false);
    setMessages(prev => ([
      ...prev,
      {
        id: Date.now(),
        type: 'system',
        message: `예약이 확정되었습니다!\n장소: ${selectedPlace}, 날짜: ${selectedDate?.date} (${selectedDate?.weather})`,
        sentAt: new Date().toISOString()
      }
    ]));
    setShowQRQuestion(true);
  };

  const handleCancelReserve = () => { setShowCancelModal(true); };
  const handleCancelConfirm = () => {
    setIsReserved(false);
    setShowCancelModal(false);
    setMessages(prev => ([
      ...prev,
      {
        id: Date.now(),
        type: 'system',
        message: `예약이 취소되었습니다. 사유: ${cancelReason}`,
        cancel: true,
        sentAt: new Date().toISOString()
      }
    ]));
    setCancelReason('');
  };
  const handleCancelClose = () => { setShowCancelModal(false); setCancelReason(''); };

  const handleExit = () => { if (window.confirm('채팅방을 나가시겠습니까?')) navigate('/chat'); };

  const getToday = () => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      setMessages(prev => ([...prev, { id: Date.now(), type: 'system', message: '거래가 완료되었습니다.', sentAt: new Date().toISOString() }]));
    } else {
      setIsCompleted(false);
      setMessages(prev => ([...prev, { id: Date.now(), type: 'system', message: '거래 완료가 취소되었습니다.', sentAt: new Date().toISOString() }]));
    }
  };

  const handleReport = () => { setShowReportModal(true); setReportReason(''); };
  const handleReportSubmit = (e) => { e.preventDefault(); if (!reportReason) return; setShowReportModal(false); setShowReportExitModal(true); };
  const handleReportExit = () => { setShowReportExitModal(false); navigate('/chat'); };
  const handleReportStay = () => { setShowReportExitModal(false); };

  /* --------------------------------- QR 코드 -------------------------------- */
  const handleQRCodeGenerate = () => { setShowQRQuestion(true); };
  const handleQRCodeConfirm = () => { setQrCodeGenerated(true); setShowQRQuestion(false); setShowQRModal(true); };
  const handleQRCodeCancel = () => { setShowQRQuestion(false); };
  const handleQRCodeClose = () => { setShowQRModal(false); };
  const handleQRCodeDownload = () => {
    const svg = document.querySelector('#qr-code svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width; canvas.height = img.height; ctx.drawImage(img, 0, 0);
        const link = document.createElement('a'); link.download = '결제QR코드.png'; link.href = canvas.toDataURL(); link.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  };
  const generateQRData = () => {
    const bookInfo = messages[0]?.message?.split(' - ') || [];
    const bookTitle = bookInfo[0] || '알 수 없는 책';
    const priceText = bookInfo[1] || '0';
    const price = priceText.replace(/[^0-9]/g, '') || '0';
    return {
      type: 'payment',
      amount: parseInt(price),
      currency: 'KRW',
      merchantId: 'hongbookstore',
      orderId: `order_${chatId}_${Date.now()}`,
      description: `책 구매: ${bookTitle}`,
      timestamp: new Date().toISOString()
    };
  };

  /* --------------------------------- 비속어 --------------------------------- */
  const detectProfanity = (text) => {
    const profanityList = [
      '씨발','개새끼','병신','미친','바보','멍청이','돌아이','등신',
      'fuck','shit','bitch','asshole','damn','hell'
    ];
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  };

  const MessageStatusIndicator = ({ status, isOwn, onRetry }) => {
    const getStatusText = () => {
      switch (status) {
        case 'sending': return '전송 중...';
        case 'read': return '읽음';
        case 'failed': return '전송 실패';
        default: return '';
      }
    };
    const getStatusIcon = () => {
      switch (status) {
        case 'sending': return '⏳';
        case 'read': return <FaEye size={10} />;
        case 'failed': return <FaExclamationCircle size={10} />;
        default: return '';
      }
    };
    return (
        <MessageStatus isOwn={isOwn}>
          <StatusIcon $status={status}>{getStatusIcon()}</StatusIcon>
          <span>{getStatusText()}</span>
          {status === 'failed' && onRetry && (
              <RetryButton onClick={onRetry} title="재전송">↻</RetryButton>
          )}
        </MessageStatus>
    );
  };

  /* ---------------------------- 스마트 예약 (장소) --------------------------- */
  const userLocationType = '교내'; // TODO: 실제 사용자/상대방 정보로 대체
  const placeOptions = userLocationType === '교내'
      ? ['홍문관 앞', '학생회관', '중앙도서관', '제2공학관']
      : ['정문 앞 카페', '홍대입구역', '신촌역', '합정역'];

  /* --------------------------- ✅ 스마트 예약 (날씨) -------------------------- */

  // 브라우저 위치(실패 시 서울 시청 좌표)
  async function getCoords() {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({ lat: 37.5665, lng: 126.9780 });
      navigator.geolocation.getCurrentPosition(
          pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
          () => resolve({ lat: 37.5665, lng: 126.9780 }),
          { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  // 백엔드 주간 날씨 API
  async function fetchWeeklyWeather({ lat, lng, sido }) {
    const q = new URLSearchParams({ lat, lng, ...(sido ? { sido } : {}) }).toString();
    const res = await fetch(`/api/weather/weekly?${q}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken') || ''}` }
    });
    if (!res.ok) throw new Error('날씨 조회 실패');
    return res.json();
  }

  // 모달 열릴 때 날씨 불러오기
  useEffect(() => {
    if (!showReserveModal) return;
    (async () => {
      try {
        setWeatherLoading(true);
        const { lat, lng } = await getCoords();
        const sido = '서울'; // TODO: 역지오코딩으로 자동화 가능
        const r = await fetchWeeklyWeather({ lat, lng, sido });
        setWeeklyWeather(r);
      } catch (e) {
        console.error(e);
        setWeeklyWeather(null);
      } finally {
        setWeatherLoading(false);
      }
    })();
  }, [showReserveModal]);

  // API 데이터를 UI용으로 정제
  const dateOptions = (weeklyWeather?.days || []).map(d => {
    const dt = new Date(d.date);
    const label = dt.toLocaleDateString('ko-KR', { month:'2-digit', day:'2-digit', weekday:'short' });
    const pop = d.popAvg ?? 0;               // 0~100
    const weatherLabel = pop <= 20 ? '맑음' : pop <= 60 ? '구름' : '비';
    return {
      date: label, iso: d.date, pop, best: d.best,
      am: d.popAm, pm: d.popPm, weather: weatherLabel
    };
  });

  const bestDate = dateOptions.find(x => x.best) || [...dateOptions].sort((a,b)=>a.pop-b.pop)[0];

  /* ---------------------------------- JSX ---------------------------------- */

  return (
      <>
        <div className="header-spacer" />
        <ChatContainer>
          <ChatHeader>
            <HeaderLeft>
              <BackButton onClick={() => navigate('/chat')}>
                <FaArrowLeft />
              </BackButton>
              <ChatInfo>
                <UserAvatar><FaUser /></UserAvatar>
                <UserInfo>
                  <UserName>{messages.length > 0 && messages[0].sender === 'other' ? '김학생' : '학생'}</UserName>
                  <BookTitle>
                    <FaBook size={12} />
                    {messages.length > 0 && messages[0].message ? messages[0].message.split(' - ')[0] : ''}
                  </BookTitle>
                </UserInfo>
              </ChatInfo>
            </HeaderLeft>

            <HeaderRight style={{gap: 0}}>
              <ChatMenuButton
                  onClick={() => { setShowReportModal(true); setReportReason(''); }}
                  title="신고하기"
                  onMouseEnter={() => setHovered('report')}
                  onMouseLeave={() => setHovered('')}
              >
                <span style={{ color: iconColor('#ffb300', false, hovered==='report'), fontSize: '1.1em' }}>⚠️</span>
                {getLabel('report')}
              </ChatMenuButton>

              {isReserved ? (
                  <ChatMenuButton
                      onClick={() => setShowCancelModal(true)}
                      title="예약 취소하기"
                      disabled={isCompleted}
                      onMouseEnter={() => setHovered('reserve-cancel')}
                      onMouseLeave={() => setHovered('')}
                  >
                    <FaRegClock style={{ color: iconColor('#bfa100', false, hovered==='reserve-cancel'), fontSize: '1.1em' }} />
                    {getLabel('reserve-cancel')}
                  </ChatMenuButton>
              ) : (
                  <ChatMenuButton
                      onClick={() => setShowReserveModal(true)}
                      title="예약하기"
                      disabled={isCompleted}
                      onMouseEnter={() => setHovered('reserve')}
                      onMouseLeave={() => setHovered('')}
                  >
                    <FaRegClock style={{ color: iconColor('#bfa100', false, hovered==='reserve'), fontSize: '1.1em' }} />
                    {getLabel('reserve')}
                  </ChatMenuButton>
              )}

              <ChatMenuButton
                  onClick={() => {
                    if (!isCompleted) {
                      setIsCompleted(true);
                      setMessages(prev => ([...prev, { id: Date.now(), type: 'system', message: '거래가 완료되었습니다.', sentAt: new Date().toISOString() }]));
                    } else {
                      setIsCompleted(false);
                      setMessages(prev => ([...prev, { id: Date.now(), type: 'system', message: '거래 완료가 취소되었습니다.', sentAt: new Date().toISOString() }]));
                    }
                  }}
                  title={isCompleted ? "거래 완료 취소" : "거래 완료"}
                  disabled={!isReserved && !isCompleted}
                  onMouseEnter={() => setHovered(isCompleted ? 'complete-cancel' : 'complete')}
                  onMouseLeave={() => setHovered('')}
              >
                <FaCheckCircle style={{ color: iconColor('#1976d2', isCompleted, hovered===(isCompleted?'complete-cancel':'complete')), fontSize: '1.1em' }} />
                {getLabel(isCompleted ? 'complete-cancel' : 'complete')}
              </ChatMenuButton>

              {isReserved && (
                  <ChatMenuButton
                      onClick={() => setShowQRQuestion(true)}
                      title="결제 QR 코드 생성"
                      onMouseEnter={() => setHovered('qr')}
                      onMouseLeave={() => setHovered('')}
                  >
                    <FaQrcode style={{ color: iconColor('#28a745', qrCodeGenerated, hovered==='qr'), fontSize: '1.1em' }} />
                    {width > 600 && '결제QR'}
                  </ChatMenuButton>
              )}

              <ExitButton onClick={() => { if(window.confirm('채팅방을 나가시겠습니까?')) navigate('/chat'); }} title="채팅방 나가기">
                <FaSignOutAlt /> {width > 600 && '나가기'}
              </ExitButton>
            </HeaderRight>
          </ChatHeader>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '8px 0', fontSize: '0.95rem', color: '#666', gap: 8 }}>
            <FaCalendarAlt style={{ opacity: 0.7 }} />
            <span>{getToday()}</span>
          </div>

          {/* 예약 취소 모달 */}
          {showCancelModal && (
              <ModalOverlay>
                <ModalBox>
                  <ModalTitle>예약 취소 사유를 입력하세요</ModalTitle>
                  <ModalTextarea
                      value={cancelReason}
                      onChange={e => setCancelReason(e.target.value)}
                      placeholder="예: 일정 변경, 거래 취소 등"
                  />
                  <ModalActions>
                    <ModalButton data-variant="cancel" onClick={() => { setShowCancelModal(false); setCancelReason(''); }}>취소</ModalButton>
                    <ModalButton onClick={handleCancelConfirm} disabled={!cancelReason.trim()}>확인</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* 신고 모달 */}
          {showReportModal && (
              <ModalOverlay>
                <ModalBox as="form" onSubmit={(e) => { e.preventDefault(); if (!reportReason) return; setShowReportModal(false); setShowReportExitModal(true); }}>
                  <ModalTitle>신고 사유를 선택하세요</ModalTitle>
                  <ReportRadio><RadioInput type="radio" name="report" value="욕설/비방" checked={reportReason === '욕설/비방'} onChange={e => setReportReason(e.target.value)} />욕설/비방</ReportRadio>
                  <ReportRadio><RadioInput type="radio" name="report" value="사기/허위매물" checked={reportReason === '사기/허위매물'} onChange={e => setReportReason(e.target.value)} />사기/허위매물</ReportRadio>
                  <ReportRadio><RadioInput type="radio" name="report" value="스팸/광고" checked={reportReason === '스팸/광고'} onChange={e => setReportReason(e.target.value)} />스팸/광고</ReportRadio>
                  <ReportRadio><RadioInput type="radio" name="report" value="기타" checked={reportReason === '기타'} onChange={e => setReportReason(e.target.value)} />기타</ReportRadio>
                  <ModalActions>
                    <ModalButton data-variant="cancel" type="button" onClick={() => setShowReportModal(false)}>취소</ModalButton>
                    <ModalButton type="submit" disabled={!reportReason}>제출</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* 신고 후 나가기 확인 */}
          {showReportExitModal && (
              <ModalOverlay>
                <ModalBox>
                  <ModalTitle>신고가 접수되었습니다.<br/>채팅방에서 나가시겠습니까?</ModalTitle>
                  <ModalActions>
                    <ModalButton data-variant="cancel" onClick={() => setShowReportExitModal(false)}>아니오</ModalButton>
                    <ModalButton onClick={() => { setShowReportExitModal(false); navigate('/chat'); }}>예</ModalButton>
                  </ModalActions>
                </ModalBox>
              </ModalOverlay>
          )}

          {/* ✅ 스마트 예약 모달 */}
          {showReserveModal && (
              <ModalOverlay>
                <ReserveModalBox>
                  <ModalTitle>스마트 예약</ModalTitle>

                  <div style={{marginBottom:'1.2rem', fontWeight:600, color:'#111'}}>추천 거래 장소</div>
                  <PlaceList>
                    {placeOptions.map(place => (
                        <PlaceItem key={place} selected={selectedPlace===place} onClick={()=>setSelectedPlace(place)}>
                          <FaMapMarkerAlt style={{opacity:0.7}} /> {place}
                        </PlaceItem>
                    ))}
                  </PlaceList>

                  <div style={{marginBottom:'1.2rem', fontWeight:600, color:'#111'}}>추천 날짜 (강수확률 중심)</div>
                  {weatherLoading && <div style={{color:'#555'}}>날씨 불러오는 중...</div>}
                  {!weatherLoading && (
                      <DateList>
                        {dateOptions.map(opt => {
                          const h = Math.max(0, Math.min(100, opt.pop)); // 0~100(%)
                          return (
                              <DateItem key={opt.iso} selected={selectedDate?.iso===opt.iso} onClick={()=>setSelectedDate(opt)}>
                                <MiniBarWrap><MiniBar style={{height: `${h}%`}}/></MiniBarWrap>
                                <div style={{display:'flex',flexDirection:'column', gap:4}}>
                                  <div style={{display:'flex', alignItems:'center', gap:8}}>
                                    <span style={{fontWeight:700}}>{opt.date}</span>
                                    {opt.best && <span style={{fontSize:11, color:'#fff', background:'#16a34a', padding:'2px 6px', borderRadius:999}}>추천</span>}
                                  </div>
                                  <div style={{fontSize:13, color:'#374151'}}>
                                    {opt.am!=null && opt.pm!=null
                                        ? <>오전 {opt.am}% / 오후 {opt.pm}% (평균 {opt.pop}%)</>
                                        : <>강수확률 {opt.pop}%</>}
                                  </div>
                                </div>
                              </DateItem>
                          );
                        })}
                      </DateList>
                  )}
                  {weeklyWeather?.recommendation && (
                      <div style={{marginTop:'6px', fontWeight:600, color:'#111827'}}>{weeklyWeather.recommendation}</div>
                  )}

                  <div style={{display:'flex', gap:'1rem', margin:'1.5rem 0 0 0', alignItems:'center'}}>
                    <ModalButton onClick={()=>setShowRoute(v=>!v)}><FaRoute /> 경로 안내</ModalButton>
                    <ModalButton onClick={handleReserveConfirm} disabled={!selectedPlace||!selectedDate}><FaCheckCircle /> 예약 확정</ModalButton>
                    <ModalButton data-variant="cancel" onClick={()=>setShowReserveModal(false)}>취소</ModalButton>
                  </div>

                  {showRoute && (
                      <div style={{marginTop:'1.2rem', background:'#f5f8ff', borderRadius:'1rem', padding:'1rem', color:'#333'}}>
                        <b>예상 이동 경로/시간 안내</b><br/>
                        (카카오맵/네이버지도 API 연동 예정, 현재는 임시 안내)<br/>
                        <span style={{fontSize:'0.95em'}}>내 위치 → {selectedPlace} (예상 15분)</span>
                      </div>
                  )}

                  {reserveConfirmed && (
                      <div style={{marginTop:'1.2rem', background:'#eaf0ff', borderRadius:'1rem', padding:'1rem', color:'#2351e9', fontWeight:600}}>
                        예약이 확정되었습니다!<br/>
                        다음 화면에서 결제 QR 코드 생성 여부를 선택할 수 있습니다.
                      </div>
                  )}
                </ReserveModalBox>
              </ModalOverlay>
          )}

          {/* QR 코드 생성 여부 묻기 모달 */}
          {showQRQuestion && (
              <QRModal>
                <QRModalContent>
                  <QRCodeQuestion>
                    <QRCodeQuestionText>💳 결제 QR 코드를 생성하시겠습니까?</QRCodeQuestionText>
                    <QRCodeQuestionDescription>
                      간편 결제를 위한 QR 코드를 생성합니다.<br/>
                      QR 코드를 스캔하면 바로 결제 페이지로 이동합니다.<br/>
                      추후 언제든지 헤더의 QR코드 버튼을 통해 다시 생성할 수 있습니다.
                    </QRCodeQuestionDescription>
                  </QRCodeQuestion>
                  <QRCodeActions>
                    <QRCodeButton className="close" onClick={() => setShowQRQuestion(false)}>나중에</QRCodeButton>
                    <QRCodeButton className="download" onClick={handleQRCodeConfirm}>결제 QR 코드 생성</QRCodeButton>
                  </QRCodeActions>
                </QRModalContent>
              </QRModal>
          )}

          {/* QR 코드 표시 모달 */}
          {showQRModal && (
              <QRModal>
                <QRModalContent>
                  <h3>💳 간편 결제 QR 코드</h3>
                  <QRCodeContainer id="qr-code">
                    <QRCode value={JSON.stringify(generateQRData())} size={200} level="M" includeMargin={true} />
                  </QRCodeContainer>
                  <QRCodeInfo>
                    <QRCodeInfoItem><QRCodeLabel>결제 금액:</QRCodeLabel><QRCodeValue>{generateQRData().amount.toLocaleString()}원</QRCodeValue></QRCodeInfoItem>
                    <QRCodeInfoItem><QRCodeLabel>상품명:</QRCodeLabel><QRCodeValue>{generateQRData().description}</QRCodeValue></QRCodeInfoItem>
                    <QRCodeInfoItem><QRCodeLabel>주문번호:</QRCodeLabel><QRCodeValue>{generateQRData().orderId}</QRCodeValue></QRCodeInfoItem>
                    <QRCodeInfoItem><QRCodeLabel>결제 수단:</QRCodeLabel><QRCodeValue>토스페이먼츠 / 카카오페이</QRCodeValue></QRCodeInfoItem>
                    <QRCodeInfoItem><QRCodeLabel>생성 시간:</QRCodeLabel><QRCodeValue>{new Date(generateQRData().timestamp).toLocaleString('ko-KR')}</QRCodeValue></QRCodeInfoItem>
                  </QRCodeInfo>
                  <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', margin: '1rem 0', fontSize: '0.9rem', color: '#666' }}>
                    💡 QR 코드를 스캔하면 바로 결제 페이지로 이동합니다.
                  </div>
                  <QRCodeActions>
                    <QRCodeButton className="download" onClick={handleQRCodeDownload}><FaDownload />다운로드</QRCodeButton>
                    <QRCodeButton className="close" onClick={() => setShowQRModal(false)}>닫기</QRCodeButton>
                  </QRCodeActions>
                </QRModalContent>
              </QRModal>
          )}

          <ChatMessages>
            {messages.length > 0 ? (
                messages.map(message => (
                    <MessageGroup key={message.messageId || message.id}>
                      {message.type === 'system' ? (
                          <SystemMessage className={message.cancel ? 'cancel' : ''}>
                            {message.message}
                          </SystemMessage>
                      ) : (
                          <>
                            <Message isOwn={message.senderId === currentUserId}>
                              {message.message}
                            </Message>
                            <MessageTime isOwn={message.senderId === currentUserId}>
                              {formatTime(message.sentAt)}
                            </MessageTime>
                            {message.senderId === currentUserId && message.status && (
                                <MessageStatusIndicator
                                    status={message.status}
                                    isOwn={true}
                                    onRetry={() => setShowRetryModal(true)}
                                />
                            )}
                          </>
                      )}
                    </MessageGroup>
                ))
            ) : (
                <NoMessages />
            )}
            <div ref={messagesEndRef} />
          </ChatMessages>

          <ChatInput>
            {profanityWarning && (
                <ProfanityWarning>
                  <FaExclamationCircle />
                  {profanityWarning}
                </ProfanityWarning>
            )}
            <InputContainer>
              <MessageInput
                  value={newMessage}
                  onChange={handleMessageChange}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  rows={1}
                  hasProfanity={hasProfanity}
              />
              <SendButton onClick={handleSendMessage} disabled={!newMessage.trim() || loading || hasProfanity}>
                <FaPaperPlane />
              </SendButton>
            </InputContainer>
            <QuickActions>
              <QuickActionButton onClick={() => handleQuickAction('가격 협의 가능')}>가격 협의 가능</QuickActionButton>
              <QuickActionButton onClick={() => handleQuickAction('책 상태 확인')}>책 상태 확인</QuickActionButton>
            </QuickActions>
          </ChatInput>
        </ChatContainer>

        {/* 전송 재시도 모달 */}
        {showRetryModal && (
            <RetryModalOverlay onClick={() => setShowRetryModal(false)}>
              <RetryModalBox onClick={e => e.stopPropagation()}>
                <RetryModalTitle>메시지 재전송</RetryModalTitle>
                <RetryModalMessage>전송에 실패한 메시지를 다시 전송하시겠습니까?</RetryModalMessage>
                <RetryModalActions>
                  <RetryModalButton className="cancel" onClick={() => setShowRetryModal(false)}>취소</RetryModalButton>
                  <RetryModalButton className="confirm" onClick={() => setShowRetryModal(false)}>재전송</RetryModalButton>
                </RetryModalActions>
              </RetryModalBox>
            </RetryModalOverlay>
        )}
      </>
  );
};

export default ChatRoom;
