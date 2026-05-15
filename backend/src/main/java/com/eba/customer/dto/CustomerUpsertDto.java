package com.eba.customer.dto;

public record CustomerUpsertDto(
    String customerCode,
    String customerName,
    String category,
    String email,
    String phone,
    String status
) {
}
