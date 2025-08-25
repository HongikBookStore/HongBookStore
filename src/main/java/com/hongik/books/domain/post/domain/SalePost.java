package com.hongik.books.domain.post.domain;

import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.post.dto.SalePostUpdateRequestDTO;
import com.hongik.books.domain.user.domain.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.Formula;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

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

    // PostImage와의 1:N 관계 설정
    @OneToMany(mappedBy = "salePost", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<PostImage> postImages = new ArrayList<>();

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

    // 책 상태 필드들
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Condition writingCondition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Condition tearCondition;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Condition waterCondition;

    // 가격 협의 가능 여부
    @Column(nullable = false)
    private boolean negotiable;

    // 조회수
    @Column(nullable = false)
    @ColumnDefault("0") // DB 기본값을 0으로 설정
    private int views = 0;

    // 해당 게시글을 찜한 수 (정렬용 가상 컬럼)
    @Formula("(select count(pl.post_like_id) from post_like pl where pl.post_id = post_id)")
    private long likeCount;

    private String locationName;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    // ✅ 추가: 교내/교외 기본 위치 코드
    // 교내 동/건물 코드 (예: "R", "A", "T"...)
    @Column(length = 64, nullable = false)
    private String oncampusPlaceCode;

    // 교외 지하철역 코드 (노선 포함, 예: "HONGDAE_2")
    @Column(length = 64, nullable = false)
    private String offcampusStationCode;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Builder
    public SalePost(User seller, Book book, String postTitle, String postContent,
                    Integer price, SaleStatus status, String locationName,
                    BigDecimal latitude, BigDecimal longitude,
                    Condition writingCondition, Condition tearCondition, Condition waterCondition, boolean negotiable,
                    String oncampusPlaceCode, String offcampusStationCode) {
        this.seller = seller;
        this.book = book;
        this.postTitle = postTitle;
        this.postContent = postContent;
        this.price = price;
        this.status = status;
        this.locationName = locationName;
        this.latitude = latitude;
        this.longitude = longitude;
        this.writingCondition = writingCondition;
        this.tearCondition = tearCondition;
        this.waterCondition = waterCondition;
        this.negotiable = negotiable;
        this.oncampusPlaceCode = oncampusPlaceCode;
        this.offcampusStationCode = offcampusStationCode;
    }

    public enum SaleStatus {
        FOR_SALE, RESERVED, SOLD_OUT
    }

    /**
     * 게시글 정보를 수정하는 메서드
     * 엔티티의 비즈니스 로직을 내부에 캡슐화하여 객체지향적인 설계
     * @param request 수정할 정보가 담긴 DTO
     */
    public void update(SalePostUpdateRequestDTO request) {
        this.postTitle = request.getPostTitle();
        this.postContent = request.getPostContent();
        this.price = request.getPrice();
        this.writingCondition = request.getWritingCondition();
        this.tearCondition = request.getTearCondition();
        this.waterCondition = request.getWaterCondition();
        this.negotiable = request.isNegotiable();
        // 위치 코드는 "작성 시 필수" 요구라 수정 DTO에는 반영 안 함(필요 시 별도 DTO로 추가)
    }

    public void increaseViewCount() {
        this.views++;
    }

    // 연관관계 편의 메서드: 게시글에 이미지를 추가할 때 사용
    public void addPostImage(PostImage postImage) {
        this.postImages.add(postImage);
    }

    /**
     * 게시글의 상태를 변경하는 메서드
     * 서비스 레이어에서 직접 status 필드를 변경하는 대신, 이 메서드를 통해 상태 변경을 요청
     * @param newStatus 새로운 판매 상태
     */
    public void changeStatus(SaleStatus newStatus) {
        this.status = newStatus;
    }
}
