package com.eba.auth.domain;

public record AuthenticatedUser(
    Long userId,
    String username,
    String role
) {
}

