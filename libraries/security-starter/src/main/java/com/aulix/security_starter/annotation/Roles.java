package com.aulix.security_starter.annotation;

/**
 * Canonical role names issued by auth-service, shared so services never hardcode string
 * literals in {@code @PreAuthorize} expressions.
 */
public class Roles {

    public static final String ADMIN = "ADMIN";
    public static final String STAFF = "STAFF";
    public static final String TEACHER = "TEACHER";
    public static final String PARENT = "PARENT";

    public Roles() {

    }
}
