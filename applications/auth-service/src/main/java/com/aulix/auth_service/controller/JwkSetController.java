package com.aulix.auth_service.controller;


import com.aulix.auth_service.security.RsaKeyProvider;
import com.nimbusds.jose.jwk.JWKSet;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Standard OAuth2/OIDC JWK Set endpoint. Every resource server in the platform (gateway,
 * student-service, notification-service) points its {@code security.jwt.jwk-set-uri} here to
 * validate access tokens issued by this service.
 */
@RestController
public class JwkSetController {
    private final RsaKeyProvider keyProvider;

    public JwkSetController(RsaKeyProvider keyProvider) {
        this.keyProvider = keyProvider;
    }

    @GetMapping("/oauth2/jwks")
    public Map<String, Object> jwks() {
        return new JWKSet(keyProvider.getPublicJwk()).toJSONObject();
    }
}
