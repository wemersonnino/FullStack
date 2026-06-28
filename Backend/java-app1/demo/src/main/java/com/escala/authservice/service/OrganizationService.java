package com.escala.authservice.service;

import com.escala.authservice.dto.ProjectRequest;
import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final SectorRepository sectorRepository;
    private final ProjectRepository projectRepository;
    private final CompanyService companyService;
    private final UserRepository userRepository;

    private Company getRequesterCompany(String requesterEmail) {
        return userRepository.findByEmail(requesterEmail)
                .map(User::getCompany)
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante ou empresa nao encontrados"));
    }

    public org.springframework.data.domain.Page<Sector> sectors(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isAdminOrOwner = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER") || r.getName().equals("SYSTEM_ADMIN"));
        if (isAdminOrOwner) {
            return sectorRepository.findByCompanyId(company.getId(), pageable);
        } else {
            boolean isManager = requester.getRoles().stream()
                    .anyMatch(r -> r.getName().startsWith("MANAGER"));
            if (isManager) {
                return sectorRepository.findByCompanyIdAndManagerEmail(company.getId(), requesterEmail, pageable);
            }
            return org.springframework.data.domain.Page.empty();
        }
    }

    public Sector createSector(String requesterEmail, SectorRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem criar setores");
        }
        User manager = null;
        if (request.getManagerId() != null) {
            manager = userRepository.findById(request.getManagerId()).orElse(null);
            if (manager != null && !isSystemAdmin && (manager.getCompany() == null || !manager.getCompany().getId().equals(company.getId()))) {
                throw new AccessDeniedException("O gerente do setor deve pertencer a mesma empresa");
            }
        }
        return sectorRepository.save(Sector.builder()
                .name(request.getName())
                .description(request.getDescription())
                .maxSeats(request.getMaxSeats())
                .company(company)
                .manager(manager)
                .build());
    }

    public Sector updateSector(String requesterEmail, UUID id, SectorRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem alterar setores");
        }
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
        sector.setName(request.getName());
        sector.setDescription(request.getDescription());
        sector.setMaxSeats(request.getMaxSeats());
        sector.setManager(manager);
        return sectorRepository.save(sector);
    }

    public void deleteSector(String requesterEmail, UUID id) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem excluir setores");
        }
        Sector sector = sectorRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (sector.getCompany() == null || !sector.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a excluir setor de outra empresa");
        }
        sectorRepository.delete(sector);
    }

    public org.springframework.data.domain.Page<Project> projects(String requesterEmail, org.springframework.data.domain.Pageable pageable) {
        Company company = getRequesterCompany(requesterEmail);
        return projectRepository.findByCompanyId(company.getId(), pageable);
    }

    public Project createProject(String requesterEmail, ProjectRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem criar projetos");
        }
        return projectRepository.save(Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() == null || request.getActive())
                .company(company)
                .build());
    }

    public Project updateProject(String requesterEmail, UUID id, ProjectRequest request) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem alterar projetos");
        }
        Project project = projectRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (project.getCompany() == null || !project.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a alterar projeto de outra empresa");
        }
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getActive() != null) {
            project.setActive(request.getActive());
        }
        return projectRepository.save(project);
    }

    public void deleteProject(String requesterEmail, UUID id) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
        Company company = requester.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Empresa nao encontrada");
        }
        boolean isSystemAdmin = requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isAdminOrOwner = isSystemAdmin || requester.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        if (!isAdminOrOwner) {
            throw new AccessDeniedException("Apenas administradores e donos podem excluir projetos");
        }
        Project project = projectRepository.findById(id).orElseThrow();
        if (!isSystemAdmin && (project.getCompany() == null || !project.getCompany().getId().equals(company.getId()))) {
            throw new AccessDeniedException("Nao autorizado a excluir projeto de outra empresa");
        }
        projectRepository.delete(project);
    }
}
