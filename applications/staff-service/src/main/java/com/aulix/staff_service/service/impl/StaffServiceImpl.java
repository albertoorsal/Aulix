package com.aulix.staff_service.service.impl;

import com.aulix.security_starter.annotation.Roles;
import com.aulix.staff_service.client.CreateUserRequest;
import com.aulix.staff_service.client.UserClient;
import com.aulix.staff_service.client.UserResponse;
import com.aulix.staff_service.domain.Staff;
import com.aulix.staff_service.dto.CreateStaffRequest;
import com.aulix.staff_service.dto.StaffResponse;
import com.aulix.staff_service.dto.StaffSearchCriteria;
import com.aulix.staff_service.dto.UpdateStaffRequest;
import com.aulix.staff_service.exception.DuplicateStaffException;
import com.aulix.staff_service.mapper.StaffMapper;
import com.aulix.staff_service.repository.StaffRepository;
import com.aulix.staff_service.repository.StaffSpecifications;
import com.aulix.staff_service.service.StaffService;
import com.aulix.common_core.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class StaffServiceImpl implements StaffService {

    private static final int USER_SEARCH_MAX_RESULTS = 500;

    private final StaffRepository staffRepository;
    private final StaffMapper staffMapper;
    private final UserClient userClient;

    public StaffServiceImpl(
            StaffRepository staffRepository,
            StaffMapper staffMapper,
            UserClient userClient
    ) {
        this.staffRepository = staffRepository;
        this.staffMapper = staffMapper;
        this.userClient = userClient;
    }

    @Override
    @Transactional
    public StaffResponse create(CreateStaffRequest request) {
        if (staffRepository.existsByCurpIgnoreCase(request.curp())) {
            throw new DuplicateStaffException("CURP: ", request.curp());
        }


        // First we need to create a user and retrieve user_id
        UserResponse user = userClient.createUser(new CreateUserRequest(
                request.email(),
                request.password(),
                request.firstName(),
                request.lastName(),
                Set.of(Roles.STAFF)
        ));

        Staff staff = new Staff(
                user.id(),
                request.employeeNumber(),
                request.dateOfBirth(),
                request.staffType(),
                request.hireDate(),
                request.department(),
                request.jobTitle(),
                request.salary(),
                request.curp()
        );

        Staff saved = staffRepository.save(staff);

        return staffMapper.toResponse(saved);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public Page<StaffResponse> search(StaffSearchCriteria criteria, Pageable pageable) {
        String search = criteria.search();
        List<UUID> matchingUserIds = (search == null || search.isBlank())
                ? List.of()
                : userClient.searchUsers(search, USER_SEARCH_MAX_RESULTS).stream().map(UserResponse::id).toList();

        Specification<Staff> spec = Specification.allOf(
                StaffSpecifications.matchesSearch(search, matchingUserIds),
                StaffSpecifications.hasEmploymentStatus(criteria.status()),
                StaffSpecifications.hasStaffType(criteria.staffType()),
                StaffSpecifications.hasDepartment(criteria.department()));

        Page<Staff> staff = staffRepository.findAll(spec, pageable);

        Map<UUID, UserResponse> usersById = userIndex(staff);

        return staff.map(staffMapper::toResponse).map(response -> enrichWithUser(response, usersById));
    }

    private Map<UUID, UserResponse> userIndex(Page<Staff> staff) {
        List<UUID> userIds = staff.getContent().stream().map(Staff::getUserId).toList();
        return userClient.findAllByIds(userIds).stream()
                .collect(Collectors.toMap(UserResponse::id, Function.identity()));
    }

    private StaffResponse enrichWithUser(StaffResponse response, Map<UUID, UserResponse> usersById) {
        UserResponse user = usersById.get(response.userId());
        if (user == null) {
            return response;
        }
        return response.withUser(user.firstName(), user.lastName(), user.email());
    }


    @Override
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public StaffResponse findById(UUID id) {
        Staff staff = getStaffOrThrow(id);
        UserResponse user = userClient.findAllByIds(List.of(staff.getUserId())).stream()
                .findFirst()
                .orElse(null);
        StaffResponse response = staffMapper.toResponse(staff);
        return user == null ? response : response.withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @Transactional
    public StaffResponse update(UUID id, UpdateStaffRequest request) {
        Staff staff = getStaffOrThrow(id);

        UserResponse user = userClient.updateUserByUserId(staff.getUserId(), request);

        staff.setDateOfBirth(request.dateOfBirth());
        staff.setStaffType(request.staffType());
        staff.setDepartment(request.department());
        staff.setJobTitle(request.jobTitle());
        staff.setSalary(request.salary());
        Staff saved = staffRepository.save(staff);

        return staffMapper.toResponse(saved).withUser(user.firstName(), user.lastName(), user.email());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        Staff staff = getStaffOrThrow(id);
        staffRepository.delete(staff);
        userClient.deleteUserByUserId(staff.getUserId());
    }

    private Staff getStaffOrThrow(UUID id) {
        return staffRepository.findById(id).orElseThrow(() -> ResourceNotFoundException.of("Staff", id));
    }
}
