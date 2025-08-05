package com.hongik.books.domain.chat.controller;

import com.hongik.books.domain.chat.domain.ChatRoom;
import com.hongik.books.domain.chat.dto.ChatRoomResponse;
import com.hongik.books.domain.chat.repository.ChatRoomRepository;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/chat/rooms")
@RequiredArgsConstructor
public class ChatRoomController {

    private final ChatRoomRepository chatRoomRepository;
    private final SalePostRepository salePostRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ChatRoomResponse createChatRoom(@RequestParam Long salePostId,
                                           @RequestParam Long buyerId) {
        SalePost salePost = salePostRepository.findById(salePostId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글"));

        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자"));

        User seller = salePost.getSeller();

        // 3개 모두 일치하는 채팅방 있는지 확인!
        Optional<ChatRoom> existing = chatRoomRepository.findBySalePostIdAndBuyerIdAndSellerId(
                salePostId, buyerId, seller.getId()
        );

        ChatRoom chatRoom;
        if (existing.isPresent()) {
            // 이미 있다면 해당 방 안내!
            chatRoom = existing.get();
        } else {
            // 없으면 새로운 방 생성!
            chatRoom = ChatRoom.builder()
                    .salePost(salePost)
                    .buyer(buyer)
                    .seller(seller)
                    .userAId(seller.getId()) // seller
                    .userBId(buyer.getId())  // buyer
                    .build();
            chatRoom = chatRoomRepository.save(chatRoom);
        }

        // DTO로 변환해서 반환!
        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .salePostId(chatRoom.getSalePost().getId())
                .buyerId(chatRoom.getBuyer().getId())
                .sellerId(chatRoom.getSeller().getId())
                .build();
    }


    @GetMapping("/{roomId}")
    public ChatRoomResponse getRoom(@PathVariable Long roomId) {
        ChatRoom chatRoom = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방"));

        return ChatRoomResponse.builder()
                .id(chatRoom.getId())
                .salePostId(chatRoom.getSalePost().getId())
                .buyerId(chatRoom.getBuyer().getId())
                .sellerId(chatRoom.getSeller().getId())
                .build();
    }

}
