package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagerAssignment;
import com.escala.authservice.entity.ManagerScopeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ManagerAssignmentRepository extends JpaRepository<ManagerAssignment, UUID> {
    List<ManagerAssignment> findByCompanyIdOrderByManagerUsernameAscScopeTypeAscScopeIdAsc(UUID companyId);
    List<ManagerAssignment> findByCompanyIdAndManagerIdAndActiveTrue(UUID companyId, UUID managerId);
    boolean existsByCompanyIdAndManagerIdAndActiveTrue(UUID companyId, UUID managerId);
    boolean existsByCompanyIdAndManagerIdAndScopeTypeAndScopeIdAndActiveTrue(UUID companyId, UUID managerId, ManagerScopeType scopeType, UUID scopeId);
}
