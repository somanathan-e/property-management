package com.eba.auth.validator;

import com.eba.auth.dto.LoginRequest;
import java.util.ArrayList;
import java.util.List;

public final class LoginRequestValidator {
    private LoginRequestValidator() {
    }

    public static List<String> validate(LoginRequest request) {
        List<String> errors = new ArrayList<>();
        if (request == null) {
            errors.add("Login request is required.");
            return errors;
        }
        if (request.username() == null || request.username().isBlank()) {
            errors.add("Username is required.");
        }
        if (request.password() == null || request.password().isBlank()) {
            errors.add("Password is required.");
        }
        return errors;
    }
}

