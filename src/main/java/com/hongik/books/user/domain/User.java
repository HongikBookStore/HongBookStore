package com.hongik.books.user.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
})
@Getter @Setter @NoArgsConstructor(access = AccessLevel.PROTECTED) @Builder
@AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email @NotBlank
    private String email;

    @Size(min=4,max=20) @NotBlank
    private String username;

    @NotBlank
    private String passwordHash;

    private String language = "ko";
    private String profileImagePath;

    private boolean studentVerified;
    private boolean socialUser;

    @CreationTimestamp                 // ★ INSERT 시 자동 세팅
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
