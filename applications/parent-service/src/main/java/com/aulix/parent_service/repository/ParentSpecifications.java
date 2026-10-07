package com.aulix.parent_service.repository;

import com.aulix.parent_service.domain.Parent;
import org.springframework.data.jpa.domain.Specification;

import java.util.Collection;
import java.util.Locale;
import java.util.UUID;

public class ParentSpecifications {
    private ParentSpecifications() {}

    public static Specification<Parent> phoneContains(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.like(cb.lower(root.get("phone")), pattern);
        };
    }

    public static Specification<Parent> hasUserIdIn(Collection<UUID> userIds) {
        return (root, query, cb)
                -> (userIds == null || userIds.isEmpty()) ? null : root.get("userId").in(userIds);
    }

    /**
     * Combines a phone match with a userId match (resolved from an auth-service name/email
     * search) so free-text search covers both parent-domain and user-domain fields.
     */
    public static Specification<Parent> matchesSearch(String search, Collection<UUID> matchingUserIds) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            return Specification.anyOf(phoneContains(search), hasUserIdIn(matchingUserIds))
                    .toPredicate(root, query, cb);
        };
    }
}
