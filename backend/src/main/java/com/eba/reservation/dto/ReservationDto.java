package com.eba.reservation.dto;

public record ReservationDto(
    Long id,
    String reservationNumber,
    Long propertyId,
    String propertyName,
    Long towerId,
    String towerName,
    Long unitId,
    String unitCode,
    String unitName,
    Long customerId,
    String customerName,
    String reservationStatus,
    String workflowStatus,
    String paymentStatus,
    String reservationDate,
    String expiryDate,
    double quotedRent,
    String currency,
    double depositAmount,
    String createdBy,
    String createdDate,
    Long convertedLeaseId,
    String convertedLeaseNumber,
    String notes
) {
}
