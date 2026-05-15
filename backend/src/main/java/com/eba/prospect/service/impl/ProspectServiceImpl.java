package com.eba.prospect.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.prospect.dto.ProspectDto;
import com.eba.prospect.dto.ProspectUpsertDto;
import com.eba.prospect.mappers.ProspectMapper;
import com.eba.prospect.service.ProspectService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class ProspectServiceImpl implements ProspectService {
    @Override public PagedResult<ProspectDto> getProspects(String search, Integer page, Integer size) { PageQuery query = PageQuery.of(search, page, size); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { ProspectMapper mapper = session.getMapper(ProspectMapper.class); return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search())); } }
    @Override public ProspectDto getProspect(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { ProspectDto item = session.getMapper(ProspectMapper.class).findById(id); if (item == null) throw new AppException(Response.Status.NOT_FOUND, "Prospect not found"); return item; } }
    @Override public ProspectDto createProspect(ProspectUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { ProspectMapper mapper = session.getMapper(ProspectMapper.class); mapper.insert(request); return mapper.findByCode(request.prospectCode()); } }
    @Override public ProspectDto updateProspect(Long id, ProspectUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { ProspectMapper mapper = session.getMapper(ProspectMapper.class); if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Prospect not found"); return mapper.findById(id); } }
    @Override public void deleteProspect(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { if (session.getMapper(ProspectMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Prospect not found"); } }
    private void validate(ProspectUpsertDto request) { if (request == null || request.propertyId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property is required"); if (request.prospectCode() == null || request.prospectCode().isBlank() || request.prospectName() == null || request.prospectName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Prospect code and name are required"); if (request.interestType() == null || request.interestType().isBlank() || request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Interest type and status are required"); }
}

