package com.eba.lease.dto;

public record LeaseUnitDto(
    Long id,
    Long leaseId,
    Long propertyId,
    String propertyName,
    Long unitId,
    String unitNumber,
    double area,
    double rent,
    double additionalCharges,
    double deposit,
    double tax,
    String fitOutPeriod,
    String unitLeaseStatus
) {
}
