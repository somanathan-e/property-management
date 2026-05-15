package com.eba.reservation.dto;

public record ReservationUnitUpsertDto(
    Long propertyId,
    Long towerId,
    Long unitId,
    String unitNumber,
    String unitType,
    double area,
    double rent,
    double deposit,
    double tax,
    String reservationStatus
) {
}
