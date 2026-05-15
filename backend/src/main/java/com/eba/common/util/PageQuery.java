package com.eba.common.util;

public record PageQuery(
    String search,
    int page,
    int size,
    int offset
) {
    public static PageQuery of(String search, Integer page, Integer size) {
        int resolvedPage = page == null || page < 1 ? 1 : page;
        int resolvedSize = size == null || size < 1 ? 10 : Math.min(size, 50);
        return new PageQuery(search == null ? "" : search.trim(), resolvedPage, resolvedSize, (resolvedPage - 1) * resolvedSize);
    }
}

