package com.aulix.student_service.repository;

import com.aulix.student_service.domain.EnrollmentStatus;
import com.aulix.student_service.domain.Student;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.Locale;
import java.util.UUID;

public class StudentSpecifications {
    private StudentSpecifications() {}

    public static Specification<Student> hasEnrollmentStatus(EnrollmentStatus status) {
        return (root, query, cb)
                -> status == null ? null : cb.equal(root.get("enrollmentStatus"), status);
    }

    public static Specification<Student> hasGradeLevel(Integer gradeLevel) {
        return (root, query, cb)
                -> gradeLevel == null ? null : cb.equal(root.get("gradeLevel"), gradeLevel);
    }

    public static Specification<Student> studentNumberContains(String search){
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.like(cb.lower(root.get("studentNumber")), pattern);
        };
    }

    public static Specification<Student> hasUserIdIn(Collection<UUID> userIds) {
        return (root, query, cb)
                -> (userIds == null || userIds.isEmpty()) ? null : root.get("userId").in(userIds);
    }

    /**
     * Combines a studentNumber match with a userId match (resolved from an auth-service name
     * search) so free-text search covers both student-domain and user-domain fields.
     */
    public static Specification<Student> matchesSearch(String search, Collection<UUID> matchingUserIds) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return Specification.anyOf(studentNumberContains(search), hasUserIdIn(matchingUserIds))
                    .toPredicate(root, query, cb);
        };
    }

}
