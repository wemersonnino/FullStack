package com.escala.authservice.repository;

import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ScheduleCycleRepository extends JpaRepository<ScheduleCycle, Long> {
    @Query("""
            select cycle
            from ScheduleCycle cycle
            where cycle.company.id = :companyId
              and cycle.id = :id
            """)
    Optional<ScheduleCycle> findByCompanyIdAndId(@Param("companyId") Long companyId, @Param("id") Long id);

    @Query("""
            select cycle
            from ScheduleCycle cycle
            where cycle.company.id = :companyId
              and ((:unitId is null and cycle.unitId is null) or cycle.unitId = :unitId)
              and cycle.year = :year
              and cycle.month = :month
              and cycle.status <> :archivedStatus
            """)
    Optional<ScheduleCycle> findActiveForPeriod(
            @Param("companyId") Long companyId,
            @Param("unitId") Long unitId,
            @Param("year") int year,
            @Param("month") int month,
            @Param("archivedStatus") ScheduleCycleStatus archivedStatus
    );
}
