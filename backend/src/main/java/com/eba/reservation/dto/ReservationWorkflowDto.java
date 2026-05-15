package com.eba.reservation.dto;

public record ReservationWorkflowDto(
    String reservationStatus,
    String workflowStatus,
    String paymentStatus,
    String notes,
    String updatedBy
) {
}
