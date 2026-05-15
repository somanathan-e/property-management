package com.eba.reservation.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.mappers.LeaseMapper;
import com.eba.reservation.dto.ReservationConvertDto;
import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import com.eba.reservation.mappers.ReservationMapper;
import com.eba.reservation.service.ReservationService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class ReservationServiceImpl implements ReservationService {
    @Override
    public PagedResult<ReservationDto> getReservations(String search, String reservationStatus, String workflowStatus, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            String normalizedReservationStatus = normalize(reservationStatus);
            String normalizedWorkflowStatus = normalize(workflowStatus);
            return new PagedResult<>(
                mapper.findPage(query.search(), normalizedReservationStatus, normalizedWorkflowStatus, query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search(), normalizedReservationStatus, normalizedWorkflowStatus)
            );
        }
    }

    @Override
    public ReservationDto getReservation(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            ReservationDto reservation = session.getMapper(ReservationMapper.class).findById(id);
            if (reservation == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            return reservation;
        }
    }

    @Override
    public ReservationDto createReservation(ReservationUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ensureUnitAvailable(mapper, request.unitId(), request.reservationDate(), request.expiryDate(), null);
            mapper.insert(request);
            return mapper.findByNumber(request.reservationNumber());
        }
    }

    @Override
    public ReservationDto updateReservation(Long id, ReservationUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ensureReservationExists(mapper, id);
            ensureUnitAvailable(mapper, request.unitId(), request.reservationDate(), request.expiryDate(), id);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public ReservationDto updateWorkflow(Long id, ReservationWorkflowDto request) {
        validateWorkflow(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ensureReservationExists(mapper, id);
            if (mapper.updateWorkflow(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public LeaseDto convertToLease(Long id, ReservationConvertDto request) {
        validateConversion(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper reservationMapper = session.getMapper(ReservationMapper.class);
            LeaseMapper leaseMapper = session.getMapper(LeaseMapper.class);
            ReservationDto reservation = ensureReservationExists(reservationMapper, id);
            if (reservation.convertedLeaseId() != null) {
                throw new AppException(Response.Status.CONFLICT, "Reservation is already converted to a lease");
            }
            if (!"APPROVED".equals(normalize(reservation.workflowStatus())) && !"CONFIRMED".equals(normalize(reservation.reservationStatus()))) {
                throw new AppException(Response.Status.BAD_REQUEST, "Only approved or confirmed reservations can be converted to leases");
            }
            if (reservationMapper.countActiveLeaseConflict(reservation.unitId(), request.startDate(), request.endDate()) > 0) {
                throw new AppException(Response.Status.CONFLICT, "Unit already has an active lease for the requested lease term");
            }

            LeaseUpsertDto leaseRequest = new LeaseUpsertDto(
                request.leaseNumber(),
                reservation.propertyId(),
                reservation.towerId(),
                reservation.unitId(),
                reservation.customerId(),
                defaultValue(request.leaseType(), "COMMERCIAL"),
                "PENDING_APPROVAL",
                "RESERVED",
                reservation.currency(),
                reservation.quotedRent(),
                reservation.depositAmount(),
                "NOT_DUE",
                "AGENT",
                "DRAFT",
                "DRAFT",
                reservation.depositAmount() > 0 ? "PARTIAL" : "PENDING",
                "PENDING",
                "NOT_STARTED",
                "NOT_REQUIRED",
                request.startDate(),
                request.endDate(),
                null,
                null,
                null,
                null,
                defaultValue(request.createdBy(), reservation.createdBy()),
                defaultValue(request.notes(), "Converted from reservation " + reservation.reservationNumber())
            );
            leaseMapper.insert(leaseRequest);
            LeaseDto lease = leaseMapper.findByLeaseNumber(request.leaseNumber());
            reservationMapper.markConverted(id, lease.id());
            return lease;
        }
    }

    @Override
    public void deleteReservation(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(ReservationMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
        }
    }

    private void validate(ReservationUpsertDto request) {
        if (request == null || request.reservationNumber() == null || request.reservationNumber().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Reservation number is required");
        }
        if (request.propertyId() == null || request.towerId() == null || request.unitId() == null || request.customerId() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property, tower, unit, and customer are required");
        }
        if (request.reservationStatus() == null || request.reservationStatus().isBlank() || request.workflowStatus() == null || request.workflowStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Reservation and workflow status are required");
        }
        if (request.paymentStatus() == null || request.paymentStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Payment status is required");
        }
        if (request.reservationDate() == null || request.expiryDate() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Reservation date and expiry date are required");
        }
        if (request.currency() == null || request.currency().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Currency is required");
        }
        if (request.quotedRent() < 0 || request.depositAmount() < 0) {
            throw new AppException(Response.Status.BAD_REQUEST, "Quoted rent and deposit cannot be negative");
        }
        if (request.createdBy() == null || request.createdBy().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Created by is required");
        }
    }

    private void validateWorkflow(ReservationWorkflowDto request) {
        if (request == null || request.reservationStatus() == null || request.reservationStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Reservation status is required");
        }
        if (request.workflowStatus() == null || request.workflowStatus().isBlank() || request.paymentStatus() == null || request.paymentStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Workflow and payment status are required");
        }
    }

    private void validateConversion(ReservationConvertDto request) {
        if (request == null || request.leaseNumber() == null || request.leaseNumber().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Lease number is required");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Lease start and end date are required");
        }
    }

    private ReservationDto ensureReservationExists(ReservationMapper mapper, Long id) {
        ReservationDto reservation = mapper.findById(id);
        if (reservation == null) {
            throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
        }
        return reservation;
    }

    private void ensureUnitAvailable(ReservationMapper mapper, Long unitId, String reservationDate, String expiryDate, Long excludeId) {
        if (mapper.countActiveLeaseConflict(unitId, reservationDate, expiryDate) > 0) {
            throw new AppException(Response.Status.CONFLICT, "Unit already has an active lease for the requested reservation window");
        }
        if (mapper.countActiveReservationConflict(unitId, reservationDate, expiryDate, excludeId) > 0) {
            throw new AppException(Response.Status.CONFLICT, "Unit already has an active reservation for the requested reservation window");
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
