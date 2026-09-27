package com.aulix.api_gateway.controller;

import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.reactive.server.WebTestClient;

class FallbackControllerTest {

    private final WebTestClient client = WebTestClient.bindToController(new FallbackController()).build();

    @ParameterizedTest
    @CsvSource({
            "GET,    /fallback/student, Student service",
            "POST,   /fallback/staff,   Staff service",
            "PUT,    /fallback/teacher, Teacher service",
            "DELETE, /fallback/subject, Subject service",
            "POST,   /fallback/auth,    Authentication service",
            "GET,    /fallback/user,    User service"
    })
    void returnsServiceUnavailableForAnyMethod(String method, String path, String service) {
        client.method(HttpMethod.valueOf(method)).uri(path)
                .exchange()
                .expectStatus().isEqualTo(HttpStatus.SERVICE_UNAVAILABLE)
                .expectBody()
                .jsonPath("$.success").isEqualTo(false)
                .jsonPath("$.message").isEqualTo(service + " is temporarily unavailable, please try again shortly")
                .jsonPath("$.timestamp").exists();
    }
}
