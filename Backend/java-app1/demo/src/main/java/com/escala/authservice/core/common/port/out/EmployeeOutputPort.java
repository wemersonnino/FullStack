package com.escala.authservice.core.common.port.out;

import com.escala.authservice.entity.Employee;
import java.util.List;
import java.util.UUID;

public interface EmployeeOutputPort {
    List<Employee> findActiveByCompany(UUID companyId);
    List<Employee> findByIdsAndActive(List<UUID> ids, UUID companyId);
}
