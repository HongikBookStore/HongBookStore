package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import com.hongik.books.domain.post.domain.PostImage;
import com.hongik.books.domain.post.domain.SalePost;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

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

    // ✅ 위치 정보 (교내/교외)
    private final String oncampusPlaceCode;     // 예: "T", "R", "A" ...
    private final String offcampusStationCode;  // 예: "홍대입구"

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

    // PostImage 정보
    private final List<String> postImageUrls;

    public static SalePostDetailResponseDTO fromEntity(SalePost salePost) {
        return new SalePostDetailResponseDTO(salePost);
    }

    private SalePostDetailResponseDTO(SalePost salePost) {
        // SalePost 정보
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

        // ✅ 위치 정보 매핑 (엔티티의 필드/게터 이름에 맞춰주세요)
        this.oncampusPlaceCode = salePost.getOncampusPlaceCode();      // 예: 컬럼 oncampus_place_code
        this.offcampusStationCode = salePost.getOffcampusStationCode(); // 예: 컬럼 offcampus_station_code

        // Book 정보
        this.bookId = salePost.getBook().getId();
        this.bookTitle = salePost.getBook().getTitle();
        this.author = salePost.getBook().getAuthor();
        this.publisher = salePost.getBook().getPublisher();
        this.originalPrice = salePost.getBook().getOriginalPrice();

        // 판매자
        this.sellerId = salePost.getSeller().getId();
        this.sellerNickname = salePost.getSeller().getUsername();
        this.sellerProfileImageUrl = salePost.getSeller().getProfileImagePath();

        // 이미지
        this.postImageUrls = salePost.getPostImages().stream()
                .map(PostImage::getImageUrl)
                .collect(Collectors.toList());
    }
}
