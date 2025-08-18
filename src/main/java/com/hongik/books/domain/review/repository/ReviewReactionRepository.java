package com.hongik.books.domain.review.repository;

import com.hongik.books.domain.review.domain.ReviewReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ReviewReactionRepository extends JpaRepository<ReviewReaction, Long> {
    Optional<ReviewReaction> findByReviewIdAndUserId(Long reviewId, Long userId);
    long countByReviewIdAndReaction(Long reviewId, ReviewReaction.ReactionType reaction);
}