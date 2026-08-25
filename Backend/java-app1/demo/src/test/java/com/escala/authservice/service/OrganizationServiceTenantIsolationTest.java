package com.escala.authservice.service;

import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.repository.WorkPostRepository;
import com.escala.authservice.security.TenantContext;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTenantIsolationTest {

    @Mock SectorRepository sectorRepository;
    @Mock ProjectRepository projectRepository;
    @Mock UserRepository userRepository;
    @Mock EmployeeRepository employeeRepository;
    @Mock WorkPostRepository workPostRepository;
    @Mock CurrentUserService currentUserService;
    @Mock PolicyService policyService;
    @Mock TenantContext tenantContext;
    @InjectMocks OrganizationService organizationService;

    private final UUID tenantId = UUID.randomUUID();
    private User requester;

    @BeforeEach
    void setUp() {
        Company tenant = Company.builder().id(tenantId).name("Tenant A").build();
        requester = User.builder().email("owner@tenant-a.test").company(tenant).build();
        when(currentUserService.requireCurrentUser(requester.getEmail())).thenReturn(requester);
        when(tenantContext.requireTenantId()).thenReturn(tenantId);
        when(policyService.isOwnerOrAdmin(requester)).thenReturn(true);
    }

    @Test
    void rejectsCrossTenantSectorUpdateBeforeMutation() {
        UUID foreignSectorId = UUID.randomUUID();
        when(sectorRepository.findByIdAndCompanyId(foreignSectorId, tenantId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class, () -> organizationService.updateSector(
                requester.getEmail(), foreignSectorId, sectorRequest(null)
        ));

        verify(sectorRepository, never()).findById(foreignSectorId);
        verify(sectorRepository, never()).save(any(Sector.class));
    }

    @Test
    void rejectsCrossTenantProjectRemovalBeforeDelete() {
        UUID foreignProjectId = UUID.randomUUID();
        when(projectRepository.findByIdAndCompanyId(foreignProjectId, tenantId)).thenReturn(Optional.empty());

        assertThrows(NoSuchElementException.class,
                () -> organizationService.deleteProject(requester.getEmail(), foreignProjectId));

        verify(projectRepository, never()).findById(foreignProjectId);
        verify(projectRepository, never()).delete(any(Project.class));
    }

    @Test
    void rejectsManagerAssociationFromAnotherTenant() {
        UUID foreignManagerId = UUID.randomUUID();
        when(userRepository.findByIdAndCompanyId(foreignManagerId, tenantId)).thenReturn(Optional.empty());

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> organizationService.createSector(requester.getEmail(), sectorRequest(foreignManagerId)));

        verify(userRepository, never()).findById(foreignManagerId);
        verify(sectorRepository, never()).save(any(Sector.class));
    }

    private SectorRequest sectorRequest(UUID managerId) {
        SectorRequest request = new SectorRequest();
        request.setName("Operacao");
        request.setManagerId(managerId);
        return request;
    }
}
