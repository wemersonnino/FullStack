package com.escala.authservice.service;

import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.WorkPost;
import com.escala.authservice.repository.WorkPostRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WorkPostService {
    private final WorkPostRepository workPostRepository;
    private final CompanyService companyService;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;

    public List<WorkPost> list() {
        Company company = companyService.resolve(null);
        return workPostRepository.findByCompany(company);
    }

    public WorkPost create(WorkPost workPost) {
        Company company = companyService.resolve(null);
        
        // Validar plano
        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "WORK_POSTS");
        
        workPost.setCompany(company);
        return workPostRepository.save(workPost);
    }

    public void delete(Long id) {
        workPostRepository.deleteById(id);
    }
}
