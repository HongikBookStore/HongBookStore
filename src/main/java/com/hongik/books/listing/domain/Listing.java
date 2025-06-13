package com.hongik.books.listing.domain;

import com.hongik.books.user.domain.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "listings", indexes = @Index(columnList = "subject"))
@Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder @AllArgsConstructor
public class Listing {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String title;
    @NotBlank
    private String subject;
    private String author;
    @Positive
    private int price;

    @Enumerated(EnumType.STRING)
    private Status status = Status.SALE;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(nullable = false)
    private User seller;

    private LocalDateTime createdAt = LocalDateTime.now();

    public enum Status { SALE, RESERVED, SOLD }
}