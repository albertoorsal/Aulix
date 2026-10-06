package com.aulix.auth_service.repository;

import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public class UserSpecifications {
    private UserSpecifications() {}

    public static Specification<User> matchesSearch(String search) {
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern),
                    cb.like(cb.lower(root.get("email")), pattern)
            );
        };
    }

    public static Specification<User> hasRole(String roleName) {
        return (root, query, cb) -> {
            if (roleName == null || roleName.isBlank()) {
                return null;
            }
            Join<User, Role> roles = root.join("roles");
            return cb.equal(cb.upper(roles.get("name")), roleName.trim().toUpperCase(Locale.ROOT));
        };
    }

    public static Specification<User> isEnabled(Boolean enabled) {
        return (root, query, cb)
                -> enabled == null ? null : cb.equal(root.get("enabled"), enabled);
    }
}
