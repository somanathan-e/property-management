package com.eba.lead.dto;

public record LeadUpsertDto(
    Long propertyId,
    String leadCode,
    String leadName,
    String source,
    String status,
    String stage
) {
}

