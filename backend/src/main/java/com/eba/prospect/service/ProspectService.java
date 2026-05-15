package com.eba.prospect.service;

import com.eba.common.dto.PagedResult;
import com.eba.prospect.dto.ProspectDto;
import com.eba.prospect.dto.ProspectUpsertDto;

public interface ProspectService {
    PagedResult<ProspectDto> getProspects(String search, Integer page, Integer size);
    ProspectDto getProspect(Long id);
    ProspectDto createProspect(ProspectUpsertDto request);
    ProspectDto updateProspect(Long id, ProspectUpsertDto request);
    void deleteProspect(Long id);
}

