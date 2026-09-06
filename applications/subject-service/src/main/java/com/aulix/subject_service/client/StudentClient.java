package com.aulix.subject_service.client;

import com.aulix.subject_service.exception.RemoteServiceException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class StudentClient {

    private final RestClient restClient;

    public StudentClient(RestClient studentServiceRestClient) {
        this.restClient = studentServiceRestClient;
    }

    /**
     * Confirms a studentId is a real student record before subject-service persists an
     * enrollment pointing at it, mirroring how teacher-service validates against auth-service.
     */
    public boolean exists(UUID studentId) {
        try {
            return restClient.get()
                    .uri("/api/students/{id}", studentId)
                    .exchange((req, res) -> {
                        if (res.getStatusCode().value() == 404) {
                            return false;
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
                        return true;
                    });
        } catch (ResourceAccessException ex) {
            throw new RemoteServiceException(
                    "student-service is unreachable while validating student id '%s'".formatted(studentId));
        }
    }
}
