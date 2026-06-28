package com.escala.authservice.repository;

import com.escala.authservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ProjectRepository extends JpaRepository<Project, UUID> {
    long countByActiveTrue();
    long countByActiveTrueAndCompanyId(UUID companyId);
    List<Project> findByActiveTrueAndCompanyId(UUID companyId);
    List<Project> findByCompanyId(UUID companyId);
}
