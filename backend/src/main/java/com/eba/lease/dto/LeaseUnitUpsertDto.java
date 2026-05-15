package com.eba.lease.dto;

public record LeaseUnitUpsertDto(
    Long propertyId,
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
