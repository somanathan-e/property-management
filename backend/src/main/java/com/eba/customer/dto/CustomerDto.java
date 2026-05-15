package com.eba.customer.dto;

public record CustomerDto(
    Long id,
    String customerCode,
    String customerName,
    String category,
    String email,
    String phone,
    String status
) {
}

