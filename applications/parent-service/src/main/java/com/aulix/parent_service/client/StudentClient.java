package com.aulix.parent_service.client;

import com.aulix.common_core.response.ApiResponse;
import com.aulix.parent_service.dto.StudentSummary;
import com.aulix.parent_service.exception.RemoteServiceException;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.Optional;
import java.util.UUID;

@Component
public class StudentClient {

    private final RestClient restClient;

    public StudentClient(RestClient studentServiceRestClient) {
        this.restClient = studentServiceRestClient;
    }

    /**
     * Loads a student record, empty when student-service answers 404. Used both to validate a
     * studentId before linking it (as subject-service does for enrollments) and to show the
     * child's details next to each link.
     */
    public Optional<StudentSummary> findById(UUID studentId) {
        try {
            return restClient.get()
                    .uri("/api/students/{id}", studentId)
                    .exchange((req, res) -> {
                        if (res.getStatusCode().value() == 404) {
                            return Optional.empty();
                        }
                        if (res.getStatusCode().is4xxClientError()) {
                            throw new RemoteServiceException(
                                    "student-service rejected lookup for id '%s' with status %s"
                                            .formatted(studentId, res.getStatusCode()));
                        }
                        if (res.getStatusCode().is5xxServerError()) {
                            throw new RemoteServiceException(
                                    "student-service failed lookup for id '%s' with status %s"
                                            .formatted(studentId, res.getStatusCode()));
                        }
                        ApiResponse<StudentSummary> body =
                                res.bodyTo(new ParameterizedTypeReference<ApiResponse<StudentSummary>>() {});
                        return Optional.ofNullable(body == null ? null : body.data());
                    });
        } catch (ResourceAccessException ex) {
            throw new RemoteServiceException(
                    "student-service is unreachable while loading student id '%s'".formatted(studentId));
        }
    }
}
