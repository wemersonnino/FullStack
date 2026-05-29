package com.escala.authservice.service;

import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
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

    public List<Employee> list() {
        return employeeRepository.findAll();
    }

    public Employee create(EmployeeRequest request) {
        return employeeRepository.save(Employee.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .active(request.getActive() == null || request.getActive())
                .sector(resolveSector(request.getSectorId()))
                .project(resolveProject(request.getProjectId()))
                .company(companyService.resolve(null))
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
