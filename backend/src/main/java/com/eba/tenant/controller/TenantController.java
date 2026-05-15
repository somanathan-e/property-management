package com.eba.tenant.controller;

import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.common.config.ServiceRegistry;
import com.eba.tenant.dto.TenantDto;
import com.eba.tenant.dto.TenantUpsertDto;
import com.eba.tenant.service.TenantService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/tenants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TenantController {
    private final TenantService tenantService;

    public TenantController() {
        this(ServiceRegistry.TENANT_SERVICE);
    }

    public TenantController(TenantService tenantService) {
        this.tenantService = tenantService;
    }

    @GET
    public ApiResponse<PagedResult<TenantDto>> getTenants(
        @QueryParam("q") String search,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Tenants fetched", tenantService.getTenants(search, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<TenantDto> getTenant(@PathParam("id") Long id) {
        return ApiResponse.success("Tenant fetched", tenantService.getTenant(id));
    }

    @POST
    public ApiResponse<TenantDto> createTenant(TenantUpsertDto request) {
        return ApiResponse.success("Tenant created", tenantService.createTenant(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<TenantDto> updateTenant(@PathParam("id") Long id, TenantUpsertDto request) {
        return ApiResponse.success("Tenant updated", tenantService.updateTenant(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteTenant(@PathParam("id") Long id) {
        tenantService.deleteTenant(id);
        return ApiResponse.success("Tenant deleted", null);
    }
}
