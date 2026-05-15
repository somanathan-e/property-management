package com.eba.auth.service;

import com.eba.auth.dto.LoginRequest;
import com.eba.auth.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}

