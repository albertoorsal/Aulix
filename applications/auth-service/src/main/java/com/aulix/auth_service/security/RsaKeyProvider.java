package com.aulix.auth_service.security;


import com.nimbusds.jose.jwk.RSAKey;
import org.springframework.stereotype.Component;
import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.util.UUID;

/**
 * Holds the RSA signing key pair used to sign/verify platform JWTs, exposed via
 * {@code /oauth2/jwks}. Generated once at startup for development; in production this should
 * be replaced with a key loaded from a secrets manager / HSM and rotated on a schedule (the
 * {@code keyId} makes rotation with overlapping validity possible without touching consumers).
 */
@Component
public class RsaKeyProvider {

    private final com.nimbusds.jose.jwk.RSAKey rsaKey;

    public RsaKeyProvider() {
        this.rsaKey = generateRsaKey();
    }

    private static com.nimbusds.jose.jwk.RSAKey generateRsaKey() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            KeyPair keyPair = generator.generateKeyPair();
            RSAPublicKey publicKey = (RSAPublicKey) keyPair.getPublic();
            RSAPrivateKey privateKey = (RSAPrivateKey) keyPair.getPrivate();
            return new com.nimbusds.jose.jwk.RSAKey.Builder(publicKey)
                    .privateKey(privateKey)
                    .keyID(UUID.randomUUID().toString())
                    .build();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to generate RSA signing key", e);
        }
    }

    public com.nimbusds.jose.jwk.RSAKey getRsaKey() {
        return rsaKey;
    }

    public RSAKey getPublicJwk() {
        return rsaKey.toPublicJWK();
    }
}
