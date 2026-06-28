package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleHoliday;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public interface ScheduleHolidayRepository extends JpaRepository<ScheduleHoliday, UUID> {
    @Query("""
            select holiday
            from ScheduleHoliday holiday
            where holiday.company.id = :companyId
              and holiday.holidayDate between :startDate and :endDate
              and (:unitId is null or holiday.unitId is null or holiday.unitId = :unitId)
            order by holiday.holidayDate asc, holiday.name asc
            """)
    List<ScheduleHoliday> findApplicable(
            @Param("companyId") UUID companyId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("unitId") UUID unitId
    );
}
