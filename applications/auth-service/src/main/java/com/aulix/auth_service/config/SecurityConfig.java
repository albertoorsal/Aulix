package com.aulix.auth_service.config;

import com.aulix.auth_service.security.RsaKeyProvider;
import com.aulix.security_starter.jwt.RbacJwtAuthenticationConverter;
import com.nimbusds.jose.JOSEException;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * auth-service is both the identity provider (issues tokens over plain HTTP endpoints) and a
 * resource server for its own protected admin endpoints (e.g. {@code /api/users/**}), so it
 * defines its own filter chain rather than relying on security-starter's default -- see
 * {@code security.starter.autoconfig.enabled=false} in auth-service.yml.
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@EnableConfigurationProperties(CookieProperties.class)
public class SecurityConfig {

    private final RsaKeyProvider keyProvider;

    public SecurityConfig(RsaKeyProvider keyProvider) {
        this.keyProvider = keyProvider;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/oauth2/jwks").permitAll()
                        .requestMatchers("/actuator/health/**", "/actuator/info", "/actuator/prometheus").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(new RbacJwtAuthenticationConverter())));
        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        try {
            return NimbusJwtDecoder.withPublicKey(keyProvider.getRsaKey().toRSAPublicKey()).build();
        } catch (JOSEException e) {
            // The key pair is freshly generated in-process by RsaKeyProvider, so extracting its
            // own public key can only fail due to a programming error, never a runtime condition.
            throw new IllegalStateException("Failed to derive RSA public key from generated signing key", e);
        }
    }
}
