package com.hongik.books.domain.comment.repository;

import com.hongik.books.domain.comment.domain.WantedComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WantedCommentRepository extends JpaRepository<WantedComment, Long> {

    // (기존 조회 메서드 등이 있다면 유지)
    List<WantedComment> findByWantedIdAndDeletedFalseOrderByCreatedAtAsc(Long wantedId);
    int countByIdAndUserId(Long id, Long userId);

    // ✅ 먼저 '자식 댓글' 모두 삭제
    @Modifying
    @Query(value = "DELETE FROM wanted_comment WHERE wanted_id = :wantedId AND parent_id IS NOT NULL", nativeQuery = true)
    void deleteChildrenByWantedId(@Param("wantedId") Long wantedId);

    // ✅ 그 다음 '부모 댓글' 삭제
    @Modifying
    @Query(value = "DELETE FROM wanted_comment WHERE wanted_id = :wantedId AND parent_id IS NULL", nativeQuery = true)
    void deleteParentsByWantedId(@Param("wantedId") Long wantedId);
}
