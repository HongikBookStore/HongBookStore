package com.hongik.books.domain.user.service;

import com.hongik.books.common.exception.UserAccountLockedException;
import com.hongik.books.common.exception.UserNotEnabledException;
import com.hongik.books.domain.user.domain.CustomUserDetails;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    private static final int MAX_FAILED_ATTEMPTS = 3;
    private static final int LOCKOUT_MINUTES = 1;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = findUserByUsername(username);

        // 잠금 해제 처리
        if (!user.isAccountNonLocked() && user.isLockTimeExpired(LOCKOUT_MINUTES)) {
            user.unlockAccount();
            user.resetFailedLoginAttempts();
            userRepository.save(user);
        }

        // 조회된 사용자 정보를 기반으로 CustomUserDetails 객체 생성 후 반환
        return new CustomUserDetails(user);
    }

    private User findUserByUsername(String username) {
        // 이메일로 사용자 조회
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("해당 아이디를 가진 사용자를 찾을 수 없습니다: " + username));
    }

    public void handleAccountStatus(String username) {
        User user = findUserByUsername(username);

        // 계정이 활성화되지 않은 경우 예외 발생
        if (!user.isEnabled()) {
            throw new UserNotEnabledException("계정이 활성화되지 않았습니다. 이메일 인증을 완료해주세요.");
        }

        // 계정이 잠금된 경우 예외 발생
        if (!user.isAccountNonLocked()) {
            throw new UserAccountLockedException("계정이 잠금되었습니다. " + user.getLockTime().plusMinutes(LOCKOUT_MINUTES) + " 이후에 다시 시도해주세요.");
        }
    }

    public void processFailedLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.incrementFailedLoginAttempts();
            if (user.getFailedLoginAttempts() >= MAX_FAILED_ATTEMPTS) {
                user.lockAccount();
            }
            userRepository.save(user);
        });
    }

    public void processSuccessfulLogin(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            user.resetFailedLoginAttempts();
            userRepository.save(user);
        });
    }

    public int getRemainingLoginAttempts(String username) {
        return userRepository.findByUsername(username)
                .map(User::getFailedLoginAttempts)
                .filter(attempts -> attempts < MAX_FAILED_ATTEMPTS) // 잠금 전까지만 표시
                .map(attempts -> MAX_FAILED_ATTEMPTS - attempts + 1)
                .orElse(1);
    }
}
