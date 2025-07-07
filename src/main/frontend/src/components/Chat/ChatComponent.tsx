import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

function ChatComponent({ senderId, receiverId }) {
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const stompClientRef = useRef(null);

    useEffect(() => {
        const socket = new SockJS('/ws-chat');
        const client = new Client({
            webSocketFactory: () => socket,
            onConnect: () => {
                console.log('Connected to WebSocket');

                client.subscribe(`/topic/${receiverId}`, (message) => {
                    const received = JSON.parse(message.body);
                    setMessages((prev) => [...prev, received]);
                });
            },
            onDisconnect: () => {
                console.log('Disconnected');
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            client.deactivate();
        };
    }, [receiverId]);

    const sendMessage = () => {
        if (!inputMessage.trim()) return;

        const chatMessage = {
            senderId,
            receiverId,
            content: inputMessage,
            messageUid: `${senderId}-${Date.now()}`
        };

        stompClientRef.current.publish({
            destination: `/app/chat/send/${receiverId}`,
            body: JSON.stringify(chatMessage),
        });

        setMessages((prev) => [...prev, chatMessage]);
        setInputMessage('');
    };

    return (
        <div>
            <div style={{ border: '1px solid #ccc', padding: '1rem', height: '300px', overflowY: 'auto' }}>
                {messages.map((msg, idx) => (
                    <div key={idx}>
                        <strong>{msg.senderId === senderId ? 'Me' : 'Them'}:</strong> {msg.content}
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
            />
            <button onClick={sendMessage}>Send</button>
        </div>
    );
}

export default ChatComponent;