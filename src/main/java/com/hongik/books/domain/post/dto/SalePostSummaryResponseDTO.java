package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.SalePost;

import java.time.LocalDateTime;

/**
 * 판매 게시글 목록 조회를 위한 요약 정보 응답 DTO
 * 상세 정보와 달리, 목록에 필요한 최소한의 정보만 포함
 */
public record SalePostSummaryResponseDTO(
        Long postId,
        String postTitle,
        int price,
        String thumbnailUrl, // 책 표지 이미지 URL
        SalePost.SaleStatus status,
        LocalDateTime createdAt,
        String sellerNickname) {
    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static SalePostSummaryResponseDTO fromEntity(SalePost salePost) {
        return new SalePostSummaryResponseDTO(
                salePost.getId(),
                salePost.getPostTitle(),
                salePost.getPrice(),
                salePost.getBook().getCoverImageUrl(), // 연관된 책의 이미지 URL
                salePost.getStatus(),
                salePost.getCreatedAt(),
                salePost.getSeller().getUsername() // 연관된 판매자의 닉네임
        );
    }
}
