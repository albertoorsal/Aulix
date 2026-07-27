package com.aulix.auth_service.domain;

import com.aulix.common_core.domain.BaseEntity;
import jakarta.persistence.*;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Entity
@Table(name = "users", uniqueConstraints = @UniqueConstraint(columnNames = "email"))
public class User extends BaseEntity {

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    @Column(name = "account_locked", nullable = false)
    private boolean accountLocked = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    protected User() {
    }

    public User(String email, String passwordHash, String firstName, String lastName) {
        this.email = email;
        this.passwordHash = passwordHash;
        this.firstName = firstName;
        this.lastName = lastName;
    }


    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void changePassword(String newPasswordHash) {
        this.passwordHash = newPasswordHash;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public boolean isAccountLocked() {
        return accountLocked;
    }

    public void setAccountLocked(boolean accountLocked) {
        this.accountLocked = accountLocked;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void assignRole(Role role) {
        this.roles.add(role);
    }

    public void revokeRole(Role role) {
        this.roles.remove(role);
    }

    public Set<String> roleNames() {
        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }

    public Set<String> permissionNames() {
        return roles.stream()
                .flatMap(r -> r.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());
    }
}
