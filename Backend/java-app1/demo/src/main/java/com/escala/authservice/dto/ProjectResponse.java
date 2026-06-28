package com.escala.authservice.dto;

import com.escala.authservice.entity.Project;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectResponse {
    private String id;
    private String name;
    private String description;
    private boolean active;

    public static ProjectResponse from(Project project) {
        if (project == null) return null;
        return ProjectResponse.builder()
                .id(project.getId().toString())
                .name(project.getName())
                .description(project.getDescription())
                .active(project.isActive())
                .build();
    }
}
