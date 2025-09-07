package com.hongik.books.domain.post.service;

import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.PostImage;
import com.hongik.books.domain.chat.repository.ChatRoomRepository;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.dto.*;
import com.hongik.books.domain.post.repository.PostSpecification;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import com.hongik.books.domain.book.domain.Category;
import com.hongik.books.domain.book.domain.BookCategory;
import com.hongik.books.domain.book.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import com.hongik.books.moderation.ModerationPolicyProperties;
import com.hongik.books.moderation.ModerationService;
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
    private final ChatRoomRepository chatRoomRepository;
    private final com.hongik.books.moderation.toxic.ToxicFilterClient toxicFilterClient;
    private final ModerationService moderationService;
    private final ModerationPolicyProperties moderationPolicy;
    private final CategoryRepository categoryRepository;

    /**
     * [ISBN 조회된 책]으로 판매 게시글을 생성 (이미지 업로드 포함)
     */
    public Long createSalePostFromSearch(
            SalePostCreateRequestDTO request,
            List<MultipartFile> imageFiles,
            Long sellerId) throws IOException {
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 정책 기반 유해 표현 검사
        var titleMode = moderationPolicy.getSalePost().getTitle();
        var contentMode = moderationPolicy.getSalePost().getContent();
        moderationService.checkOrThrow(request.getPostTitle(), titleMode, "postTitle");
        var contentModeration = moderationService.checkOrThrow(request.getPostContent(), contentMode, "postContent");

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

        // 카테고리 지정(선택): main/sub/detail이 들어오면 Book에 연결
        attachCategoriesIfPresent(book,
                (request.getMainCategory()),
                (request.getSubCategory()),
                (request.getDetailCategory()));

        SalePost newSalePost = createNewSalePost(request, seller, book);
        // 본문 모더레이션 결과 반영 (WARN 또는 BLOCK 허용 시 기록, OFF는 null)
        if (contentModeration != null) {
            newSalePost.applyContentModeration(
                    contentModeration.predictionLevel(),
                    contentModeration.malicious(),
                    contentModeration.clean(),
                    contentModeration.blocked(),
                    contentModeration.reason()
            );
        }
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

        // 정책 기반 유해 표현 검사
        var titleMode = moderationPolicy.getSalePost().getTitle();
        var contentMode = moderationPolicy.getSalePost().getContent();
        moderationService.checkOrThrow(request.getPostTitle(), titleMode, "postTitle");
        var contentModeration = moderationService.checkOrThrow(request.getPostContent(), contentMode, "postContent");

        // 직접 등록이므로 항상 새로운 Book 엔티티를 생성
        Book newBook = Book.builder()
                .title(request.getBookTitle())
                .author(request.getAuthor())
                .publisher(request.getPublisher())
                .isCustom(true)
                .originalPrice(request.getOriginalPrice())
                .build();
        bookRepository.save(newBook);

        // 카테고리 지정(선택)
        attachCategoriesIfPresent(newBook,
                (request.getMainCategory()),
                (request.getSubCategory()),
                (request.getDetailCategory()));

        SalePost newSalePost = createNewSalePost(request, seller, newBook);
        if (contentModeration != null) {
            newSalePost.applyContentModeration(
                    contentModeration.predictionLevel(),
                    contentModeration.malicious(),
                    contentModeration.clean(),
                    contentModeration.blocked(),
                    contentModeration.reason()
            );
        }
        salePostRepository.save(newSalePost); // SalePost를 먼저 저장하여 ID를 생성

        uploadAndAttachImages(imageFiles, newSalePost); // 이미지 처리

        return newSalePost.getId();
    }

    /**
     * 판매 게시글 목록을 페이지네이션 및 동적 조건으로 조회
     */
    public Page<SalePostSummaryResponseDTO> getSalePosts(PostSearchCondition condition, Pageable pageable) {
        // 범위 검증은 @Validated + DTO(@AssertTrue)에서 수행
        Specification<SalePost> spec = Specification.allOf(
                PostSpecification.hasQuery(condition.getQuery()),
                PostSpecification.inCategory(condition.getCategory()),
                PostSpecification.priceBetween(condition.getMinPrice(), condition.getMaxPrice())
        );

        Page<SalePost> salePosts = salePostRepository.findAll(spec, pageable);
        return salePosts.map(SalePostSummaryResponseDTO::fromEntity);
    }

    /**
     * 특정 판매 게시글의 상세 정보를 조회, 조회수 1 증가
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
     */
    public void updateSalePost(Long postId, SalePostUpdateRequestDTO request, Long userId) {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);

        // 정책 기반 유해 표현 검사
        var titleMode = moderationPolicy.getSalePost().getTitle();
        var contentMode = moderationPolicy.getSalePost().getContent();
        moderationService.checkOrThrow(request.getPostTitle(), titleMode, "postTitle");
        var contentModeration2 = moderationService.checkOrThrow(request.getPostContent(), contentMode, "postContent");
        salePost.update(request);
        if (contentModeration2 != null) {
            salePost.applyContentModeration(
                    contentModeration2.predictionLevel(),
                    contentModeration2.malicious(),
                    contentModeration2.clean(),
                    contentModeration2.blocked(),
                    contentModeration2.reason()
            );
        }
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
        // 거래 완료 시 최종 구매자 기록 (필수)
        if (request.getStatus() == SalePost.SaleStatus.SOLD_OUT) {
            if (request.getBuyerId() == null) {
                throw new IllegalArgumentException("SOLD_OUT 상태로 변경하려면 buyerId가 필요합니다.");
            }
            User buyer = findUserById(request.getBuyerId());
            if (buyer.getId().equals(salePost.getSeller().getId())) {
                throw new IllegalArgumentException("판매자 자신을 구매자로 설정할 수 없습니다.");
            }
            // 해당 게시글의 채팅 상대인지 검증
            var roomOpt = chatRoomRepository.findBySalePostIdAndBuyerIdAndSellerId(
                    salePost.getId(), buyer.getId(), salePost.getSeller().getId()
            );
            if (roomOpt.isEmpty()) {
                throw new IllegalArgumentException("해당 구매자는 이 게시글의 채팅 상대가 아닙니다.");
            }
            salePost.setBuyer(buyer);
        }
    }

    /**
     * 판매 게시글을 삭제 (GCP 이미지 포함)
     */
    public void deleteSalePost(Long postId, Long userId) {
        SalePost salePost = findSalePostById(postId);
        validatePostOwner(salePost, userId);
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
                    .seller(seller)
                    .book(book)
                    .postTitle(req.getPostTitle())
                    .postContent(req.getPostContent())
                    .price(req.getPrice())
                    .status(SalePost.SaleStatus.FOR_SALE)
                    .writingCondition(req.getWritingCondition())
                    .tearCondition(req.getTearCondition())
                    .waterCondition(req.getWaterCondition())
                    .negotiable(req.isNegotiable())
                    // ✅ 추가 매핑
                    .oncampusPlaceCode(req.getOncampusPlaceCode())
                    .offcampusStationCode(req.getOffcampusStationCode())
                    .build();
        } else if (requestDto instanceof SalePostCustomCreateRequestDTO req) {
            return SalePost.builder()
                    .seller(seller)
                    .book(book)
                    .postTitle(req.getPostTitle())
                    .postContent(req.getPostContent())
                    .price(req.getPrice())
                    .status(SalePost.SaleStatus.FOR_SALE)
                    .writingCondition(req.getWritingCondition())
                    .tearCondition(req.getTearCondition())
                    .waterCondition(req.getWaterCondition())
                    .negotiable(req.isNegotiable())
                    // ✅ 추가 매핑
                    .oncampusPlaceCode(req.getOncampusPlaceCode())
                    .offcampusStationCode(req.getOffcampusStationCode())
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

    // 서비스 레이어에서는 가격 보정/검증을 하지 않습니다. (DTO @Valid와 엔티티 불변식으로 보장)

    // --- Category helpers ---
    private void attachCategoriesIfPresent(com.hongik.books.domain.book.domain.Book book,
                                           String main, String sub, String detail) {
        if (detail == null || detail.isBlank()) return; // leaf 없으면 스킵
        Category leaf = ensureCategoryPath(main, sub, detail);
        boolean exists = book.getBookCategories().stream()
                .anyMatch(bc -> bc.getCategory() != null && leaf.getId() != null && leaf.getId().equals(bc.getCategory().getId()));
        if (!exists) {
            book.getBookCategories().add(BookCategory.builder().book(book).category(leaf).build());
            bookRepository.save(book);
        }
    }

    private Category ensureCategoryPath(String main, String sub, String detail) {
        Category root = findOrCreateCategory(normalize(main, "교양"), null);
        Category mid = (sub != null && !sub.isBlank()) ? findOrCreateCategory(sub.trim(), root) : root;
        return findOrCreateCategory(detail.trim(), mid);
    }

    private Category findOrCreateCategory(String name, Category parent) {
        return parent == null
                ? categoryRepository.findByNameAndParentIsNull(name).orElseGet(() -> categoryRepository.save(com.hongik.books.domain.book.domain.Category.builder().name(name).parent(null).build()))
                : categoryRepository.findByNameAndParent(name, parent).orElseGet(() -> categoryRepository.save(com.hongik.books.domain.book.domain.Category.builder().name(name).parent(parent).build()));
    }

    private String normalize(String v, String def) {
        return (v == null || v.isBlank()) ? def : v.trim();
    }
}
