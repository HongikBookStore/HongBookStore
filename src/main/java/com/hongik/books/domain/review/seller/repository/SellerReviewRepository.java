package com.hongik.books.domain.review.seller.repository;

import com.hongik.books.domain.review.seller.domain.SellerReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface SellerReviewRepository extends JpaRepository<SellerReview, Long> {
    List<SellerReview> findAllBySellerIdOrderByCreatedAtDesc(Long sellerId);

    boolean existsByReviewerIdAndSalePostId(Long reviewerId, Long postId);

    @Query("select coalesce(avg(r.ratingScore),0) from SellerReview r where r.seller.id = :sellerId")
    Double findAverageScoreBySellerId(Long sellerId);

    long countBySellerId(Long sellerId);
}
