package com.eba.reservation.dto;

public record ReservationUpsertDto(
    String reservationNumber,
    Long propertyId,
    Long towerId,
    Long unitId,
    Long customerId,
    String reservationStatus,
    String workflowStatus,
    String paymentStatus,
    String reservationDate,
    String expiryDate,
    double quotedRent,
    String currency,
    double depositAmount,
    String createdBy,
    String notes
) {
}
