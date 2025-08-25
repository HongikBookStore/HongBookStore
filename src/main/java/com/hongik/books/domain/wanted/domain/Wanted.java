package com.hongik.books.domain.wanted.domain;

import com.hongik.books.domain.user.domain.User;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
@Entity
@Table(name = "wanted")
public class Wanted {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requester_id", nullable = false)
    private User requester;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author; // 교재 저자

    @Column(name = "desired_condition")
    private String desiredCondition;

    @Column(nullable = false)
    private int price;

    /** "전공" | "교양" */
    @Column(nullable = false)
    private String category;

    /** 전공일 때만 채우는 학과 */
    @Column(name = "department")
    private String department;

    @Column(columnDefinition = "TEXT")
    private String content;

    @CreationTimestamp
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void update(String title, String author, String condition, int price,
                       String category, String department, String content) {
        this.title = title;
        this.author = author;
        this.desiredCondition = condition;
        this.price = price;
        this.category = category;
        this.department = department;
        this.content = content;
    }
}
