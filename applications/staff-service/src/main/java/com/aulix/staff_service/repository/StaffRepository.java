package com.aulix.staff_service.repository;


import com.aulix.staff_service.domain.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID>,
        JpaSpecificationExecutor<Staff> {

    Optional<Staff> findByUserId(UUID userId);


    boolean existsByCurpIgnoreCase(String curp);
}
