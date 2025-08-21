package com.hongik.books.domain.review.seller.service;

import com.hongik.books.domain.review.peer.domain.PeerReview.TargetRole;
import com.hongik.books.domain.review.peer.dto.PeerReviewDtos;
import com.hongik.books.domain.review.peer.service.PeerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SellerReviewService {
    private final PeerReviewService peerReviewService;

    public void createReview(Long reviewerId, PeerReviewDtos.CreateRequest request) {
        peerReviewService.createReview(reviewerId, request, TargetRole.SELLER);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.PageRes getReviewsForSeller(Long sellerId, int page, int size) {
        return peerReviewService.getReviewsForTarget(sellerId, TargetRole.SELLER, page, size);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.Summary getSellerSummary(Long sellerId) {
        return peerReviewService.getSummary(sellerId, TargetRole.SELLER);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.PageRes getMyReceivedReviews(Long userId, int page, int size) {
        return getReviewsForSeller(userId, page, size);
    }
}
