package com.eba.amenity.service;

import com.eba.amenity.dto.AmenityDto;
import com.eba.amenity.dto.AmenityUpsertDto;
import com.eba.common.dto.PagedResult;

public interface AmenityService {
    PagedResult<AmenityDto> getAmenities(String search, Integer page, Integer size);
    AmenityDto getAmenity(Long id);
    AmenityDto createAmenity(AmenityUpsertDto request);
    AmenityDto updateAmenity(Long id, AmenityUpsertDto request);
    void deleteAmenity(Long id);
}

