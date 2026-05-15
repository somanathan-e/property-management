package com.eba.amenity.mappers;

import com.eba.amenity.dto.AmenityDto;
import com.eba.amenity.dto.AmenityUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface AmenityMapper {
    List<AmenityDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);
    long count(@Param("search") String search);
    AmenityDto findById(Long id);
    AmenityDto findByCode(String amenityCode);
    void insert(AmenityUpsertDto request);
    int update(@Param("id") Long id, @Param("request") AmenityUpsertDto request);
    int softDelete(Long id);
}

