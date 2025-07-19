package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import com.hongik.books.domain.post.domain.SalePost;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * 판매 게시글 상세 조회를 위한 응답 DTO
 */
public record SalePostDetailResponseDTO(
        // SalePost 정보
        Long postId,
        String postTitle,
        String postContent,
        int price,
        SalePost.SaleStatus status,
        LocalDateTime createdAt,
        Condition writingCondition,
        Condition tearCondition,
        Condition waterCondition,
        boolean negotiable,
        int views,

        // Book 정보
        Long bookId,
        String bookTitle,
        String author,
        String publisher,
        String coverImageUrl,
        Integer originalPrice,

        // User 정보 (판매자)
        Long sellerId,
        String sellerNickname,
        String sellerProfileImageUrl // 판매자 프로필 이미지
) {
    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static SalePostDetailResponseDTO fromEntity(SalePost salePost) {
        Objects.requireNonNull(salePost, "SalePost cannot be null");
        return new SalePostDetailResponseDTO(
                salePost.getId(),
                salePost.getPostTitle(),
                salePost.getPostContent(),
                salePost.getPrice(),
                salePost.getStatus(),
                salePost.getCreatedAt(),
                salePost.getWritingCondition(),
                salePost.getTearCondition(),
                salePost.getWaterCondition(),
                salePost.isNegotiable(),
                salePost.getViews(),

                // 연관된 Book 정보 매핑
                salePost.getBook() != null ? salePost.getBook().getId() : null,
                salePost.getBook() != null ? salePost.getBook().getTitle() : "정보 없음",
                salePost.getBook() != null ? salePost.getBook().getAuthor() : "정보 없음",
                salePost.getBook() != null ? salePost.getBook().getPublisher() : "정보 없음",
                salePost.getBook() != null ? salePost.getBook().getCoverImageUrl() : null,
                salePost.getBook() != null ? salePost.getBook().getOriginalPrice(): null,

                // 연관된 User(Seller) 정보 매핑 (비밀번호 등 민감 정보는 제외)
                salePost.getSeller() != null ? salePost.getSeller().getId() : null,
                salePost.getSeller() != null ? salePost.getSeller().getUsername() : "알 수 없음", // User Entity의 username을 닉네임으로 사용
                salePost.getSeller() != null ? salePost.getSeller().getProfileImagePath() : null
        );
    }

    // 필요시 편의 메서드 추가
    public boolean hasDiscount() {
        return originalPrice != null && price < originalPrice;
    }

    public double getDiscountRate() {
        if (originalPrice == null || originalPrice <= 0) {
            return 0.0;
        }
        return ((double) (originalPrice - price) / originalPrice) * 100;
    }
}