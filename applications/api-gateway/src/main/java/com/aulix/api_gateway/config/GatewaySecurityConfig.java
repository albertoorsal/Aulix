package com.aulix.api_gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.ReactiveJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.authentication.ReactiveJwtAuthenticationConverterAdapter;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Edge-level JWT validation for the gateway (reactive/WebFlux stack -- mirrors the RBAC claim
 * mapping in {@code security-starter}'s RbacJwtAuthenticationConverter, which downstream
 * servlet-based services use). Every request past the gateway either carries a valid bearer
 * token or hits a permitted public route; downstream services independently re-validate the
 * same token (defense in depth) rather than trusting a gateway-forwarded identity header.
 */

@Configuration
@EnableWebFluxSecurity
public class GatewaySecurityConfig {

    @Value("${security.jwt.jwk-set-uri:http://localhost:9000/oauth2/jwks}")
    private String jwkSetUri;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/api/auth/**").permitAll()
                        .pathMatchers("/actuator/health/**", "/actuator/info", "/actuator/prometheus").permitAll()
                        .pathMatchers("/fallback/**").permitAll()
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(reactiveJwtAuthenticationConverter())));
        return http.build();
    }


    private ReactiveJwtAuthenticationConverterAdapter reactiveJwtAuthenticationConverter() {
        return new ReactiveJwtAuthenticationConverterAdapter(jwt -> {
            JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();
            Collection<GrantedAuthority> authorities = Stream.of(
                            defaultConverter.convert(jwt).stream(),
                            extractClaim(jwt, "roles", "ROLE_"),
                            extractClaim(jwt, "permissions", "")
                    )
                    .flatMap(s -> s)
                    .collect(Collectors.toSet());
            var token = new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    jwt.getSubject(), jwt, authorities);
            return token;
        });
    }

    @SuppressWarnings("unchecked")
    private Stream<GrantedAuthority> extractClaim(Jwt jwt, String claim, String prefix) {
        Object raw = jwt.getClaim(claim);
        if (raw == null) {
            return Stream.empty();
        }
        List<String> values = raw instanceof Collection<?> collection
                ? (List<String>) collection.stream().map(Object::toString).toList()
                : List.of(raw.toString());
        return values.stream().map(v -> new SimpleGrantedAuthority(prefix + v));
    }

    @Bean
    public ReactiveJwtDecoder reactiveJwtDecoder() {
        return org.springframework.security.oauth2.jwt.NimbusReactiveJwtDecoder.withJwkSetUri(jwkSetUri).build();
    }

    private CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }



}
