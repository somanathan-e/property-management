package com.eba.lease.mappers;

import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseTransactionCreateDto;
import com.eba.lease.dto.LeaseTransactionDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.dto.LeaseUnitDto;
import com.eba.lease.dto.UnitAvailabilityDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface LeaseMapper {
    List<LeaseDto> findPage(@Param("search") String search, @Param("leaseStatus") String leaseStatus, @Param("renewalStatus") String renewalStatus, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search, @Param("leaseStatus") String leaseStatus, @Param("renewalStatus") String renewalStatus);

    LeaseDto findById(Long id);

    LeaseDto findByLeaseNumber(String leaseNumber);

    long countActiveLeaseConflict(@Param("unitId") Long unitId, @Param("startDate") String startDate, @Param("effectiveStartDate") String effectiveStartDate, @Param("endDate") String endDate, @Param("excludeId") Long excludeId);

    long countActiveReservationConflict(@Param("unitId") Long unitId, @Param("effectiveStartDate") String effectiveStartDate, @Param("endDate") String endDate);

    long countUnavailableUnit(@Param("unitId") Long unitId);

    void insert(LeaseUpsertDto request);

    void insertLeaseUnit(@Param("leaseId") Long leaseId, @Param("propertyId") Long propertyId, @Param("unitId") Long unitId, @Param("unitNumber") String unitNumber, @Param("area") double area, @Param("rent") double rent, @Param("additionalCharges") double additionalCharges, @Param("deposit") double deposit, @Param("tax") double tax, @Param("fitOutPeriod") String fitOutPeriod, @Param("unitLeaseStatus") String unitLeaseStatus);

    void updateUnitOccupancy(@Param("unitId") Long unitId, @Param("occupancyStatus") String occupancyStatus);

    void deleteLeaseUnits(Long leaseId);

    List<LeaseUnitDto> findLeaseUnits(Long leaseId);

    int update(@Param("id") Long id, @Param("request") LeaseUpsertDto request);

    int softDelete(Long id);

    List<LeaseTransactionDto> findTransactionsByLeaseId(Long leaseId);

    LeaseTransactionDto findTransactionByNumber(String transactionNumber);

    void insertTransaction(@Param("leaseId") Long leaseId, @Param("transactionNumber") String transactionNumber, @Param("previousVersionNumber") int previousVersionNumber, @Param("newVersionNumber") int newVersionNumber, @Param("request") LeaseTransactionCreateDto request);

    int applyTransaction(
        @Param("id") Long id,
        @Param("leaseStatus") String leaseStatus,
        @Param("renewalStatus") String renewalStatus,
        @Param("startDate") String startDate,
        @Param("endDate") String endDate,
        @Param("rentAmount") Double rentAmount,
        @Param("securityDeposit") Double securityDeposit,
        @Param("unitId") Long unitId,
        @Param("versionNumber") Integer versionNumber,
        @Param("notes") String notes
    );

    List<UnitAvailabilityDto> findUnitAvailability(
        @Param("propertyId") Long propertyId,
        @Param("towerId") Long towerId,
        @Param("unitSearch") String unitSearch,
        @Param("occupancyStatus") String occupancyStatus,
        @Param("availabilityPeriod") String availabilityPeriod,
        @Param("leasePeriod") String leasePeriod,
        @Param("dateFrom") String dateFrom,
        @Param("dateTo") String dateTo,
        @Param("limit") int limit,
        @Param("offset") int offset
    );

    long countUnitAvailability(
        @Param("propertyId") Long propertyId,
        @Param("towerId") Long towerId,
        @Param("unitSearch") String unitSearch,
        @Param("occupancyStatus") String occupancyStatus,
        @Param("availabilityPeriod") String availabilityPeriod,
        @Param("leasePeriod") String leasePeriod,
        @Param("dateFrom") String dateFrom,
        @Param("dateTo") String dateTo
    );
}
