package com.eba.lease.controller;

import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.common.config.ServiceRegistry;
import com.eba.lease.dto.LeaseDto;
import com.eba.lease.dto.LeaseTransactionCreateDto;
import com.eba.lease.dto.LeaseTransactionDto;
import com.eba.lease.dto.LeaseUpsertDto;
import com.eba.lease.service.LeaseService;
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
import java.util.List;

@Path("/leases")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class LeaseController {
    private final LeaseService leaseService;

    public LeaseController() {
        this(ServiceRegistry.LEASE_SERVICE);
    }

    public LeaseController(LeaseService leaseService) {
        this.leaseService = leaseService;
    }

    @GET
    public ApiResponse<PagedResult<LeaseDto>> getLeases(
        @QueryParam("q") String search,
        @QueryParam("leaseStatus") String leaseStatus,
        @QueryParam("renewalStatus") String renewalStatus,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Leases fetched", leaseService.getLeases(search, leaseStatus, renewalStatus, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<LeaseDto> getLease(@PathParam("id") Long id) {
        return ApiResponse.success("Lease fetched", leaseService.getLease(id));
    }

    @POST
    public ApiResponse<LeaseDto> createLease(LeaseUpsertDto request) {
        return ApiResponse.success("Lease created", leaseService.createLease(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<LeaseDto> updateLease(@PathParam("id") Long id, LeaseUpsertDto request) {
        return ApiResponse.success("Lease updated", leaseService.updateLease(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteLease(@PathParam("id") Long id) {
        leaseService.deleteLease(id);
        return ApiResponse.success("Lease deleted", null);
    }

    @GET
    @Path("/{id}/transactions")
    public ApiResponse<List<LeaseTransactionDto>> getLeaseTransactions(@PathParam("id") Long id) {
        return ApiResponse.success("Lease transactions fetched", leaseService.getLeaseTransactions(id));
    }

    @POST
    @Path("/{id}/transactions")
    public ApiResponse<LeaseTransactionDto> createLeaseTransaction(@PathParam("id") Long id, LeaseTransactionCreateDto request) {
        return ApiResponse.success("Lease transaction created", leaseService.createLeaseTransaction(id, request));
    }
}
