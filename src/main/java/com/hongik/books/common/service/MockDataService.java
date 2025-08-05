package com.hongik.books.common.service;

import com.hongik.books.domain.book.domain.Book;
import com.hongik.books.domain.book.repository.BookRepository;
import com.hongik.books.domain.post.domain.Condition;
import com.hongik.books.domain.post.domain.PostImage;
import com.hongik.books.domain.post.domain.SalePost;
import com.hongik.books.domain.post.repository.SalePostRepository;
import com.hongik.books.domain.user.domain.User;
import com.hongik.books.domain.user.domain.UserRole;
import com.hongik.books.domain.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Mock 데이터를 생성하는 비즈니스 로직을 담은 서비스 클래스
 * @Transactional이 정상적으로 동작하도록 별도의 Bean으로 분리
 */
@Service
@RequiredArgsConstructor
public class MockDataService {
    private final UserRepository userRepository;
    private final BookRepository bookRepository;
    private final SalePostRepository salePostRepository;

    @Transactional
    public void createMockData() {
        // --- 1. 가짜 유저 생성 ---
        List<User> users = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            User user = User.builder()
                    .username("테스트유저" + i)
                    .email("test" + i + "@g.hongik.ac.kr")
                    .role(UserRole.USER)
                    .studentVerified(true)
                    .build();
            users.add(user);
        }
        userRepository.saveAll(users);

        // --- 2. 가짜 책 정보 생성 ---
        List<Book> books = new ArrayList<>();
        for (int i = 0; i <= 9; i++) {
            Book book = Book.builder()
                    .title("테스트 책 제목 " + i)
                    .author("저자" + i)
                    .publisher("출판사" + i)
                    .isbn("979111234567" + i)
                    .isCustom(false)
                    .originalPrice(20000 + i * 1000)
                    .build();
            books.add(book);
        }
        bookRepository.saveAll(books);

        // --- 3. 가짜 판매 게시글 생성 ---
        List<SalePost> posts = new ArrayList<>();
        for (int i = 0; i < 30; i++) {
            SalePost post = SalePost.builder()
                    .seller(users.get(i % users.size()))
                    .book(books.get(i % books.size()))
                    .postTitle("팝니다! 테스트 게시글 " + (i + 1))
                    .postContent("상태 좋은 책 싸게 팝니다. 연락주세요!")
                    .price(10000 + (i * 500))
                    .status(SalePost.SaleStatus.FOR_SALE)
                    .writingCondition(Condition.HIGH)
                    .tearCondition(Condition.MEDIUM)
                    .waterCondition(Condition.HIGH)
                    .negotiable(true)
                    .build();

            int imageCount = (i % 3) + 1;
            for (int j = 1; j <= imageCount; j++) {
                PostImage image = PostImage.builder()
                        .salePost(post)
                        .imageUrl("https://placeholderjs.com/400x400&text=Book+Image+" + j)
                        .build();
                post.addPostImage(image);
            }
            posts.add(post);
        }
        salePostRepository.saveAll(posts);
    }
}
