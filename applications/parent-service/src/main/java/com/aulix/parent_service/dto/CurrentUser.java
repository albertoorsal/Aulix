package com.aulix.parent_service.dto;

import org.springframework.security.oauth2.jwt.Jwt;

import java.util.UUID;

/**
 * The signed-in user as described by the access token auth-service issues: {@code sub} is the
 * user id and the profile claims carry the name and email. Used by the PARENT self-service
 * endpoints, which must not trust any id sent by the client.
 */
public record CurrentUser(
        UUID userId,
        String firstName,
        String lastName,
        String email
) {
    public static CurrentUser from(Jwt jwt) {
        return new CurrentUser(
                UUID.fromString(jwt.getSubject()),
                jwt.getClaimAsString("given_name"),
                jwt.getClaimAsString("family_name"),
                jwt.getClaimAsString("preferred_username")
        );
    }
}
