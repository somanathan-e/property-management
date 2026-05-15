package com.eba.asset.mappers;

import com.eba.asset.dto.AssetDto;
import com.eba.asset.dto.AssetUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface AssetMapper {
    List<AssetDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search);

    AssetDto findById(Long id);

    AssetDto findByCode(String assetCode);

    void insert(AssetUpsertDto request);

    int update(@Param("id") Long id, @Param("request") AssetUpsertDto request);

    int softDelete(Long id);
}
