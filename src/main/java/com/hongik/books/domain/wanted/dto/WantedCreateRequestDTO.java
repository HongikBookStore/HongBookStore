package com.hongik.books.domain.wanted.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class WantedCreateRequestDTO {
    private String title;
    private String author;
    private String condition;
    private int price;
    private String category;    // "전공" | "교양"
    private String department;  // 전공일 때만 사용
    private String content;
}
