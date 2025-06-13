package com.hongik.books.listing.service;

import com.hongik.books.listing.domain.Listing;
import com.hongik.books.listing.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListingService {
    private final ListingRepository listingRepository;

    @Transactional
    public Listing create(Listing l) {
        return listingRepository.save(l);
    }

    public Page<Listing> list(String q, Pageable p) {
        return listingRepository.findBySubjectContainingIgnoreCase(q == null ? "" : q, p);
    }

    public Listing get(Long id) {
        return listingRepository.findById(id).orElseThrow();
    }

    @Transactional
    public Listing update(Long id, Listing in) {
        Listing l = listingRepository.findById(id).orElseThrow();
        l.setTitle(in.getTitle());
        l.setSubject(in.getSubject());
        l.setAuthor(in.getAuthor());
        l.setPrice(in.getPrice());
        l.setDescription(in.getDescription());
        l.setStatus(in.getStatus());
        return l;
    }

    @Transactional
    public void delete(Long id) {
        listingRepository.deleteById(id);
    }
}