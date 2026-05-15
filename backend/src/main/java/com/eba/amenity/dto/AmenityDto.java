package com.eba.amenity.dto;

public record AmenityDto(
    Long id,
    Long propertyId,
    String propertyCode,
    String amenityCode,
    String amenityName,
    String category,
    String status
) {
}

