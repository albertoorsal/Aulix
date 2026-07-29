package com.aulix.auth_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cookie")
public record CookieProperties(
        String domain,
        boolean secure,
        String sameSite
) {
}
