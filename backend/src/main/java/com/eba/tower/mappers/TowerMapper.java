package com.eba.tower.mappers;

import com.eba.tower.dto.TowerDto;
import com.eba.tower.dto.TowerUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface TowerMapper {
    List<TowerDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    TowerDto findById(Long id);
    TowerDto findByCode(String towerCode);
    void insert(TowerUpsertDto request);
    int update(@Param("id") Long id, @Param("request") TowerUpsertDto request);
    int softDelete(Long id);
}

