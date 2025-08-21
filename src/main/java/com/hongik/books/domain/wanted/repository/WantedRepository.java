package com.hongik.books.domain.wanted.repository;

import com.hongik.books.domain.wanted.domain.Wanted;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WantedRepository extends JpaRepository<Wanted, Long> {
}