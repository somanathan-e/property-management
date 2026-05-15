package com.eba.reservation.mappers;

import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface ReservationMapper {
    List<ReservationDto> findPage(@Param("search") String search, @Param("reservationStatus") String reservationStatus, @Param("workflowStatus") String workflowStatus, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search, @Param("reservationStatus") String reservationStatus, @Param("workflowStatus") String workflowStatus);
    ReservationDto findById(Long id);
    ReservationDto findByNumber(String reservationNumber);
    void insert(ReservationUpsertDto request);
    int update(@Param("id") Long id, @Param("request") ReservationUpsertDto request);
    int updateWorkflow(@Param("id") Long id, @Param("request") ReservationWorkflowDto request);
    int markConverted(@Param("id") Long id, @Param("leaseId") Long leaseId);
    int softDelete(Long id);
    long countActiveReservationConflict(@Param("unitId") Long unitId, @Param("reservationDate") String reservationDate, @Param("expiryDate") String expiryDate, @Param("excludeId") Long excludeId);
    long countActiveLeaseConflict(@Param("unitId") Long unitId, @Param("startDate") String startDate, @Param("endDate") String endDate);
}
