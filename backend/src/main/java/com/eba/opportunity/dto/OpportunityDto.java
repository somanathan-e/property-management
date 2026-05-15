package com.eba.opportunity.dto;

public record OpportunityDto(
    Long id,
    Long propertyId,
    String propertyCode,
    Long customerId,
    String customerCode,
    String opportunityCode,
    String opportunityName,
    String pipelineStage,
    double estimatedValue,
    String status
) {
}

