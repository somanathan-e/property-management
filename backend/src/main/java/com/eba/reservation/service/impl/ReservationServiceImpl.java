package com.eba.reservation.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.mappers.LeaseMapper;
import com.eba.reservation.dto.AvailableUnitDto;
import com.eba.reservation.dto.ReservationConvertDto;
import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationHistoryDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationUnitDto;
import com.eba.reservation.dto.ReservationUnitUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import com.eba.reservation.mappers.ReservationMapper;
import com.eba.reservation.service.ReservationService;
import jakarta.ws.rs.core.Response;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.ibatis.session.SqlSession;

public class ReservationServiceImpl implements ReservationService {
    @Override
    public PagedResult<AvailableUnitDto> searchAvailableUnits(Long propertyId, Long towerId, String propertyType, String unitType, String unitSearch, String location, Double minArea, Double maxArea, Double minRent, Double maxRent, String leaseType, String availabilityDate, String startDate, String endDate, String furnishingStatus, String floor, Integer capacity, Integer page, Integer size) {
        PageQuery query = PageQuery.of(null, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            mapper.expireOverdue(LocalDate.now().toString());
            String normalizedStartDate = firstDate(startDate, availabilityDate, LocalDate.now().toString());
            String normalizedEndDate = firstDate(endDate, normalizedStartDate);
            return new PagedResult<>(
                mapper.searchAvailableUnits(propertyId, towerId, normalize(propertyType), normalize(unitType), normalize(unitSearch), location, minArea, maxArea, minRent, maxRent, normalize(leaseType), normalizedStartDate, normalizedEndDate, normalize(furnishingStatus), floor, capacity, query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.countAvailableUnits(propertyId, towerId, normalize(propertyType), normalize(unitType), normalize(unitSearch), location, minArea, maxArea, minRent, maxRent, normalize(leaseType), normalizedStartDate, normalizedEndDate, normalize(furnishingStatus), floor, capacity)
            );
        }
    }

    private String firstDate(String... values) {
        for (String value : values) {
            if (value != null && !value.isBlank()) {
                return value;
            }
        }
        return LocalDate.now().toString();
    }

    @Override
    public PagedResult<ReservationDto> getReservations(String search, String reservationStatus, String workflowStatus, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            mapper.expireOverdue(LocalDate.now().toString());
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
    public List<ReservationHistoryDto> getReservationHistory(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ensureReservationExists(mapper, id);
            return mapper.findHistory(id);
        }
    }

    @Override
    public List<ReservationUnitDto> getReservationUnits(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ensureReservationExists(mapper, id);
            return mapper.findUnits(id);
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
            List<ReservationUnitUpsertDto> units = normalizedUnits(request);
            ensureUnitsAvailable(mapper, units, request.reservationDate(), request.expiryDate(), null);
            mapper.insert(request);
            ReservationDto reservation = mapper.findByNumber(request.reservationNumber());
            insertUnits(mapper, reservation.id(), units);
            mapper.insertHistory(reservation.id(), null, reservation.reservationStatus(), "CREATE", request.notes(), request.createdBy());
            return mapper.findById(reservation.id());
        }
    }

