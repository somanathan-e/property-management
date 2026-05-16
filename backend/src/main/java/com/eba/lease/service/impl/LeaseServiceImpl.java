package com.eba.lease.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseTransactionCreateDto;
import com.eba.lease.dto.LeaseTransactionDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.dto.LeaseUnitUpsertDto;
import com.eba.lease.dto.UnitAvailabilityDto;
import com.eba.lease.mappers.LeaseMapper;
import com.eba.lease.service.LeaseService;
import jakarta.ws.rs.core.Response;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.ibatis.session.SqlSession;

public class LeaseServiceImpl implements LeaseService {

    @Override
    public PagedResult<LeaseDto> getLeases(String search, String leaseStatus, String renewalStatus, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        String normalizedLeaseStatus = normalize(leaseStatus);
        String normalizedRenewalStatus = normalize(renewalStatus);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            return new PagedResult<>(
                mapper.findPage(query.search(), normalizedLeaseStatus, normalizedRenewalStatus, query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search(), normalizedLeaseStatus, normalizedRenewalStatus)
            );
        }
    }

    @Override
    public LeaseDto getLease(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            LeaseDto lease = session.getMapper(LeaseMapper.class).findById(id);
            if (lease == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Lease not found");
            }
            return lease;
        }
    }

    @Override
    public LeaseDto createLease(LeaseUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            ensureUniqueLeaseNumber(mapper, request.leaseNumber(), null);
            ensureNoActiveLeaseConflict(mapper, request, null);
            mapper.insert(request);
            LeaseDto lease = mapper.findByLeaseNumber(request.leaseNumber());
            List<LeaseUnitUpsertDto> units = normalizedUnits(request);
            insertLeaseUnits(mapper, lease.id(), units);
            updateUnitOccupancy(mapper, units, request.occupancyStatus());
            return mapper.findById(lease.id());
        }
    }

    @Override
    public LeaseDto updateLease(Long id, LeaseUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            ensureUniqueLeaseNumber(mapper, request.leaseNumber(), id);
            ensureNoActiveLeaseConflict(mapper, request, id);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Lease not found");
            }
            mapper.deleteLeaseUnits(id);
            List<LeaseUnitUpsertDto> units = normalizedUnits(request);
            insertLeaseUnits(mapper, id, units);
            updateUnitOccupancy(mapper, units, request.occupancyStatus());
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteLease(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(LeaseMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Lease not found");
            }
        }
    }

    @Override
    public List<LeaseTransactionDto> getLeaseTransactions(Long leaseId) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            ensureLeaseExists(mapper, leaseId);
            return mapper.findTransactionsByLeaseId(leaseId);
        }
    }

    @Override
    public LeaseTransactionDto createLeaseTransaction(Long leaseId, LeaseTransactionCreateDto request) {
        validateTransaction(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            LeaseDto lease = ensureLeaseExists(mapper, leaseId);
            int previousVersion = lease.versionNumber();
            int newVersion = requiresVersionBump(request.transactionType()) ? previousVersion + 1 : previousVersion;
            String transactionNumber = buildTransactionNumber(request.transactionType());
            mapper.insertTransaction(leaseId, transactionNumber, previousVersion, newVersion, request);
            mapper.applyTransaction(
                leaseId,
                resolveLeaseStatus(lease.leaseStatus(), request.transactionType()),
                resolveRenewalStatus(lease.renewalStatus(), request.transactionType()),
                shouldUpdateStartDate(request.transactionType()) ? request.effectiveStartDate() : null,
                shouldUpdateEndDate(request.transactionType()) ? request.effectiveEndDate() : null,
                request.revisedRentAmount(),
                request.revisedSecurityDeposit(),
                request.targetUnitId(),
                newVersion,
                request.notes()
            );
            return mapper.findTransactionByNumber(transactionNumber);
        }
    }

    @Override
    public PagedResult<UnitAvailabilityDto> getUnitAvailability(Long propertyId, Long towerId, String unitSearch, String occupancyStatus, String availabilityPeriod, String leasePeriod, String dateFrom, String dateTo, Integer page, Integer size) {
        PageQuery query = PageQuery.of(unitSearch, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            LeaseMapper mapper = session.getMapper(LeaseMapper.class);
            return new PagedResult<>(
                mapper.findUnitAvailability(propertyId, towerId, query.search(), normalize(occupancyStatus), normalize(availabilityPeriod), normalize(leasePeriod), normalize(dateFrom), normalize(dateTo), query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.countUnitAvailability(propertyId, towerId, query.search(), normalize(occupancyStatus), normalize(availabilityPeriod), normalize(leasePeriod), normalize(dateFrom), normalize(dateTo))
            );
        }
    }

    private void validate(LeaseUpsertDto request) {
        if (request == null || request.leaseNumber() == null || request.leaseNumber().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Lease number is required");
        }
        if (request.propertyId() == null || request.towerId() == null || request.unitId() == null || request.customerId() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property, tower, unit, and customer are required");
        }
        if (request.leaseType() == null || request.leaseType().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Lease type is required");
        }
        if (request.leaseStatus() == null || request.leaseStatus().isBlank() || request.occupancyStatus() == null || request.occupancyStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Lease status and occupancy status are required");
        }
        if (request.startDate() == null || request.endDate() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Start date and end date are required");
        }
        if (request.currency() == null || request.currency().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Currency is required");
        }
        if (request.createdBy() == null || request.createdBy().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Created by is required");
        }
        if (request.requestInitiator() == null || request.requestInitiator().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Request initiator is required");
        }
        if (request.approvalStatus() == null || request.approvalStatus().isBlank() || request.documentStatus() == null || request.documentStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Approval and document status are required");
        }
        if (request.paymentStatus() == null || request.paymentStatus().isBlank() || request.registrationStatus() == null || request.registrationStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Payment and registration status are required");
        }
        if (request.handoverStatus() == null || request.handoverStatus().isBlank() || request.settlementStatus() == null || request.settlementStatus().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Handover and settlement status are required");
        }
        if (request.rentAmount() < 0 || request.securityDeposit() < 0) {
            throw new AppException(Response.Status.BAD_REQUEST, "Rent and security deposit cannot be negative");
        }
        if (isAfter(request.fitOutPeriodStart(), request.startDate())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Fit-out start must be before or on lease start date");
        }
        if (isAfter(request.fitOutPeriodEnd(), request.startDate())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Fit-out end must be before or on lease start date");
        }
        if (isAfter(request.fitOutPeriodStart(), request.fitOutPeriodEnd())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Fit-out start cannot be after fit-out end");
        }
        if (isAfter(request.freePeriodStart(), request.freePeriodEnd())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Free period start cannot be after free period end");
        }
        if (isBefore(request.freePeriodStart(), request.startDate()) || isAfter(request.freePeriodStart(), request.endDate()) || isBefore(request.freePeriodEnd(), request.startDate()) || isAfter(request.freePeriodEnd(), request.endDate())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Free period must be within the lease duration");
        }
    }

    private void validateTransaction(LeaseTransactionCreateDto request) {
        if (request == null || request.transactionType() == null || request.transactionType().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Transaction type is required");
        }
        if (request.createdBy() == null || request.createdBy().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Created by is required for transactions");
        }
        String type = normalize(request.transactionType());
        if ("TRANSFER".equals(type) && request.targetUnitId() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Target unit is required for transfer transactions");
        }
        if (("TERMINATION".equals(type) || "CANCELLATION".equals(type)) && (request.reason() == null || request.reason().isBlank())) {
            throw new AppException(Response.Status.BAD_REQUEST, "Reason is required for termination and cancellation");
        }
    }

    private LeaseDto ensureLeaseExists(LeaseMapper mapper, Long leaseId) {
        LeaseDto lease = mapper.findById(leaseId);
        if (lease == null) {
            throw new AppException(Response.Status.NOT_FOUND, "Lease not found");
        }
        return lease;
    }

    private void ensureUniqueLeaseNumber(LeaseMapper mapper, String leaseNumber, Long currentLeaseId) {
        LeaseDto existingLease = mapper.findByLeaseNumber(leaseNumber);
        if (existingLease != null && (currentLeaseId == null || !existingLease.id().equals(currentLeaseId))) {
            throw new AppException(Response.Status.CONFLICT, "Lease number already exists");
        }
    }

    private void ensureNoActiveLeaseConflict(LeaseMapper mapper, LeaseUpsertDto request, Long excludeId) {
        Set<Long> selectedUnitIds = new HashSet<>();
        String effectiveStartDate = effectiveAvailabilityStart(request);
        for (LeaseUnitUpsertDto unit : normalizedUnits(request)) {
            if (unit.unitId() == null || !selectedUnitIds.add(unit.unitId())) {
                throw new AppException(Response.Status.CONFLICT, "Duplicate units are not allowed in the same lease");
            }
            if (excludeId == null && mapper.countUnavailableUnit(unit.unitId()) > 0) {
                throw new AppException(Response.Status.CONFLICT, "Inactive, occupied, or reserved units cannot be leased");
            }
            if (mapper.countActiveReservationConflict(unit.unitId(), effectiveStartDate, request.endDate()) > 0) {
                throw new AppException(Response.Status.CONFLICT, "Unit already has an active reservation for the requested lease term");
            }
            if (mapper.countActiveLeaseConflict(unit.unitId(), request.startDate(), effectiveStartDate, request.endDate(), excludeId) > 0) {
                throw new AppException(Response.Status.CONFLICT, "Unit already has an active lease for the requested lease term");
            }
        }
    }

    private List<LeaseUnitUpsertDto> normalizedUnits(LeaseUpsertDto request) {
        if (request.units() != null && !request.units().isEmpty()) {
            return request.units();
        }
        return List.of(new LeaseUnitUpsertDto(
            request.propertyId(),
            request.unitId(),
            "UNIT-" + request.unitId(),
            0,
            request.rentAmount(),
            0,
            request.securityDeposit(),
            0,
            null,
            request.leaseStatus()
        ));
    }

    private void insertLeaseUnits(LeaseMapper mapper, Long leaseId, List<LeaseUnitUpsertDto> units) {
        for (LeaseUnitUpsertDto unit : units) {
            mapper.insertLeaseUnit(leaseId, unit.propertyId(), unit.unitId(), unit.unitNumber(), unit.area(), unit.rent(), unit.additionalCharges(), unit.deposit(), unit.tax(), unit.fitOutPeriod(), unit.unitLeaseStatus());
        }
    }

    private void updateUnitOccupancy(LeaseMapper mapper, List<LeaseUnitUpsertDto> units, String occupancyStatus) {
        String normalizedStatus = normalize(occupancyStatus);
        if (normalizedStatus == null || normalizedStatus.isBlank()) {
            return;
        }
        for (LeaseUnitUpsertDto unit : units) {
            mapper.updateUnitOccupancy(unit.unitId(), normalizedStatus);
        }
    }

    private String effectiveAvailabilityStart(LeaseUpsertDto request) {
        String fitOutStart = normalizeOptionalDate(request.fitOutPeriodStart());
        return fitOutStart == null ? request.startDate() : fitOutStart;
    }

    private boolean isAfter(String left, String right) {
        String normalizedLeft = normalizeOptionalDate(left);
        String normalizedRight = normalizeOptionalDate(right);
        return normalizedLeft != null && normalizedRight != null && normalizedLeft.compareTo(normalizedRight) > 0;
    }

    private boolean isBefore(String left, String right) {
        String normalizedLeft = normalizeOptionalDate(left);
        String normalizedRight = normalizeOptionalDate(right);
        return normalizedLeft != null && normalizedRight != null && normalizedLeft.compareTo(normalizedRight) < 0;
    }

    private String normalizeOptionalDate(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private boolean requiresVersionBump(String transactionType) {
        return switch (normalize(transactionType)) {
            case "RENEWAL", "EXTENSION", "EXPANSION", "CONTRACTION", "AMENDMENT", "ADDENDUM", "RENT_REVISION", "TRANSFER" -> true;
            default -> false;
        };
    }

    private boolean shouldUpdateStartDate(String transactionType) {
        return switch (normalize(transactionType)) {
            case "RENEWAL", "TRANSFER" -> true;
            default -> false;
        };
    }

    private boolean shouldUpdateEndDate(String transactionType) {
        return switch (normalize(transactionType)) {
            case "RENEWAL", "EXTENSION", "EXPANSION", "CONTRACTION", "TERMINATION", "CANCELLATION" -> true;
            default -> false;
        };
    }

    private String resolveLeaseStatus(String currentStatus, String transactionType) {
        return switch (normalize(transactionType)) {
            case "SUSPENSION" -> "SUSPENDED";
            case "RESUME" -> "ACTIVE";
            case "TERMINATION" -> "TERMINATION_REVIEW";
            case "CANCELLATION" -> "CANCELLED";
            default -> currentStatus;
        };
    }

    private String resolveRenewalStatus(String currentRenewalStatus, String transactionType) {
        return switch (normalize(transactionType)) {
            case "RENEWAL" -> "RENEWED";
            case "EXTENSION" -> "EXTENDED";
            default -> currentRenewalStatus;
        };
    }

    private String buildTransactionNumber(String transactionType) {
        String prefix = switch (normalize(transactionType)) {
            case "RENEWAL" -> "REN";
            case "EXTENSION" -> "EXT";
            case "EXPANSION" -> "EXP";
            case "CONTRACTION" -> "CON";
            case "AMENDMENT" -> "AMD";
            case "ADDENDUM" -> "ADD";
            case "RENT_REVISION" -> "REV";
            case "SUSPENSION" -> "SUS";
            case "RESUME" -> "RES";
            case "TERMINATION" -> "TER";
            case "CANCELLATION" -> "CAN";
            case "TRANSFER" -> "TRF";
            default -> "TRX";
        };
        return prefix + "-" + DateTimeFormatter.ofPattern("yyyyMMddHHmmss").format(LocalDateTime.now());
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase();
    }
}
