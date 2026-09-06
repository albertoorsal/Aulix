package com.aulix.subject_service.dto;

import com.aulix.subject_service.domain.SubjectStatus;

public record SubjectSearchCriteria(
        String search,
        SubjectStatus status
) {
}
