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
import com.escala.authservice.security.TenantContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;
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
    private final CurrentUserService currentUserService;
    private final PolicyService policyService;
    private final TenantContext tenantContext;

    private Company getRequesterCompany(String requesterEmail) {
        Company company = currentUserService.requireCurrentUser(requesterEmail).getCompany();
        UUID tenantId = tenantContext.requireTenantId();
        if (company == null || !tenantId.equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Empresa do usuario diverge do tenant autenticado");
        }
        return company;
    }

    public org.springframework.data.domain.Page<Employee> list(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        Company company = getRequesterCompany(requesterEmail);
        return employeeRepository.findByCompanyId(company.getId(), pageable);
    }

    private void checkEmployeeAdmin(String requesterEmail, Company company) {
        com.escala.authservice.entity.User requester = currentUserService.requireCurrentUser(requesterEmail);
        
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        
        if (!isAdminOrOwner) {
            throw new org.springframework.security.access.AccessDeniedException("Apenas administradores ou donos podem gerenciar funcionarios");
        }
        
        if (!isSystemAdmin && (company == null || !company.getId().equals(requester.getCompany().getId()))) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a gerenciar funcionarios de outra empresa");
        }
    }

    public Employee create(String requesterEmail, EmployeeRequest request) {
        Company company = getRequesterCompany(requesterEmail);
        checkEmployeeAdmin(requesterEmail, company);
        validateEmployeeRequest(company, request, null);
        
        int currentCount = (int) employeeRepository.countByActiveTrueAndCompanyId(company.getId());
        if (!checkPlanLimitUseCase.canAddEmployee(company.getPlanType(), currentCount)) {
            throw new IllegalStateException("Limite de funcionários atingido para o plano atual: " + company.getPlanType() + ". Faça upgrade do seu plano.");
        }

        return employeeRepository.save(Employee.builder()
                .fullName(request.getFullName().trim())
                .email(normalizeEmail(request.getEmail()))
                .active(request.getActive() == null || request.getActive())
                .sector(resolveSector(company, request.getSectorId()))
                .project(resolveProject(company, request.getProjectId()))
                .company(company)
                .build());
    }

    public Employee update(String requesterEmail, UUID id, EmployeeRequest request) {
        Company requesterCompany = getRequesterCompany(requesterEmail);
        Employee employee = findAccessibleEmployee(id, requesterCompany.getId());
        checkEmployeeAdmin(requesterEmail, employee.getCompany());
        validateEmployeeRequest(employee.getCompany(), request, employee.getId());

        employee.setFullName(request.getFullName().trim());
        employee.setEmail(normalizeEmail(request.getEmail()));
        if (request.getActive() != null) employee.setActive(request.getActive());
        
        employee.setSector(resolveSector(employee.getCompany(), request.getSectorId()));
        employee.setProject(resolveProject(employee.getCompany(), request.getProjectId()));
        return employeeRepository.save(employee);
    }

    public void remove(String requesterEmail, UUID id) {
        Company requesterCompany = getRequesterCompany(requesterEmail);
        Employee employee = findAccessibleEmployee(id, requesterCompany.getId());
        checkEmployeeAdmin(requesterEmail, employee.getCompany());

        employee.setActive(false);
        employeeRepository.save(employee);
    }

    private Sector resolveSector(Company company, UUID id) {
        if (id == null) return null;
        return sectorRepository.findByIdAndCompanyId(id, company.getId()).orElseThrow();
    }

    private Project resolveProject(Company company, UUID id) {
        if (id == null) return null;
        return projectRepository.findByIdAndCompanyId(id, company.getId()).orElseThrow();
    }

    private Employee findAccessibleEmployee(UUID id, UUID tenantId) {
        if (tenantContext.hasGlobalTenantAccess()) {
            return employeeRepository.findById(id).orElseThrow();
        }
        return employeeRepository.findByIdAndCompanyId(id, tenantId).orElseThrow();
    }

    private void validateEmployeeRequest(Company company, EmployeeRequest request, UUID employeeId) {
        if (request.getFullName() == null || request.getFullName().trim().isBlank()) {
            throw new IllegalArgumentException("Nome completo do funcionario e obrigatorio");
        }
        String normalizedEmail = normalizeEmail(request.getEmail());
        boolean exists = employeeId == null
                ? employeeRepository.existsByCompanyIdAndEmailIgnoreCase(company.getId(), normalizedEmail)
                : employeeRepository.existsByCompanyIdAndEmailIgnoreCaseAndIdNot(company.getId(), normalizedEmail, employeeId);
        if (exists) {
            throw new IllegalArgumentException("Ja existe funcionario com este email na empresa");
        }
    }

    private String normalizeEmail(String email) {
        if (email == null || email.trim().isBlank()) {
            throw new IllegalArgumentException("Email do funcionario e obrigatorio");
        }
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
