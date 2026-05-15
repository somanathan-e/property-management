package com.eba.lease.dto;

public record LeaseUpsertDto(
    String leaseNumber,
    Long propertyId,
    Long towerId,
    Long unitId,
    Long customerId,
    String leaseType,
    String leaseStatus,
    String occupancyStatus,
    String currency,
    double rentAmount,
    double securityDeposit,
    String renewalStatus,
    String requestInitiator,
    String approvalStatus,
    String documentStatus,
    String paymentStatus,
    String registrationStatus,
    String handoverStatus,
    String settlementStatus,
    String startDate,
    String endDate,
    String freePeriodStart,
    String freePeriodEnd,
    String fitOutPeriodStart,
    String fitOutPeriodEnd,
    String createdBy,
    String notes
) {
}
