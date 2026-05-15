package com.eba.property.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.property.dto.PropertyDto;
import com.eba.property.dto.PropertyUpsertDto;
import com.eba.property.mappers.PropertyMapper;
import com.eba.property.service.PropertyService;
import jakarta.ws.rs.core.Response;
import java.util.List;
import org.apache.ibatis.session.SqlSession;

public class PropertyServiceImpl implements PropertyService {

    @Override
    public PagedResult<PropertyDto> getProperties(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            PropertyMapper mapper = session.getMapper(PropertyMapper.class);
            return new PagedResult<>(
                mapper.findPage(query.search(), query.size(), query.offset()),
                query.page(),
                query.size(),
                mapper.count(query.search())
            );
        }
    }

    @Override
    public PropertyDto getProperty(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            PropertyDto property = session.getMapper(PropertyMapper.class).findById(id);
            if (property == null) {
                throw new AppException(Response.Status.NOT_FOUND, "Property not found");
            }
            return property;
        }
    }

    @Override
    public PropertyDto createProperty(PropertyUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            PropertyMapper mapper = session.getMapper(PropertyMapper.class);
            mapper.insert(request);
            return mapper.findByCode(request.propertyCode());
        }
    }

    @Override
    public PropertyDto updateProperty(Long id, PropertyUpsertDto request) {
        validate(request);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            PropertyMapper mapper = session.getMapper(PropertyMapper.class);
            if (mapper.update(id, request) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Property not found");
            }
            return mapper.findById(id);
        }
    }

    @Override
    public void deleteProperty(Long id) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) {
            if (session.getMapper(PropertyMapper.class).softDelete(id) == 0) {
                throw new AppException(Response.Status.NOT_FOUND, "Property not found");
            }
        }
    }

    private void validate(PropertyUpsertDto request) {
        if (request == null || request.propertyCode() == null || request.propertyCode().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property code is required");
        }
        if (request.propertyName() == null || request.propertyName().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property name is required");
        }
        if (request.propertyType() == null || request.propertyType().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Property type is required");
        }
        if (request.city() == null || request.city().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "City is required");
        }
        if (request.status() == null || request.status().isBlank()) {
            throw new AppException(Response.Status.BAD_REQUEST, "Status is required");
        }
    }
}
