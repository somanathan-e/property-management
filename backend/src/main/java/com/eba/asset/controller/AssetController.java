package com.eba.asset.controller;

import com.eba.asset.service.AssetService;
import com.eba.asset.dto.AssetUpsertDto;
import com.eba.asset.dto.AssetDto;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.common.config.ServiceRegistry;
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

@Path("/assets")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AssetController {
    private final AssetService assetService;

    public AssetController() {
        this(ServiceRegistry.ASSET_SERVICE);
    }

    public AssetController(AssetService assetService) {
        this.assetService = assetService;
    }

    @GET
    public ApiResponse<PagedResult<AssetDto>> getAssets(
        @QueryParam("q") String search,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Assets fetched", assetService.getAssets(search, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<AssetDto> getAsset(@PathParam("id") Long id) {
        return ApiResponse.success("Asset fetched", assetService.getAsset(id));
    }

    @POST
    public ApiResponse<AssetDto> createAsset(AssetUpsertDto request) {
        return ApiResponse.success("Asset created", assetService.createAsset(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<AssetDto> updateAsset(@PathParam("id") Long id, AssetUpsertDto request) {
        return ApiResponse.success("Asset updated", assetService.updateAsset(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteAsset(@PathParam("id") Long id) {
        assetService.deleteAsset(id);
        return ApiResponse.success("Asset deleted", null);
    }
}
