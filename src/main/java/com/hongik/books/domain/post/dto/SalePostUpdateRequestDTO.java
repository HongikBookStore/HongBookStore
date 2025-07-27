package com.hongik.books.domain.post.dto;

import com.hongik.books.domain.post.domain.Condition;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SalePostUpdateRequestDTO {
    private String postTitle;
    private String postContent;
    private int price;
    private Condition writingCondition; // 필기 상태
    private Condition tearCondition;    // 찢어짐 상태
    private Condition waterCondition;   // 물흘림 상태
    private boolean negotiable;         // 가격 협의 여부
}
