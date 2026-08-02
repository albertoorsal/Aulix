package com.aulix.auth_service.repository;

import com.aulix.auth_service.domain.User;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public class UserSpecifications {
    private UserSpecifications() {}

    public static Specification<User> nameContains(String search){
        return (root, query, cb) -> {
            if (search == null || search.isBlank()) {
                return null;
            }
            String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("firstName")), pattern),
                    cb.like(cb.lower(root.get("lastName")), pattern)
            );
        };
    }
}
