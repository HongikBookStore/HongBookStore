package com.hongik.chatting.entity;

import com.hongik.chatting.model.ChatMessage;
import com.hongik.chatting.model.ChatMessage;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long senderId;
    private Long receiverId;
    private String content;
    private String messageUid;

    @CreationTimestamp
    private LocalDateTime sentAt;

    private LocalDateTime readAt;

    public MessageEntity(ChatMessage dto) {
        this.senderId = dto.getSenderId();
        this.receiverId = dto.getReceiverId();
        this.content = dto.getContent();
        this.messageUid = dto.getMessageUid();
    }

    public MessageEntity() {}
}