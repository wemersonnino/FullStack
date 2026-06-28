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

    public org.springframework.data.domain.Page<Employee> list(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        Company company = getRequesterCompany(requesterEmail);
        return employeeRepository.findByCompanyId(company.getId(), pageable);
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
                .sector(resolveSector(company, request.getSectorId()))
                .project(resolveProject(company, request.getProjectId()))
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
        employee.setSector(resolveSector(company, request.getSectorId()));
        employee.setProject(resolveProject(company, request.getProjectId()));
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

    private Sector resolveSector(Company company, UUID id) {
        if (id == null) return null;
        Sector sector = sectorRepository.findById(id).orElseThrow();
        if (sector.getCompany() == null || !sector.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Setor nao pertence a empresa do requisitante");
        }
        return sector;
    }

    private Project resolveProject(Company company, UUID id) {
        if (id == null) return null;
        Project project = projectRepository.findById(id).orElseThrow();
        if (project.getCompany() == null || !project.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Projeto nao pertence a empresa do requisitante");
        }
        return project;
    }
}
