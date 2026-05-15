package com.eba.lease.dto;

public record LeaseTransactionCreateDto(
    String transactionType,
    String transactionStatus,
    String effectiveStartDate,
    String effectiveEndDate,
    Double revisedRentAmount,
    Double revisedSecurityDeposit,
    Long targetUnitId,
    String reason,
    String notes,
    String createdBy
) {
}
