package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagementEdge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ManagementEdgeRepository extends JpaRepository<ManagementEdge, UUID> {
    List<ManagementEdge> findByCompanyIdOrderByParentUsernameAscChildUsernameAsc(UUID companyId);
    List<ManagementEdge> findByCompanyIdAndActiveTrue(UUID companyId);
}
