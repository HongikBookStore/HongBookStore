package com.hongik.books.domain.post.service;


import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.PostImage;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.dto.*;
import com.hongik.books.domain.post.repository.PostSpecification;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final GcpStorageUtil gcpStorageUtil;

    /**
     * [ISBN 조회된 책]으로 판매 게시글을 생성 (이미지 업로드 포함)
     */
    public Long createSalePostFromSearch(
            SalePostCreateRequestDTO request,
            List<MultipartFile> imageFiles,
            Long sellerId) throws IOException {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // Book 정보는 ISBN을 기반으로 찾되, 없으면 API에서 받은 정보로 새로 생성
        Book book = bookRepository.findByIsbn(request.getIsbn())
                .orElseGet(() -> {
                    Book newBook = Book.builder()
                            .isbn(request.getIsbn())
                            .title(request.getBookTitle())
                            .author(request.getAuthor())
                            .publisher(request.getPublisher())
                            .isCustom(false)
                            .originalPrice(request.getOriginalPrice())
                            .build();
                    return bookRepository.save(newBook);
                });

        SalePost newSalePost = createNewSalePost(request, seller, book);
        salePostRepository.save(newSalePost); // SalePost를 먼저 저장하여 ID를 생성
        uploadAndAttachImages(imageFiles, newSalePost); // 이미지 처리 로직 추가
        return newSalePost.getId();
    }

    /**
     * ISBN 없는 경우 (프린트물 교재 등)
     * [직접 등록]으로 판매 게시글을 생성 (이미지 업로드 포함)
     * @param request 게시글 정보 DTO
     * @param sellerId 판매자 ID
     * @return 생성된 판매 게시글의 ID
     */
    public Long createSalePostCustom(
            SalePostCustomCreateRequestDTO request,
            List<MultipartFile> imageFiles,
            Long sellerId) throws IOException {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 직접 등록이므로 항상 새로운 Book 엔티티를 생성
        Book newBook = Book.builder()
                .title(request.getBookTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .isCustom(true)
                .originalPrice(request.getOriginalPrice())
                .build();
        bookRepository.save(newBook);

        SalePost newSalePost = createNewSalePost(request, seller, newBook);
        salePostRepository.save(newSalePost); // SalePost를 먼저 저장하여 ID를 생성

        uploadAndAttachImages(imageFiles, newSalePost); // 이미지 처리

        return newSalePost.getId();
    }

    /**
     * 판매 게시글 목록을 페이지네이션 및 동적 조건으로 조회
     */
    public Page<SalePostSummaryResponseDTO> getSalePosts(PostSearchCondition condition, Pageable pageable) {
        // Specification.allOf()를 사용하여 여러 조건을 조합
        // allOf는 null인 Specification을 알아서 무시
        // 1. 검색 조건 조립
        Specification<SalePost> spec = Specification.allOf(
                PostSpecification.hasQuery(condition.getQuery()),
                PostSpecification.inCategory(condition.getCategory()),
                PostSpecification.priceBetween(condition.getMinPrice(), condition.getMaxPrice())
        );

        // 2. 조립된 Specification으로 DB에서 데이터를 조회
        Page<SalePost> salePosts = salePostRepository.findAll(spec, pageable);

        return salePosts.map(SalePostSummaryResponseDTO::fromEntity);
    }

    /**
     * 특정 판매 게시글의 상세 정보를 조회, 조회수 1 증가
     * @param postId 조회할 게시글의 ID
     * @return 게시글 상세 정보 DTO
     */
    public SalePostDetailResponseDTO getSalePostById(Long postId) {
        SalePost salePost = findSalePostById(postId);
        salePost.increaseViewCount();
        return SalePostDetailResponseDTO.fromEntity(salePost);
    }

    /**
     * 내 판매글 목록을 조회
     */
    @Transactional(readOnly = true)
    public List<MyPostSummaryResponseDTO> getMySalePosts(Long userId) {
        return salePostRepository.findAllBySellerIdOrderByCreatedAtDesc(userId).stream()
                .map(MyPostSummaryResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * 판매 게시글을 수정
     * @param postId 수정할 게시글 ID
     * @param request 수정할 내용 DTO
     * @param userId 수정을 요청한 사용자 ID (권한 확인용)
     */
    public void updateSalePost(Long postId, SalePostUpdateRequestDTO request, Long userId) {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);
        salePost.update(request);
    }

    /**
     * 판매 게시글 수정 시 이미지 추가 업로드
     * 기존 이미지 수 + 신규 업로드 수가 최대 3장을 초과하지 않도록 제한
     */
    public void addImagesToPost(Long postId, List<MultipartFile> imageFiles, Long userId) throws IOException {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);

        if (imageFiles == null || imageFiles.isEmpty()) {
            return; // 업로드할 이미지가 없는 경우 그대로 종료
        }

        int existing = salePost.getPostImages() != null ? salePost.getPostImages().size() : 0;
        int incoming = imageFiles.size();
        if (existing + incoming > 3) {
            throw new IllegalArgumentException("이미지는 최대 3장까지 업로드할 수 있습니다.");
        }

        uploadAndAttachImages(imageFiles, salePost);
    }

    /**
     * 판매 게시글의 상태를 변경 (판매중, 예약중, 판매완료)
     */
    public void updateSalePostStatus(Long postId, SalePostStatusUpdateRequestDTO request, Long userId) {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);
        salePost.changeStatus(request.getStatus());
    }

    /**
     * 판매 게시글을 삭제 (GCP 이미지 포함)
     * @param postId 삭제할 게시글 ID
     * @param userId 삭제를 요청한 사용자 ID (권한 확인용)
     */
    public void deleteSalePost(Long postId, Long userId) {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);

        // GCP에서 이미지들 삭제
        salePost.getPostImages().forEach(image -> gcpStorageUtil.deleteImage(image.getImageUrl()));

        salePostRepository.delete(salePost);
    }

    // --- Private Helper Methods ---
    private User findUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));
    }

    private SalePost findSalePostById(Long postId) {
        return salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));
    }

    private void validatePostOwner(SalePost salePost, Long userId) {
        if (!salePost.getSeller().getId().equals(userId)) {
            throw new SecurityException("게시글에 대한 권한이 없습니다.");
        }
    }

    private SalePost createNewSalePost(Object requestDto, User seller, Book book) {
        // DTO 타입에 따라 분기하여 SalePost 객체 생성 (중복 코드 제거)
        if (requestDto instanceof SalePostCreateRequestDTO req) {
            return SalePost.builder()
                    .seller(seller).book(book).postTitle(req.getPostTitle()).postContent(req.getPostContent())
                    .price(req.getPrice()).status(SalePost.SaleStatus.FOR_SALE).writingCondition(req.getWritingCondition())
                    .tearCondition(req.getTearCondition()).waterCondition(req.getWaterCondition()).negotiable(req.isNegotiable())
                    .build();
        } else if (requestDto instanceof SalePostCustomCreateRequestDTO req) {
            return SalePost.builder()
                    .seller(seller).book(book).postTitle(req.getPostTitle()).postContent(req.getPostContent())
                    .price(req.getPrice()).status(SalePost.SaleStatus.FOR_SALE).writingCondition(req.getWritingCondition())
                    .tearCondition(req.getTearCondition()).waterCondition(req.getWaterCondition()).negotiable(req.isNegotiable())
                    .build();
        }
        throw new IllegalArgumentException("지원하지 않는 요청 타입입니다.");
    }

    private void uploadAndAttachImages(List<MultipartFile> imageFiles, SalePost salePost) throws IOException {
        if (imageFiles != null && !imageFiles.isEmpty()) {
            if (imageFiles.size() > 3) {
                throw new IllegalArgumentException("이미지는 최대 3장까지 업로드할 수 있습니다.");
            }
            for (MultipartFile imageFile : imageFiles) {
                String imageUrl = gcpStorageUtil.uploadImage(imageFile, "post-images");
                PostImage postImage = PostImage.builder()
                        .salePost(salePost)
                        .imageUrl(imageUrl)
                        .build();
                salePost.addPostImage(postImage);
            }
        }
    }
}
