package com.eba.unit.dto;

public record UnitDto(
    Long id,
    Long propertyId,
    String propertyCode,
    Long towerId,
    String towerCode,
    String unitCode,
    String unitName,
    String unitType,
    String occupancyStatus,
    String status
) {
}

