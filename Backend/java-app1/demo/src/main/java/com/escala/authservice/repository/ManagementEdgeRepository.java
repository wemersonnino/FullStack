package com.escala.authservice.repository;

import com.escala.authservice.entity.ManagementEdge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagementEdgeRepository extends JpaRepository<ManagementEdge, Long> {
    List<ManagementEdge> findByCompanyIdOrderByParentUsernameAscChildUsernameAsc(Long companyId);
    List<ManagementEdge> findByCompanyIdAndActiveTrue(Long companyId);
}
