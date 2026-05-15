package com.eba.prospect.dto;

public record ProspectUpsertDto(
    Long propertyId,
    String prospectCode,
    String prospectName,
    String interestType,
    String status
) {
}

