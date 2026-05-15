package com.eba.property.service;

import com.eba.common.dto.PagedResult;
import com.eba.property.dto.PropertyDto;
import com.eba.property.dto.PropertyUpsertDto;

public interface PropertyService {
    PagedResult<PropertyDto> getProperties(String search, Integer page, Integer size);

    PropertyDto getProperty(Long id);

    PropertyDto createProperty(PropertyUpsertDto request);

    PropertyDto updateProperty(Long id, PropertyUpsertDto request);

    void deleteProperty(Long id);
}
