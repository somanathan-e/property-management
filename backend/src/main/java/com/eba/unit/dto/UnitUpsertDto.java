package com.eba.unit.dto;

public record UnitUpsertDto(
    Long propertyId,
    Long towerId,
    String unitCode,
    String unitName,
    String unitType,
    String occupancyStatus,
    String status
) {
}

