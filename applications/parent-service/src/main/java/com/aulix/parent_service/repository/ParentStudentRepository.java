package com.aulix.parent_service.repository;

import com.aulix.parent_service.domain.ParentStudent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ParentStudentRepository extends JpaRepository<ParentStudent, UUID> {

    boolean existsByParentIdAndStudentId(UUID parentId, UUID studentId);

    Optional<ParentStudent> findByParentIdAndStudentId(UUID parentId, UUID studentId);

    List<ParentStudent> findByParentId(UUID parentId);

    List<ParentStudent> findByStudentIdAndPrimaryContactTrue(UUID studentId);

    long countByParentId(UUID parentId);

    void deleteByParentId(UUID parentId);

    /** Child counts for a page of parents in one query, as {@code [parentId, count]} rows. */
    @Query("select ps.parentId, count(ps) from ParentStudent ps where ps.parentId in :parentIds group by ps.parentId")
    List<Object[]> countByParentIds(Collection<UUID> parentIds);
}
