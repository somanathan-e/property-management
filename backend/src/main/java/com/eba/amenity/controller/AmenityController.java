package com.eba.amenity.controller;

import com.eba.amenity.dto.AmenityDto;
import com.eba.amenity.dto.AmenityUpsertDto;
import com.eba.amenity.service.AmenityService;
import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
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

@Path("/amenities")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AmenityController {
    private final AmenityService amenityService;
    public AmenityController() { this(ServiceRegistry.AMENITY_SERVICE); }
    public AmenityController(AmenityService amenityService) { this.amenityService = amenityService; }
    @GET public ApiResponse<PagedResult<AmenityDto>> getAmenities(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) { return ApiResponse.success("Amenities fetched", amenityService.getAmenities(search, page, size)); }
    @GET @Path("/{id}") public ApiResponse<AmenityDto> getAmenity(@PathParam("id") Long id) { return ApiResponse.success("Amenity fetched", amenityService.getAmenity(id)); }
    @POST public ApiResponse<AmenityDto> createAmenity(AmenityUpsertDto request) { return ApiResponse.success("Amenity created", amenityService.createAmenity(request)); }
    @PUT @Path("/{id}") public ApiResponse<AmenityDto> updateAmenity(@PathParam("id") Long id, AmenityUpsertDto request) { return ApiResponse.success("Amenity updated", amenityService.updateAmenity(id, request)); }
    @DELETE @Path("/{id}") public ApiResponse<Void> deleteAmenity(@PathParam("id") Long id) { amenityService.deleteAmenity(id); return ApiResponse.success("Amenity deleted", null); }
}

