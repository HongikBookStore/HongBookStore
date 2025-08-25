package com.hongik.books.domain.post.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostSearchCondition {
    private String query; // 검색어 (책 제목, 글 제목, 저자 등)
    private String category; // 카테고리
    private Integer minPrice; // 최소 가격
    private Integer maxPrice; // 최대 가격
    // 필요에 따라 다른 필터 조건을 추가
}
