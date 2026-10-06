package com.aulix.auth_service.service.impl;

import com.aulix.auth_service.domain.AuditAction;
import com.aulix.auth_service.domain.Role;
import com.aulix.auth_service.domain.User;
import com.aulix.auth_service.dto.UpdateUserRequest;
import com.aulix.auth_service.mapper.UserMapper;
import com.aulix.auth_service.repository.RoleRepository;
import com.aulix.auth_service.repository.UserRepository;
import com.aulix.auth_service.service.AuditLogService;
import com.aulix.common_core.exception.BusinessRuleViolationException;
import com.aulix.common_core.exception.ResourceAlreadyExistsException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    private static final String ADMIN_EMAIL = "admin@aulix.com";

    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private AuditLogService auditLogService;

    private UserServiceImpl userService;

    @BeforeEach
    void setUp() {
        userService = new UserServiceImpl(userRepository, roleRepository, new UserMapper() {}, auditLogService);
        SecurityContextHolder.getContext().setAuthentication(new TestingAuthenticationToken(ADMIN_EMAIL, null));
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void disableRecordsAuditEntry() {
        User user = givenUser("jane@aulix.com");

        userService.setEnabled(user.getId(), false);

        assertThat(user.isEnabled()).isFalse();
        verify(auditLogService).record(AuditAction.USER_DISABLED, user, null);
    }

    @Test
    void enablingAnEnabledUserIsANoOp() {
        User user = givenUser("jane@aulix.com");

        userService.setEnabled(user.getId(), true);

        verifyNoInteractions(auditLogService);
    }

    @Test
    void cannotDisableOwnAccount() {
        User self = givenUser(ADMIN_EMAIL);

        assertThatThrownBy(() -> userService.setEnabled(self.getId(), false))
                .isInstanceOf(BusinessRuleViolationException.class);
        assertThat(self.isEnabled()).isTrue();
        verifyNoInteractions(auditLogService);
    }

    @Test
    void assignRoleRecordsOnlyWhenRoleIsNew() {
        User user = givenUser("jane@aulix.com");
        givenRole("TEACHER");

        userService.assignRole(user.getId(), "teacher");
        userService.assignRole(user.getId(), "teacher");

        assertThat(user.roleNames()).containsExactly("TEACHER");
        verify(auditLogService).record(AuditAction.ROLE_ASSIGNED, user, "TEACHER");
    }

    @Test
    void revokeRoleRecordsAuditEntry() {
        User user = givenUser("jane@aulix.com");
        Role staff = givenRole("STAFF");
        user.assignRole(staff);

        userService.revokeRole(user.getId(), "STAFF");

        assertThat(user.roleNames()).isEmpty();
        verify(auditLogService).record(AuditAction.ROLE_REVOKED, user, "STAFF");
    }

    @Test
    void cannotRevokeOwnAdminRole() {
        User self = givenUser(ADMIN_EMAIL);
        Role admin = givenRole("ADMIN");
        self.assignRole(admin);

        assertThatThrownBy(() -> userService.revokeRole(self.getId(), "ADMIN"))
                .isInstanceOf(BusinessRuleViolationException.class);
        assertThat(self.roleNames()).containsExactly("ADMIN");
    }

    @Test
    void cannotDeleteOwnAccount() {
        User self = givenUser(ADMIN_EMAIL);

        assertThatThrownBy(() -> userService.delete(self.getId()))
                .isInstanceOf(BusinessRuleViolationException.class);
        verify(userRepository, never()).delete(any(User.class));
    }

    @Test
    void deleteRecordsAuditEntryBeforeRemovingUser() {
        User user = givenUser("jane@aulix.com");

        userService.delete(user.getId());

        verify(auditLogService).record(AuditAction.USER_DELETED, user, null);
        verify(userRepository).delete(user);
    }

    @Test
    void updateRejectsEmailTakenByAnotherUser() {
        User user = givenUser("jane@aulix.com");
        when(userRepository.existsByEmailIgnoreCase("taken@aulix.com")).thenReturn(true);

        assertThatThrownBy(() -> userService.update(user.getId(),
                new UpdateUserRequest("Jane", "Doe", "taken@aulix.com")))
                .isInstanceOf(ResourceAlreadyExistsException.class);
        verify(userRepository, never()).save(any());
    }

    @Test
    void updateRecordsWhichFieldsChanged() {
        User user = givenUser("jane@aulix.com");
        when(userRepository.existsByEmailIgnoreCase("jane.doe@aulix.com")).thenReturn(false);
        when(userRepository.save(user)).thenReturn(user);

        userService.update(user.getId(), new UpdateUserRequest("Jane", "Smith", "jane.doe@aulix.com"));

        assertThat(user.getLastName()).isEqualTo("Smith");
        verify(auditLogService).record(AuditAction.USER_UPDATED, user, "Changed last name, email");
    }

    @Test
    void updateWithoutChangesIsNotAudited() {
        User user = givenUser("jane@aulix.com");
        when(userRepository.save(user)).thenReturn(user);

        userService.update(user.getId(), new UpdateUserRequest("Jane", "Doe", "jane@aulix.com"));

        verifyNoInteractions(auditLogService);
    }

    private User givenUser(String email) {
        User user = new User(email, "hash", "Jane", "Doe");
        user.setId(UUID.randomUUID());
        when(userRepository.findById(user.getId())).thenReturn(Optional.of(user));
        return user;
    }

    private Role givenRole(String name) {
        Role role = new Role(name, null);
        role.setId(UUID.randomUUID());
        when(roleRepository.findByNameIgnoreCase(anyString())).thenReturn(Optional.of(role));
        return role;
    }
}
