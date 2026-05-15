package com.eba.tower.dto;

public record TowerUpsertDto(
    Long propertyId,
    String towerCode,
    String towerName,
    String status
) {
}

