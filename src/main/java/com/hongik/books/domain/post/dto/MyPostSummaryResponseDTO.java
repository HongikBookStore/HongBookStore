package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.SalePost;

import java.time.LocalDateTime;

/**
 * '내 판매글 목록' 조회를 위한 요약 정보 응답 DTO
 */
public record MyPostSummaryResponseDTO(
        Long postId,
        String bookTitle,
        int price,
        SalePost.SaleStatus status,
        String thumbnailUrl,
        LocalDateTime createdAt
        // TODO: 예약 기능 구현 시, 구매자 정보(buyerNickname)도 추가하면 좋습니다.
) {
    public MyPostSummaryResponseDTO(SalePost salePost) {
        this(
                salePost.getId(),
                salePost.getBook().getTitle(),
                salePost.getPrice(),
                salePost.getStatus(),
                salePost.getBook().getCoverImageUrl(),
                salePost.getCreatedAt()
        );
    }
}