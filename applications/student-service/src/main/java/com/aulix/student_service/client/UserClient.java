package com.aulix.student_service.client;

import com.aulix.common_core.pagination.PageResponse;
import com.aulix.common_core.response.ApiResponse;
import com.aulix.student_service.exception.DuplicateStudentException;
import com.aulix.student_service.exception.UserProvisioningException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

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

    /**
     * Returns up to {@code maxResults} users whose name/email matches {@code search}, used to
     * resolve the set of userIds a student free-text search should also match against.
     */
    public List<UserResponse> searchUsers(String search, int maxResults) {
        ApiResponse<PageResponse<UserResponse>> response = restClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/users")
                        .queryParam("search", search)
                        .queryParam("size", maxResults)
                        .build()
                )
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new UserProvisioningException(
                            "auth-service rejected user search for '%s' with status %s"
                                    .formatted(search, res.getStatusCode()));
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new UserProvisioningException(
                            "auth-service failed to search users for '%s' with status %s"
                                    .formatted(search, res.getStatusCode()));
                })
                .body(new ParameterizedTypeReference<ApiResponse<PageResponse<UserResponse>>>() {});

        if (response == null || response.data() == null) {
            throw new UserProvisioningException(
                    "auth-service returned an empty response while searching users for '%s'".formatted(search));
        }
        return response.data().content();
    }

    /**
     * Batch-fetches users by id, used to enrich a page of Students with their user-domain data
     * (name, email) in a single round trip instead of one call per student.
     */
    public List<UserResponse> findAllByIds(Collection<UUID> ids) {
        if (ids == null || ids.isEmpty()) {
            return List.of();
        }

        ApiResponse<List<UserResponse>> response = restClient.post()
                .uri("/api/users/batch")
                .body(ids)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new UserProvisioningException(
                            "auth-service rejected batch user retrieval with status %s".formatted(res.getStatusCode()));
                })
                .onStatus(HttpStatusCode::is5xxServerError, (req, res) -> {
                    throw new UserProvisioningException(
                            "auth-service failed batch user retrieval with status %s".formatted(res.getStatusCode()));
                })
                .body(new ParameterizedTypeReference<ApiResponse<List<UserResponse>>>() {});

        if (response == null || response.data() == null) {
            throw new UserProvisioningException(
                    "auth-service returned an empty response during batch user retrieval");
        }
        return response.data();
    }
}
