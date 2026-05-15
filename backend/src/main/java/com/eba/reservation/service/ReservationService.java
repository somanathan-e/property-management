package com.eba.reservation.service;

import com.eba.common.dto.PagedResult;
import com.eba.lease.dto.LeaseDto;
import com.eba.reservation.dto.ReservationConvertDto;
import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;

public interface ReservationService {
    PagedResult<ReservationDto> getReservations(String search, String reservationStatus, String workflowStatus, Integer page, Integer size);
    ReservationDto getReservation(Long id);
    ReservationDto createReservation(ReservationUpsertDto request);
    ReservationDto updateReservation(Long id, ReservationUpsertDto request);
    ReservationDto updateWorkflow(Long id, ReservationWorkflowDto request);
    LeaseDto convertToLease(Long id, ReservationConvertDto request);
    void deleteReservation(Long id);
}
