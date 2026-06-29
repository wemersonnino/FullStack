package com.escala.authservice.service;

import com.escala.authservice.dto.ProjectRequest;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final SectorRepository sectorRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final WorkPostRepository workPostRepository;
    private final CurrentUserService currentUserService;
    private final PolicyService policyService;

    private Company getRequesterCompany(String requesterEmail) {
        Company company = currentUserService.requireCurrentUser(requesterEmail).getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Usuario requisitante ou empresa nao encontrados");
        }
        return company;
    }

    public org.springframework.data.domain.Page<Sector> sectors(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (isAdminOrOwner) {
            return sectorRepository.findByCompanyId(company.getId(), pageable);
        } else {
            boolean isManager = policyService.isManager(requester);
            if (isManager) {
                return sectorRepository.findByCompanyIdAndManagerEmail(company.getId(), requester.getEmail(), pageable);
            }
            return org.springframework.data.domain.Page.empty();
        }
    }

    public Sector createSector(String requesterEmail, SectorRequest request) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem criar setores");
        }
        validateSectorRequest(request);
        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId()).orElse(null);
            if (manager != null && !isSystemAdmin && (manager.getCompany() == null || !manager.getCompany().getId().equals(company.getId()))) {
                throw new AccessDeniedException("O gerente do setor deve pertencer a mesma empresa");
            }
        }
        return sectorRepository.save(Sector.builder()
                .name(request.getName().trim())
                .description(normalizeText(request.getDescription()))
                .maxSeats(request.getMaxSeats())
                .company(company)
                .manager(manager)
                .build());
    }

    public Sector updateSector(String requesterEmail, UUID id, SectorRequest request) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem alterar setores");
        }
        validateSectorRequest(request);
        Sector sector = sectorRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (sector.getCompany() == null || !sector.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a alterar setor de outra empresa");
        }
        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId()).orElse(null);
            if (manager != null && !isSystemAdmin && (manager.getCompany() == null || !manager.getCompany().getId().equals(company.getId()))) {
                throw new AccessDeniedException("O gerente do setor deve pertencer a mesma empresa");
            }
        }
        sector.setName(request.getName().trim());
        sector.setDescription(normalizeText(request.getDescription()));
        sector.setMaxSeats(request.getMaxSeats());
        sector.setManager(manager);
        return sectorRepository.save(sector);
    }

    public void deleteSector(String requesterEmail, UUID id) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem excluir setores");
        }
        Sector sector = sectorRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (sector.getCompany() == null || !sector.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a excluir setor de outra empresa");
        }
        if (employeeRepository.countBySectorIdAndCompanyId(sector.getId(), company.getId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nao e permitido excluir setor com funcionarios vinculados");
        }
        sectorRepository.delete(sector);
    }

    public org.springframework.data.domain.Page<Project> projects(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        Company company = getRequesterCompany(requesterEmail);
        return projectRepository.findByCompanyId(company.getId(), pageable);
    }

    public Project createProject(String requesterEmail, ProjectRequest request) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem criar projetos");
        }
        validateProjectRequest(request);
        return projectRepository.save(Project.builder()
                .name(request.getName().trim())
                .description(normalizeText(request.getDescription()))
                .active(request.getActive() == null || request.getActive())
                .company(company)
                .build());
    }

    public Project updateProject(String requesterEmail, UUID id, ProjectRequest request) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem alterar projetos");
        }
        validateProjectRequest(request);
        Project project = projectRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (project.getCompany() == null || !project.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a alterar projeto de outra empresa");
        }
        project.setName(request.getName().trim());
        project.setDescription(normalizeText(request.getDescription()));
        if (request.getActive() != null) {
            project.setActive(request.getActive());
        }
        return projectRepository.save(project);
    }

    public void deleteProject(String requesterEmail, UUID id) {
        User requester = currentUserService.requireCurrentUser(requesterEmail);
        Company company = getRequesterCompany(requesterEmail);
        boolean isSystemAdmin = policyService.isSystemAdmin(requester);
        boolean isAdminOrOwner = policyService.isOwnerOrAdmin(requester);
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem excluir projetos");
        }
        Project project = projectRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (project.getCompany() == null || !project.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a excluir projeto de outra empresa");
        }
        if (employeeRepository.countByProjectIdAndCompanyId(project.getId(), company.getId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nao e permitido excluir projeto com funcionarios vinculados");
        }
        if (workPostRepository.countByProjectId(project.getId()) > 0) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Nao e permitido excluir projeto com postos de trabalho vinculados");
        }
        projectRepository.delete(project);
    }

    private void validateSectorRequest(SectorRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome do setor e obrigatorio");
        }
        if (request.getMaxSeats() != null && request.getMaxSeats() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacidade maxima do setor deve ser positiva");
        }
    }

    private void validateProjectRequest(ProjectRequest request) {
        if (request.getName() == null || request.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome do projeto e obrigatorio");
        }
    }

    private String normalizeText(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }
}
