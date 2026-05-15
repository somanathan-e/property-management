package com.eba.tenant.mappers;

import com.eba.tenant.dto.TenantDto;
import com.eba.tenant.dto.TenantUpsertDto;
import java.util.List;
import org.apache.ibatis.annotations.Param;

public interface TenantMapper {
    List<TenantDto> findPage(@Param("search") String search, @Param("limit") int limit, @Param("offset") int offset);

    long count(@Param("search") String search);

    TenantDto findById(Long id);

    TenantDto findByCode(String tenantCode);

    void insert(TenantUpsertDto request);

    int update(@Param("id") Long id, @Param("request") TenantUpsertDto request);

    int softDelete(Long id);
}
