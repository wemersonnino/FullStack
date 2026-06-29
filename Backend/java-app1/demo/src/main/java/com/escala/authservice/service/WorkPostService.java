package com.escala.authservice.service;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.WorkPostRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkPostService {
    private final WorkPostRepository workPostRepository;
    private final ProjectRepository projectRepository;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;
    private final CurrentUserService currentUserService;
    private final PolicyService policyService;

    private Company getRequesterCompany(String requesterEmail) {
        Company company = currentUserService.requireCurrentUser(requesterEmail).getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Usuario requisitante ou empresa nao encontrados");
        }
        return company;
    }

    public List<WorkPost> list(String requesterEmail) {
        Company company = getRequesterCompany(requesterEmail);
        return workPostRepository.findByCompany(company);
    }

    public WorkPost create(String requesterEmail, WorkPost workPost) {
        Company company = getRequesterCompany(requesterEmail);
        policyService.requireOwnerOrAdmin(currentUserService.requireCurrentUser(requesterEmail), "Apenas administradores podem criar postos de trabalho");
        
        // Validar plano
        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "WORK_POSTS");
        if (workPost.getName() == null || workPost.getName().trim().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome do posto de trabalho e obrigatorio");
        }
        if (workPostRepository.existsByCompanyAndNameIgnoreCase(company, workPost.getName().trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Ja existe posto de trabalho com este nome na empresa");
        }
        if (workPost.getProject() != null && workPost.getProject().getId() != null) {
            Project project = projectRepository.findById(workPost.getProject().getId()).orElseThrow();
            if (project.getCompany() == null || !project.getCompany().getId().equals(company.getId())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Projeto do posto deve pertencer a mesma empresa");
            }
            workPost.setProject(project);
        } else {
            workPost.setProject(null);
        }
        
        workPost.setName(workPost.getName().trim());
        workPost.setCompany(company);
        return workPostRepository.save(workPost);
    }

    public void delete(String requesterEmail, UUID id) {
        Company company = getRequesterCompany(requesterEmail);
        policyService.requireOwnerOrAdmin(currentUserService.requireCurrentUser(requesterEmail), "Apenas administradores podem excluir postos de trabalho");
        WorkPost workPost = workPostRepository.findById(id).orElseThrow();
        if (workPost.getCompany() == null || !workPost.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a excluir posto de trabalho de outra empresa");
        }
        workPostRepository.delete(workPost);
    }
}
