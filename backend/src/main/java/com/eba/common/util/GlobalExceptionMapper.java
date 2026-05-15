package com.eba.common.util;

import com.eba.common.dto.ApiResponse;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import java.util.List;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {
        if (exception instanceof AppException appException) {
            return Response.status(appException.status())
                .entity(ApiResponse.failure(appException.getMessage(), appException.errors()))
                .build();
        }

        return Response.serverError()
            .entity(ApiResponse.failure("Unexpected server error", List.of(exception.getMessage())))
            .build();
    }
}

