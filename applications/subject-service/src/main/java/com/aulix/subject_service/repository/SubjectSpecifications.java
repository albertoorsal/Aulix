package com.aulix.subject_service.repository;

import com.aulix.subject_service.domain.Subject;
import com.aulix.subject_service.domain.SubjectStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public class SubjectSpecifications {
    private SubjectSpecifications() {}

    public static Specification<Subject> hasStatus(SubjectStatus status) {
        return (root, query, cb)
                -> status == null ? null : cb.equal(root.get("status"), status);
    }

    public static Specification<Subject> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("code")), pattern),
                    cb.like(cb.lower(root.get("name")), pattern)
            );
        };
    }
}
