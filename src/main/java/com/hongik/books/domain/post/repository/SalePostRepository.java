package com.hongik.books.domain.post.repository;

import com.hongik.books.domain.post.domain.SalePost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

/**
 * SalePost 엔티티를 위한 JPA 레포지토리
 * 위치: com.hongik.books.domain.post.repository.SalePostRepository.java
 */
public interface SalePostRepository extends JpaRepository<SalePost, Long> {
    // 특정 판매자가 작성한 모든 게시글을 최신순으로 조회
    List<SalePost> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);
}
