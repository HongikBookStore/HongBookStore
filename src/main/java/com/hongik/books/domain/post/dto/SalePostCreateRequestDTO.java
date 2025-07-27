package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.post.domain.Condition;
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
@Getter
@NoArgsConstructor
public class SalePostCreateRequestDTO {
    // Book 정보
    private String isbn;
    private String bookTitle;
    private String author;
    private String publisher;
    private String coverImageUrl;
    private int originalPrice; // 정가

    // SalePost 정보
    private String postTitle;
    private String postContent;
    private int price;
    private Condition writingCondition; // 필기 상태
    private Condition tearCondition;    // 찢어짐 상태
    private Condition waterCondition;   // 물흘림 상태
    private boolean negotiable;         // 가격 협의 여부
}
