package com.escala.authservice.repository;

import com.escala.authservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    long countByActiveTrue();
    long countByActiveTrueAndCompanyId(Long companyId);
    List<Project> findByActiveTrueAndCompanyId(Long companyId);
    List<Project> findByCompanyId(Long companyId);
}
