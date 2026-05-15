package com.eba.dashboard.mappers;

import com.eba.dashboard.dto.ExecutiveDashboardDto;

public interface DashboardMapper {
    ExecutiveDashboardDto fetchExecutiveSummary();
}

