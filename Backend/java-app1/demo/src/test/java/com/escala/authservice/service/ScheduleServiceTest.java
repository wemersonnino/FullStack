package com.escala.authservice.service;

import com.escala.authservice.dto.escala.EscalaRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.Employee;
import com.escala.authservice.entity.Project;
import com.escala.authservice.entity.Role;
import com.escala.authservice.entity.Sector;
import com.escala.authservice.entity.ShiftStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.entity.WorkShift;
import com.escala.authservice.repository.AbsenceRepository;
import com.escala.authservice.repository.CompanyRepository;
import com.escala.authservice.repository.EmployeeRepository;
import com.escala.authservice.repository.ProjectRepository;
import com.escala.authservice.repository.SectorRepository;
import com.escala.authservice.repository.ShiftSwapRequestRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.repository.WorkShiftRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;
    @Mock
    private WorkShiftRepository workShiftRepository;
    @Mock
    private ShiftSwapRequestRepository shiftSwapRequestRepository;
    @Mock
    private AbsenceRepository absenceRepository;
    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private SectorRepository sectorRepository;
    @Mock
    private CompanyRepository companyRepository;
    @Mock
    private AuditLogService auditLogService;
    @Mock
    private UserRepository userRepository;
    @Mock
    private PolicyService policyService;
    @Mock
    private CurrentUserService currentUserService;
    @Mock
    private com.escala.authservice.core.scheduling.application.GenerateScheduleService generateScheduleUseCase;

    @InjectMocks
    private ScheduleService scheduleService;

    @Test
    void createEscalasRejectsSectorFromAnotherCompany() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").build();
        Company companyB = Company.builder().id(UUID.randomUUID()).slug("empresa-b").build();
        User requester = User.builder().id(UUID.randomUUID()).email("admin@empresa-a.com").company(companyA).build();
        Employee employee = Employee.builder().id(UUID.randomUUID()).company(companyA).fullName("Funcionario").build();
        Sector foreignSector = Sector.builder().id(UUID.randomUUID()).company(companyB).name("Setor B").build();
        EscalaRequest request = new EscalaRequest();
        request.setEmployeeId(employee.getId());
        request.setSectorId(foreignSector.getId());
        request.setDates(List.of(LocalDate.of(2026, 7, 1)));
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(17, 0));

        when(currentUserService.requireCurrentUser("admin@empresa-a.com")).thenReturn(requester);
        when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
        when(sectorRepository.findById(foreignSector.getId())).thenReturn(Optional.of(foreignSector));

        assertThrows(
                AccessDeniedException.class,
                () -> scheduleService.createEscalas(request, "admin@empresa-a.com")
        );
    }

    @Test
    void usuarioEscalavelAppliesScopedManagerPolicy() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-a").build();
        User requester = User.builder().id(UUID.randomUUID()).email("manager@empresa-a.com").company(company).build();
        Employee employee = Employee.builder().id(UUID.randomUUID()).company(company).fullName("Funcionario").build();

        when(currentUserService.requireCurrentUser("manager@empresa-a.com")).thenReturn(requester);
        when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
        doThrow(new AccessDeniedException("Nao autorizado")).when(policyService).requireCanAccessEmployee(requester, employee);

        assertThrows(
                AccessDeniedException.class,
                () -> scheduleService.usuarioEscalavel(employee.getId(), "manager@empresa-a.com")
        );
    }

    @Test
    void createEscalasAllowsNewShiftWhenPreviousOneWasCancelled() {
        Company company = Company.builder().id(UUID.randomUUID()).slug("empresa-a").build();
        User requester = User.builder().id(UUID.randomUUID()).email("admin@empresa-a.com").company(company).build();
        Employee employee = Employee.builder()
                .id(UUID.randomUUID())
                .company(company)
                .email("funcionario@empresa-a.com")
                .fullName("Funcionario")
                .build();
        EscalaRequest request = new EscalaRequest();
        request.setEmployeeId(employee.getId());
        request.setDates(List.of(LocalDate.of(2026, 7, 2)));
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(17, 0));

        when(currentUserService.requireCurrentUser("admin@empresa-a.com")).thenReturn(requester);
        when(employeeRepository.findById(employee.getId())).thenReturn(Optional.of(employee));
        when(workShiftRepository.existsByEmployeeIdAndShiftDateAndStatusNot(employee.getId(), LocalDate.of(2026, 7, 2), ShiftStatus.CANCELLED))
                .thenReturn(false);
        when(workShiftRepository.findRelatedActiveShiftsForLaborRules(
                employee.getId(),
                company.getId(),
                LocalDate.of(2026, 6, 25),
                LocalDate.of(2026, 7, 9),
                null
        )).thenReturn(List.of());
        when(workShiftRepository.save(any(WorkShift.class))).thenAnswer(invocation -> invocation.getArgument(0));

        List<com.escala.authservice.dto.escala.EscalaResponse> created = scheduleService.createEscalas(request, "admin@empresa-a.com");

        assertEquals(1, created.size());
        assertEquals(LocalDate.of(2026, 7, 2), created.getFirst().getShiftDate());
    }

    @Test
    void usuariosEscalaveisRejectsForeignCompanyForNonSystemAdmin() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").build();
        Company companyB = Company.builder().id(UUID.randomUUID()).slug("empresa-b").build();
        User requester = User.builder()
                .id(UUID.randomUUID())
                .email("admin@empresa-a.com")
                .company(companyA)
                .roles(Set.of(Role.builder().name("ADMIN").build()))
                .build();

        when(currentUserService.requireCurrentUser("admin@empresa-a.com")).thenReturn(requester);

        assertThrows(
                AccessDeniedException.class,
                () -> scheduleService.usuariosEscalaveis(null, null, companyB.getId(), null, "admin@empresa-a.com")
        );
    }

    @Test
    void usuariosEscalaveisAllowsSystemAdminToQueryAnotherCompany() {
        Company companyA = Company.builder().id(UUID.randomUUID()).slug("empresa-a").build();
        Company companyB = Company.builder().id(UUID.randomUUID()).slug("empresa-b").build();
        User requester = User.builder()
                .id(UUID.randomUUID())
                .email("sys@empresa-a.com")
                .company(companyA)
                .roles(Set.of(Role.builder().name("SYSTEM_ADMIN").build()))
                .build();
        Employee employee = Employee.builder()
                .id(UUID.randomUUID())
                .company(companyB)
                .fullName("Funcionario B")
                .email("funcionario@empresa-b.com")
                .active(true)
                .build();

        when(currentUserService.requireCurrentUser("sys@empresa-a.com")).thenReturn(requester);
        when(policyService.isSystemAdmin(requester)).thenReturn(true);
        when(companyRepository.findById(companyB.getId())).thenReturn(Optional.of(companyB));
        when(employeeRepository.findSchedulableEmployees(companyB.getId(), null, null, null)).thenReturn(List.of(employee));

        List<com.escala.authservice.dto.escala.UsuarioEscalaResponse> usuarios =
                scheduleService.usuariosEscalaveis(null, null, companyB.getId(), null, "sys@empresa-a.com");

        assertEquals(1, usuarios.size());
        assertEquals(employee.getId(), usuarios.getFirst().getId());
    }
}
