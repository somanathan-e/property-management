package com.eba.lease.mappers;

import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseTransactionCreateDto;
import com.eba.lease.dto.LeaseTransactionDto;
import com.eba.lease.dto.LeaseUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface LeaseMapper {
    List<LeaseDto> findPage(@Param("search") String search, @Param("leaseStatus") String leaseStatus, @Param("renewalStatus") String renewalStatus, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search, @Param("leaseStatus") String leaseStatus, @Param("renewalStatus") String renewalStatus);

    LeaseDto findById(Long id);

    LeaseDto findByLeaseNumber(String leaseNumber);

    long countActiveLeaseConflict(@Param("unitId") Long unitId, @Param("startDate") String startDate, @Param("endDate") String endDate, @Param("excludeId") Long excludeId);

    void insert(LeaseUpsertDto request);

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
}
