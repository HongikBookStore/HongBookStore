package com.hongik.books.domain.chat.repository;

import com.hongik.books.domain.chat.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {

    // 판매글 + 구매자 기준으로 중복 채팅방 탐색
    Optional<ChatRoom> findBySalePostIdAndBuyerId(Long salePostId, Long buyerId);

    // 3개 모두 일치하는 채팅방만 찾기!
    Optional<ChatRoom> findBySalePostIdAndBuyerIdAndSellerId(Long salePostId, Long buyerId, Long sellerId);

}