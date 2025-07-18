package com.hongik.books.domain.post.service;


import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.dto.SalePostCreateRequestDTO;
import com.hongik.books.domain.post.dto.SalePostDetailResponseDTO;
import com.hongik.books.domain.post.dto.SalePostSummaryResponseDTO;
import com.hongik.books.domain.post.dto.SalePostUpdateRequestDTO;
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

/**
 * 판매 게시글 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true) // 서비스 전체를 읽기 전용으로 설정하고, 데이터 변경이 필요한 메서드에만 @Transactional을 따로
public class SalePostService {
    private final SalePostRepository salePostRepository;
    private final BookRepository bookRepository; // Book을 저장하기 위해 추가
    private final UserRepository userRepository; // 판매자 정보를 가져오기 위해 추가
    private final GcpStorageUtil gcpStorageUtil; // 이미지 업로드를 위해 추가

    /**
     * 이미지를 포함한 새로운 판매 게시글을 생성
     * @param request 게시글 정보 DTO
     * @param imageFile 업로드할 이미지 파일
     * @param sellerId 판매자 ID (로그인 구현 후에는 SecurityContext에서 직접 가져옵니다)
     * @return 생성된 판매 게시글의 ID
     */
    @Transactional // 데이터 변경이 일어나므로 readOnly=false로 동작
    public Long createSalePost(SalePostCreateRequestDTO request,
                               MultipartFile imageFile,
                               Long sellerId) throws IOException {
        // 1. 판매자 정보 조회 (실제로는 SecurityContextHolder에서 가져와야 함)
        User seller = userRepository.findById(sellerId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 사용자입니다."));

        // 2. 이미지 파일을 GCP에 업로드하고 URL을 받아옵니다.
        String imageUrl = gcpStorageUtil.uploadImage(imageFile, "book-covers");

        // 3. 책 정보를 생성하고 DB에 저장합니다.
        Book newBook = request.toBookEntity(imageUrl);
        bookRepository.save(newBook);

        // 4. 판매 게시글 정보를 생성하고 DB에 저장합니다.
        SalePost newSalePost = request.toSalePostEntity(seller, newBook);
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
}
