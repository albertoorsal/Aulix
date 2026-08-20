package com.aulix.teacher_service.repository;

import com.aulix.teacher_service.domain.EmploymentStatus;
import com.aulix.teacher_service.domain.Teacher;
import com.aulix.teacher_service.domain.TeacherType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.Locale;
import java.util.UUID;

public class TeacherSpecifications {
    private TeacherSpecifications() {}

    public static Specification<Teacher> hasEmploymentStatus(EmploymentStatus status) {
        return (root, query, cb)
                -> status == null ? null : cb.equal(root.get("employmentStatus"), status);
    }

    public static Specification<Teacher> hasTeacherType(TeacherType teacherType) {
        return (root, query, cb)
                -> teacherType == null ? null : cb.equal(root.get("teacherType"), teacherType);
    }

    public static Specification<Teacher> hasDepartment(String department) {
        return (root, query, cb)
                -> (department == null || department.isBlank()) ? null : cb.equal(root.get("department"), department);
    }

    public static Specification<Teacher> employeeNumberContains(String search){
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.like(cb.lower(root.get("employeeNumber")), pattern);
        };
    }

    public static Specification<Teacher> hasUserIdIn(Collection<UUID> userIds) {
        return (root, query, cb)
                -> (userIds == null || userIds.isEmpty()) ? null : root.get("userId").in(userIds);
    }

    /**
     * Combines an employeeNumber match with a userId match (resolved from an auth-service name
     * search) so free-text search covers both teacher-domain and user-domain fields.
     */
    public static Specification<Teacher> matchesSearch(String search, Collection<UUID> matchingUserIds) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return Specification.anyOf(employeeNumberContains(search), hasUserIdIn(matchingUserIds))
                    .toPredicate(root, query, cb);
        };
    }

}
