package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface WorkPostRepository extends JpaRepository<WorkPost, UUID> {
    List<WorkPost> findByCompany(Company company);
}
