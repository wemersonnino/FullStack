package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagementClosure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ManagementClosureRepository extends JpaRepository<ManagementClosure, UUID> {
    boolean existsByCompanyIdAndAncestorIdAndDescendantId(UUID companyId, UUID ancestorId, UUID descendantId);
    List<ManagementClosure> findByCompanyIdOrderByAncestorUsernameAscDepthAscDescendantUsernameAsc(UUID companyId);
    void deleteByCompanyId(UUID companyId);
}
