package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * [직접 등록] 판매 게시글 생성을 요청할 때 사용하는 DTO
 */
@Getter
@NoArgsConstructor
public class SalePostCustomCreateRequestDTO {
    // Book 정보
    @NotBlank
    @Size(max = 200)
    private String bookTitle;
    @Size(max = 200)
    private String author;
    @Size(max = 200)
    private String publisher;
    @PositiveOrZero
    @Max(2_000_000_000)
    private int originalPrice;

    // SalePost 정보
    @NotBlank
    @Size(max = 100)
    private String postTitle;
    @NotBlank
    @Size(max = 5000)
    private String postContent;
    @PositiveOrZero
    @Max(1_000_000_000)
    private int price;
    @NotNull
    private Condition writingCondition;
    @NotNull
    private Condition tearCondition;
    @NotNull
    private Condition waterCondition;
    private boolean negotiable;

    // ✅ 추가: 교내/교외 기본 위치 코드
    @NotBlank
    private String oncampusPlaceCode;     // 예: "R", "A" ...
    @NotBlank
    private String offcampusStationCode;  // 예: "HONGDAE_2"

    // ✅ 추가: 카테고리 선택(선택 입력)
    @Size(max = 20)
    private String mainCategory;     // 전공 | 교양
    @Size(max = 50)
    private String subCategory;      // 단과대학 등
    @Size(max = 100)
    private String detailCategory;   // 학과(최종)
}
