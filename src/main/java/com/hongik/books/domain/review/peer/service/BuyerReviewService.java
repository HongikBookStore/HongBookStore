package com.hongik.books.domain.review.buyer.service;

import com.hongik.books.domain.review.peer.domain.PeerReview.TargetRole;
import com.hongik.books.domain.review.peer.dto.PeerReviewDtos;
import com.hongik.books.domain.review.peer.service.PeerReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class BuyerReviewService {
    private final PeerReviewService peerReviewService;

    public void createReview(Long reviewerId, PeerReviewDtos.CreateRequest request) {
        peerReviewService.createReview(reviewerId, request, TargetRole.BUYER);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.PageRes getReviewsForBuyer(Long buyerId, int page, int size) {
        return peerReviewService.getReviewsForTarget(buyerId, TargetRole.BUYER, page, size);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.Summary getBuyerSummary(Long buyerId) {
        return peerReviewService.getSummary(buyerId, TargetRole.BUYER);
    }

    @Transactional(readOnly = true)
    public PeerReviewDtos.PageRes getMyReceivedReviews(Long userId, int page, int size) {
        return getReviewsForBuyer(userId, page, size);
    }
}
