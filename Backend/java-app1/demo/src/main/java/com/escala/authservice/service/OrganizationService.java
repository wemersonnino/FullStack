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
                .maxSeats(request.getMaxSeats())
                .company(companyService.resolve(null))
                .build());
    }

    public Sector updateSector(Long id, SectorRequest request) {
        Sector sector = sectorRepository.findById(id).orElseThrow();
        sector.setName(request.getName());
        sector.setDescription(request.getDescription());
        sector.setMaxSeats(request.getMaxSeats());
        return sectorRepository.save(sector);
    }

    public void deleteSector(Long id) {
        sectorRepository.deleteById(id);
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

    public Project updateProject(Long id, ProjectRequest request) {
        Project project = projectRepository.findById(id).orElseThrow();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        if (request.getActive() != null) {
            project.setActive(request.getActive());
        }
        return projectRepository.save(project);
    }

    public void deleteProject(Long id) {
        projectRepository.deleteById(id);
    }
}
