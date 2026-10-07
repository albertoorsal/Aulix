package com.aulix.parent_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.parent_service.client.CreateUserRequest;
import com.aulix.parent_service.client.UserClient;
import com.aulix.parent_service.client.UserResponse;
import com.aulix.parent_service.domain.Parent;
import com.aulix.parent_service.dto.CreateParentRequest;
import com.aulix.parent_service.dto.CurrentUser;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.mapper.ParentMapper;
import com.aulix.parent_service.repository.ParentRepository;
import com.aulix.parent_service.repository.ParentStudentRepository;
import com.aulix.security_starter.annotation.Roles;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParentServiceImplTest {

    private static final UUID PARENT_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Mock
    private ParentRepository parentRepository;
    @Mock
    private ParentStudentRepository parentStudentRepository;
    @Mock
    private ParentMapper parentMapper;
    @Mock
    private UserClient userClient;

    private ParentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ParentServiceImpl(parentRepository, parentStudentRepository, parentMapper, userClient);
        lenient().when(parentMapper.toResponse(any(Parent.class))).thenAnswer(inv -> {
            Parent parent = inv.getArgument(0);
            return new ParentResponse(parent.getId(), parent.getUserId(), parent.getPhone(), 0, null, null, null);
        });
    }

    @Test
    void createProvisionsAParentAccount() {
        when(userClient.createUser(any())).thenReturn(
                new UserResponse(USER_ID, "maria@example.com", "Maria", "Lopez", true, Set.of(Roles.PARENT)));
        when(parentRepository.save(any(Parent.class))).thenAnswer(inv -> inv.getArgument(0));

        ParentResponse response = service.create(
                new CreateParentRequest("Maria", "Lopez", "maria@example.com", "  ", "secret123"));

        ArgumentCaptor<CreateUserRequest> request = ArgumentCaptor.forClass(CreateUserRequest.class);
        verify(userClient).createUser(request.capture());
        assertThat(request.getValue().roles()).containsExactly(Roles.PARENT);
        assertThat(response.userId()).isEqualTo(USER_ID);
        assertThat(response.email()).isEqualTo("maria@example.com");
        // A blank phone is stored as null.
        assertThat(response.phone()).isNull();
    }

    @Test
    void findMineUsesTheTokenIdentity() {
        Parent parent = parent();
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.of(parent));
        when(parentStudentRepository.countByParentId(PARENT_ID)).thenReturn(2L);

        ParentResponse response = service.findMine(new CurrentUser(USER_ID, "Maria", "Lopez", "maria@example.com"));

        assertThat(response.id()).isEqualTo(PARENT_ID);
        assertThat(response.childCount()).isEqualTo(2);
        assertThat(response.firstName()).isEqualTo("Maria");
        verifyNoInteractions(userClient);
    }

    @Test
    void findMineWithoutProfileIsNotFound() {
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findMine(new CurrentUser(USER_ID, "Maria", "Lopez", "maria@example.com")))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deleteRemovesLinksParentAndAccount() {
        Parent parent = parent();
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent));

        service.delete(PARENT_ID);

        InOrder order = inOrder(parentStudentRepository, parentRepository, userClient);
        order.verify(parentStudentRepository).deleteByParentId(PARENT_ID);
        order.verify(parentRepository).delete(parent);
        order.verify(userClient).deleteUserByUserId(USER_ID);
    }

    @Test
    void deleteUnknownParentIsNotFound() {
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.delete(PARENT_ID)).isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(userClient);
    }

    private static Parent parent() {
        Parent parent = new Parent(USER_ID, "555-0100");
        parent.setId(PARENT_ID);
        return parent;
    }
}
