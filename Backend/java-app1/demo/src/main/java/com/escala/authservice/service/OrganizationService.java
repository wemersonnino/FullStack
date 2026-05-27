package com.escala.authservice.service;

import com.escala.authservice.dto.ProjectRequest;
import com.escala.authservice.dto.SectorRequest;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrganizationService {
    private final SectorRepository sectorRepository;
    private final ProjectRepository projectRepository;
    private final CompanyService companyService;

    public List<Sector> sectors() {
        return sectorRepository.findAll();
    }

    public Sector createSector(SectorRequest request) {
        return sectorRepository.save(Sector.builder()
                .name(request.getName())
                .description(request.getDescription())
                .company(companyService.resolve(null))
                .build());
    }

    public List<Project> projects() {
        return projectRepository.findAll();
    }

    public Project createProject(ProjectRequest request) {
        return projectRepository.save(Project.builder()
                .name(request.getName())
                .description(request.getDescription())
                .active(request.getActive() == null || request.getActive())
                .company(companyService.resolve(null))
                .build());
    }
}
