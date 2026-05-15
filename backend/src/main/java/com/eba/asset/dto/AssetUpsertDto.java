package com.eba.asset.dto;

public record AssetUpsertDto(
    String assetCode,
    String assetName,
    Long propertyId,
    String category,
    String status
) {
}
