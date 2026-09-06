package com.aulix.subject_service.client;

import com.aulix.subject_service.exception.RemoteServiceException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class TeacherClient {

    private final RestClient restClient;

    public TeacherClient(RestClient teacherServiceRestClient) {
        this.restClient = teacherServiceRestClient;
    }

    /**
     * Confirms a teacherId is a real teacher record before subject-service persists an
     * assignment pointing at it, mirroring how teacher-service validates against auth-service.
     */
    public boolean exists(UUID teacherId) {
        try {
            return restClient.get()
                    .uri("/api/teachers/{id}", teacherId)
                    .exchange((req, res) -> {
                        if (res.getStatusCode().value() == 404) {
                            return false;
                        }
                        if (res.getStatusCode().is4xxClientError()) {
                            throw new RemoteServiceException(
                                    "teacher-service rejected lookup for id '%s' with status %s"
                                            .formatted(teacherId, res.getStatusCode()));
                        }
                        if (res.getStatusCode().is5xxServerError()) {
                            throw new RemoteServiceException(
                                    "teacher-service failed lookup for id '%s' with status %s"
                                            .formatted(teacherId, res.getStatusCode()));
                        }
                        return true;
                    });
        } catch (ResourceAccessException ex) {
            throw new RemoteServiceException(
                    "teacher-service is unreachable while validating teacher id '%s'".formatted(teacherId));
        }
    }
}
