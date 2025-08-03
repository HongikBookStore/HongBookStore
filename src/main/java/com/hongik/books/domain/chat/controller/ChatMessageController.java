package com.hongik.books.domain.chat.controller;

import com.hongik.books.domain.chat.domain.ChatMessage;
import com.hongik.books.domain.chat.dto.ChatMessageRequest;
import com.hongik.books.domain.chat.dto.ChatMessageResponse;
import com.hongik.books.domain.chat.repository.ChatMessageRepository;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.List;

@RequiredArgsConstructor
@Controller // REST와 STOMP를 모두 지원하려면 Controller 사용 (RestController X)
@RequestMapping("/api/chat")
public class ChatMessageController {

    private final ChatMessageRepository chatMessageRepository;
    private final SalePostRepository salePostRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate template;

    // 1. REST: 이전 메시지 조회
    @ResponseBody // Controller + ResponseBody로 REST 응답 지원
    @GetMapping("/room/{postId}/messages")
    public List<ChatMessageResponse> getMessages(@PathVariable Long postId) {
        List<ChatMessage> messages = chatMessageRepository.findAllBySalePostIdOrderBySentAtAsc(postId);
        return messages.stream().map(msg ->
                ChatMessageResponse.builder()
                        .messageId(msg.getId())
                        .salePostId(msg.getSalePost().getId())
                        .senderId(msg.getSender().getId())
                        .receiverId(msg.getReceiver().getId())
                        .message(msg.getMessage())
                        .isRead(msg.isRead())
                        .sentAt(msg.getSentAt())
                        .build()
        ).toList();
    }

    // 2. STOMP: 실시간 메시지 저장 및 전송
    @MessageMapping("/chat.sendMessage")
    public void sendMessage(ChatMessageRequest dto) {
        var salePost = salePostRepository.findById(dto.getSalePostId()).orElseThrow();
        var sender = userRepository.findById(dto.getSenderId()).orElseThrow();
        var receiver = userRepository.findById(dto.getReceiverId()).orElseThrow();

        ChatMessage chatMessage = ChatMessage.builder()
                .salePost(salePost)
                .sender(sender)
                .receiver(receiver)
                .message(dto.getMessage())
                .build();

        chatMessageRepository.save(chatMessage);

        // 메시지 저장 후, 구독자들에게 실시간 전달
        // ChatMessageResponse로 변환해서 내려주면 프론트 일관성 ↑
        ChatMessageResponse response = ChatMessageResponse.builder()
                .messageId(chatMessage.getId())
                .salePostId(salePost.getId())
                .senderId(sender.getId())
                .receiverId(receiver.getId())
                .message(chatMessage.getMessage())
                .isRead(chatMessage.isRead())
                .sentAt(chatMessage.getSentAt())
                .build();

        template.convertAndSend("/sub/chat/room/" + dto.getRoomId(), response);
    }
}
