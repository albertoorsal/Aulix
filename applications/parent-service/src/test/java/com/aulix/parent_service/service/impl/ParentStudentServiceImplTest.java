package com.aulix.parent_service.service.impl;

import com.aulix.common_core.exception.ResourceNotFoundException;
import com.aulix.parent_service.client.StudentClient;
import com.aulix.parent_service.domain.Parent;
import com.aulix.parent_service.domain.ParentStudent;
import com.aulix.parent_service.domain.Relationship;
import com.aulix.parent_service.dto.LinkStudentRequest;
import com.aulix.parent_service.dto.ParentStudentResponse;
import com.aulix.parent_service.dto.StudentSummary;
import com.aulix.parent_service.exception.DuplicateLinkException;
import com.aulix.parent_service.exception.RemoteServiceException;
import com.aulix.parent_service.mapper.ParentMapper;
import com.aulix.parent_service.repository.ParentRepository;
import com.aulix.parent_service.repository.ParentStudentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ParentStudentServiceImplTest {

    private static final UUID PARENT_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();
    private static final UUID STUDENT_ID = UUID.randomUUID();

    @Mock
    private ParentRepository parentRepository;
    @Mock
    private ParentStudentRepository parentStudentRepository;
    @Mock
    private StudentClient studentClient;
    @Mock
    private ParentMapper parentMapper;

    private ParentStudentServiceImpl service;

    @BeforeEach
    void setUp() {
        service = new ParentStudentServiceImpl(parentRepository, parentStudentRepository, studentClient, parentMapper);
        lenient().when(parentMapper.toResponse(any(ParentStudent.class))).thenAnswer(inv -> {
            ParentStudent link = inv.getArgument(0);
            return new ParentStudentResponse(link.getId(), link.getParentId(), link.getStudentId(),
                    link.getRelationship(), link.isPrimaryContact(), null);
        });
    }

    @Test
    void linkRejectsUnknownParent() {
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.link(PARENT_ID, STUDENT_ID, new LinkStudentRequest(Relationship.MOTHER, false)))
                .isInstanceOf(ResourceNotFoundException.class);
        verifyNoInteractions(studentClient);
    }

    @Test
    void linkRejectsUnknownStudent() {
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent()));
        when(studentClient.findById(STUDENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.link(PARENT_ID, STUDENT_ID, new LinkStudentRequest(Relationship.MOTHER, false)))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Student");
        verify(parentStudentRepository, never()).save(any());
    }

    @Test
    void linkRejectsDuplicate() {
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent()));
        when(studentClient.findById(STUDENT_ID)).thenReturn(Optional.of(student()));
        when(parentStudentRepository.existsByParentIdAndStudentId(PARENT_ID, STUDENT_ID)).thenReturn(true);

        assertThatThrownBy(() -> service.link(PARENT_ID, STUDENT_ID, new LinkStudentRequest(Relationship.MOTHER, false)))
                .isInstanceOf(DuplicateLinkException.class);
    }

    @Test
    void linkAsPrimaryContactDemotesTheCurrentPrimaryContact() {
        ParentStudent otherPrimary = new ParentStudent(UUID.randomUUID(), STUDENT_ID, Relationship.FATHER, true);
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent()));
        when(studentClient.findById(STUDENT_ID)).thenReturn(Optional.of(student()));
        when(parentStudentRepository.findByStudentIdAndPrimaryContactTrue(STUDENT_ID)).thenReturn(List.of(otherPrimary));
        when(parentStudentRepository.save(any(ParentStudent.class))).thenAnswer(inv -> inv.getArgument(0));

        ParentStudentResponse response =
                service.link(PARENT_ID, STUDENT_ID, new LinkStudentRequest(Relationship.MOTHER, true));

        assertThat(otherPrimary.isPrimaryContact()).isFalse();
        verify(parentStudentRepository).saveAll(List.of(otherPrimary));
        assertThat(response.primaryContact()).isTrue();
        assertThat(response.relationship()).isEqualTo(Relationship.MOTHER);
        assertThat(response.student()).isEqualTo(student());
    }

    @Test
    void linkWithoutPrimaryContactLeavesOthersAlone() {
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent()));
        when(studentClient.findById(STUDENT_ID)).thenReturn(Optional.of(student()));
        when(parentStudentRepository.save(any(ParentStudent.class))).thenAnswer(inv -> inv.getArgument(0));

        service.link(PARENT_ID, STUDENT_ID, new LinkStudentRequest(Relationship.GUARDIAN, false));

        verify(parentStudentRepository, never()).findByStudentIdAndPrimaryContactTrue(any());
    }

    @Test
    void unlinkMissingLinkIsNotFound() {
        when(parentStudentRepository.findByParentIdAndStudentId(PARENT_ID, STUDENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.unlink(PARENT_ID, STUDENT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findLinkForUserReturnsOwnChildWithoutCallingStudentService() {
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.of(parent()));
        when(parentStudentRepository.findByParentIdAndStudentId(PARENT_ID, STUDENT_ID))
                .thenReturn(Optional.of(new ParentStudent(PARENT_ID, STUDENT_ID, Relationship.MOTHER, true)));

        ParentStudentResponse response = service.findLinkForUser(USER_ID, STUDENT_ID);

        assertThat(response.studentId()).isEqualTo(STUDENT_ID);
        // student-service calls this endpoint itself; looking the student up would loop.
        verifyNoInteractions(studentClient);
    }

    @Test
    void findLinkForUserRejectsAnotherParentsChild() {
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.of(parent()));
        when(parentStudentRepository.findByParentIdAndStudentId(PARENT_ID, STUDENT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findLinkForUser(USER_ID, STUDENT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void findLinkForUserWithoutParentProfileIsNotFound() {
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.findLinkForUser(USER_ID, STUDENT_ID))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void listForUserWithoutParentProfileIsEmpty() {
        when(parentRepository.findByUserId(USER_ID)).thenReturn(Optional.empty());

        assertThat(service.listForUser(USER_ID)).isEmpty();
    }

    @Test
    void listForParentKeepsChildrenThatCannotBeLoaded() {
        UUID missingId = UUID.randomUUID();
        UUID downId = UUID.randomUUID();
        when(parentRepository.findById(PARENT_ID)).thenReturn(Optional.of(parent()));
        when(parentStudentRepository.findByParentId(PARENT_ID)).thenReturn(List.of(
                new ParentStudent(PARENT_ID, missingId, Relationship.MOTHER, false),
                new ParentStudent(PARENT_ID, STUDENT_ID, Relationship.MOTHER, true),
                new ParentStudent(PARENT_ID, downId, Relationship.MOTHER, false)));
        when(studentClient.findById(missingId)).thenReturn(Optional.empty());
        when(studentClient.findById(STUDENT_ID)).thenReturn(Optional.of(student()));
        when(studentClient.findById(downId)).thenThrow(new RemoteServiceException("down"));

        List<ParentStudentResponse> links = service.listForParent(PARENT_ID);

        assertThat(links).hasSize(3);
        // Resolved children first, unresolved ones after.
        assertThat(links.getFirst().student()).isEqualTo(student());
        assertThat(links.subList(1, 3)).allSatisfy(link -> assertThat(link.student()).isNull());
    }

    private static Parent parent() {
        Parent parent = new Parent(USER_ID, "555-0100");
        parent.setId(PARENT_ID);
        return parent;
    }

    private static StudentSummary student() {
        return new StudentSummary(STUDENT_ID, "S-001", LocalDate.of(2015, 3, 1), "ENROLLED", 4,
                "Ana", "Lopez", "ana@example.com");
    }
}
