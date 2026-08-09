package com.aulix.staff_service.repository;

import com.aulix.staff_service.domain.EmploymentStatus;
import com.aulix.staff_service.domain.Staff;
import com.aulix.staff_service.domain.StaffType;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.Locale;
import java.util.UUID;

public class StaffSpecifications {
    private StaffSpecifications() {}

    public static Specification<Staff> hasEmploymentStatus(EmploymentStatus status) {
        return (root, query, cb)
                -> status == null ? null : cb.equal(root.get("employmentStatus"), status);
    }

    public static Specification<Staff> hasStaffType(StaffType staffType) {
        return (root, query, cb)
                -> staffType == null ? null : cb.equal(root.get("staffType"), staffType);
    }

    public static Specification<Staff> hasDepartment(String department) {
        return (root, query, cb)
                -> (department == null || department.isBlank()) ? null : cb.equal(root.get("department"), department);
    }

    public static Specification<Staff> employeeNumberContains(String search){
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.like(cb.lower(root.get("employeeNumber")), pattern);
        };
    }

    public static Specification<Staff> hasUserIdIn(Collection<UUID> userIds) {
        return (root, query, cb)
                -> (userIds == null || userIds.isEmpty()) ? null : root.get("userId").in(userIds);
    }

    /**
     * Combines an employeeNumber match with a userId match (resolved from an auth-service name
     * search) so free-text search covers both staff-domain and user-domain fields.
     */
    public static Specification<Staff> matchesSearch(String search, Collection<UUID> matchingUserIds) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return Specification.anyOf(employeeNumberContains(search), hasUserIdIn(matchingUserIds))
                    .toPredicate(root, query, cb);
        };
    }

}
