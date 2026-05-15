package com.eba.opportunity.dto;

public record OpportunityUpsertDto(
    Long propertyId,
    Long customerId,
    String opportunityCode,
    String opportunityName,
    String pipelineStage,
    double estimatedValue,
    String status
) {
}

