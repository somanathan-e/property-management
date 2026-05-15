package com.eba.reservation.dto;

public record AvailableUnitDto(
    Long unitId,
    Long propertyId,
    Long towerId,
    String propertyName,
    String towerName,
    String location,
    String propertyType,
    String unitNumber,
    String floor,
    String unitType,
    double area,
    String areaUnit,
    String availabilityStatus,
    String availableFromDate,
    double monthlyRent,
    String currency,
    double securityDeposit,
    double maintenanceCharges,
    double camCharges,
    double parkingCharges,
    String minimumLeaseDuration,
    String fitOutPeriod,
    String noticePeriod,
    String escalationTerms,
    String furnishingStatus,
    String amenities,
    String parkingAvailability,
    String imageUrl
) {
}
