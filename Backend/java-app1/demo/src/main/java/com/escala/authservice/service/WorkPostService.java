package com.escala.authservice.service;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.repository.WorkPostRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WorkPostService {
    private final WorkPostRepository workPostRepository;
    private final UserRepository userRepository;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;

    private Company getRequesterCompany(String requesterEmail) {
        return userRepository.findByEmail(requesterEmail)
                .map(User::getCompany)
                .orElseThrow(() -> new IllegalArgumentException("Usuario requisitante ou empresa nao encontrados"));
    }

    public List<WorkPost> list(String requesterEmail) {
        Company company = getRequesterCompany(requesterEmail);
        return workPostRepository.findByCompany(company);
    }

    public WorkPost create(String requesterEmail, WorkPost workPost) {
        Company company = getRequesterCompany(requesterEmail);
        
        // Validar plano
        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "WORK_POSTS");
        
        workPost.setCompany(company);
        return workPostRepository.save(workPost);
    }

    public void delete(String requesterEmail, UUID id) {
        Company company = getRequesterCompany(requesterEmail);
        WorkPost workPost = workPostRepository.findById(id).orElseThrow();
        if (workPost.getCompany() == null || !workPost.getCompany().getId().equals(company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Nao autorizado a excluir posto de trabalho de outra empresa");
        }
        workPostRepository.delete(workPost);
    }
}
