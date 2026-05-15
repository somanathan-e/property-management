package com.eba.lead.service;

import com.eba.common.dto.PagedResult;
import com.eba.lead.dto.LeadDto;
import com.eba.lead.dto.LeadUpsertDto;

public interface LeadService {
    PagedResult<LeadDto> getLeads(String search, Integer page, Integer size);
    LeadDto getLead(Long id);
    LeadDto createLead(LeadUpsertDto request);
    LeadDto updateLead(Long id, LeadUpsertDto request);
    void deleteLead(Long id);
}

