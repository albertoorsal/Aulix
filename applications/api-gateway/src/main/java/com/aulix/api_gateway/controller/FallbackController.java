package com.aulix.api_gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.time.Instant;
import java.util.Map;

/**
 * Resilience4j circuit-breaker fallback targets configured per route in api-gateway.yml.
 * Returns a 503 with a stable JSON shape rather than letting the caller see a raw connection
 * failure when a downstream service is unavailable/tripped open.
 */
@RestController
public class FallbackController {

    // Here all fallback for each service


    private Mono<ResponseEntity<Map<String, Object>>> fallbackResponse(String service) {
        return Mono.just(ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(Map.of(
                "success", false,
                "message", service + " is temporarily unavailable, please try again shortly",
                "timestamp", Instant.now().toString()
        )));
    }
}
