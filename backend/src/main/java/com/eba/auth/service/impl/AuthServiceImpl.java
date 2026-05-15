package com.eba.auth.service.impl;

import com.eba.auth.domain.AuthenticatedUser;
import com.eba.auth.dto.LoginRequest;
import com.eba.auth.dto.LoginResponse;
import com.eba.auth.mappers.AuthMapper;
import com.eba.common.config.DatabaseConfig;
import com.eba.common.util.AppException;
import com.eba.auth.service.AuthService;
import jakarta.ws.rs.core.Response;
import org.apache.ibatis.session.SqlSession;

public class AuthServiceImpl implements AuthService {

    @Override
    public LoginResponse login(LoginRequest request) {
        try (SqlSession session = DatabaseConfig.sqlSessionFactory().openSession()) {
            AuthenticatedUser user = session.getMapper(AuthMapper.class).findByUsername(request.username());
            if (user == null || !"secret".equals(request.password())) {
                throw new AppException(Response.Status.UNAUTHORIZED, "Invalid credentials");
            }
            return new LoginResponse("demo-access-token", "demo-refresh-token", user.role());
        }
    }
}
