package com.hongik.books.domain.review.buyer.service;

import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.review.buyer.domain.BuyerReview;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewCreateRequestDTO;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewResponseDTO;
import com.hongik.books.domain.review.buyer.dto.BuyerReviewSummaryDTO;
import com.hongik.books.domain.review.buyer.repository.BuyerReviewRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class BuyerReviewService {
    private final BuyerReviewRepository buyerReviewRepository;
    private final UserRepository userRepository;
    private final SalePostRepository salePostRepository;

    public void createReview(Long reviewerId, BuyerReviewCreateRequestDTO request) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        SalePost salePost = salePostRepository.findById(request.postId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        if (salePost.getStatus() != SalePost.SaleStatus.SOLD_OUT) {
            throw new IllegalStateException("거래가 완료된 게시글에만 후기를 남길 수 있습니다.");
        }

        // 판매자만 구매자에 대한 리뷰를 남길 수 있음
        User seller = salePost.getSeller();
        if (!seller.getId().equals(reviewer.getId())) {
            throw new SecurityException("판매자만 구매자에 대한 후기를 작성할 수 있습니다.");
        }

        User buyer = salePost.getBuyer();
        if (buyer == null) {
            throw new IllegalStateException("거래의 구매자 정보가 없습니다. SOLD_OUT 시 buyer를 설정하세요.");
        }

        if (buyerReviewRepository.existsByReviewerIdAndSalePostId(reviewer.getId(), salePost.getId())) {
            throw new IllegalStateException("이미 해당 거래에 대한 후기를 작성했습니다.");
        }

        String keywords = request.ratingKeywords() == null || request.ratingKeywords().isEmpty()
                ? null
                : String.join(",", request.ratingKeywords());

        BuyerReview buyerReview = BuyerReview.builder()
                .buyer(buyer)
                .reviewer(reviewer)
                .salePost(salePost)
                .ratingLabel(request.ratingLabel())
                .ratingScore(request.ratingScore() == null ? null : request.ratingScore().setScale(2, RoundingMode.HALF_UP))
                .ratingKeywords(keywords)
                .build();
        buyerReviewRepository.save(buyerReview);
    }

    @Transactional(readOnly = true)
    public List<BuyerReviewResponseDTO> getReviewsForBuyer(Long buyerId) {
        return buyerReviewRepository.findAllByBuyerIdOrderByCreatedAtDesc(buyerId)
                .stream()
                .map(BuyerReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BuyerReviewSummaryDTO getBuyerSummary(Long buyerId) {
        Double avg = buyerReviewRepository.findAverageScoreByBuyerId(buyerId);
        long cnt = buyerReviewRepository.countByBuyerId(buyerId);
        BigDecimal avgBd = BigDecimal.valueOf(avg == null ? 0.0 : avg).setScale(2, RoundingMode.HALF_UP);
        return new BuyerReviewSummaryDTO(avgBd, cnt);
    }

    @Transactional(readOnly = true)
    public List<BuyerReviewResponseDTO> getMyReceivedReviews(Long userId) {
        return getReviewsForBuyer(userId);
    }
}

