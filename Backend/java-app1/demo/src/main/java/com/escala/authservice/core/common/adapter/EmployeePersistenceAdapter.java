package com.escala.authservice.core.common.adapter;

import com.escala.authservice.core.common.port.out.EmployeeOutputPort;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class EmployeePersistenceAdapter implements EmployeeOutputPort {
    private final EmployeeRepository repository;

    @Override
    public List<Employee> findActiveByCompany(UUID companyId) {
        return repository.findByActiveTrueAndCompanyIdOrderByFullNameAsc(companyId);
    }

    @Override
    public List<Employee> findByIdsAndActive(List<UUID> ids, UUID companyId) {
        return repository.findByIdInAndActiveTrueAndCompanyId(ids, companyId);
    }
}
