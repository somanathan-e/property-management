package com.eba.auth.controller;

import com.eba.auth.dto.LoginRequest;
import com.eba.common.config.ServiceRegistry;
import com.eba.auth.service.AuthService;
import com.eba.auth.validator.LoginRequestValidator;
import com.eba.common.dto.ApiResponse;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class AuthController {
    private final AuthService authService;

    public AuthController() {
        this(ServiceRegistry.AUTH_SERVICE);
    }

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @POST
    @Path("/login")
    public Response login(LoginRequest request) {
        List<String> errors = LoginRequestValidator.validate(request);
        if (!errors.isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(ApiResponse.failure("Validation failed", errors))
                .build();
        }
        return Response.ok(ApiResponse.success("Login successful", authService.login(request))).build();
    }
}
