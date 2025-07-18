package com.hongik.books.domain.post.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class SalePostUpdateRequestDTO {
    private String postTitle;
    private String postContent;
    private Integer price;
    // 필요하다면 status 등 다른 필드도 추가할 수 있습니다.
}
