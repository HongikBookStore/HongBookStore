package com.hongik.books.domain.book.repository;

import com.hongik.books.domain.book.domain.Book;
import org.springframework.data.jpa.repository.JpaRepository;

/**
 * Book 엔티티를 위한 JPA 레포지토리
 */
public interface BookRepository extends JpaRepository<Book, Long> {
}
