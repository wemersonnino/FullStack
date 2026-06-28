package com.escala.authservice.service;

import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final SectorRepository sectorRepository;
    private final ProjectRepository projectRepository;
    private final CompanyService companyService;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;
    private final UserRepository userRepository;

    private Company getRequesterCompany(String requesterEmail) {
        return userRepository.findByEmail(requesterEmail)
                .map(com.escala.authservice.entity.User::getCompany)
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante ou empresa nao encontrados"));
    }

    public List<Employee> list(String requesterEmail) {
        Company company = getRequesterCompany(requesterEmail);
        return employeeRepository.findByCompanyId(company.getId());
    }

    public Employee create(String requesterEmail, EmployeeRequest request) {
        Company company = getRequesterCompany(requesterEmail);
        int currentCount = (int) employeeRepository.countByActiveTrueAndCompanyId(company.getId());
        
        if (!checkPlanLimitUseCase.canAddEmployee(company.getPlanType(), currentCount)) {
            throw new IllegalStateException("Limite de funcionários atingido para o plano atual: " + company.getPlanType() + ". Faça upgrade do seu plano.");
        }

        return employeeRepository.save(Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .active(request.getActive() == null || request.getActive())
                .sector(resolveSector(request.getSectorId()))
                .project(resolveProject(request.getProjectId()))
                .company(company)
                .build());
    }

    public Employee update(String requesterEmail, UUID id, EmployeeRequest request) {
        Company company = getRequesterCompany(requesterEmail);
        Employee employee = employeeRepository.findById(id).orElseThrow();
        
        if (employee.getCompany() == null || !employee.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a alterar funcionario de outra empresa");
        }

        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        if (request.getActive() != null) employee.setActive(request.getActive());
        employee.setSector(resolveSector(request.getSectorId()));
        employee.setProject(resolveProject(request.getProjectId()));
        return employeeRepository.save(employee);
    }

    public void remove(String requesterEmail, UUID id) {
        Company company = getRequesterCompany(requesterEmail);
        Employee employee = employeeRepository.findById(id).orElseThrow();
        
        if (employee.getCompany() == null || !employee.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a remover funcionario de outra empresa");
        }

        employee.setActive(false);
        employeeRepository.save(employee);
    }

    private Sector resolveSector(UUID id) {
        return id == null ? null : sectorRepository.findById(id).orElseThrow();
    }

    private Project resolveProject(UUID id) {
        return id == null ? null : projectRepository.findById(id).orElseThrow();
    }
}
