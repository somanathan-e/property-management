package com.eba.lead.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.lead.dto.LeadDto;
import com.eba.lead.dto.LeadUpsertDto;
import com.eba.lead.mappers.LeadMapper;
import com.eba.lead.service.LeadService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class LeadServiceImpl implements LeadService {
    @Override public PagedResult<LeadDto> getLeads(String search, Integer page, Integer size) { PageQuery query = PageQuery.of(search, page, size); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { LeadMapper mapper = session.getMapper(LeadMapper.class); return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search())); } }
    @Override public LeadDto getLead(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { LeadDto item = session.getMapper(LeadMapper.class).findById(id); if (item == null) throw new AppException(Response.Status.NOT_FOUND, "Lead not found"); return item; } }
    @Override public LeadDto createLead(LeadUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { LeadMapper mapper = session.getMapper(LeadMapper.class); mapper.insert(request); return mapper.findByCode(request.leadCode()); } }
    @Override public LeadDto updateLead(Long id, LeadUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { LeadMapper mapper = session.getMapper(LeadMapper.class); if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Lead not found"); return mapper.findById(id); } }
    @Override public void deleteLead(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { if (session.getMapper(LeadMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Lead not found"); } }
    private void validate(LeadUpsertDto request) { if (request == null || request.propertyId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property is required"); if (request.leadCode() == null || request.leadCode().isBlank() || request.leadName() == null || request.leadName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Lead code and name are required"); if (request.source() == null || request.source().isBlank() || request.status() == null || request.status().isBlank() || request.stage() == null || request.stage().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Source, status, and stage are required"); }
}

