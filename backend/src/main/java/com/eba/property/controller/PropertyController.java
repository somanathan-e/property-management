package com.eba.property.controller;

import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.common.config.ServiceRegistry;
import com.eba.property.dto.PropertyDto;
import com.eba.property.dto.PropertyUpsertDto;
import com.eba.property.service.PropertyService;
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

@Path("/properties")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class PropertyController {
    private final PropertyService propertyService;

    public PropertyController() {
        this(ServiceRegistry.PROPERTY_SERVICE);
    }

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @GET
    public ApiResponse<PagedResult<PropertyDto>> getProperties(
        @QueryParam("q") String search,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Properties fetched", propertyService.getProperties(search, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<PropertyDto> getProperty(@PathParam("id") Long id) {
        return ApiResponse.success("Property fetched", propertyService.getProperty(id));
    }

    @POST
    public ApiResponse<PropertyDto> createProperty(PropertyUpsertDto request) {
        return ApiResponse.success("Property created", propertyService.createProperty(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<PropertyDto> updateProperty(@PathParam("id") Long id, PropertyUpsertDto request) {
        return ApiResponse.success("Property updated", propertyService.updateProperty(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteProperty(@PathParam("id") Long id) {
        propertyService.deleteProperty(id);
        return ApiResponse.success("Property deleted", null);
    }
}
