package com.aulix.common_core.pagination;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

/**
 * Normalizes page/size/sort query parameters into a Spring Data {@link Pageable}, capping
 * page size so a client cannot request unbounded result sets.
 */
public record PageRequestParams (
        Integer page,
        Integer size,
        String sortBy,
        String direction
) {
    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    public Pageable toPageable(String defaultSortBy) {
        int resolvedPage = page != null && page >= 0 ? page : 0;
        int resolvedSize = size != null ? Math.min(Math.max(size, 1), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
        String resolvedSortBy = sortBy != null && !sortBy.isBlank() ? sortBy : defaultSortBy;
        Sort.Direction resolvedDirection = "DESC".equalsIgnoreCase(direction) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return PageRequest.of(resolvedPage, resolvedSize, Sort.by(resolvedDirection, resolvedSortBy));
    }
}
