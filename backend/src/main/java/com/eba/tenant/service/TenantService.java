package com.eba.tenant.service;

import com.eba.common.dto.PagedResult;
import com.eba.tenant.dto.TenantDto;
import com.eba.tenant.dto.TenantUpsertDto;

public interface TenantService {
    PagedResult<TenantDto> getTenants(String search, Integer page, Integer size);

    TenantDto getTenant(Long id);

    TenantDto createTenant(TenantUpsertDto request);

    TenantDto updateTenant(Long id, TenantUpsertDto request);

    void deleteTenant(Long id);
}
