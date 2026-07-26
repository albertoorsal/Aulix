package com.aulix.security_starter.jwt;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;

import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * Translates the {@code roles} and {@code permissions} custom claims issued by auth-service
 * into Spring {@link GrantedAuthority}s.
 *
 * <p>Roles become {@code ROLE_*} authorities (for {@code hasRole(...)}), permissions become
 * plain authorities (for {@code hasAuthority(...)}), so every service gets the same
 * method-security vocabulary without redefining it.
 */
public class RbacJwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {

    private static final String ROLES_CLAIM = "roles";
    private static final String PERMISSIONS_CLAIM = "permissions";
    private static final String ROLE_PREFIX = "ROLE_";
    private final JwtGrantedAuthoritiesConverter defaultConverter = new JwtGrantedAuthoritiesConverter();

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        Collection<GrantedAuthority> authorities = Stream.of(
                defaultConverter.convert(jwt).stream(),
                extractClaim(jwt, ROLES_CLAIM, ROLE_PREFIX),
                extractClaim(jwt, PERMISSIONS_CLAIM, "")
        ).flatMap(s -> s)
                .collect(Collectors.toSet());

        String principalClaim = jwt.hasClaim("preferred_username")
                ? jwt.getClaimAsString("preferred_username")
                : jwt.getSubject();

        JwtAuthenticationConverter delegate = new JwtAuthenticationConverter();
        delegate.setJwtGrantedAuthoritiesConverter(j -> authorities);
        delegate.setPrincipalClaimName(jwt.hasClaim("preferred_username") ? "preferred_username" : "sub");
        return delegate.convert(jwt);
    }

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
}
