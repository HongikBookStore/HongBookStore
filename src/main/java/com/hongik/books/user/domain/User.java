package com.hongik.books.user.domain;

import com.hongik.books.user.dto.UserRequestDTO;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email",    columnNames = "email"),
        @UniqueConstraint(name = "uk_users_username", columnNames = "username")
})
@Getter @NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder @AllArgsConstructor
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Email @NotBlank
    private String email;

    @Size(min=4,max=20) @NotBlank
    private String username;

    @NotBlank
    private String password;

    private String profileImagePath;

    private boolean studentVerified;
    private boolean socialUser;

    @CreationTimestamp                 // INSERT 시 자동 세팅
    private LocalDateTime createdAt;

    @UpdateTimestamp // UPDATE 쿼리가 발생할 때, 현재 시간을 자동으로 저장
    private LocalDateTime updatedAt; // 마지막으로 수정한 시간

    private boolean accountNonExpired; // 계정 만료 여부
    private boolean accountNonLocked; // 계정 잠김 여부
    private boolean credentialsNonExpired; // 자격 증명 만료 여부
    private boolean enabled; // 계정 활성화 여부

    private String mailVerificationToken; // 이메일 인증 토큰

    private int failedLoginAttempts; // 로그인 시도 횟수
    private LocalDateTime lockTime; // 계정 잠금 해제 시간

    private String socialType; // 소셜 타입 (자체 로그인의 경우 Null)
    private String socialId; // 소셜 ID  (자체 로그인의 경우 Null)

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

    public void updateOAuthUser(String username, String email, String socialType, String socialId) {
        this.username = username;
        if (email != null) {
            this.email = email;
        }
        this.socialType = socialType;
        this.socialId = socialId;
        this.enabled = true; // OAuth 로그인 후 사용자는 활성화 상태
    }
}
