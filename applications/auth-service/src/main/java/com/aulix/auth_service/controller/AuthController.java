package com.aulix.auth_service.controller;

import com.aulix.auth_service.dto.*;
import com.aulix.auth_service.security.CookieService;
import com.aulix.auth_service.security.JwtValidationException;
import com.aulix.auth_service.service.AuthService;
import com.aulix.common_core.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.Nullable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication", description = "Registration, login, token refresh and logout")
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;

    public AuthController(AuthService authService, CookieService cookieService) {
        this.authService = authService;
        this.cookieService = cookieService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(@Valid @RequestBody RegisterUserRequest request) {
        UserResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response, "User registered successfully"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        TokenResponse tokens = authService.login(request);
        cookieService.writeTokenCookies(response, tokens);
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            @Valid @RequestBody RefreshTokenRequest request, HttpServletResponse response) {
        TokenResponse tokens = authService.refresh(request);
        cookieService.writeTokenCookies(response, tokens);
        return ResponseEntity.ok(ApiResponse.ok(tokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletResponse response) {
        cookieService.clearTokenCookies(response);
        return ResponseEntity.ok(ApiResponse.ok(null, "Logged out successfully"));
    }

    @GetMapping("/verify")
    public ResponseEntity<ApiResponse<VerifyResponse>> verify(
            HttpServletRequest request,
            @RequestHeader(value = "Authorization", required = false) @Nullable String authorization) {
        String accessToken = resolveAccessToken(request, authorization);
        if (accessToken == null) {
            throw new JwtValidationException("No access token provided");
        }
        VerifyResponse verified = authService.verify(accessToken);
        return ResponseEntity.ok(ApiResponse.ok(verified));
    }

    @Nullable
    private String resolveAccessToken(HttpServletRequest request, @Nullable String authorization) {
        if (authorization != null && authorization.regionMatches(true, 0, "Bearer ", 0, 7)) {
            return authorization.substring(7).trim();
        }
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (CookieService.ACCESS_TOKEN_COOKIE.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

