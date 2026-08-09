package com.aulix.staff_service.service;

import com.aulix.staff_service.dto.CreateStaffRequest;
import com.aulix.staff_service.dto.StaffResponse;
import com.aulix.staff_service.dto.StaffSearchCriteria;
import com.aulix.staff_service.dto.UpdateStaffRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface StaffService {

    StaffResponse create(CreateStaffRequest request);

    Page<StaffResponse> search(StaffSearchCriteria criteria, Pageable pageable);

    StaffResponse findById(UUID id);

    StaffResponse update(UUID id, UpdateStaffRequest request);

    void delete(UUID id);
}
