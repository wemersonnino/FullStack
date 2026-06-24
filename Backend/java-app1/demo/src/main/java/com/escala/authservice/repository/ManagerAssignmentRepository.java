package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagerAssignment;
import com.escala.authservice.entity.ManagerScopeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagerAssignmentRepository extends JpaRepository<ManagerAssignment, Long> {
    List<ManagerAssignment> findByCompanyIdOrderByManagerUsernameAscScopeTypeAscScopeIdAsc(Long companyId);
    List<ManagerAssignment> findByCompanyIdAndManagerIdAndActiveTrue(Long companyId, Long managerId);
    boolean existsByCompanyIdAndManagerIdAndActiveTrue(Long companyId, Long managerId);
    boolean existsByCompanyIdAndManagerIdAndScopeTypeAndScopeIdAndActiveTrue(Long companyId, Long managerId, ManagerScopeType scopeType, Long scopeId);
}
