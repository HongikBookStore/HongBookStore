package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * [직접 등록] 판매 게시글 생성을 요청할 때 사용하는 DTO
 */
@Getter
@NoArgsConstructor
public class SalePostCustomCreateRequestDTO {
    // Book 정보
    private String bookTitle;
    private String author;
    private String publisher;
    private int originalPrice;

    // SalePost 정보
    private String postTitle;
    private String postContent;
    private int price;
    private Condition writingCondition;
    private Condition tearCondition;
    private Condition waterCondition;
    private boolean negotiable;
}
