package com.hongik.books.listing.controller;

import com.hongik.books.listing.domain.Listing;
import com.hongik.books.listing.service.ListingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
@Validated
public class ListingController {
    private final ListingService listingService;

    @PostMapping
    public ResponseEntity<Listing> create(@RequestBody @Valid Listing in) {
        return ResponseEntity.status(HttpStatus.CREATED).body(listingService.create(in));
    }

    @GetMapping
    public Page<Listing> list(@RequestParam(required=false) String q, @PageableDefault(size=20) Pageable p) {
        return listingService.list(q,p);
    }

    @GetMapping("/{id}")
    public Listing get(@PathVariable Long id) {
        return listingService.get(id);
    }

    @PutMapping("/{id}")
    public Listing update(@PathVariable Long id, @RequestBody @Valid Listing in) {
        return listingService.update(id, in);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        listingService.delete(id);
    }
}
