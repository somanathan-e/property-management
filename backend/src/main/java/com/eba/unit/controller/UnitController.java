package com.eba.unit.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.unit.dto.UnitDto;
import com.eba.unit.dto.UnitUpsertDto;
import com.eba.unit.service.UnitService;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;

@Path("/units")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class UnitController {
    private final UnitService unitService;
    public UnitController() { this(ServiceRegistry.UNIT_SERVICE); }
    public UnitController(UnitService unitService) { this.unitService = unitService; }
    @GET public ApiResponse<PagedResult<UnitDto>> getUnits(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Units fetched", unitService.getUnits(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<UnitDto> getUnit(@PathParam("id") Long id) { return ApiResponse.success("Unit fetched", unitService.getUnit(id)); }
    @POST public ApiResponse<UnitDto> createUnit(UnitUpsertDto request) { return ApiResponse.success("Unit created", unitService.createUnit(request)); }
    @PUT @Path("/{id}") public ApiResponse<UnitDto> updateUnit(@PathParam("id") Long id, UnitUpsertDto request) { return ApiResponse.success("Unit updated", unitService.updateUnit(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteUnit(@PathParam("id") Long id) { unitService.deleteUnit(id); return ApiResponse.success("Unit deleted", null); }
}

