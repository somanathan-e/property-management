package com.eba.asset.dto;

public record AssetDto(
    Long id,
    String assetCode,
    String assetName,
    Long propertyId,
    String propertyCode,
    String category,
    String status
) {
}

