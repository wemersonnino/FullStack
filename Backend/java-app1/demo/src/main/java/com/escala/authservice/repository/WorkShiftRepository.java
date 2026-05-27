package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.entity.WorkMode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {
    List<WorkShift> findByShiftDateBetweenOrderByShiftDateAscStartTimeAsc(LocalDate start, LocalDate end);
    boolean existsByEmployeeIdAndShiftDate(Long employeeId, LocalDate shiftDate);
    long countByShiftDateBetween(LocalDate start, LocalDate end);
    long countByShiftDateAndWorkMode(LocalDate shiftDate, WorkMode workMode);
}
