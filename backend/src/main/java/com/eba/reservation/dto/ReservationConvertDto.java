package com.eba.reservation.dto;

public record ReservationConvertDto(
    String leaseNumber,
    String leaseType,
    String startDate,
    String endDate,
    String createdBy,
    String notes
) {
}
