package com.eba.opportunity.service;

import com.eba.common.dto.PagedResult;
import com.eba.opportunity.dto.OpportunityDto;
import com.eba.opportunity.dto.OpportunityUpsertDto;

public interface OpportunityService {
    PagedResult<OpportunityDto> getOpportunities(String search, Integer page, Integer size);
    OpportunityDto getOpportunity(Long id);
    OpportunityDto createOpportunity(OpportunityUpsertDto request);
    OpportunityDto updateOpportunity(Long id, OpportunityUpsertDto request);
    void deleteOpportunity(Long id);
}

