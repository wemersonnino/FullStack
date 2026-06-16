package com.escala.authservice.repository;

import com.escala.authservice.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;

public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    long countByAbsenceDateBetween(LocalDate start, LocalDate end);
    long countByEmployeeCompanyIdAndAbsenceDateBetween(Long companyId, LocalDate start, LocalDate end);
}
