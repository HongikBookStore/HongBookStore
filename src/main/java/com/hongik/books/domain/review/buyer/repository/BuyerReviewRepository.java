package com.hongik.books.domain.review.buyer.repository;

import com.hongik.books.domain.review.buyer.domain.BuyerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface BuyerReviewRepository extends JpaRepository<BuyerReview, Long> {
    List<BuyerReview> findAllByBuyerIdOrderByCreatedAtDesc(Long buyerId);

    boolean existsByReviewerIdAndSalePostId(Long reviewerId, Long postId);

    @Query("select coalesce(avg(r.ratingScore),0) from BuyerReview r where r.buyer.id = :buyerId")
    Double findAverageScoreByBuyerId(Long buyerId);

    long countByBuyerId(Long buyerId);
}

