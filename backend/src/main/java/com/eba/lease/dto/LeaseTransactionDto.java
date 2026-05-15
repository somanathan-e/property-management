package com.eba.lease.dto;

public record LeaseTransactionDto(
    Long id,
    Long leaseId,
    String leaseNumber,
    String transactionNumber,
    String transactionType,
    int previousVersionNumber,
    int newVersionNumber,
    String transactionStatus,
    String effectiveStartDate,
    String effectiveEndDate,
    Double revisedRentAmount,
    Double revisedSecurityDeposit,
    Long targetUnitId,
    String targetUnitCode,
    String reason,
    String notes,
    String createdBy,
    String createdDate
) {
}
