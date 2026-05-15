package com.eba.reservation.service;

import com.eba.common.dto.PagedResult;
import com.eba.lease.dto.LeaseDto;
import com.eba.reservation.dto.AvailableUnitDto;
import com.eba.reservation.dto.ReservationConvertDto;
import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationHistoryDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationUnitDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import java.util.List;

public interface ReservationService {
    PagedResult<AvailableUnitDto> searchAvailableUnits(Long propertyId, Long towerId, String propertyType, String unitType, String unitSearch, String location, Double minArea, Double maxArea, Double minRent, Double maxRent, String leaseType, String availabilityDate, String startDate, String endDate, String furnishingStatus, String floor, Integer capacity, Integer page, Integer size);
    PagedResult<ReservationDto> getReservations(String search, String reservationStatus, String workflowStatus, Integer page, Integer size);
    ReservationDto getReservation(Long id);
    List<ReservationHistoryDto> getReservationHistory(Long id);
    List<ReservationUnitDto> getReservationUnits(Long id);
    ReservationDto createReservation(ReservationUpsertDto request);
    ReservationDto updateReservation(Long id, ReservationUpsertDto request);
    ReservationDto updateWorkflow(Long id, ReservationWorkflowDto request);
    ReservationDto cancelReservationUnit(Long id, Long unitId, ReservationWorkflowDto request);
    ReservationDto cancelReservation(Long id, ReservationWorkflowDto request);
    ReservationDto expireReservation(Long id, ReservationWorkflowDto request);
    LeaseDto convertToLease(Long id, ReservationConvertDto request);
    void deleteReservation(Long id);
}
