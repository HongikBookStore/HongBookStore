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
    private String category;
    private String content;
}