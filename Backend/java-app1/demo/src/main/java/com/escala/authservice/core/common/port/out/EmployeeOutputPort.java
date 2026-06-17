package com.escala.authservice.core.common.port.out;

import com.escala.authservice.entity.Employee;
import java.util.List;

public interface EmployeeOutputPort {
    List<Employee> findActiveByCompany(Long companyId);
    List<Employee> findByIdsAndActive(List<Long> ids, Long companyId);
}
