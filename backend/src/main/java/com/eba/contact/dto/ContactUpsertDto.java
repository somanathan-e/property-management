package com.eba.contact.dto;

public record ContactUpsertDto(
    Long customerId,
    String contactCode,
    String fullName,
    String email,
    String phone,
    String roleTitle,
    String status
) {
}

