package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WorkPostRepository extends JpaRepository<WorkPost, Long> {
    List<WorkPost> findByCompany(Company company);
}
