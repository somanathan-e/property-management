package com.eba.auth.mappers;

import com.eba.auth.domain.AuthenticatedUser;

public interface AuthMapper {
    AuthenticatedUser findByUsername(String username);
}

