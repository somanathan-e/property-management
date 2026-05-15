package com.eba.contact.dto;

public record ContactDto(
    Long id,
    Long customerId,
    String customerCode,
    String contactCode,
    String fullName,
    String email,
    String phone,
    String roleTitle,
    String status
) {
}

