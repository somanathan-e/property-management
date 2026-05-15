package com.eba.property.dto;

public record PropertyUpsertDto(
    String propertyCode,
    String propertyName,
    String propertyType,
    String city,
    String status
) {
}
