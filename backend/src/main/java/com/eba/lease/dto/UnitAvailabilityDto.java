package com.eba.lease.dto;

public record UnitAvailabilityDto(
    Long unitId,
    Long propertyId,
    Long towerId,
    String propertyName,
    String towerName,
    String unitNumber,
    String unitType,
    double area,
    String areaUnit,
    String currentOccupancyStatus,
    String currentLeasePeriod,
    String futurePeriods,
    String availableFrom,
    String availableTo,
    String fitOutPeriod,
    String freePeriod,
    String tenantDetails,
    String timelineStatus,
    String currentLeaseStart,
    String currentLeaseEnd,
    String fitOutStart,
    String fitOutEnd,
    String freePeriodStart,
    String freePeriodEnd
) {
}
