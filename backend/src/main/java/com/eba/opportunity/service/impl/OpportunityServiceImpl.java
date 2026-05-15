package com.eba.opportunity.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.common.dto.PagedResult;
import com.eba.common.util.AppException;
import com.eba.common.util.PageQuery;
import com.eba.opportunity.dto.OpportunityDto;
import com.eba.opportunity.dto.OpportunityUpsertDto;
import com.eba.opportunity.mappers.OpportunityMapper;
import com.eba.opportunity.service.OpportunityService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class OpportunityServiceImpl implements OpportunityService {
    @Override public PagedResult<OpportunityDto> getOpportunities(String search, Integer page, Integer size) { PageQuery query = PageQuery.of(search, page, size); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { OpportunityMapper mapper = session.getMapper(OpportunityMapper.class); return new PagedResult<>(mapper.findPage(query.search(), query.size(), query.offset()), query.page(), query.size(), mapper.count(query.search())); } }
    @Override public OpportunityDto getOpportunity(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) { OpportunityDto item = session.getMapper(OpportunityMapper.class).findById(id); if (item == null) throw new AppException(Response.Status.NOT_FOUND, "Opportunity not found"); return item; } }
    @Override public OpportunityDto createOpportunity(OpportunityUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { OpportunityMapper mapper = session.getMapper(OpportunityMapper.class); mapper.insert(request); return mapper.findByCode(request.opportunityCode()); } }
    @Override public OpportunityDto updateOpportunity(Long id, OpportunityUpsertDto request) { validate(request); try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { OpportunityMapper mapper = session.getMapper(OpportunityMapper.class); if (mapper.update(id, request) == 0) throw new AppException(Response.Status.NOT_FOUND, "Opportunity not found"); return mapper.findById(id); } }
    @Override public void deleteOpportunity(Long id) { try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession(true)) { if (session.getMapper(OpportunityMapper.class).softDelete(id) == 0) throw new AppException(Response.Status.NOT_FOUND, "Opportunity not found"); } }
    private void validate(OpportunityUpsertDto request) { if (request == null || request.propertyId() == null) throw new AppException(Response.Status.BAD_REQUEST, "Property is required"); if (request.opportunityCode() == null || request.opportunityCode().isBlank() || request.opportunityName() == null || request.opportunityName().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Opportunity code and name are required"); if (request.pipelineStage() == null || request.pipelineStage().isBlank() || request.status() == null || request.status().isBlank()) throw new AppException(Response.Status.BAD_REQUEST, "Pipeline stage and status are required"); }
}

