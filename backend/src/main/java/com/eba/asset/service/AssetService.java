package com.eba.asset.service;

import com.eba.asset.dto.AssetUpsertDto;
import com.eba.common.dto.PagedResult;
import com.eba.asset.dto.AssetDto;

public interface AssetService {
    PagedResult<AssetDto> getAssets(String search, Integer page, Integer size);

    AssetDto getAsset(Long id);

    AssetDto createAsset(AssetUpsertDto request);

    AssetDto updateAsset(Long id, AssetUpsertDto request);

    void deleteAsset(Long id);
}
