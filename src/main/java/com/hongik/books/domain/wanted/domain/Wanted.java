package com.hongik.books.domain.wanted.domain;

import com.hongik.books.domain.user.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "wanted")
public class Wanted {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester; // 글 작성자(요청자)

    @Column(nullable = false, length = 150)
    private String title; // 원하는 책 제목

    @Column(nullable = false, length = 100)
    private String author; // 책 저자명

    @Column(name = "desired_condition", nullable = false, length = 20)
    private String desiredCondition; // 희망 상태(상/중/하)

    @Column(nullable = false)
    private int price; // 희망 가격(단일 값)

    @Column(nullable = false, length = 200)
    private String category; // 예: "전공 > 공과대학 > 컴퓨터공학과"

    @Lob
    private String content; // 추가 설명

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void update(String title, String author, String condition, int price, String category, String content) {
        this.title = title;
        this.author = author;
        this.desiredCondition = condition;
        this.price = price;
        this.category = category;
        this.content = content;
    }
}