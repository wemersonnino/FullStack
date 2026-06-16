package com.escala.authservice.service;

import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final SectorRepository sectorRepository;
    private final ProjectRepository projectRepository;
    private final CompanyService companyService;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;

    public List<Employee> list() {
        return employeeRepository.findAll();
    }

    public Employee create(EmployeeRequest request) {
        Company company = companyService.resolve(null);
        
        // Mock current employee count since we might need a specific query for this
        // In a real scenario: int count = employeeRepository.countByCompany(company);
        int currentCount = (int) employeeRepository.count(); 
        
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

    public Employee update(Long id, EmployeeRequest request) {
        Employee employee = employeeRepository.findById(id).orElseThrow();
        employee.setFullName(request.getFullName());
        employee.setEmail(request.getEmail());
        if (request.getActive() != null) employee.setActive(request.getActive());
        employee.setSector(resolveSector(request.getSectorId()));
        employee.setProject(resolveProject(request.getProjectId()));
        if (employee.getCompany() == null) employee.setCompany(companyService.resolve(null));
        return employeeRepository.save(employee);
    }

    public void remove(Long id) {
        Employee employee = employeeRepository.findById(id).orElseThrow();
        employee.setActive(false);
        employeeRepository.save(employee);
    }

    private Sector resolveSector(Long id) {
        return id == null ? null : sectorRepository.findById(id).orElseThrow();
    }

    private Project resolveProject(Long id) {
        return id == null ? null : projectRepository.findById(id).orElseThrow();
    }
}
