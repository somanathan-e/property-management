package com.eba.property.mappers;

import com.eba.property.dto.PropertyDto;
import com.eba.property.dto.PropertyUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface PropertyMapper {
    List<PropertyDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search);

    PropertyDto findById(Long id);

    PropertyDto findByCode(String propertyCode);

    void insert(PropertyUpsertDto request);

    int update(@Param("id") Long id, @Param("request") PropertyUpsertDto request);

    int softDelete(Long id);
}
