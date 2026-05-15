package com.eba.tower.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.tower.dto.TowerDto;
import com.eba.tower.dto.TowerUpsertDto;
import com.eba.tower.service.TowerService;
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

@Path("/towers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class TowerController {
    private final TowerService towerService;

    public TowerController() {
        this(ServiceRegistry.TOWER_SERVICE);
    }

    public TowerController(TowerService towerService) {
        this.towerService = towerService;
    }

    @GET
    public ApiResponse<PagedResult<TowerDto>> getTowers(@QueryParam("q") String search, @QueryParam("page") Integer page, @QueryParam("size") Integer size) {
        return ApiResponse.success("Towers fetched", towerService.getTowers(search, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<TowerDto> getTower(@PathParam("id") Long id) {
        return ApiResponse.success("Tower fetched", towerService.getTower(id));
    }

    @POST
    public ApiResponse<TowerDto> createTower(TowerUpsertDto request) {
        return ApiResponse.success("Tower created", towerService.createTower(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<TowerDto> updateTower(@PathParam("id") Long id, TowerUpsertDto request) {
        return ApiResponse.success("Tower updated", towerService.updateTower(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteTower(@PathParam("id") Long id) {
        towerService.deleteTower(id);
        return ApiResponse.success("Tower deleted", null);
    }
}

