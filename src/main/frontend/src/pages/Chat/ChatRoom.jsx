import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaUser, FaBook, FaArrowLeft, FaEllipsisV, FaSignOutAlt, FaCalendarAlt, FaExclamationTriangle, FaRegClock, FaCheckCircle, FaRedo, FaEye, FaEyeSlash, FaExclamationCircle } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';

const ChatContainer = styled.div`
  max-width: 1600px;
  width: 100vw;
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
  @media (max-width: 900px) {
    padding-top: 0;
  }
  @media (max-width: 600px) {
    padding-top: 0;
  }
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
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

  &:hover {
    background: #5a6268;
  }
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
`;

const ChatMenuButton = styled.button`
  background: ${props => props.active ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--surface)'};
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

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    transform: translateX(-100%);
    transition: 0.6s;
  }

  &:hover::before {
    transform: translateX(100%);
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(124, 58, 237, 0.05);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    color: #bbb;
    background: #f5f5f5;
    border-color: #eee;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: auto;
    width: 100%;
    font-size: 0.95rem;
    padding: 0.7rem 1rem;
  }
`;

const ExitButton = styled(ChatMenuButton)`
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 2px solid rgba(239, 68, 68, 0.2);
  &:hover {
    background: #ef4444;
    color: white;
    border-color: #ef4444;
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 15px;
  @media (max-width: 600px) {
    padding: 8px;
    gap: 8px;
  }
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
    align-self: flex-end;
    background: #007bff;
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    align-self: flex-start;
    background: #f1f3f4;
    color: #333;
    border-bottom-left-radius: 4px;
  `}
