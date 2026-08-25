package com.escala.authservice.service;

import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.security.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTenantIsolationTest {

    @Mock EmployeeRepository employeeRepository;
    @Mock SectorRepository sectorRepository;
    @Mock ProjectRepository projectRepository;
    @Mock CompanyService companyService;
    @Mock CheckPlanLimitUseCase checkPlanLimitUseCase;
    @Mock UserRepository userRepository;
    @Mock CurrentUserService currentUserService;
    @Mock PolicyService policyService;
    @Mock TenantContext tenantContext;
    @InjectMocks EmployeeService employeeService;

    private final UUID tenantAId = UUID.randomUUID();
    private final UUID tenantBId = UUID.randomUUID();
    private Company tenantA;
    private Company tenantB;
    private User requester;

    @BeforeEach
    void setUp() {
        tenantA = Company.builder().id(tenantAId).name("Tenant A").build();
        tenantB = Company.builder().id(tenantBId).name("Tenant B").build();
        requester = User.builder().email("owner@tenant-a.test").company(tenantA)
                .roles(Set.of(Role.builder().name("OWNER").build())).build();
        when(currentUserService.requireCurrentUser(requester.getEmail())).thenReturn(requester);
        when(tenantContext.requireTenantId()).thenReturn(tenantAId);
    }

    @Test
    void listsOnlyAuthenticatedTenant() {
        PageRequest page = PageRequest.of(0, 20);

        employeeService.list(requester.getEmail(), page);

        verify(employeeRepository).findByCompanyId(tenantAId, page);
        verify(employeeRepository, never()).findAll(page);
    }

    @Test
    void updatesResourceFromOwnTenantUsingTenantAwareLookup() {
        Employee employee = employee(tenantA);
        EmployeeRequest request = request(null, null);
        when(employeeRepository.findByIdAndCompanyId(employee.getId(), tenantAId)).thenReturn(Optional.of(employee));
        when(policyService.isOwnerOrAdmin(requester)).thenReturn(true);
        when(employeeRepository.save(employee)).thenReturn(employee);

        Employee updated = employeeService.update(requester.getEmail(), employee.getId(), request);

        assertEquals("Nome atualizado", updated.getFullName());
        verify(employeeRepository, never()).findById(employee.getId());
    }

    @Test
    void rejectsUpdateAndRemovalFromAnotherTenantWithoutGlobalLookup() {
        UUID foreignEmployeeId = UUID.randomUUID();
        when(employeeRepository.findByIdAndCompanyId(foreignEmployeeId, tenantAId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> employeeService.update(requester.getEmail(), foreignEmployeeId, request(null, null)));
        assertThrows(NoSuchElementException.class,
                () -> employeeService.remove(requester.getEmail(), foreignEmployeeId));

        verify(employeeRepository, never()).findById(foreignEmployeeId);
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void rejectsCrossTenantAssociationAtRepositoryBoundary() {
        UUID foreignSectorId = UUID.randomUUID();
        EmployeeRequest request = request(foreignSectorId, null);
        when(policyService.isOwnerOrAdmin(requester)).thenReturn(true);
        when(checkPlanLimitUseCase.canAddEmployee(any(), any(Integer.class))).thenReturn(true);
        when(sectorRepository.findByIdAndCompanyId(foreignSectorId, tenantAId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> employeeService.create(requester.getEmail(), request));

        verify(sectorRepository, never()).findById(foreignSectorId);
        verify(employeeRepository, never()).save(any(Employee.class));
    }

    @Test
    void systemAdminUsesExplicitGlobalPathAndKeepsTargetTenantForAssociations() {
        Employee foreignEmployee = employee(tenantB);
        requester.setRoles(Set.of(Role.builder().name("SYSTEM_ADMIN").build()));
        when(tenantContext.hasGlobalTenantAccess()).thenReturn(true);
        when(employeeRepository.findById(foreignEmployee.getId())).thenReturn(Optional.of(foreignEmployee));
        when(policyService.isOwnerOrAdmin(requester)).thenReturn(true);
        when(policyService.isSystemAdmin(requester)).thenReturn(true);
        when(employeeRepository.save(foreignEmployee)).thenReturn(foreignEmployee);

        Employee updated = employeeService.update(requester.getEmail(), foreignEmployee.getId(), request(null, null));

        assertEquals(tenantBId, updated.getCompany().getId());
        verify(employeeRepository, never()).findByIdAndCompanyId(foreignEmployee.getId(), tenantAId);
    }

    private Employee employee(Company company) {
        return Employee.builder().id(UUID.randomUUID()).company(company).fullName("Nome antigo")
                .email("employee@example.test").active(true).build();
    }

    private EmployeeRequest request(UUID sectorId, UUID projectId) {
        EmployeeRequest request = new EmployeeRequest();
        request.setFullName("Nome atualizado");
        request.setEmail("updated@example.test");
        request.setActive(true);
        request.setSectorId(sectorId);
        request.setProjectId(projectId);
        return request;
    }
}
