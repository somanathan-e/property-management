package com.eba.unit.mappers;

import com.eba.unit.dto.UnitDto;
import com.eba.unit.dto.UnitUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface UnitMapper {
    List<UnitDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    UnitDto findById(Long id);
    UnitDto findByCode(String unitCode);
    void insert(UnitUpsertDto request);
    int update(@Param("id") Long id, @Param("request") UnitUpsertDto request);
    int softDelete(Long id);
}

