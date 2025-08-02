package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import com.hongik.books.domain.post.domain.PostImage;
import com.hongik.books.domain.post.domain.SalePost;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 판매 게시글 상세 조회를 위한 응답 DTO
 * 게시글 정보, 책 정보, 판매자 정보, 그리고 여러 장의 이미지 URL을 모두 포함
 */
@Getter
public class SalePostDetailResponseDTO {

    // SalePost 정보
    private final Long postId;
    private final String postTitle;
    private final String postContent;
    private final int price;
    private final SalePost.SaleStatus status;
    private final LocalDateTime createdAt;
    private final Condition writingCondition;
    private final Condition tearCondition;
    private final Condition waterCondition;
    private final boolean negotiable;
    private final int views;

    // Book 정보
    private final Long bookId;
    private final String bookTitle;
    private final String author;
    private final String publisher;
    private final Integer originalPrice;

    // User 정보 (판매자)
    private final Long sellerId;
    private final String sellerNickname;
    private final String sellerProfileImageUrl;

    // PostImage 정보 (여러 장의 이미지 URL)
    private final List<String> postImageUrls;

    // Entity를 DTO로 변환하는 정적 팩토리 메서드
    public static SalePostDetailResponseDTO fromEntity(SalePost salePost) {
        return new SalePostDetailResponseDTO(salePost);
    }

    // 생성자를 private으로 선언하여 정적 팩토리 메서드 사용을 유도
    private SalePostDetailResponseDTO(SalePost salePost) {
        // SalePost 정보 매핑
        this.postId = salePost.getId();
        this.postTitle = salePost.getPostTitle();
        this.postContent = salePost.getPostContent();
        this.price = salePost.getPrice();
        this.status = salePost.getStatus();
        this.createdAt = salePost.getCreatedAt();
        this.writingCondition = salePost.getWritingCondition();
        this.tearCondition = salePost.getTearCondition();
        this.waterCondition = salePost.getWaterCondition();
        this.negotiable = salePost.isNegotiable();
        this.views = salePost.getViews();

        // 연관된 Book 정보 매핑
        this.bookId = salePost.getBook().getId();
        this.bookTitle = salePost.getBook().getTitle();
        this.author = salePost.getBook().getAuthor();
        this.publisher = salePost.getBook().getPublisher();
        this.originalPrice = salePost.getBook().getOriginalPrice();

        // 연관된 User(Seller) 정보 매핑
        this.sellerId = salePost.getSeller().getId();
        this.sellerNickname = salePost.getSeller().getUsername();
        this.sellerProfileImageUrl = salePost.getSeller().getProfileImagePath();

        // 연관된 PostImage 정보 매핑
        this.postImageUrls = salePost.getPostImages().stream()
                .map(PostImage::getImageUrl)
                .collect(Collectors.toList());
    }
}