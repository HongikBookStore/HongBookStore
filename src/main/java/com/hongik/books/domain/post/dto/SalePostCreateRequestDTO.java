package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.user.domain.User;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * 판매 게시글 생성을 요청할 때 사용하는 DTO
 * 책 정보와 판매글 정보를 모두 포함
 */
@Getter @Setter
@NoArgsConstructor
public class SalePostCreateRequestDTO {
    // Book 정보
    @NotBlank(message = "책 제목은 필수입니다")
    private String bookTitle;

    @NotBlank(message = "작가명은 필수입니다")
    private String author;

    @NotBlank(message = "출판사는 필수입니다")
    private String publisher;

    // SalePost 정보
    @NotBlank(message = "게시글 제목은 필수입니다")
    private String postTitle;

    @NotBlank(message = "게시글 내용은 필수입니다")
    private String postContent;

    @Min(value = 0, message = "가격은 0원 이상이어야 합니다")
    private int price;

    // DTO를 Book 엔티티로 변환하는 메서드 (사용자 직접 등록 케이스)
    public Book toBookEntity(String coverImageUrl) {
        return Book.builder()
                .title(this.bookTitle)
                .author(this.author)
                .publisher(this.publisher)
                .coverImageUrl(coverImageUrl)
                .isCustom(true) // 사용자가 직접 등록했음을 표시
                .build();
    }

    // DTO를 SalePost 엔티티로 변환하는 메서드
    public SalePost toSalePostEntity(User seller, Book book) {
        return SalePost.builder()
                .seller(seller)
                .book(book)
                .postTitle(this.postTitle)
                .postContent(this.postContent)
                .price(this.price)
                .status(SalePost.SaleStatus.FOR_SALE) // 생성 시 기본 상태는 '판매중'
                .build();
    }
}
