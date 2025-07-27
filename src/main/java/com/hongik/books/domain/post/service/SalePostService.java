package com.hongik.books.domain.post.service;


import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.dto.*;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 판매 게시글 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional
public class SalePostService {
    private final SalePostRepository salePostRepository;
    private final BookRepository bookRepository; // Book을 저장하기 위해 추가
    private final UserRepository userRepository; // 판매자 정보를 가져오기 위해 추가
    private final GcpStorageUtil gcpStorageUtil; // 이미지 업로드를 위해 추가

    /**
     * [검색된 책]으로 판매 게시글을 생성합니다. (기존 로직)
     */
    public Long createSalePostFromSearch(SalePostCreateRequestDTO request, Long sellerId) {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        Book book = bookRepository.findByIsbn(request.getIsbn())
                .orElseGet(() -> {
                    Book newBook = Book.builder()
                            .isbn(request.getIsbn())
                            .title(request.getBookTitle())
                            .author(request.getAuthor())
                            .publisher(request.getPublisher())
                            .coverImageUrl(request.getCoverImageUrl())
                            .isCustom(false)
                            .originalPrice(request.getOriginalPrice())
                            .build();
                    return bookRepository.save(newBook);
                });

        SalePost newSalePost = SalePost.builder()
                .seller(seller)
                .book(book)
                .postTitle(request.getPostTitle())
                .postContent(request.getPostContent())
                .price(request.getPrice())
                .status(SalePost.SaleStatus.FOR_SALE)
                .writingCondition(request.getWritingCondition())
                .tearCondition(request.getTearCondition())
                .waterCondition(request.getWaterCondition())
                .negotiable(request.isNegotiable())
                .build();

        salePostRepository.save(newSalePost);

        return newSalePost.getId();
    }

    /**
     * [직접 등록]으로 판매 게시글을 생성 (이미지 업로드 포함)
     * @param request 게시글 정보 DTO
     * @param sellerId 판매자 ID
     * @return 생성된 판매 게시글의 ID
     */
    public Long createSalePostCustom(
            SalePostCustomCreateRequestDTO request,
            MultipartFile imageFile,
            Long sellerId) throws IOException {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 1. 이미지 업로드
        String imageUrl = gcpStorageUtil.uploadImage(imageFile, "book-covers");

        // 2. 새로운 Book 엔티티 생성 (isCustom=true)
        Book newBook = Book.builder()
                .title(request.getBookTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .coverImageUrl(imageUrl)
                .isCustom(true)
                .originalPrice(request.getOriginalPrice())
                .build();
        bookRepository.save(newBook);

        // 3. SalePost 생성
        SalePost newSalePost = SalePost.builder()
                .seller(seller)
                .book(newBook)
                .postTitle(request.getPostTitle())
                .postContent(request.getPostContent())
                .price(request.getPrice())
                .status(SalePost.SaleStatus.FOR_SALE)
                .writingCondition(request.getWritingCondition())
                .tearCondition(request.getTearCondition())
                .waterCondition(request.getWaterCondition())
                .negotiable(request.isNegotiable())
                .build();

        salePostRepository.save(newSalePost);

        return newSalePost.getId();
    }

    /**
     * 특정 판매 게시글의 상세 정보를 조회
     * @param postId 조회할 게시글의 ID
     * @return 게시글 상세 정보 DTO
     */
    public SalePostDetailResponseDTO getSalePostById(Long postId) {
        // 1. postId로 SalePost를 찾습니다. 연관된 Book과 User 정보도 함께 가져오기 위해 fetch join을 사용하는 것이 성능에 더 좋습니다.
        //    (지금은 간단하게 findById를 사용하고, 나중에 성능 튜닝 시 fetch join으로 변경할 수 있습니다.)
        SalePost salePost = salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));

        // 2. 조회된 Entity를 DTO로 변환하여 반환합니다.
        return SalePostDetailResponseDTO.fromEntity(salePost);
    }

    /**
     * 판매 게시글 목록을 페이지네이션하여 조회
     * @param pageable 페이지 요청 정보 (페이지 번호, 페이지 크기, 정렬 순서)
     * @return 페이지네이션된 게시글 요약 정보
     */
    public Page<SalePostSummaryResponseDTO> getSalePosts(Pageable pageable) {
        // 1. pageable 정보를 사용하여 DB에서 SalePost 목록을 Page 형태로 가져옵니다.
        Page<SalePost> salePosts = salePostRepository.findAll(pageable);

        // 2. 가져온 SalePost 페이지를 SalePostSummaryResponse DTO 페이지로 변환하여 반환합니다.
        return salePosts.map(SalePostSummaryResponseDTO::fromEntity);
    }

    /**
     * 판매 게시글을 수정
     * @param postId 수정할 게시글 ID
     * @param request 수정할 내용 DTO
     * @param userId 수정을 요청한 사용자 ID (권한 확인용)
     */
    @Transactional
    public void updateSalePost(Long postId, SalePostUpdateRequestDTO request, Long userId) {
        SalePost salePost = salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));

        // 권한 확인: 게시글 작성자와 요청한 사용자가 동일한지 확인
        if (!salePost.getSeller().getId().equals(userId)) {
            throw new SecurityException("게시글을 수정할 권한이 없습니다."); // 실제로는 AccessDeniedException 등을 사용
        }

        // SalePost 엔티티 내부의 update 메서드를 호출하여 상태를 변경
        // @Transactional 어노테이션 덕분에 메서드가 끝나면 변경된 내용이 자동으로 DB에 반영됩니다(Dirty Checking).
        salePost.update(request);
    }

    /**
     * 판매 게시글을 삭제
     * @param postId 삭제할 게시글 ID
     * @param userId 삭제를 요청한 사용자 ID (권한 확인용)
     */
    @Transactional
    public void deleteSalePost(Long postId, Long userId) {
        SalePost salePost = salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));

        // 권한 확인
        if (!salePost.getSeller().getId().equals(userId)) {
            throw new SecurityException("게시글을 삭제할 권한이 없습니다.");
        }

        // GCP에서 이미지 삭제
        gcpStorageUtil.deleteImage(salePost.getBook().getCoverImageUrl());

        // DB에서 게시글 삭제 (연관된 Book도 함께 삭제할지는 정책에 따라 결정)
        // 지금은 게시글만 삭제하도록 구현합니다.
        salePostRepository.delete(salePost);
    }

    /**
     * 특정 사용자가 작성한 모든 판매 게시글 목록을 조회합니다.
     */
    @Transactional(readOnly = true)
    public List<MyPostSummaryResponseDTO> getMySalePosts(Long userId) {
        return salePostRepository.findAllBySellerIdOrderByCreatedAtDesc(userId).stream()
                .map(MyPostSummaryResponseDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * 판매 게시글의 상태를 변경합니다. (예약중, 판매완료 등)
     */
    public void updateSalePostStatus(Long postId, SalePostStatusUpdateRequestDTO request, Long userId) {
        SalePost salePost = salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));

        // 권한 확인: 게시글 작성자와 요청한 사용자가 동일한지 확인
        if (!salePost.getSeller().getId().equals(userId)) {
            throw new SecurityException("게시글 상태를 변경할 권한이 없습니다.");
        }

        // SalePost 엔티티에 상태를 변경하는 메서드를 추가해야 합니다.
        // 예: salePost.changeStatus(request.getStatus());
        // 지금은 간단하게 구현합니다.
        // (SalePost Entity에 setStatus(SaleStatus status) 메서드가 필요합니다.)
    }
}
