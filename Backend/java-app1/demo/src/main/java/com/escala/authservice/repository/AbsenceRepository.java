package com.escala.authservice.repository;

import com.escala.authservice.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.UUID;

public interface AbsenceRepository extends JpaRepository<Absence, UUID> {
    long countByAbsenceDateBetween(LocalDate start, LocalDate end);
    long countByEmployeeCompanyIdAndAbsenceDateBetween(UUID companyId, LocalDate start, LocalDate end);
}
