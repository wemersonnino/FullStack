package com.escala.authservice.repository;

import com.escala.authservice.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    long countByActiveTrue();
}