`;

const MessageTime = styled.div`
  font-size: 0.75rem;
  color: #999;
  margin-top: 4px;
  white-space: nowrap;
  
  ${props => props.isOwn ? `
    align-self: flex-end;
    text-align: right;
  ` : `
    align-self: flex-start;
    text-align: left;
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
    color: #d32f2f;
    background: #fff0f0;
    border: 1px solid #ffcdd2;
    font-weight: 600;
  }
`;

const ChatInput = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  background: #f8f9fa;
  @media (max-width: 600px) {
    padding: 8px;
  }
`;

const InputContainer = styled.div`
  display: flex;
  gap: 10px;
  align-items: flex-end;
`;

const MessageStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.7rem;
  margin-top: 2px;
  
  ${props => props.isOwn ? `
    align-self: flex-end;
    justify-content: flex-end;
  ` : `
    align-self: flex-start;
    justify-content: flex-start;
  `}
`;

const StatusIcon = styled.span`
  color: ${props => {
    if (props.status === 'sending') return '#ffa726';
    if (props.status === 'read') return '#2196f3';
    if (props.status === 'failed') return '#f44336';
    return '#9e9e9e';
  }};
  font-size: 0.8rem;
`;

const RetryButton = styled.button`
  background: none;
  border: none;
  color: #f44336;
  cursor: pointer;
  padding: 2px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
  
  &:hover {
    background: rgba(244, 67, 54, 0.1);
  }
`;

const ProfanityWarning = styled.div`
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
  padding: 8px 12px;
  border-radius: 8px;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
`;

const MessageInput = styled.textarea`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid ${props => props.hasProfanity ? '#f44336' : '#ddd'};
  border-radius: 20px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.3s;
  max-height: 100px;
  min-height: 44px;

  &:focus {
    border-color: ${props => props.hasProfanity ? '#f44336' : '#007bff'};
  }
`;

const SendButton = styled.button`
  padding: 12px 16px;
  background: ${props => props.disabled ? '#ccc' : '#007bff'};
  color: white;
  border: none;
  border-radius: 50%;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;

  &:hover {
    background: ${props => props.disabled ? '#ccc' : '#0056b3'};
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
`;

const QuickActionButton = styled.button`
  padding: 6px 12px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 15px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s;

  &:hover {
    background: #007bff;
    color: white;
    border-color: #007bff;
  }
`;

const NoMessages = styled.div`
  text-align: center;
  color: #666;
  padding: 40px 20px;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 32px 24px 24px 24px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const ModalTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ModalTextarea = styled.textarea`
  width: 100%;
  min-height: 60px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  font-size: 1rem;
  resize: none;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const ModalButton = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: #007bff;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #0056b3; }
  &[data-variant='cancel'] {
    background: #ccc;
    color: #333;
    &:hover { background: #bbb; }
  }
`;

const ReportRadio = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    color: #007bff;
  }
`;

const RadioInput = styled.input`
  margin: 0;
  cursor: pointer;
`;

const RetryModalOverlay = styled.div`
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const RetryModalBox = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  min-width: 320px;
  box-shadow: 0 2px 16px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
`;

const RetryModalTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
`;

const RetryModalMessage = styled.div`
  font-size: 0.95rem;
  color: #666;
  line-height: 1.4;
`;

const RetryModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 8px;
`;

const RetryModalButton = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  border: none;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  
  &.cancel {
    background: #f1f3f4;
    color: #333;
    &:hover { background: #e8eaed; }
  }
  
  &.confirm {
    background: #007bff;
    color: white;
    &:hover { background: #0056b3; }
  }
`;

// 반응형 width 감지 훅
function useWindowWidth() {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return width;
}

const ChatRoom = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'message',
      content: '안녕하세요! 책에 대해 문의드립니다.',
      sender: 'other',
      timestamp: '2024-01-15 14:30:00',
      status: 'read'
    },
    {
      id: 2,
      type: 'message',
      content: '네, 어떤 점이 궁금하신가요?',
      sender: 'own',
      timestamp: '2024-01-15 14:32:00',
      status: 'read'
    },
    {
      id: 3,
      type: 'message',
      content: '책 상태가 어떤가요?',
      sender: 'other',
      timestamp: '2024-01-15 14:33:00',
      status: 'read'
    },
    {
      id: 4,
      type: 'message',
      content: '거의 새책 상태입니다!',
      sender: 'own',
      timestamp: '2024-01-15 14:35:00',
      status: 'read'
    },
    {
      id: 5,
      type: 'message',
      content: '네트워크 오류로 전송 실패한 메시지 예시입니다.',
      sender: 'own',
      timestamp: '2024-01-15 14:36:00',
      status: 'failed'
    }
  ]);
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
  const width = useWindowWidth();

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

  // 아이콘 색상 동적
  const iconColor = (activeColor, isActive, isHover) => {
    if (isActive || isHover) return activeColor;
    return '#bbb';
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || hasProfanity) return;

    const messageId = Date.now();
    const message = {
      id: messageId,
      type: 'message',
      content: newMessage.trim(),
      sender: 'own',
      timestamp: new Date().toLocaleString('ko-KR'),
      status: 'sending'
    };

    // 메시지를 즉시 추가 (전송 중 상태)
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setLoading(true);

    try {
      // 실제로는 API 호출하여 메시지 전송
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // 전송 성공 시 바로 읽음 상태로 변경
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'read' }
          : msg
      ));

    } catch (error) {
      console.error('메시지 전송 실패:', error);
      // 전송 실패 시 상태 업데이트
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleRetryMessage = async (messageId) => {
    const message = messages.find(msg => msg.id === messageId);
    if (!message) return;

    // 메시지 상태를 전송 중으로 변경
    setMessages(prev => prev.map(msg => 
      msg.id === messageId 
        ? { ...msg, status: 'sending' }
        : msg
    ));

    try {
      // 재전송 시도
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      // 재전송 성공 시 바로 읽음 상태로 변경
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'read' }
          : msg
      ));

    } catch (error) {
      console.error('메시지 재전송 실패:', error);
      // 재전송 실패
      setMessages(prev => prev.map(msg => 
        msg.id === messageId 
          ? { ...msg, status: 'failed' }
          : msg
      ));
    }
  };

  const handleRetryClick = (messageId) => {
    setRetryMessageId(messageId);
    setShowRetryModal(true);
  };

  const handleRetryConfirm = async () => {
    if (retryMessageId) {
      setShowRetryModal(false);
      await handleRetryMessage(retryMessageId);
      setRetryMessageId(null);
    }
  };

  const handleRetryCancel = () => {
    setShowRetryModal(false);
    setRetryMessageId(null);
  };

  const handleMessageChange = (e) => {
    const text = e.target.value;
    setNewMessage(text);
    
    // 비속어 감지
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
      '책 상태 확인': '책 상태를 더 자세히 알 수 있을까요?',
      '거래 방법': '어떤 방법으로 거래하시나요?',
      '배송 가능': '배송도 가능하신가요?'
    };

    setNewMessage(quickMessages[action]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => {
    navigate('/chat');
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReserve = () => {
    setIsReserved(true);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'system', content: '상대방이 예약을 요청했습니다.', timestamp: new Date().toLocaleString('ko-KR') }
    ]);
  };

  const handleCancelReserve = () => {
    setShowCancelModal(true);
  };

  const handleCancelConfirm = () => {
    setIsReserved(false);
    setShowCancelModal(false);
    setMessages(prev => [
      ...prev,
      { id: Date.now(), type: 'system', content: `예약이 취소되었습니다. 사유: ${cancelReason}`, timestamp: new Date().toLocaleString('ko-KR'), cancel: true }
    ]);
    setCancelReason('');
  };

  const handleCancelClose = () => {
    setShowCancelModal(false);
    setCancelReason('');
  };

  const handleExit = () => {
    if(window.confirm('채팅방을 나가시겠습니까?')) {
      navigate('/chat');
    }
  };

  const getToday = () => {
    const d = new Date();
    return d.toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  };

  const handleComplete = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'system', content: '거래가 완료되었습니다.', timestamp: new Date().toLocaleString('ko-KR') }
      ]);
    } else {
      setIsCompleted(false);
      setMessages(prev => [
        ...prev,
        { id: Date.now(), type: 'system', content: '거래 완료가 취소되었습니다.', timestamp: new Date().toLocaleString('ko-KR') }
      ]);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
    setReportReason('');
  };

  const handleReportSubmit = (e) => {
    e.preventDefault();
    if (!reportReason) return;
    setShowReportModal(false);
    setShowReportExitModal(true);
    // 실제 신고 API 연동은 추후 구현
  };

  const handleReportExit = () => {
    setShowReportExitModal(false);
    navigate('/chat');
  };

  const handleReportStay = () => {
    setShowReportExitModal(false);
  };

  // 비속어 감지 함수
  const detectProfanity = (text) => {
    const profanityList = [
      '씨발', '개새끼', '병신', '미친', '바보', '멍청이', '돌아이', '등신',
      'fuck', 'shit', 'bitch', 'asshole', 'damn', 'hell'
    ];
    
    const lowerText = text.toLowerCase();
    return profanityList.some(word => lowerText.includes(word));
  };

  // 메시지 상태 표시 컴포넌트
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
        <StatusIcon status={status}>
          {getStatusIcon()}
        </StatusIcon>
        <span>{getStatusText()}</span>
        {status === 'failed' && onRetry && (
          <RetryButton onClick={onRetry} title="재전송">
            <FaRedo size={10} />
          </RetryButton>
        )}
      </MessageStatus>
    );
  };

  return (
    <>
      <div className="header-spacer" />
      <ChatContainer>
        <ChatHeader>
          <HeaderLeft>
            <BackButton onClick={handleBack}>
              <FaArrowLeft />
            </BackButton>
            <ChatInfo>
              <UserAvatar>
                <FaUser />
              </UserAvatar>
              <UserInfo>
                <UserName>{messages[0].sender === 'other' ? '김학생' : '학생'}</UserName>
                <BookTitle>
                  <FaBook size={12} />
                  {messages[0].content.split(' - ')[0]} - {messages[0].content.split(' - ')[1]}원
                </BookTitle>
              </UserInfo>
            </ChatInfo>
          </HeaderLeft>
          <HeaderRight style={{gap: 0}}>
            <ChatMenuButton
              onClick={handleReport}
              title="신고하기"
              onMouseEnter={() => setHovered('report')}
              onMouseLeave={() => setHovered('')}
            >
              <FaExclamationTriangle style={{ color: iconColor('#ffb300', false, hovered==='report'), fontSize: '1.1em' }} />
              {getLabel('report')}
            </ChatMenuButton>
            {isReserved ? (
              <ChatMenuButton
                onClick={handleCancelReserve}
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
                onClick={handleReserve}
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
              onClick={handleComplete}
              title={isCompleted ? "거래 완료 취소" : "거래 완료"}
              disabled={!isReserved && !isCompleted}
              onMouseEnter={() => setHovered(isCompleted ? 'complete-cancel' : 'complete')}
              onMouseLeave={() => setHovered('')}
            >
              <FaCheckCircle style={{ color: iconColor('#1976d2', isCompleted, hovered===(isCompleted?'complete-cancel':'complete')), fontSize: '1.1em' }} />
              {getLabel(isCompleted ? 'complete-cancel' : 'complete')}
            </ChatMenuButton>
            <ExitButton onClick={handleExit} title="채팅방 나가기">
              <FaSignOutAlt /> {width > 600 && '나가기'}
            </ExitButton>
          </HeaderRight>
        </ChatHeader>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', padding: '8px 0', fontSize: '0.95rem', color: '#666', gap: 8 }}>
          <FaCalendarAlt style={{ opacity: 0.7 }} />
          <span>{getToday()}</span>
        </div>
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
                <ModalButton data-variant="cancel" onClick={handleCancelClose}>취소</ModalButton>
                <ModalButton onClick={handleCancelConfirm} disabled={!cancelReason.trim()}>확인</ModalButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
        {showReportModal && (
          <ModalOverlay>
            <ModalBox as="form" onSubmit={handleReportSubmit}>
              <ModalTitle>신고 사유를 선택하세요</ModalTitle>
              <ReportRadio>
                <RadioInput type="radio" name="report" value="욕설/비방" checked={reportReason === '욕설/비방'} onChange={e => setReportReason(e.target.value)} />
                욕설/비방
              </ReportRadio>
              <ReportRadio>
                <RadioInput type="radio" name="report" value="사기/허위매물" checked={reportReason === '사기/허위매물'} onChange={e => setReportReason(e.target.value)} />
                사기/허위매물
              </ReportRadio>
              <ReportRadio>
                <RadioInput type="radio" name="report" value="스팸/광고" checked={reportReason === '스팸/광고'} onChange={e => setReportReason(e.target.value)} />
                스팸/광고
              </ReportRadio>
              <ReportRadio>
                <RadioInput type="radio" name="report" value="기타" checked={reportReason === '기타'} onChange={e => setReportReason(e.target.value)} />
                기타
              </ReportRadio>
              <ModalActions>
                <ModalButton data-variant="cancel" type="button" onClick={() => setShowReportModal(false)}>취소</ModalButton>
                <ModalButton type="submit" disabled={!reportReason}>제출</ModalButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
        {showReportExitModal && (
          <ModalOverlay>
            <ModalBox>
              <ModalTitle>신고가 접수되었습니다.<br/>채팅방에서 나가시겠습니까?</ModalTitle>
              <ModalActions>
                <ModalButton data-variant="cancel" onClick={handleReportStay}>아니오</ModalButton>
                <ModalButton onClick={handleReportExit}>예</ModalButton>
              </ModalActions>
            </ModalBox>
          </ModalOverlay>
        )}
        <ChatMessages>
          {messages.length > 0 ? (
            messages.map(message => (
              <MessageGroup key={message.id}>
                {message.type === 'system' ? (
                  <SystemMessage className={message.cancel ? 'cancel' : ''}>{message.content}</SystemMessage>
                ) : (
                  <>
                    <Message isOwn={message.sender === 'own'}>
                      {message.content}
                    </Message>
                    <MessageTime isOwn={message.sender === 'own'}>
                      {formatTime(message.timestamp)}
                    </MessageTime>
                    {message.sender === 'own' && message.status && (
                      <MessageStatusIndicator 
                        status={message.status} 
                        isOwn={true}
                        onRetry={() => handleRetryClick(message.id)}
                      />
                    )}
                  </>
                )}
              </MessageGroup>
            ))
          ) : (
            <NoMessages>
              <FaUser size={40} style={{marginBottom: '15px', opacity: 0.5}} />
              <h3>아직 메시지가 없습니다</h3>
              <p>첫 번째 메시지를 보내보세요!</p>
            </NoMessages>
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
            <SendButton 
              onClick={handleSendMessage} 
              disabled={!newMessage.trim() || loading || hasProfanity}
            >
              <FaPaperPlane />
            </SendButton>
          </InputContainer>
          <QuickActions>
            <QuickActionButton onClick={() => handleQuickAction('가격 협의 가능')}>
              가격 협의 가능
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('책 상태 확인')}>
              책 상태 확인
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('거래 방법')}>
              거래 방법
            </QuickActionButton>
            <QuickActionButton onClick={() => handleQuickAction('배송 가능')}>
              배송 가능
            </QuickActionButton>
          </QuickActions>
        </ChatInput>
      </ChatContainer>
      {showRetryModal && (
        <RetryModalOverlay onClick={handleRetryCancel}>
          <RetryModalBox onClick={e => e.stopPropagation()}>
            <RetryModalTitle>메시지 재전송</RetryModalTitle>
            <RetryModalMessage>
              전송에 실패한 메시지를 다시 전송하시겠습니까?
            </RetryModalMessage>
            <RetryModalActions>
              <RetryModalButton className="cancel" onClick={handleRetryCancel}>
                취소
              </RetryModalButton>
              <RetryModalButton className="confirm" onClick={handleRetryConfirm}>
                재전송
              </RetryModalButton>
            </RetryModalActions>
          </RetryModalBox>
        </RetryModalOverlay>
      )}
    </>
  );
};

export default ChatRoom; 