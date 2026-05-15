package com.eba.prospect.dto;

public record ProspectDto(
    Long id,
    Long propertyId,
    String propertyCode,
    String prospectCode,
    String prospectName,
    String interestType,
    String status
) {
}

