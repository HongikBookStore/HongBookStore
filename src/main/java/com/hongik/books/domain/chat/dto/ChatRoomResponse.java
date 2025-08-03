package com.hongik.books.domain.chat.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatRoomResponse {
    private Long id;
    private Long salePostId;
    private Long buyerId;
    private Long sellerId;
}
