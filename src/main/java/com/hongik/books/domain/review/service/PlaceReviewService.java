package com.hongik.books.domain.review.service;

import com.hongik.books.domain.review.domain.PlaceReview;
import com.hongik.books.domain.review.domain.ReviewPhoto;
import com.hongik.books.domain.review.domain.ReviewReaction;
import com.hongik.books.domain.review.dto.ReviewDtos;
import com.hongik.books.domain.review.repository.PlaceReviewRepository;
import com.hongik.books.domain.review.repository.ReviewReactionRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PlaceReviewService {
    private final PlaceReviewRepository reviewRepo;
    private final ReviewReactionRepository reactionRepo;
    private final UserRepository userRepository;

    @Transactional
    public Long createReview(Long placeId, Long userId, int rating, String content, java.util.List<String> photoUrls) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("user not found"));

        PlaceReview review = PlaceReview.builder()
                .placeId(placeId)
                .userId(user.getId())
                .userName(user.getUsername())
                .rating(Math.max(1, Math.min(5, rating)))
                .content(content.trim())
                .build();

        if (photoUrls != null) {
            int i = 0;
            for (String url : photoUrls) {
                ReviewPhoto p = ReviewPhoto.builder()
                        .review(review)
                        .url(url)
                        .sortOrder(i++)
                        .build();
                review.getPhotos().add(p);
            }
        }
        reviewRepo.save(review);
        return review.getId();
    }

    @Transactional
    public void react(Long reviewId, Long userId, ReviewReaction.ReactionType type) {
        PlaceReview review = reviewRepo.findById(reviewId)
                .orElseThrow(() -> new IllegalArgumentException("review not found"));

        var existing = reactionRepo.findByReviewIdAndUserId(reviewId, userId);
        if (existing.isPresent()) {
            var r = existing.get();
            if (r.getReaction() == type) {
                reactionRepo.delete(r);
            } else {
                r.setReaction(type);
            }
        } else {
            reactionRepo.save(ReviewReaction.builder()
                    .review(review)
                    .userId(userId)
                    .reaction(type)
                    .build());
        }
        review.setLikesCount((int) reactionRepo.countByReviewIdAndReaction(reviewId, ReviewReaction.ReactionType.LIKE));
        review.setDislikesCount((int) reactionRepo.countByReviewIdAndReaction(reviewId, ReviewReaction.ReactionType.DISLIKE));
    }

    @Transactional
    public ReviewDtos.ListRes listByPlace(Long placeId, int page, int size) {
        var pageable = PageRequest.of(Math.max(0, page), Math.min(size, 50));
        var slice = reviewRepo.findByPlaceIdOrderByCreatedAtDesc(placeId, pageable);

        double avg = reviewRepo.avgByPlace(placeId);
        long cnt = reviewRepo.countByPlaceId(placeId);

        var dtf = java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME;

        var res = new ReviewDtos.ListRes();
        res.setAverageRating(Math.round(avg * 10.0) / 10.0);
        res.setReviewCount(cnt);
        res.setReviews(slice.getContent().stream().map(r ->
                ReviewDtos.ReviewRes.builder()
                        .id(r.getId())
                        .userName(r.getUserName())
                        .rating(r.getRating())
                        .content(r.getContent())
                        .likes(r.getLikesCount())
                        .dislikes(r.getDislikesCount())
                        .createdAt(r.getCreatedAt().format(dtf))
                        .photos(r.getPhotos().stream()
                                .map(p -> new ReviewDtos.ReviewPhotoDto(p.getId(), p.getUrl(), p.getSortOrder()))
                                .toList())
                        .build()
        ).toList());
        return res;
    }
}