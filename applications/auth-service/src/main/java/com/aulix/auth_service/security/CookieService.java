package com.aulix.auth_service.security;

import com.aulix.auth_service.config.CookieProperties;
import com.aulix.auth_service.dto.TokenResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

/**
 * Mirrors access/refresh tokens into HttpOnly cookies alongside the JSON body so callers can
 * pick either transport. Refresh token TTL is not exposed on {@link TokenResponse}, so its
 * cookie is session-scoped (cleared when the browser closes) rather than fixed-Max-Age.
 */
@Service
public class CookieService {

    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    private final CookieProperties properties;

    public CookieService(CookieProperties properties) {
        this.properties = properties;
    }

    public void writeTokenCookies(HttpServletResponse response, TokenResponse tokens) {
        response.addHeader("Set-Cookie", accessTokenCookie(tokens.accessToken(), tokens.expiresInSeconds()).toString());
        response.addHeader("Set-Cookie", refreshTokenCookie(tokens.refreshToken()).toString());
    }

    public void clearTokenCookies(HttpServletResponse response) {
        response.addHeader("Set-Cookie", cookieBuilder(ACCESS_TOKEN_COOKIE, "").maxAge(0).build().toString());
        response.addHeader("Set-Cookie", cookieBuilder(REFRESH_TOKEN_COOKIE, "").maxAge(0).build().toString());
    }

    private ResponseCookie accessTokenCookie(String token, long maxAgeSeconds) {
        return cookieBuilder(ACCESS_TOKEN_COOKIE, token).maxAge(maxAgeSeconds).build();
    }

    private ResponseCookie refreshTokenCookie(String token) {
        return cookieBuilder(REFRESH_TOKEN_COOKIE, token).build();
    }

    private ResponseCookie.ResponseCookieBuilder cookieBuilder(String name, String value) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(properties.secure())
                .sameSite(properties.sameSite())
                .path("/");
        if (properties.domain() != null && !properties.domain().isBlank()) {
            builder.domain(properties.domain());
        }
        return builder;
    }
}
