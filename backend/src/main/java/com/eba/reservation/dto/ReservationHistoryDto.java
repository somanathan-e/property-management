package com.eba.reservation.dto;

public record ReservationHistoryDto(
    Long id,
    Long reservationId,
    String previousStatus,
    String newStatus,
    String actionType,
    String remarks,
    String createdBy,
    String createdDate
) {
}
