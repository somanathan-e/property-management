package com.eba.amenity.service.impl;

import com.eba.amenity.dto.AmenityDto;
import com.eba.amenity.dto.AmenityUpsertDto;
import com.eba.amenity.mappers.AmenityMapper;
import com.eba.amenity.service.AmenityService;
import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class AmenityServiceImpl implements AmenityService {
    @Override
    public PagedResult<AmenityDto> getAmenities(String search, Integer page, Integer size) {
        PageQuery query = PageQuery.of(search, page, size);
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            AmenityMapper mapper = session.getMapper(AmenityMapper.class);
            return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search()));
        }
    }
    @Override public AmenityDto getAmenity(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { AmenityDto item = session.getMapper(AmenityMapper.class).findById(id); if (item == null) throw new AppException(Response.Status.NOT_FOUND, "Amenity not found"); return item; } }
    @Override public AmenityDto createAmenity(AmenityUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { AmenityMapper mapper = session.getMapper(AmenityMapper.class); mapper.insert(request); return mapper.findByCode(request.amenityCode()); } }
    @Override public AmenityDto updateAmenity(Long id, AmenityUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { AmenityMapper mapper = session.getMapper(AmenityMapper.class); if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Amenity not found"); return mapper.findById(id); } }
    @Override public void deleteAmenity(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { if (session.getMapper(AmenityMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Amenity not found"); } }
    private void validate(AmenityUpsertDto request) { if (request == null || request.propertyId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property is required"); if (request.amenityCode() == null || request.amenityCode().isBlank() || request.amenityName() == null || request.amenityName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Amenity code and name are required"); if (request.category() == null || request.category().isBlank() || request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Category and status are required"); }
}

