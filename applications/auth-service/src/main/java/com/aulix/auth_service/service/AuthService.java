package com.aulix.auth_service.service;

import com.aulix.auth_service.dto.*;

public interface AuthService {

    UserResponse register(RegisterUserRequest request);

    TokenResponse login(LoginRequest request);

    TokenResponse refresh(RefreshTokenRequest request);
}