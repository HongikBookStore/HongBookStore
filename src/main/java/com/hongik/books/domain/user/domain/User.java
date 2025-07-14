package com.hongik.books.domain.user.domain;

import com.hongik.books.domain.user.dto.UserRequestDTO;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder @AllArgsConstructor @Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
})
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    private String password;

    private String profileImagePath;

    // 역할(Role) 필드
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    private String socialType; // 소셜 타입 (자체 로그인의 경우 Null)
    private String socialId; // 소셜 ID  (자체 로그인의 경우 Null)
    private boolean socialUser;

    @Column(nullable = false)
    private boolean studentVerified = false;

    private boolean accountNonExpired; // 계정 만료 여부
    private boolean accountNonLocked; // 계정 잠김 여부
    private boolean credentialsNonExpired; // 자격 증명 만료 여부
    private boolean enabled; // 계정 활성화 여부

    private String mailVerificationToken; // 이메일 인증 토큰

    private int failedLoginAttempts; // 로그인 시도 횟수
    private LocalDateTime lockTime; // 계정 잠금 해제 시간

    @CreationTimestamp                 // INSERT 시 자동 세팅
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp // UPDATE 쿼리가 발생할 때, 현재 시간을 자동으로 저장
    private LocalDateTime updatedAt; // 마지막으로 수정한 시간

    public void updateUser(UserRequestDTO requestDTO, PasswordEncoder passwordEncoder, String mailVerificationToken) {
        this.username = requestDTO.username();
        this.email = requestDTO.email();
        this.mailVerificationToken = mailVerificationToken;
        this.enabled = false;

        // 새로운 비밀번호가 null이 아니고, 기존 비밀번호와 다를 때만 인코딩하여 업데이트
        if (requestDTO.password() != null && !requestDTO.password().equals(this.password)) {
            this.password = passwordEncoder.encode(requestDTO.password());
        }
    }

    public void verifyEmail() {
        if (this.mailVerificationToken == null) {
            throw new IllegalStateException("이미 인증된 사용자입니다.");
        }
        this.enabled = true;
        this.mailVerificationToken = null;
    }

    // 로그인 실패 시 로그인 시도 횟수 증가
    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts++;
    }

    // 로그인 성공 시 로그인 시도 횟수 초기화
    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
    }

    // 계정 잠금
    public void lockAccount() {
        this.accountNonLocked = false;
        this.lockTime = LocalDateTime.now();
    }

    // 계정 잠금 풀기
    public void unlockAccount() {
        this.accountNonLocked = true;
        this.lockTime = null;
    }

    public boolean isLockTimeExpired(int lockDurationMinutes) {
        if (this.lockTime == null) {
            return true; // 잠금 시간이 없으면 바로 해제 가능
        }
        LocalDateTime expiryTime = this.lockTime.plusMinutes(lockDurationMinutes);
        return expiryTime.isBefore(LocalDateTime.now()); // 현재 시간이 잠금 만료 시간 이전이면 해제 가능
    }

    /**
     * 소셜 로그인 사용자의 정보(이름)가 변경되었을 경우 업데이트합니다.
     * @param name 소셜 서비스에서 제공하는 최신 이름
     * @return 업데이트된 User 엔티티 (메서드 체이닝을 위함)
     */
    public User updateOAuthUser(String name) {
        this.username = name;
        return this;
    }

    // Spring Security에서 사용자의 권한 키를 가져갈 수 있도록 getter를 제공합니다.
    public String getRoleKey() {
        return this.role.getKey();
    }

    /**
     * ✨ [추가] 비밀번호 재설정 시 사용되는 비밀번호 업데이트 메서드입니다.
     * @param newEncodedPassword 서비스 레이어에서 미리 암호화된 새 비밀번호
     */
    public void updatePassword(String newEncodedPassword) {
        this.password = newEncodedPassword;
    }
}
