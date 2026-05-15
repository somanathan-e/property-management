package com.eba.common.util;

import jakarta.ws.rs.core.Response;
import java.util.List;

public class AppException extends RuntimeException {
    private final Response.Status status;
    private final List<String> errors;

    public AppException(Response.Status status, String message) {
        this(status, message, List.of());
    }

    public AppException(Response.Status status, String message, List<String> errors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }

    public Response.Status status() {
        return status;
    }

    public List<String> errors() {
        return errors;
    }
}

