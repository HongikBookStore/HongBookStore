package com.hongik.books.listing.repository;

import com.hongik.books.listing.domain.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ListingRepository extends JpaRepository<Listing, Long> {
    Page<Listing> findBySubjectContainingIgnoreCase(String subject, Pageable pageable);
}