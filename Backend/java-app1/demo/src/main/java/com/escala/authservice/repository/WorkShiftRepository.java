package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.entity.WorkMode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {
    List<WorkShift> findByEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(Long companyId, LocalDate start, LocalDate end);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(Long employeeId, Long companyId, LocalDate start, LocalDate end);
    List<WorkShift> findByEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(Long companyId, LocalDate shiftDate);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(Long employeeId, Long companyId, LocalDate shiftDate);
    boolean existsByEmployeeIdAndShiftDate(Long employeeId, LocalDate shiftDate);
    long countByEmployeeCompanyIdAndShiftDateBetween(Long companyId, LocalDate start, LocalDate end);
    long countByEmployeeCompanyIdAndShiftDateAndWorkMode(Long companyId, LocalDate shiftDate, WorkMode workMode);
    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorId(Long companyId, LocalDate shiftDate, WorkMode workMode, Long sectorId);
    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorIdAndIdNot(Long companyId, LocalDate shiftDate, WorkMode workMode, Long sectorId, Long id);
}
