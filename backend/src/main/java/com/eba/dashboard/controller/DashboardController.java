package com.eba.dashboard.controller;

import com.eba.common.dto.ApiResponse;
import com.eba.common.config.ServiceRegistry;
import com.eba.dashboard.dto.ExecutiveDashboardDto;
import com.eba.dashboard.service.DashboardService;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/dashboard")
@Produces(MediaType.APPLICATION_JSON)
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController() {
        this(ServiceRegistry.DASHBOARD_SERVICE);
    }

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GET
    @Path("/executive")
    public ApiResponse<ExecutiveDashboardDto> executiveDashboard() {
        return ApiResponse.success("Executive dashboard loaded", dashboardService.getExecutiveDashboard());
    }
}
