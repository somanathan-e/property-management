package com.eba.reservation.mappers;

import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationHistoryDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ReservationMapper {
    List<com.eba.reservation.dto.AvailableUnitDto> searchAvailableUnits(
        @Param("propertyId") Long propertyId,
        @Param("towerId") Long towerId,
        @Param("propertyType") String propertyType,
        @Param("unitType") String unitType,
        @Param("unitSearch") String unitSearch,
        @Param("location") String location,
        @Param("minArea") Double minArea,
        @Param("maxArea") Double maxArea,
        @Param("minRent") Double minRent,
        @Param("maxRent") Double maxRent,
        @Param("leaseType") String leaseType,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate,
        @Param("furnishingStatus") String furnishingStatus,
        @Param("floor") String floor,
        @Param("capacity") Integer capacity,
        @Param("limit") int limit,
        @Param("offset") int offset
    );
    long countAvailableUnits(
        @Param("propertyId") Long propertyId,
        @Param("towerId") Long towerId,
        @Param("propertyType") String propertyType,
        @Param("unitType") String unitType,
        @Param("unitSearch") String unitSearch,
        @Param("location") String location,
        @Param("minArea") Double minArea,
        @Param("maxArea") Double maxArea,
        @Param("minRent") Double minRent,
        @Param("maxRent") Double maxRent,
        @Param("leaseType") String leaseType,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate,
        @Param("furnishingStatus") String furnishingStatus,
        @Param("floor") String floor,
        @Param("capacity") Integer capacity
    );
    List<ReservationDto> findPage(@Param("search") String search, @Param("reservationStatus") String reservationStatus, @Param("workflowStatus") String workflowStatus, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search, @Param("reservationStatus") String reservationStatus, @Param("workflowStatus") String workflowStatus);
    ReservationDto findById(Long id);
    ReservationDto findByNumber(String reservationNumber);
    List<ReservationHistoryDto> findHistory(Long reservationId);
    List<com.eba.reservation.dto.ReservationUnitDto> findUnits(Long reservationId);
    void insert(ReservationUpsertDto request);
    void deleteUnits(Long reservationId);
    void insertUnit(@Param("reservationId") Long reservationId, @Param("unit") com.eba.reservation.dto.ReservationUnitUpsertDto unit);
    void insertHistory(@Param("reservationId") Long reservationId, @Param("previousStatus") String previousStatus, @Param("newStatus") String newStatus, @Param("actionType") String actionType, @Param("remarks") String remarks, @Param("createdBy") String createdBy);
    int update(@Param("id") Long id, @Param("request") ReservationUpsertDto request);
    int updateWorkflow(@Param("id") Long id, @Param("request") ReservationWorkflowDto request);
    int markConverted(@Param("id") Long id, @Param("leaseId") Long leaseId);
    int expireOverdue(@Param("today") String today);
    int cancelReservationUnit(@Param("reservationId") Long reservationId, @Param("unitId") Long unitId, @Param("status") String status);
    int softDelete(Long id);
    long countActiveReservationConflict(@Param("unitId") Long unitId, @Param("reservationDate") String reservationDate, @Param("expiryDate") String expiryDate, @Param("excludeId") Long excludeId);
    long countActiveLeaseConflict(@Param("unitId") Long unitId, @Param("startDate") String startDate, @Param("endDate") String endDate);
    long countUnavailableUnit(@Param("unitId") Long unitId);
}
