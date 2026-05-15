package com.eba.unit.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.unit.dto.UnitDto;
import com.eba.unit.dto.UnitUpsertDto;
import com.eba.unit.mappers.UnitMapper;
import com.eba.unit.service.UnitService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class UnitServiceImpl implements UnitService {
    @Override
    public PagedResult<UnitDto> getUnits(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            UnitMapper mapper = session.getMapper(UnitMapper.class);
            return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search()));
        }
    }

    @Override
    public UnitDto getUnit(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            UnitDto unit = session.getMapper(UnitMapper.class).findById(id);
            if (unit == null) throw new AppException(Response.Status.NOT_FOUND, "Unit not found");
            return unit;
        }
    }

    @Override
    public UnitDto createUnit(UnitUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            UnitMapper mapper = session.getMapper(UnitMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.unitCode());
        }
    }

    @Override
    public UnitDto updateUnit(Long id, UnitUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            UnitMapper mapper = session.getMapper(UnitMapper.class);
            if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Unit not found");
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteUnit(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(UnitMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Unit not found");
        }
    }

    private void validate(UnitUpsertDto request) {
        if (request == null || request.propertyId() == null || request.towerId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property and tower are required");
        if (request.unitCode() == null || request.unitCode().isBlank() || request.unitName() == null || request.unitName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Unit code and name are required");
        if (request.unitType() == null || request.unitType().isBlank() || request.occupancyStatus() == null || request.occupancyStatus().isBlank() || request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Unit type, occupancy status, and status are required");
    }
}

