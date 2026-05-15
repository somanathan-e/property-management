package com.eba.prospect.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.prospect.dto.ProspectDto;
import com.eba.prospect.dto.ProspectUpsertDto;
import com.eba.prospect.service.ProspectService;
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

@Path("/prospects")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProspectController {
    private final ProspectService prospectService;
    public ProspectController() { this(ServiceRegistry.PROSPECT_SERVICE); }
    public ProspectController(ProspectService prospectService) { this.prospectService = prospectService; }
    @GET public ApiResponse<PagedResult<ProspectDto>> getProspects(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Prospects fetched", prospectService.getProspects(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<ProspectDto> getProspect(@PathParam("id") Long id) { return ApiResponse.success("Prospect fetched", prospectService.getProspect(id)); }
    @POST public ApiResponse<ProspectDto> createProspect(ProspectUpsertDto request) { return ApiResponse.success("Prospect created", prospectService.createProspect(request)); }
    @PUT @Path("/{id}") public ApiResponse<ProspectDto> updateProspect(@PathParam("id") Long id, ProspectUpsertDto request) { return ApiResponse.success("Prospect updated", prospectService.updateProspect(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteProspect(@PathParam("id") Long id) { prospectService.deleteProspect(id); return ApiResponse.success("Prospect deleted", null); }
}

