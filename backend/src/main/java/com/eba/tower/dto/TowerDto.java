package com.eba.tower.dto;

public record TowerDto(
    Long id,
    Long propertyId,
    String propertyCode,
    String towerCode,
    String towerName,
    String status
) {
}

