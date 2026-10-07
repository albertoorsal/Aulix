package com.aulix.student_service.client;

import com.aulix.student_service.exception.RemoteServiceException;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;

import java.util.UUID;

/**
 * Asks parent-service whether a student is linked to the signed-in parent. parent-service owns
 * the parent-student links (ADR 0001 §3), so a PARENT may read a student here only when it
 * says yes. Referenced from {@code @PreAuthorize} as {@code @parentClient}.
 */
@Component
public class ParentClient {

    private final RestClient restClient;

    public ParentClient(RestClient parentServiceRestClient) {
        this.restClient = parentServiceRestClient;
    }

    /**
     * True when parent-service confirms the link. Answers with false (deny) for any 4xx, and
     * fails closed with a 502 when parent-service errors or is unreachable.
     */
    public boolean isLinkedToCurrentParent(UUID studentId) {
        try {
            return restClient.get()
                    .uri("/api/parents/me/students/{studentId}", studentId)
                    .exchange((req, res) -> {
                        if (res.getStatusCode().is2xxSuccessful()) {
                            return true;
                        }
                        if (res.getStatusCode().is4xxClientError()) {
                            return false;
                        }
                        throw new RemoteServiceException(
                                "parent-service failed link check for student '%s' with status %s"
                                        .formatted(studentId, res.getStatusCode()));
                    });
        } catch (ResourceAccessException ex) {
            throw new RemoteServiceException(
                    "parent-service is unreachable while checking access to student '%s'".formatted(studentId));
        }
    }
}
