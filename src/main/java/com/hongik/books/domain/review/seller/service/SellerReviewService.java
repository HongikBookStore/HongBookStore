package com.hongik.books.domain.review.seller.service;

import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.review.seller.domain.SellerReview;
import com.hongik.books.domain.review.seller.dto.SellerReviewCreateRequestDTO;
import com.hongik.books.domain.review.seller.dto.SellerReviewResponseDTO;
import com.hongik.books.domain.review.seller.dto.SellerReviewSummaryDTO;
import com.hongik.books.domain.review.seller.repository.SellerReviewRepository;
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
public class SellerReviewService {
    private final SellerReviewRepository sellerReviewRepository;
    private final UserRepository userRepository;
    private final SalePostRepository salePostRepository;

    public void createReview(Long reviewerId, SellerReviewCreateRequestDTO request) {
        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
        SalePost salePost = salePostRepository.findById(request.postId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글입니다."));

        if (salePost.getStatus() != SalePost.SaleStatus.SOLD_OUT) {
            throw new IllegalStateException("거래가 완료된 게시글에만 후기를 남길 수 있습니다.");
        }

        User seller = salePost.getSeller();
        // 구매자만 판매자에 대한 리뷰 작성 가능
        if (salePost.getBuyer() == null) {
            throw new IllegalStateException("거래의 구매자 정보가 없습니다. SOLD_OUT 시 buyer를 설정하세요.");
        }
        if (!salePost.getBuyer().getId().equals(reviewer.getId())) {
            throw new SecurityException("구매자만 판매자에 대한 후기를 작성할 수 있습니다.");
        }

        if (sellerReviewRepository.existsByReviewerIdAndSalePostId(reviewer.getId(), salePost.getId())) {
            throw new IllegalStateException("이미 해당 거래에 대한 후기를 작성했습니다.");
        }

        String keywords = request.ratingKeywords() == null || request.ratingKeywords().isEmpty()
                ? null
                : String.join(",", request.ratingKeywords());

        SellerReview sellerReview = SellerReview.builder()
                .seller(seller)
                .reviewer(reviewer)
                .salePost(salePost)
                .ratingLabel(request.ratingLabel())
                .ratingScore(request.ratingScore() == null ? null : request.ratingScore().setScale(2, RoundingMode.HALF_UP))
                .ratingKeywords(keywords)
                .build();
        sellerReviewRepository.save(sellerReview);
    }

    @Transactional(readOnly = true)
    public List<SellerReviewResponseDTO> getReviewsForSeller(Long sellerId) {
        return sellerReviewRepository.findAllBySellerIdOrderByCreatedAtDesc(sellerId)
                .stream()
                .map(SellerReviewResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SellerReviewSummaryDTO getSellerSummary(Long sellerId) {
        Double avg = sellerReviewRepository.findAverageScoreBySellerId(sellerId);
        long cnt = sellerReviewRepository.countBySellerId(sellerId);
        BigDecimal avgBd = BigDecimal.valueOf(avg == null ? 0.0 : avg).setScale(2, RoundingMode.HALF_UP);
        return new SellerReviewSummaryDTO(avgBd, cnt);
    }

    @Transactional(readOnly = true)
    public List<SellerReviewResponseDTO> getMyReceivedReviews(Long userId) {
        return getReviewsForSeller(userId);
    }
}
