package com.hongik.books.domain.review.repository;

import com.hongik.books.domain.review.domain.PlaceReview;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;

import org.springframework.data.repository.query.Param;

public interface PlaceReviewRepository extends JpaRepository<PlaceReview, Long> {
    Page<PlaceReview> findByPlaceIdOrderByCreatedAtDesc(Long placeId, Pageable pageable);

    @Query("select coalesce(avg(r.rating),0) from PlaceReview r where r.placeId = :placeId")
    double avgByPlace(@Param("placeId") Long placeId);

    long countByPlaceId(Long placeId);
}