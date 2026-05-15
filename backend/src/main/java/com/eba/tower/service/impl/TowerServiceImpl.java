package com.eba.tower.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.tower.dto.TowerDto;
import com.eba.tower.dto.TowerUpsertDto;
import com.eba.tower.mappers.TowerMapper;
import com.eba.tower.service.TowerService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class TowerServiceImpl implements TowerService {
    @Override
    public PagedResult<TowerDto> getTowers(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            TowerMapper mapper = session.getMapper(TowerMapper.class);
            return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search()));
        }
    }

    @Override
    public TowerDto getTower(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            TowerDto tower = session.getMapper(TowerMapper.class).findById(id);
            if (tower == null) throw new AppException(Response.Status.NOT_FOUND, "Tower not found");
            return tower;
        }
    }

    @Override
    public TowerDto createTower(TowerUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            TowerMapper mapper = session.getMapper(TowerMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.towerCode());
        }
    }

    @Override
    public TowerDto updateTower(Long id, TowerUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            TowerMapper mapper = session.getMapper(TowerMapper.class);
            if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Tower not found");
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteTower(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(TowerMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Tower not found");
        }
    }

    private void validate(TowerUpsertDto request) {
        if (request == null || request.propertyId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property is required");
        if (request.towerCode() == null || request.towerCode().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Tower code is required");
        if (request.towerName() == null || request.towerName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Tower name is required");
        if (request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Status is required");
    }
}

