package com.escala.authservice.integration;

import com.escala.authservice.dto.scheduling.ScheduleCycleRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleAssignment;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleCycleAssignmentRepository;
import com.escala.authservice.repository.ScheduleCycleRepository;
import com.escala.authservice.scheduling.domain.enums.ModalidadeTrabalho;
import com.escala.authservice.service.ScheduleCyclePublicationService;
import com.escala.authservice.service.ScheduleCycleService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ScheduleCyclePublicationIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ScheduleCycleService scheduleCycleService;

    @Autowired
    private ScheduleCyclePublicationService scheduleCyclePublicationService;

    @Autowired
    private ScheduleCycleRepository scheduleCycleRepository;

    @Autowired
    private ScheduleCycleAssignmentRepository scheduleCycleAssignmentRepository;

    @Test
    void publishesRectifiesAndArchivesCycleWithRealDatabaseAndRedisLock() {
        Company company = persistCompany("empresa-a");
        User owner = persistUser(company, "owner@empresa-a.com", "owner-a", "OWNER");
        User employeeUser = persistUser(company, "employee@empresa-a.com", "employee-a", "USER");
        Employee employee = persistEmployee(company, employeeUser, employeeUser.getEmail(), "Funcionario A");

        ScheduleCycle cycle = scheduleCycleService.createCycle(
                owner.getEmail(),
                new ScheduleCycleRequest(2026, 7, null, "America/Sao_Paulo")
        );

        scheduleCycleAssignmentRepository.saveAndFlush(ScheduleCycleAssignment.builder()
                .cycle(cycle)
                .company(company)
                .employee(employee)
                .assignmentDate(LocalDate.of(2026, 7, 6))
                .legendCode("TRAB")
                .legendLabel("Trabalho")
                .legendImpact("WORKED")
                .plannedMinutes(480)
                .modality(ModalidadeTrabalho.PRESENCIAL)
                .build());

        ScheduleCycle published = scheduleCyclePublicationService.publish(owner.getEmail(), cycle.getPublicId());
        assertThat(published.getStatus()).isEqualTo(ScheduleCycleStatus.PUBLICADO);
        assertThat(published.getPublishedAt()).isNotNull();
        assertThat(published.getPublishedBy().getId()).isEqualTo(owner.getId());

        ScheduleCycle rectified = scheduleCyclePublicationService.rectify(owner.getEmail(), cycle.getPublicId());
        assertThat(rectified.getStatus()).isEqualTo(ScheduleCycleStatus.RETIFICADO);
        assertThat(rectified.getBusinessVersion()).isEqualTo(2);

        ScheduleCycle archived = scheduleCyclePublicationService.archive(owner.getEmail(), cycle.getPublicId());
        assertThat(archived.getStatus()).isEqualTo(ScheduleCycleStatus.ARQUIVADO);
        assertThat(archived.getArchivedAt()).isNotNull();
        assertThat(archived.getArchivedBy().getId()).isEqualTo(owner.getId());

        ScheduleCycle persisted = scheduleCycleRepository.findById(archived.getId()).orElseThrow();
        assertThat(persisted.getStatus()).isEqualTo(ScheduleCycleStatus.ARQUIVADO);
    }
}
