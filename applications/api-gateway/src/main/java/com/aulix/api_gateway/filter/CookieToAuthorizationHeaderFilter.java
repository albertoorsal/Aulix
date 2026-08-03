package com.aulix.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

/**
 * Downstream services (student-service, etc.) only recognize the Authorization header -- they
 * have no cookie fallback (see GatewaySecurityConfig.cookieOrHeaderBearerTokenConverter, which
 * lets the gateway itself authenticate cookie-based browser requests). Without this filter, a
 * request authenticated here purely via the accessToken cookie would be proxied downstream with
 * no Authorization header and get rejected as anonymous by the resource servers.
 */
@Component
public class CookieToAuthorizationHeaderFilter implements GlobalFilter, Ordered {

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String header = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (header != null && !header.isBlank()) {
            return chain.filter(exchange);
        }

        return Mono.justOrEmpty(request.getCookies().getFirst("accessToken"))
                .map(cookie -> exchange.mutate()
                        .request(r -> r.headers(h -> h.setBearerAuth(cookie.getValue())))
                        .build())
                .defaultIfEmpty(exchange)
                .flatMap(chain::filter);
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
