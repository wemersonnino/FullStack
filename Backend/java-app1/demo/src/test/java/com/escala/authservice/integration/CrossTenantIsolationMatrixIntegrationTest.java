package com.escala.authservice.integration;

import com.escala.authservice.dto.EmployeeRequest;
import com.escala.authservice.dto.ProjectRequest;
import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.service.EmployeeService;
import com.escala.authservice.service.OrganizationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.AccessDeniedException;

import java.util.NoSuchElementException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CrossTenantIsolationMatrixIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private EmployeeService employeeService;

    @Autowired
    private OrganizationService organizationService;

    @Autowired
    private SectorRepository sectorRepository;

    @Autowired
    private ProjectRepository projectRepository;

    private TenantFixture tenantA;
    private TenantFixture tenantB;
    private Sector sectorA;
    private Sector sectorB;
    private Project projectA;
    private Project projectB;

    @BeforeEach
    void createDeterministicTenantMatrix() {
        tenantA = persistTenantFixture("tenant-a");
        tenantB = persistTenantFixture("tenant-b");
        sectorA = sectorRepository.saveAndFlush(Sector.builder()
                .name("Operacao A")
                .company(tenantA.company())
                .build());
        sectorB = sectorRepository.saveAndFlush(Sector.builder()
                .name("Operacao B")
                .company(tenantB.company())
                .build());
        projectA = projectRepository.saveAndFlush(Project.builder()
                .name("Projeto A")
                .active(true)
                .company(tenantA.company())
                .build());
        projectB = projectRepository.saveAndFlush(Project.builder()
                .name("Projeto B")
                .active(true)
                .company(tenantB.company())
                .build());
        authenticateAs(tenantA, "OWNER");
    }

    @Test
    void listsOnlyResourcesFromAuthenticatedTenantEvenWhenFallbackEmailIsSpoofed() {
        var employees = employeeService.list(tenantB.owner().getEmail(), PageRequest.of(0, 20));
        var sectors = organizationService.sectors(tenantB.owner().getEmail(), PageRequest.of(0, 20));
        var projects = organizationService.projects(tenantB.owner().getEmail(), PageRequest.of(0, 20));

        assertThat(employees).extracting(Employee::getId).containsExactly(tenantA.employee().getId());
        assertThat(sectors).extracting(Sector::getId).containsExactly(sectorA.getId());
        assertThat(projects).extracting(Project::getId).containsExactly(projectA.getId());
    }

    @Test
    void knownForeignIdsCannotBeUpdatedOrDeleted() {
        assertThatThrownBy(() -> employeeService.update(
                tenantA.owner().getEmail(), tenantB.employee().getId(), employeeRequest("Intruso", null, null)))
                .isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(() -> employeeService.remove(
                tenantA.owner().getEmail(), tenantB.employee().getId()))
                .isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(() -> organizationService.updateSector(
                tenantA.owner().getEmail(), sectorB.getId(), sectorRequest("Alterado", null)))
                .isInstanceOf(NoSuchElementException.class);
        assertThatThrownBy(() -> organizationService.deleteProject(
                tenantA.owner().getEmail(), projectB.getId()))
                .isInstanceOf(NoSuchElementException.class);

        assertThat(employeeRepository.findById(tenantB.employee().getId()).orElseThrow().isActive()).isTrue();
        assertThat(sectorRepository.findById(sectorB.getId()).orElseThrow().getName()).isEqualTo("Operacao B");
        assertThat(projectRepository.existsById(projectB.getId())).isTrue();
    }

    @Test
    void crossTenantAssociationsAreRejectedForManagerSectorAndProject() {
        assertThatThrownBy(() -> organizationService.createSector(
                tenantA.owner().getEmail(), sectorRequest("Setor invalido", tenantB.owner().getId())))
                .isInstanceOf(AccessDeniedException.class);

        assertThatThrownBy(() -> employeeService.create(
                tenantA.owner().getEmail(), employeeRequest("Funcionario invalido", sectorB.getId(), projectB.getId())))
                .isInstanceOf(NoSuchElementException.class);
    }

    @Test
    void sameTenantCrudAndAssociationsRemainAllowed() {
        Employee created = employeeService.create(
                tenantA.owner().getEmail(), employeeRequest("Funcionario local", sectorA.getId(), projectA.getId()));
        Employee updated = employeeService.update(
                tenantA.owner().getEmail(), created.getId(), employeeRequest("Funcionario atualizado", sectorA.getId(), projectA.getId()));

        assertThat(updated.getCompany().getId()).isEqualTo(tenantA.company().getId());
        assertThat(updated.getSector().getId()).isEqualTo(sectorA.getId());
        assertThat(updated.getProject().getId()).isEqualTo(projectA.getId());

        employeeService.remove(tenantA.owner().getEmail(), created.getId());
        assertThat(employeeRepository.findById(created.getId()).orElseThrow().isActive()).isFalse();

        Project localProject = organizationService.createProject(
                tenantA.owner().getEmail(), projectRequest("Temporario"));
        organizationService.deleteProject(tenantA.owner().getEmail(), localProject.getId());
        assertThat(projectRepository.existsById(localProject.getId())).isFalse();
    }

    @Test
    void systemAdminUsesTheExplicitGlobalExceptionWithoutChangingTargetTenant() {
        tenantA.owner().setRoles(java.util.Set.of(persistRole("SYSTEM_ADMIN")));
        userRepository.saveAndFlush(tenantA.owner());
        authenticateAs(tenantA, "SYSTEM_ADMIN");

        Employee updated = employeeService.update(
                tenantA.owner().getEmail(), tenantB.employee().getId(),
                employeeRequest("Atualizado globalmente", sectorB.getId(), projectB.getId()));

        assertThat(updated.getCompany().getId()).isEqualTo(tenantB.company().getId());
        assertThat(updated.getSector().getId()).isEqualTo(sectorB.getId());
        assertThat(updated.getProject().getId()).isEqualTo(projectB.getId());
    }

    private EmployeeRequest employeeRequest(String name, java.util.UUID sectorId, java.util.UUID projectId) {
        EmployeeRequest request = new EmployeeRequest();
        request.setFullName(name);
        request.setEmail(name.toLowerCase(java.util.Locale.ROOT).replace(' ', '.') + "@example.test");
        request.setActive(true);
        request.setSectorId(sectorId);
        request.setProjectId(projectId);
        return request;
    }

    private SectorRequest sectorRequest(String name, java.util.UUID managerId) {
        SectorRequest request = new SectorRequest();
        request.setName(name);
        request.setManagerId(managerId);
        return request;
    }

    private ProjectRequest projectRequest(String name) {
        ProjectRequest request = new ProjectRequest();
        request.setName(name);
        request.setActive(true);
        return request;
    }
}
