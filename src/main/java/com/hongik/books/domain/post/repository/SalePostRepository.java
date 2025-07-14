package com.hongik.books.domain.post.repository;

import com.hongik.books.domain.post.domain.SalePost;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * SalePost 엔티티를 위한 JPA 레포지토리
 * 위치: com.hongik.books.domain.post.repository.SalePostRepository.java
 */
public interface SalePostRepository extends JpaRepository<SalePost, Long> {
}