    @Override
    public ReservationDto updateReservation(Long id, ReservationUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ReservationDto previous = ensureReservationExists(mapper, id);
            List<ReservationUnitUpsertDto> units = normalizedUnits(request);
            ensureUnitsAvailable(mapper, units, request.reservationDate(), request.expiryDate(), id);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            mapper.deleteUnits(id);
            insertUnits(mapper, id, units);
            mapper.insertHistory(id, previous.reservationStatus(), request.reservationStatus(), "UPDATE", request.notes(), request.createdBy());
            return mapper.findById(id);
        }
    }

    @Override
    public ReservationDto updateWorkflow(Long id, ReservationWorkflowDto request) {
        validateWorkflow(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ReservationDto previous = ensureReservationExists(mapper, id);
            if (mapper.updateWorkflow(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            mapper.insertHistory(id, previous.reservationStatus(), request.reservationStatus(), "WORKFLOW", request.notes(), request.updatedBy());
            return mapper.findById(id);
        }
    }

    @Override
    public ReservationDto cancelReservation(Long id, ReservationWorkflowDto request) {
        return applyTerminalStatus(id, request, "CANCELLED", "CANCEL");
    }

    @Override
    public ReservationDto cancelReservationUnit(Long id, Long unitId, ReservationWorkflowDto request) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ReservationDto previous = ensureReservationExists(mapper, id);
            if (mapper.cancelReservationUnit(id, unitId, "CANCELLED") == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation unit not found");
            }
            mapper.insertHistory(id, previous.reservationStatus(), previous.reservationStatus(), "CANCEL_UNIT", request == null ? null : request.notes(), request == null ? "system" : defaultValue(request.updatedBy(), "system"));
            return mapper.findById(id);
        }
    }

    @Override
    public ReservationDto expireReservation(Long id, ReservationWorkflowDto request) {
        return applyTerminalStatus(id, request, "EXPIRED", "EXPIRE");
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
            if (!"RESERVED".equals(normalize(reservation.reservationStatus()))) {
                throw new AppException(Response.Status.BAD_REQUEST, "Only reserved units can be converted to leases");
            }
            List<ReservationUnitDto> reservationUnits = reservationMapper.findUnits(id);
            if (reservationUnits.isEmpty()) {
                throw new AppException(Response.Status.BAD_REQUEST, "Reservation has no units to convert");
            }
            for (ReservationUnitDto unit : reservationUnits) {
                if (reservationMapper.countActiveLeaseConflict(unit.unitId(), request.startDate(), request.endDate()) > 0) {
                    throw new AppException(Response.Status.CONFLICT, "Unit already has an active lease for the requested lease term: " + unit.unitNumber());
                }
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
                reservation.totalRentAmount(),
                reservation.totalDepositAmount(),
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
                defaultValue(request.notes(), "Converted from reservation " + reservation.reservationNumber()),
                null
            );
            leaseMapper.insert(leaseRequest);
            LeaseDto lease = leaseMapper.findByLeaseNumber(request.leaseNumber());
            for (ReservationUnitDto unit : reservationUnits) {
                leaseMapper.insertLeaseUnit(lease.id(), unit.propertyId(), unit.unitId(), unit.unitNumber(), unit.area(), unit.rent(), 0.0, unit.deposit(), unit.tax(), null, "PENDING_APPROVAL");
            }
            reservationMapper.markConverted(id, lease.id());
            reservationMapper.insertHistory(id, reservation.reservationStatus(), "CONVERTED_TO_LEASE", "CONVERT_TO_LEASE", request.notes(), defaultValue(request.createdBy(), reservation.createdBy()));
            return leaseMapper.findById(lease.id());
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
        if (request.proposedLeaseStartDate() == null || request.proposedLeaseEndDate() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Proposed lease start and end date are required");
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
        if (excludeId == null && mapper.countUnavailableUnit(unitId) > 0) {
            throw new AppException(Response.Status.CONFLICT, "Inactive, occupied, or reserved units cannot be reserved");
        }
        if (mapper.countActiveLeaseConflict(unitId, reservationDate, expiryDate) > 0) {
            throw new AppException(Response.Status.CONFLICT, "Unit already has an active lease for the requested reservation window");
        }
        if (mapper.countActiveReservationConflict(unitId, reservationDate, expiryDate, excludeId) > 0) {
            throw new AppException(Response.Status.CONFLICT, "Unit already has an active reservation for the requested reservation window");
        }
    }

    private List<ReservationUnitUpsertDto> normalizedUnits(ReservationUpsertDto request) {
        if (request.units() != null && !request.units().isEmpty()) {
            return request.units();
        }
        return List.of(new ReservationUnitUpsertDto(
            request.propertyId(),
            request.towerId(),
            request.unitId(),
            "UNIT-" + request.unitId(),
            "UNIT",
            0,
            request.quotedRent(),
            request.depositAmount(),
            0,
            request.reservationStatus()
        ));
    }

    private void ensureUnitsAvailable(ReservationMapper mapper, List<ReservationUnitUpsertDto> units, String reservationDate, String expiryDate, Long excludeId) {
        Set<Long> selectedUnitIds = new HashSet<>();
        for (ReservationUnitUpsertDto unit : units) {
            if (unit.unitId() == null || !selectedUnitIds.add(unit.unitId())) {
                throw new AppException(Response.Status.CONFLICT, "Duplicate units are not allowed in the same reservation");
            }
            ensureUnitAvailable(mapper, unit.unitId(), reservationDate, expiryDate, excludeId);
        }
    }

    private void insertUnits(ReservationMapper mapper, Long reservationId, List<ReservationUnitUpsertDto> units) {
        for (ReservationUnitUpsertDto unit : units) {
            mapper.insertUnit(reservationId, unit);
        }
    }

    private ReservationDto applyTerminalStatus(Long id, ReservationWorkflowDto request, String status, String actionType) {
        ReservationWorkflowDto safeRequest = new ReservationWorkflowDto(status, status, request == null || request.paymentStatus() == null ? "PENDING" : request.paymentStatus(), request == null ? null : request.notes(), request == null ? "system" : request.updatedBy());
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            ReservationMapper mapper = session.getMapper(ReservationMapper.class);
            ReservationDto previous = ensureReservationExists(mapper, id);
            if (mapper.updateWorkflow(id, safeRequest) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Reservation not found");
            }
            mapper.insertHistory(id, previous.reservationStatus(), status, actionType, safeRequest.notes(), safeRequest.updatedBy());
            return mapper.findById(id);
        }
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }

    private String defaultValue(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }
}
