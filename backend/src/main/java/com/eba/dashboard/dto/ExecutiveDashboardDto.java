package com.eba.dashboard.dto;

public record ExecutiveDashboardDto(
    String occupancyPercentage,
    String revenueSummary,
    int expiringLeases,
    int vacantUnits,
    int pendingApprovals
) {
}

