package com.eba.tenant.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.tenant.dto.TenantDto;
import com.eba.tenant.dto.TenantUpsertDto;
import com.eba.tenant.mappers.TenantMapper;
import com.eba.tenant.service.TenantService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class TenantServiceImpl implements TenantService {

    @Override
    public PagedResult<TenantDto> getTenants(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            TenantMapper mapper = session.getMapper(TenantMapper.class);
            return new PagedResult<>(
                mapper.findPage(query.search(), query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search())
            );
        }
    }

    @Override
    public TenantDto getTenant(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            TenantDto tenant = session.getMapper(TenantMapper.class).findById(id);
            if (tenant == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Tenant not found");
            }
            return tenant;
        }
    }

    @Override
    public TenantDto createTenant(TenantUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            TenantMapper mapper = session.getMapper(TenantMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.tenantCode());
        }
    }

    @Override
    public TenantDto updateTenant(Long id, TenantUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            TenantMapper mapper = session.getMapper(TenantMapper.class);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Tenant not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteTenant(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(TenantMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Tenant not found");
            }
        }
    }

    private void validate(TenantUpsertDto request) {
        if (request == null || request.tenantCode() == null || request.tenantCode().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Tenant code is required");
        }
        if (request.tenantName() == null || request.tenantName().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Tenant name is required");
        }
        if (request.status() == null || request.status().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Status is required");
        }
    }
}
