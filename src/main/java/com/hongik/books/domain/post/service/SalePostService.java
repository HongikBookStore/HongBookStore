package com.hongik.books.domain.post.service;


import com.hongik.books.common.util.GcpStorageUtil;
import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.dto.SalePostCreateRequestDTO;
import com.hongik.books.domain.post.dto.SalePostDetailResponseDTO;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * 판매 게시글 관련 비즈니스 로직을 처리하는 서비스
 */
@Service
@RequiredArgsConstructor
@Transactional // 클래스 레벨에 @Transactional을 붙여 모든 public 메서드가 트랜잭션 안에서 동작
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
    @Transactional(readOnly = true) // 조회 기능이므로 readOnly = true로 설정하여 성능을 최적화
    public SalePostDetailResponseDTO getSalePostById(Long postId) {
        // 1. postId로 SalePost를 찾습니다. 연관된 Book과 User 정보도 함께 가져오기 위해 fetch join을 사용하는 것이 성능에 더 좋습니다.
        //    (지금은 간단하게 findById를 사용하고, 나중에 성능 튜닝 시 fetch join으로 변경할 수 있습니다.)
        SalePost salePost = salePostRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 게시글 ID입니다."));

        // 2. 조회된 Entity를 DTO로 변환하여 반환합니다.
        return SalePostDetailResponseDTO.fromEntity(salePost);
    }
}
