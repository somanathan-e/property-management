package com.eba.lease.service;

import com.eba.common.dto.PagedResult;
import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseTransactionCreateDto;
import com.eba.lease.dto.LeaseTransactionDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.dto.UnitAvailabilityDto;
import java.util.List;

public interface LeaseService {
    PagedResult<LeaseDto> getLeases(String search, String leaseStatus, String renewalStatus, Integer page, Integer size);

    LeaseDto getLease(Long id);

    LeaseDto createLease(LeaseUpsertDto request);

    LeaseDto updateLease(Long id, LeaseUpsertDto request);

    void deleteLease(Long id);

    List<LeaseTransactionDto> getLeaseTransactions(Long leaseId);

    LeaseTransactionDto createLeaseTransaction(Long leaseId, LeaseTransactionCreateDto request);

    PagedResult<UnitAvailabilityDto> getUnitAvailability(Long propertyId, Long towerId, String unitSearch, String occupancyStatus, String availabilityPeriod, String leasePeriod, String dateFrom, String dateTo, Integer page, Integer size);
}
