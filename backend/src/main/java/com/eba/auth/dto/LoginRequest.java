package com.eba.auth.dto;

public record LoginRequest(
    String username,
    String password
) {
}

