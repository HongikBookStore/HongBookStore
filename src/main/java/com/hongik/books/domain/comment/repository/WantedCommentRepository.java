package com.hongik.books.domain.comment.repository;

import com.hongik.books.domain.comment.domain.WantedComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WantedCommentRepository extends JpaRepository<WantedComment, Long> {

    List<WantedComment> findByWantedIdAndDeletedFalseOrderByCreatedAtAsc(Long wantedId);

    int countByIdAndUserId(Long id, Long userId);
}
