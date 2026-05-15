package com.eba.unit.service;

import com.eba.common.dto.PagedResult;
import com.eba.unit.dto.UnitDto;
import com.eba.unit.dto.UnitUpsertDto;

public interface UnitService {
    PagedResult<UnitDto> getUnits(String search, Integer page, Integer size);
    UnitDto getUnit(Long id);
    UnitDto createUnit(UnitUpsertDto request);
    UnitDto updateUnit(Long id, UnitUpsertDto request);
    void deleteUnit(Long id);
}

