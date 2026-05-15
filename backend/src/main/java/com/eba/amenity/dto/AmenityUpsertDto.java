package com.eba.amenity.dto;

public record AmenityUpsertDto(
    Long propertyId,
    String amenityCode,
    String amenityName,
    String category,
    String status
) {
}

