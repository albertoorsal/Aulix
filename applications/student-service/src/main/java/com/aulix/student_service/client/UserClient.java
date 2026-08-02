package com.aulix.student_service.client;

import com.aulix.common_core.response.ApiResponse;
import com.aulix.student_service.exception.DuplicateStudentException;
import com.aulix.student_service.exception.UserProvisioningException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class UserClient {

    private final RestClient restClient;

    public UserClient(RestClient userServiceRestClient) {
        this.restClient = userServiceRestClient;
    }

    public UserResponse createUser(CreateUserRequest request) {
        ApiResponse<UserResponse> response = restClient.post()
                .uri("/api/auth/register")
                .body(request)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    if (res.getStatusCode().value() == 409) {
                        throw new DuplicateStudentException("email", request.email());
                    }
                    throw new UserProvisioningException(
                            "auth-service rejected user creation for '%s' with status %s"
                                    .formatted(request.email(), res.getStatusCode()));
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new UserProvisioningException(
                            "auth-service failed to create user for '%s' with status %s"
                                    .formatted(request.email(), res.getStatusCode()));
                })
                .body(new ParameterizedTypeReference<ApiResponse<UserResponse>>() {});

        if (response == null || response.data() == null) {
            throw new UserProvisioningException(
                    "auth-service returned an empty response while creating user for '%s'".formatted(request.email()));
        }
        return response.data();
    }
}
