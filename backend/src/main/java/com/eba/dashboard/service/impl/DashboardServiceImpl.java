package com.eba.dashboard.service.impl;

import com.eba.common.config.DatabaseConfig;
import com.eba.dashboard.dto.ExecutiveDashboardDto;
import com.eba.dashboard.mappers.DashboardMapper;
import com.eba.dashboard.service.DashboardService;
import org.apache.ibatis.session.SqlSession;

public class DashboardServiceImpl implements DashboardService {

    @Override
    public ExecutiveDashboardDto getExecutiveDashboard() {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            return session.getMapper(DashboardMapper.class).fetchExecutiveSummary();
        }
    }
}
