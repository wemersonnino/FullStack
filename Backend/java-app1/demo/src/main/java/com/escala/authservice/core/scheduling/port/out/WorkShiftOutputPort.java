package com.escala.authservice.core.scheduling.port.out;

import com.escala.authservice.core.scheduling.domain.WorkShiftDomain;
import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

public interface WorkShiftOutputPort {
    void saveAll(List<WorkShiftDomain> shifts);
    List<WorkShiftDomain> findByCompanyAndPeriod(UUID companyId, LocalDate start, LocalDate end);
    boolean existsByEmployeeAndDate(UUID employeeId, LocalDate date);
}
