package com.hongik.books.domain.review.seller.domain;

import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.user.domain.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Entity
@Table(name = "seller_reviews",
       uniqueConstraints = {
           @UniqueConstraint(name = "uk_reviewer_post", columnNames = {"reviewer_id", "post_id"})
       })
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SellerReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "review_id")
    private Long id;

    // 리뷰 대상 판매자
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    // 리뷰 작성자(구매자)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewer_id", nullable = false)
    private User reviewer;

    // 어떤 거래(판매글)에 대한 리뷰인지
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private SalePost salePost;

    // 간단 등급: worst/bad/good/best among fixed labels
    @Column(nullable = false, length = 16)
    private String ratingLabel;

    // 별점 점수(0.00 ~ 5.00)
    @Column(nullable = false, precision = 3, scale = 2)
    private BigDecimal ratingScore;

    // 선택 키워드(간단히 콤마 구분 문자열로 저장)
    @Lob
    private String ratingKeywords;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public SellerReview(User seller, User reviewer, SalePost salePost,
                        String ratingLabel, BigDecimal ratingScore, String ratingKeywords) {
        this.seller = seller;
        this.reviewer = reviewer;
        this.salePost = salePost;
        this.ratingLabel = ratingLabel;
        this.ratingScore = ratingScore;
        this.ratingKeywords = ratingKeywords;
    }
}
