package com.eba.asset.service.impl;

import com.eba.asset.dto.AssetUpsertDto;
import com.eba.asset.mappers.AssetMapper;
import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.asset.dto.AssetDto;
import com.eba.asset.service.AssetService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class AssetServiceImpl implements AssetService {

    @Override
    public PagedResult<AssetDto> getAssets(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            AssetMapper mapper = session.getMapper(AssetMapper.class);
            return new PagedResult<>(
                mapper.findPage(query.search(), query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search())
            );
        }
    }

    @Override
    public AssetDto getAsset(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            AssetDto asset = session.getMapper(AssetMapper.class).findById(id);
            if (asset == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Asset not found");
            }
            return asset;
        }
    }

    @Override
    public AssetDto createAsset(AssetUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            AssetMapper mapper = session.getMapper(AssetMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.assetCode());
        }
    }

    @Override
    public AssetDto updateAsset(Long id, AssetUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            AssetMapper mapper = session.getMapper(AssetMapper.class);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Asset not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteAsset(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(AssetMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Asset not found");
            }
        }
    }

    private void validate(AssetUpsertDto request) {
        if (request == null || request.assetCode() == null || request.assetCode().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Asset code is required");
        }
        if (request.assetName() == null || request.assetName().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Asset name is required");
        }
        if (request.propertyId() == null) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property is required");
        }
        if (request.category() == null || request.category().isBlank() || request.status() == null || request.status().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Category and status are required");
        }
    }
}
