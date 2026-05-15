package com.eba.reservation.dto;

public record ReservationUnitDto(
    Long id,
    Long reservationId,
    Long propertyId,
    String propertyName,
    Long towerId,
    String towerName,
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
