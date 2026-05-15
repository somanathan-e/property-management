package com.eba.property.dto;

public record PropertyDto(
    Long id,
    String propertyCode,
    String propertyName,
    String propertyType,
    String city,
    String status
) {
}

