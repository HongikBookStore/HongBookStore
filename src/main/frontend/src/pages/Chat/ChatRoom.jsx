import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FaPaperPlane, FaUser, FaArrowLeft } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatRoom = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const userId = 1; // TODO: Replace with actual logged-in user ID

  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = new Client({
      webSocketFactory: () => socket,
      onConnect: () => {
        console.log('WebSocket connected');
        client.subscribe(`/sub/chat/${chatId}`, (message) => {
          const received = JSON.parse(message.body);
          setMessages(prev => [...prev, received]);
        });
      },
      onStompError: (frame) => {
        console.error('Broker error:', frame);
      },
    });

    client.activate();
    stompClientRef.current = client;

    return () => {
      client.deactivate();
      console.log('WebSocket disconnected');
    };
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const messageObj = {
      roomId: chatId,
      senderId: userId,
      content: newMessage.trim(),
      type: 'TALK',
    };

    if (stompClientRef.current && stompClientRef.current.connected) {
      stompClientRef.current.publish({
        destination: '/pub/chat/message',
        body: JSON.stringify(messageObj),
      });
      setMessages(prev => [...prev, {
        ...messageObj,
        sender: 'own',
        timestamp: new Date().toLocaleString('ko-KR'),
      }]);
      setNewMessage('');
    } else {
      alert('WebSocket 연결되지 않았습니다.');
    }
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

  return (
      <div>
        <button onClick={handleBack}><FaArrowLeft /> 뒤로가기</button>
        <div>
          {messages.map((msg, idx) => (
              <div key={idx} style={{ textAlign: msg.sender === 'own' ? 'right' : 'left' }}>
                <div>{msg.content}</div>
                <div style={{ fontSize: '0.75rem', color: '#999' }}>{msg.timestamp}</div>
              </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div>
        <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="메시지를 입력하세요"
        />
          <button onClick={handleSendMessage}><FaPaperPlane /></button>
        </div>
      </div>
  );
};

export default ChatRoom;