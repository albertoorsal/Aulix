package com.aulix.auth_service.security;

import com.aulix.auth_service.domain.User;
import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.List;
import java.util.UUID;

/**
 * Issues and verifies signed platform JWTs. Access tokens carry {@code roles}/{@code permissions}
 * claims consumed by {@code security-starter}'s RbacJwtAuthenticationConverter in every
 * downstream service; refresh tokens are opaque-looking JWTs with a narrower {@code scope}
 * claim (token_type=refresh) so they cannot be used directly as access tokens even if leaked
 * to a resource server.
 */
@Service
public class JwtTokenService {

    private static final String CLAIM_ROLES = "roles";
    private static final String CLAIM_PERMISSIONS = "permissions";
    private static final String CLAIM_TOKEN_TYPE = "token_type";
    private static final String TOKEN_TYPE_ACCESS = "access";
    private static final String TOKEN_TYPE_REFRESH = "refresh";

    private final RsaKeyProvider keyProvider;
    private final String issuer;
    private final long accessTokenTtlMinutes;
    private final long refreshTokenTtlDays;

    public JwtTokenService(
            RsaKeyProvider keyProvider,
            @Value("${app.jwt.issuer:http://localhost:9000}") String issuer,
            @Value("${app.jwt.access-token-ttl-minutes:30}") long accessTokenTtlMinutes,
            @Value("${app.jwt.refresh-token-ttl-days:14}") long refreshTokenTtlDays) {
        this.keyProvider = keyProvider;
        this.issuer = issuer;
        this.accessTokenTtlMinutes = accessTokenTtlMinutes;
        this.refreshTokenTtlDays = refreshTokenTtlDays;
    }

    public String generateAccessToken(User user) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(user.getId().toString())
                .claim("preferred_username", user.getEmail())
                .claim("given_name", user.getFirstName())
                .claim("family_name", user.getLastName())
                .claim(CLAIM_ROLES, List.copyOf(user.roleNames()))
                .claim(CLAIM_PERMISSIONS, List.copyOf(user.permissionNames()))
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_ACCESS)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(accessTokenTtlMinutes, ChronoUnit.MINUTES)))
                .jwtID(UUID.randomUUID().toString())
                .build();
        return sign(claims);
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .issuer(issuer)
                .subject(user.getId().toString())
                .claim(CLAIM_TOKEN_TYPE, TOKEN_TYPE_REFRESH)
                .issueTime(Date.from(now))
                .expirationTime(Date.from(now.plus(refreshTokenTtlDays, ChronoUnit.DAYS)))
                .jwtID(UUID.randomUUID().toString())
                .build();
        return sign(claims);
    }

    public long accessTokenTtlSeconds() {
        return accessTokenTtlMinutes * 60;
    }

    /**
     * Verifies signature and expiry, and asserts the token is a refresh token.
     *
     * @return the subject (user id) claim
     * @throws JwtValidationException if the token is invalid, expired, or not a refresh token
     */
    public String verifyRefreshTokenAndGetSubject(String token) {
        JWTClaimsSet claims = verify(token);
        if (!TOKEN_TYPE_REFRESH.equals(claims.getClaims().get(CLAIM_TOKEN_TYPE))) {
            throw new JwtValidationException("Token is not a refresh token");
        }
        return claims.getSubject();
    }

    private String sign(JWTClaimsSet claims) {
        try {
            SignedJWT signedJWT = new SignedJWT(
                    new JWSHeader.Builder(JWSAlgorithm.RS256).keyID(keyProvider.getRsaKey().getKeyID()).build(),
                    claims);
            signedJWT.sign(new RSASSASigner(keyProvider.getRsaKey()));
            return signedJWT.serialize();
        } catch (JOSEException e) {
            throw new IllegalStateException("Failed to sign JWT", e);
        }
    }

    private JWTClaimsSet verify(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            if (!signedJWT.verify(new RSASSAVerifier(keyProvider.getRsaKey().toRSAPublicKey()))) {
                throw new JwtValidationException("Invalid token signature");
            }
            JWTClaimsSet claims = signedJWT.getJWTClaimsSet();
            if (claims.getExpirationTime() == null || claims.getExpirationTime().before(new Date())) {
                throw new JwtValidationException("Token has expired");
            }
            return claims;
        } catch (ParseException | JOSEException e) {
            throw new JwtValidationException("Malformed token");
        }
    }
}