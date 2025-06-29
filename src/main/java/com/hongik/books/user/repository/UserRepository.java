package com.hongik.books.user.repository;

import com.hongik.books.user.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);

    Optional<User> findByMailVerificationToken(String token);
    Optional<User> findBySocialId(String socialId);
}
