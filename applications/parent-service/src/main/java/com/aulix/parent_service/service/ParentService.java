package com.aulix.parent_service.service;

import com.aulix.parent_service.dto.CreateParentRequest;
import com.aulix.parent_service.dto.CurrentUser;
import com.aulix.parent_service.dto.ParentResponse;
import com.aulix.parent_service.dto.ParentSearchCriteria;
import com.aulix.parent_service.dto.UpdateParentRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ParentService {

    ParentResponse create(CreateParentRequest request);

    Page<ParentResponse> search(ParentSearchCriteria criteria, Pageable pageable);

    ParentResponse findById(UUID id);

    ParentResponse findMine(CurrentUser currentUser);

    ParentResponse update(UUID id, UpdateParentRequest request);

    void delete(UUID id);
}
