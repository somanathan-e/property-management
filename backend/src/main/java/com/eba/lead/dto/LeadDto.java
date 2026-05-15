package com.eba.lead.dto;

public record LeadDto(
    Long id,
    Long propertyId,
    String propertyCode,
    String leadCode,
    String leadName,
    String source,
    String status,
    String stage
) {
}

