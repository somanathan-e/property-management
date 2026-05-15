package com.eba.reservation.dto;

import java.util.List;

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
    String proposedLeaseStartDate,
    String proposedLeaseEndDate,
    double quotedRent,
    String currency,
    double depositAmount,
    String createdBy,
    String leadName,
    String notes,
    List<ReservationUnitUpsertDto> units
) {
}
