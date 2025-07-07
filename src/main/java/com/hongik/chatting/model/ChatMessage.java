package com.hongik.chatting.model;

import java.time.LocalDateTime;

public class ChatMessage {
    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageUid;
    private LocalDateTime sentAt;

    public ChatMessage() {}

    public ChatMessage(Long senderId, Long receiverId, String content, String messageUid) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.content = content;
        this.messageUid = messageUid;
        this.sentAt = LocalDateTime.now();
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public String getMessageUid() {
        return messageUid;
    }

    public void setMessageUid(String messageUid) {
        this.messageUid = messageUid;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }
}