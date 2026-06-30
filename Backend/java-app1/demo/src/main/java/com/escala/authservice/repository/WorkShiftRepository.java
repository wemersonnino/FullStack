package com.escala.authservice.repository;

import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.entity.WorkMode;
import com.escala.authservice.entity.ShiftStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public interface WorkShiftRepository extends JpaRepository<WorkShift, UUID> {
    List<WorkShift> findByEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(UUID companyId, LocalDate start, LocalDate end);
    List<WorkShift> findByEmployeeCompanyIdAndEmployeeSectorIdInAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(UUID companyId, List<UUID> sectorIds, LocalDate start, LocalDate end);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(UUID employeeId, UUID companyId, LocalDate start, LocalDate end);
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
            @Param("companyId") UUID companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("employeeId") UUID employeeId,
            @Param("sectorId") UUID sectorId,
            @Param("projectId") UUID projectId
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
            @Param("employeeId") UUID employeeId,
            @Param("companyId") UUID companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("ignoredShiftId") UUID ignoredShiftId
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
            @Param("employeeIds") List<UUID> employeeIds,
            @Param("companyId") UUID companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end
    );

    List<WorkShift> findByEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(UUID companyId, LocalDate shiftDate);
    List<WorkShift> findByEmployeeIdAndEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(UUID employeeId, UUID companyId, LocalDate shiftDate);
    boolean existsByEmployeeIdAndShiftDate(UUID employeeId, LocalDate shiftDate);
    boolean existsByEmployeeIdAndShiftDateAndStatusNot(UUID employeeId, LocalDate shiftDate, ShiftStatus status);
    long countByEmployeeCompanyIdAndShiftDateBetween(UUID companyId, LocalDate start, LocalDate end);
    long countByEmployeeCompanyIdAndShiftDateAndWorkMode(UUID companyId, LocalDate shiftDate, WorkMode workMode);

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
            @Param("companyId") UUID companyId,
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("workMode") WorkMode workMode
    );

    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorId(UUID companyId, LocalDate shiftDate, WorkMode workMode, UUID sectorId);
    long countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorIdAndIdNot(UUID companyId, LocalDate shiftDate, WorkMode workMode, UUID sectorId, UUID id);
}
