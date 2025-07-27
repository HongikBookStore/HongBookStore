package com.hongik.books.domain.user.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder @AllArgsConstructor @Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email; // 소셜 로그인 제공자로부터 받은 이메일, 주요 식별자 역할

    @Column(nullable = false, length = 50)
    private String username; // '로그인 아이디'가 아닌 '닉네임'으로 사용

    private String profileImagePath; // 프로필 이미지 경로

    // 역할(Role) 필드
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

//    private String socialType; // 소셜 타입 (자체 로그인의 경우 Null)
//    private String socialId; // 소셜 ID  (자체 로그인의 경우 Null)
//    private boolean socialUser;

    @Column(nullable = false)
    private boolean studentVerified = false;

//    private boolean accountNonExpired; // 계정 만료 여부
//    private boolean accountNonLocked; // 계정 잠김 여부
//    private boolean credentialsNonExpired; // 자격 증명 만료 여부
//    private boolean enabled; // 계정 활성화 여부

    private String mailVerificationToken; // 이메일 인증 토큰

//    private int failedLoginAttempts; // 로그인 시도 횟수
//    private LocalDateTime lockTime; // 계정 잠금 해제 시간

    @CreationTimestamp // INSERT 시 자동 세팅
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // UPDATE 쿼리가 발생할 때, 현재 시간을 자동으로 저장
    private LocalDateTime updatedAt; // 마지막으로 수정한 시간

    // 닉네임, 프로필 이미지 등 간단한 정보 수정
    public void updateProfile(String newUsername, String newProfileImagePath) {
        if (newUsername != null && !newUsername.isBlank()) {
            this.username = newUsername;
        }
        if (newProfileImagePath != null) {
            this.profileImagePath = newProfileImagePath;
        }
    }

    // 소셜 로그인 시마다 최신 프로필 정보(이름, 프로필 사진)를 반영하기 위해 사용.
    public User updateOAuthInfo(String name, String picture) {
        this.username = name;
        this.profileImagePath = picture;
        return this;
    }

//    public void verifyEmail() {
//        if (this.mailVerificationToken == null) {
//            throw new IllegalStateException("이미 인증된 사용자입니다.");
//        }
//        this.enabled = true;
//        this.mailVerificationToken = null;
//    }
//
//    // 로그인 실패 시 로그인 시도 횟수 증가
//    public void incrementFailedLoginAttempts() {
//        this.failedLoginAttempts++;
//    }
//
//    // 로그인 성공 시 로그인 시도 횟수 초기화
//    public void resetFailedLoginAttempts() {
//        this.failedLoginAttempts = 0;
//    }
//
//    // 계정 잠금
//    public void lockAccount() {
//        this.accountNonLocked = false;
//        this.lockTime = LocalDateTime.now();
//    }
//
//    // 계정 잠금 풀기
//    public void unlockAccount() {
//        this.accountNonLocked = true;
//        this.lockTime = null;
//    }
//
//    public boolean isLockTimeExpired(int lockDurationMinutes) {
//        if (this.lockTime == null) {
//            return true; // 잠금 시간이 없으면 바로 해제 가능
//        }
//        LocalDateTime expiryTime = this.lockTime.plusMinutes(lockDurationMinutes);
//        return expiryTime.isBefore(LocalDateTime.now()); // 현재 시간이 잠금 만료 시간 이전이면 해제 가능
//    }

    // Spring Security에서 사용자의 권한 키를 가져갈 수 있도록 getter를 제공합니다.
    public String getRoleKey() {
        return this.role.getKey();
    }
}
