package com.hongik.books.domain.post.domain;

import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 판매 게시글 정보를 담는 SalePost Entity
 */
@Getter @Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class SalePost {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(nullable = false)
    private String postTitle;

    @Lob
    @Column(nullable = false)
    private String postContent;

    @Column(nullable = false)
    private Integer price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SaleStatus status;

    private String locationName;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public SalePost(User seller, Book book, String postTitle, String postContent,
                    Integer price, SaleStatus status, String locationName,
                    BigDecimal latitude, BigDecimal longitude) {
        this.seller = seller;
        this.book = book;
        this.postTitle = postTitle;
        this.postContent = postContent;
        this.price = price;
        this.status = status;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public enum SaleStatus {
        FOR_SALE, RESERVED, SOLD_OUT
    }
}
