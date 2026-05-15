package com.eba.lead.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.lead.dto.LeadDto;
import com.eba.lead.dto.LeadUpsertDto;
import com.eba.lead.service.LeadService;
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

@Path("/leads")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeadController {
    private final LeadService leadService;
    public LeadController() { this(ServiceRegistry.LEAD_SERVICE); }
    public LeadController(LeadService leadService) { this.leadService = leadService; }
    @GET public ApiResponse<PagedResult<LeadDto>> getLeads(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Leads fetched", leadService.getLeads(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<LeadDto> getLead(@PathParam("id") Long id) { return ApiResponse.success("Lead fetched", leadService.getLead(id)); }
    @POST public ApiResponse<LeadDto> createLead(LeadUpsertDto request) { return ApiResponse.success("Lead created", leadService.createLead(request)); }
    @PUT @Path("/{id}") public ApiResponse<LeadDto> updateLead(@PathParam("id") Long id, LeadUpsertDto request) { return ApiResponse.success("Lead updated", leadService.updateLead(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteLead(@PathParam("id") Long id) { leadService.deleteLead(id); return ApiResponse.success("Lead deleted", null); }
}

