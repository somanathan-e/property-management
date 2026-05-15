package com.eba.opportunity.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.opportunity.dto.OpportunityDto;
import com.eba.opportunity.dto.OpportunityUpsertDto;
import com.eba.opportunity.service.OpportunityService;
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

@Path("/opportunities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class OpportunityController {
    private final OpportunityService opportunityService;
    public OpportunityController() { this(ServiceRegistry.OPPORTUNITY_SERVICE); }
    public OpportunityController(OpportunityService opportunityService) { this.opportunityService = opportunityService; }
    @GET public ApiResponse<PagedResult<OpportunityDto>> getOpportunities(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Opportunities fetched", opportunityService.getOpportunities(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<OpportunityDto> getOpportunity(@PathParam("id") Long id) { return ApiResponse.success("Opportunity fetched", opportunityService.getOpportunity(id)); }
    @POST public ApiResponse<OpportunityDto> createOpportunity(OpportunityUpsertDto request) { return ApiResponse.success("Opportunity created", opportunityService.createOpportunity(request)); }
    @PUT @Path("/{id}") public ApiResponse<OpportunityDto> updateOpportunity(@PathParam("id") Long id, OpportunityUpsertDto request) { return ApiResponse.success("Opportunity updated", opportunityService.updateOpportunity(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteOpportunity(@PathParam("id") Long id) { opportunityService.deleteOpportunity(id); return ApiResponse.success("Opportunity deleted", null); }
}

