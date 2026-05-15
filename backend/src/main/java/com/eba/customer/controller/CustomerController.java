package com.eba.customer.controller;

import com.eba.common.dto.ApiResponse;
import com.eba.common.dto.PagedResult;
import com.eba.common.config.ServiceRegistry;
import com.eba.customer.dto.CustomerDto;
import com.eba.customer.dto.CustomerUpsertDto;
import com.eba.customer.service.CustomerService;
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

@Path("/customers")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CustomerController {
    private final CustomerService customerService;

    public CustomerController() {
        this(ServiceRegistry.CUSTOMER_SERVICE);
    }

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GET
    public ApiResponse<PagedResult<CustomerDto>> getCustomers(
        @QueryParam("q") String search,
        @QueryParam("page") Integer page,
        @QueryParam("size") Integer size
    ) {
        return ApiResponse.success("Customers fetched", customerService.getCustomers(search, page, size));
    }

    @GET
    @Path("/{id}")
    public ApiResponse<CustomerDto> getCustomer(@PathParam("id") Long id) {
        return ApiResponse.success("Customer fetched", customerService.getCustomer(id));
    }

    @POST
    public ApiResponse<CustomerDto> createCustomer(CustomerUpsertDto request) {
        return ApiResponse.success("Customer created", customerService.createCustomer(request));
    }

    @PUT
    @Path("/{id}")
    public ApiResponse<CustomerDto> updateCustomer(@PathParam("id") Long id, CustomerUpsertDto request) {
        return ApiResponse.success("Customer updated", customerService.updateCustomer(id, request));
    }

    @DELETE
    @Path("/{id}")
    public ApiResponse<Void> deleteCustomer(@PathParam("id") Long id) {
        customerService.deleteCustomer(id);
        return ApiResponse.success("Customer deleted", null);
    }
}
