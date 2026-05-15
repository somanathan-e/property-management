package com.eba.reservation.controller;

import com.eba.common.config.ServiceRegistry;
import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.lease.dto.LeaseDto;
import com.eba.reservation.dto.AvailableUnitDto;
import com.eba.reservation.dto.ReservationConvertDto;
import com.eba.reservation.dto.ReservationDto;
import com.eba.reservation.dto.ReservationHistoryDto;
import com.eba.reservation.dto.ReservationUnitDto;
import com.eba.reservation.dto.ReservationUpsertDto;
import com.eba.reservation.dto.ReservationWorkflowDto;
import com.eba.reservation.service.ReservationService;
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
import java.util.List;

@Path("/reservations")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ReservationController {
    private final ReservationService reservationService;

    public ReservationController() {
        this(ServiceRegistry.RESERVATION_SERVICE);
    }

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GET
    @Path("/available-units")
    public ApiResponse<PagedResult<AvailableUnitDto>> searchAvailableUnits(
        @QueryParam("propertyId") Long propertyId,
        @QueryParam("towerId") Long towerId,
        @QueryParam("propertyType") String propertyType,
        @QueryParam("unitType") String unitType,
        @QueryParam("unitSearch") String unitSearch,
        @QueryParam("location") String location,
        @QueryParam("minArea") Double minArea,
        @QueryParam("maxArea") Double maxArea,
        @QueryParam("minRent") Double minRent,
        @QueryParam("maxRent") Double maxRent,
        @QueryParam("leaseType") String leaseType,
        @QueryParam("availabilityDate") String availabilityDate,
        @QueryParam("startDate") String startDate,
        @QueryParam("endDate") String endDate,
        @QueryParam("furnishingStatus") String furnishingStatus,
        @QueryParam("floor") String floor,
        @QueryParam("capacity") Integer capacity,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Available units fetched", reservationService.searchAvailableUnits(propertyId, towerId, propertyType, unitType, unitSearch, location, minArea, maxArea, minRent, maxRent, leaseType, availabilityDate, startDate, endDate, furnishingStatus, floor, capacity, page, size));
    }

    @GET
    public ApiResponse<PagedResult<ReservationDto>> getReservations(
        @QueryParam("q") String search,
        @QueryParam("reservationStatus") String reservationStatus,
        @QueryParam("workflowStatus") String workflowStatus,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Reservations fetched", reservationService.getReservations(search, reservationStatus, workflowStatus, page, size));
    }

    @GET
    @Path("/{id}/history")
    public ApiResponse<List<ReservationHistoryDto>> getReservationHistory(@PathParam("id") Long id) {
        return ApiResponse.success("Reservation history fetched", reservationService.getReservationHistory(id));
    }

    @GET
    @Path("/{id}/units")
    public ApiResponse<List<ReservationUnitDto>> getReservationUnits(@PathParam("id") Long id) {
        return ApiResponse.success("Reservation units fetched", reservationService.getReservationUnits(id));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<ReservationDto> getReservation(@PathParam("id") Long id) {
        return ApiResponse.success("Reservation fetched", reservationService.getReservation(id));
    }

    @POST
    public ApiResponse<ReservationDto> createReservation(ReservationUpsertDto request) {
        return ApiResponse.success("Reservation created", reservationService.createReservation(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<ReservationDto> updateReservation(@PathParam("id") Long id, ReservationUpsertDto request) {
        return ApiResponse.success("Reservation updated", reservationService.updateReservation(id, request));
    }

    @POST
    @Path("/{id}/workflow")
    public ApiResponse<ReservationDto> updateWorkflow(@PathParam("id") Long id, ReservationWorkflowDto request) {
        return ApiResponse.success("Reservation workflow updated", reservationService.updateWorkflow(id, request));
    }

    @POST
    @Path("/{id}/cancel")
    public ApiResponse<ReservationDto> cancelReservation(@PathParam("id") Long id, ReservationWorkflowDto request) {
        return ApiResponse.success("Reservation cancelled", reservationService.cancelReservation(id, request));
    }

    @POST
    @Path("/{id}/units/{unitId}/cancel")
    public ApiResponse<ReservationDto> cancelReservationUnit(@PathParam("id") Long id, @PathParam("unitId") Long unitId, ReservationWorkflowDto request) {
        return ApiResponse.success("Reservation unit cancelled", reservationService.cancelReservationUnit(id, unitId, request));
    }

    @POST
    @Path("/{id}/expire")
    public ApiResponse<ReservationDto> expireReservation(@PathParam("id") Long id, ReservationWorkflowDto request) {
        return ApiResponse.success("Reservation expired", reservationService.expireReservation(id, request));
    }

    @POST
    @Path("/{id}/convert-to-lease")
    public ApiResponse<LeaseDto> convertToLease(@PathParam("id") Long id, ReservationConvertDto request) {
        return ApiResponse.success("Reservation converted to lease", reservationService.convertToLease(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteReservation(@PathParam("id") Long id) {
        reservationService.deleteReservation(id);
        return ApiResponse.success("Reservation deleted", null);
    }
}
