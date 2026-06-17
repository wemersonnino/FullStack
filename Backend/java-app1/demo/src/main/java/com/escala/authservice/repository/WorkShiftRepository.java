package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.entity.WorkMode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, Long> {
    List<WorkShift> findByEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(Long companyId, LocalDate start, LocalDate end);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(Long employeeId, Long companyId, LocalDate start, LocalDate end);
    @Query("""
            select ws
            from WorkShift ws
            where ws.employee.company.id = :companyId
              and ws.shiftDate between :start and :end
              and (:employeeId is null or ws.employee.id = :employeeId)
              and (:sectorId is null or ws.employee.sector.id = :sectorId)
              and (:projectId is null or ws.employee.project.id = :projectId)
            order by ws.shiftDate asc, ws.startTime asc
            """)
    List<WorkShift> findEscalas(
            @Param("companyId") Long companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("employeeId") Long employeeId,
            @Param("sectorId") Long sectorId,
            @Param("projectId") Long projectId
    );

    @Query("""
            select ws
            from WorkShift ws
            where ws.employee.id = :employeeId
              and ws.employee.company.id = :companyId
              and ws.shiftDate between :start and :end
              and ws.status <> com.escala.authservice.entity.ShiftStatus.CANCELLED
              and (:ignoredShiftId is null or ws.id <> :ignoredShiftId)
            order by ws.shiftDate asc, ws.startTime asc
            """)
    List<WorkShift> findRelatedActiveShiftsForLaborRules(
            @Param("employeeId") Long employeeId,
            @Param("companyId") Long companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("ignoredShiftId") Long ignoredShiftId
    );

    @Query("""
            select ws
            from WorkShift ws
            where ws.employee.id in :employeeIds
              and ws.employee.company.id = :companyId
              and ws.shiftDate between :start and :end
              and ws.status <> com.escala.authservice.entity.ShiftStatus.CANCELLED
            order by ws.shiftDate asc, ws.startTime asc
            """)
    List<WorkShift> findRelatedActiveShiftsForLaborRulesInBatch(
            @Param("employeeIds") List<Long> employeeIds,
            @Param("companyId") Long companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    List<WorkShift> findByEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(Long companyId, LocalDate shiftDate);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(Long employeeId, Long companyId, LocalDate shiftDate);
    boolean existsByEmployeeIdAndShiftDate(Long employeeId, LocalDate shiftDate);
    long countByEmployeeCompanyIdAndShiftDateBetween(Long companyId, LocalDate start, LocalDate end);
    long countByEmployeeCompanyIdAndShiftDateAndWorkMode(Long companyId, LocalDate shiftDate, WorkMode workMode);

    @Query("""
            select ws.shiftDate, count(ws)
            from WorkShift ws
            where ws.employee.company.id = :companyId
              and ws.shiftDate between :start and :end
              and ws.workMode = :workMode
              and ws.status <> com.escala.authservice.entity.ShiftStatus.CANCELLED
            group by ws.shiftDate
            """)
    List<Object[]> countByEmployeeCompanyIdAndShiftDateBetweenAndWorkModeGroupByShiftDate(
            @Param("companyId") Long companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("workMode") WorkMode workMode
    );

    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorId(Long companyId, LocalDate shiftDate, WorkMode workMode, Long sectorId);
    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorIdAndIdNot(Long companyId, LocalDate shiftDate, WorkMode workMode, Long sectorId, Long id);
}
