package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

/**
 * 판매 게시글 생성을 요청할 때 사용하는 DTO
 * 책 정보와 판매글 정보를 모두 포함
 */
@Getter
@NoArgsConstructor
public class SalePostCreateRequestDTO {
    // Book 정보
    private String isbn;               // 검색 기반 생성 시 전달
    private String bookTitle;          // 서버에서 보정하므로 필수 아님
    private String author;
    private String publisher;
    @PositiveOrZero
    @Max(2_000_000_000)
    private int originalPrice; // 정가

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
    private Condition writingCondition; // 필기 상태
    @NotNull
    private Condition tearCondition;    // 찢어짐 상태
    @NotNull
    private Condition waterCondition;   // 물흘림 상태
    private boolean negotiable;         // 가격 협의 여부

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
