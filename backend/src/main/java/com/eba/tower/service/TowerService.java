package com.eba.tower.service;

import com.eba.common.dto.PagedResult;
import com.eba.tower.dto.TowerDto;
import com.eba.tower.dto.TowerUpsertDto;

public interface TowerService {
    PagedResult<TowerDto> getTowers(String search, Integer page, Integer size);
    TowerDto getTower(Long id);
    TowerDto createTower(TowerUpsertDto request);
    TowerDto updateTower(Long id, TowerUpsertDto request);
    void deleteTower(Long id);
}

