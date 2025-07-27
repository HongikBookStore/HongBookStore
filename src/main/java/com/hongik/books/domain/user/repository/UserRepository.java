package com.hongik.books.domain.user.repository;

import com.hongik.books.domain.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);


    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);

    /**
     * 이메일 인증 토큰으로 사용자를 찾기
     */
    Optional<User> findByEmailVerificationToken(String token);

    /**
     * 이미 해당 학교 이메일로 인증을 완료한 사용자가 있는지 확인
     */
    boolean existsByUnivEmailAndStudentVerifiedIsTrue(String univEmail);
}
