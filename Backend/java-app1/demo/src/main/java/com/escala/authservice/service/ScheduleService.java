package com.escala.authservice.service;

import com.escala.authservice.dto.CreateShiftSwapRequest;
import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.DecideShiftSwapRequest;
import com.escala.authservice.dto.GenerateScheduleRequest;
import com.escala.authservice.dto.escala.EscalaRequest;
import com.escala.authservice.dto.escala.EscalaResponse;
import com.escala.authservice.dto.escala.UsuarioEscalaResponse;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import com.escala.authservice.scheduling.domain.enums.PadraoEscala;
import com.escala.authservice.scheduling.domain.enums.StatusTroca;
import com.escala.authservice.scheduling.domain.model.FluxoTrocaEscala;
import com.escala.authservice.scheduling.domain.model.SolicitacaoTrocaEscala;
import com.escala.authservice.scheduling.domain.policy.JornadaPlanejada;
import com.escala.authservice.scheduling.domain.policy.LaborRuleEngine;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final EmployeeRepository employeeRepository;
    private final WorkShiftRepository workShiftRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final AbsenceRepository absenceRepository;
    private final ProjectRepository projectRepository;
    private final SectorRepository sectorRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final PolicyService policyService;
    private final com.escala.authservice.core.scheduling.application.GenerateScheduleService generateScheduleUseCase;
    private final LaborRuleEngine laborRuleEngine = new LaborRuleEngine();

    private Company resolveCompany(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .map(User::getCompany)
                .orElseThrow(() -> new IllegalArgumentException("Usuario ou empresa nao encontrados"));
    }

    public List<WorkShift> listMonth(int year, int month, String userEmail) {
        Company company = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        
        YearMonth yearMonth = YearMonth.of(year, month);
        if (policyService.isScopedManagerOnly(user)) {
            List<Long> sectorIds = policyService.managedSectorIds(user);
            if (sectorIds.isEmpty()) {
                return Collections.emptyList();
            }
            return workShiftRepository.findByEmployeeCompanyIdAndEmployeeSectorIdInAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(
                    company.getId(),
                    sectorIds,
                    yearMonth.atDay(1),
                    yearMonth.atEndOfMonth()
            );
        }

        return workShiftRepository.findByEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(
                company.getId(),
                yearMonth.atDay(1),
                yearMonth.atEndOfMonth()
        );
    }

    public List<EscalaResponse> listEscalas(LocalDate inicio, LocalDate fim, Long usuarioId, Long setorId, Long projetoId, String userEmail) {
        Company company = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        
        LocalDate start = inicio == null ? YearMonth.now().atDay(1) : inicio;
        LocalDate end = fim == null ? YearMonth.from(start).atEndOfMonth() : fim;

        if (policyService.isScopedManagerOnly(user)) {
            List<Long> sectorIds = policyService.managedSectorIds(user);
            if (sectorIds.isEmpty()) {
                return Collections.emptyList();
            }
            if (setorId != null) {
                policyService.requireCanAccessSector(user, setorId);
            } else {
                return workShiftRepository.findByEmployeeCompanyIdAndEmployeeSectorIdInAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(
                        company.getId(), sectorIds, start, end).stream()
                        .map(EscalaResponse::from)
                        .toList();
            }
        }
        
        return workShiftRepository.findEscalas(company.getId(), start, end, usuarioId, setorId, projetoId).stream()
                .map(EscalaResponse::from)
                .toList();
    }

    public List<EscalaResponse> listEscalasDoUsuario(String userEmail, LocalDate inicio, LocalDate fim) {
        Employee employee = resolveRequester(userEmail);
        LocalDate start = inicio == null ? YearMonth.now().atDay(1) : inicio;
        LocalDate end = fim == null ? YearMonth.from(start).atEndOfMonth() : fim;
        return workShiftRepository.findByEmployeeIdAndEmployeeCompanyIdAndShiftDateBetweenOrderByShiftDateAscStartTimeAsc(employee.getId(), employee.getCompany().getId(), start, end)
                .stream()
                .map(EscalaResponse::from)
                .toList();
    }

    public List<EscalaResponse> listEscalasDoDia(LocalDate data, String userEmail, boolean admin) {
        if (data == null) {
            throw new IllegalArgumentException("Parametro data e obrigatorio");
        }
        Company company = resolveCompany(userEmail);
        List<WorkShift> shifts = admin
                ? workShiftRepository.findByEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(company.getId(), data)
                : workShiftRepository.findByEmployeeIdAndEmployeeCompanyIdAndShiftDateOrderByStartTimeAsc(resolveRequester(userEmail).getId(), company.getId(), data);
        return shifts.stream().map(EscalaResponse::from).toList();
    }

    @Transactional
    public List<EscalaResponse> createEscalas(EscalaRequest request, String userEmail) {
        Company company = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        policyService.requireCanManageSchedules(user);
        Employee employee = employeeRepository.findById(request.getEmployeeId()).orElseThrow();
        policyService.requireCanAccessEmployee(user, employee);
        policyService.requireCanAccessSector(user, request.getSectorId());

        applyEmployeeAllocation(employee, request);
        validateEmployeeSelection(employee, request);
        if (request.getDates() == null || request.getDates().isEmpty()) {
            throw new IllegalArgumentException("Selecione ao menos uma data");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("Horario inicial e final sao obrigatorios");
        }

        List<WorkShift> saved = new ArrayList<>();
        PadraoEscala padraoEscala = request.getPadraoEscala() != null ? request.getPadraoEscala() : PadraoEscala.COMUM;
        
        for (LocalDate date : request.getDates()) {
            if (workShiftRepository.existsByEmployeeIdAndShiftDate(employee.getId(), date)) {
                throw new IllegalStateException("Funcionario ja possui escala em " + date);
            }
            WorkMode workMode = request.getWorkMode() == null ? WorkMode.PRESENCIAL : request.getWorkMode();
            validateLaborRules(employee, date, request.getStartTime(), request.getEndTime(), padraoEscala, null, List.of(), null);
            validateSectorCapacity(employee, request, date, workMode, null, company.getId());
            WorkShift shift = WorkShift.builder()
                    .employee(employee)
                    .shiftDate(date)
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .status(ShiftStatus.SCHEDULED)
                    .workMode(workMode)
                    .padraoEscala(padraoEscala)
                    .notes(request.getNotes())
                    .build();
            saved.add(workShiftRepository.save(shift));
        }

        auditLogService.record(
                userEmail,
                "SHIFT_CREATED",
                "WorkShift",
                employee.getId(),
                "Escalas criadas=" + saved.size()
        );
        return saved.stream().map(EscalaResponse::from).toList();
    }

    @Transactional
    public EscalaResponse updateEscala(Long id, EscalaRequest request, String userEmail) {
        Company company = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        policyService.requireCanManageSchedules(user);
        WorkShift shift = workShiftRepository.findById(id).orElseThrow();
        policyService.requireCanAccessShift(user, shift);

        // Concurrency Check (Optimistic Locking)
        if (request.getVersion() != null && !Objects.equals(shift.getVersion(), request.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(WorkShift.class, id);
        }

        policyService.requireCanAccessSector(user, request.getSectorId());

        if (request.getEmployeeId() != null && !Objects.equals(request.getEmployeeId(), shift.getEmployee().getId())) {
            Employee newEmp = employeeRepository.findById(request.getEmployeeId()).orElseThrow();
            policyService.requireCanAccessEmployee(user, newEmp);
            shift.setEmployee(newEmp);
        }
        applyEmployeeAllocation(shift.getEmployee(), request);
        validateEmployeeSelection(shift.getEmployee(), request);
        if (request.getDates() != null && !request.getDates().isEmpty()) {
            LocalDate newDate = request.getDates().get(0);
            if (!Objects.equals(newDate, shift.getShiftDate())
                    && workShiftRepository.existsByEmployeeIdAndShiftDate(shift.getEmployee().getId(), newDate)) {
                throw new IllegalStateException("Funcionario ja possui escala em " + newDate);
            }
            shift.setShiftDate(newDate);
        }
        if (request.getStartTime() != null) shift.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) shift.setEndTime(request.getEndTime());
        if (request.getWorkMode() != null) shift.setWorkMode(request.getWorkMode());
        if (request.getPadraoEscala() != null) shift.setPadraoEscala(request.getPadraoEscala());
        if (request.getNotes() != null) shift.setNotes(request.getNotes());
        
        validateLaborRules(shift.getEmployee(), shift.getShiftDate(), shift.getStartTime(), shift.getEndTime(), shift.getPadraoEscala(), shift.getId(), List.of(), null);
        validateSectorCapacity(shift.getEmployee(), request, shift.getShiftDate(), shift.getWorkMode(), shift.getId(), company.getId());

        WorkShift saved = workShiftRepository.save(shift);
        auditLogService.record(userEmail, "SHIFT_UPDATED", "WorkShift", saved.getId(), "Escala atualizada");
        return EscalaResponse.from(saved);
    }

    @Transactional
    public void cancelEscala(Long id, String userEmail) {
        Company company = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        policyService.requireCanManageSchedules(user);
        WorkShift shift = workShiftRepository.findById(id).orElseThrow();
        policyService.requireCanAccessShift(user, shift);

        shift.setStatus(ShiftStatus.CANCELLED);
        workShiftRepository.save(shift);
        auditLogService.record(userEmail, "SHIFT_CANCELLED", "WorkShift", id, "Escala cancelada");
    }

    public List<UsuarioEscalaResponse> usuariosEscalaveis(Long projectId, Long sectorId, Long companyId, String query, String userEmail) {
        Company myCompany = resolveCompany(userEmail);
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        
        Long finalSectorId = sectorId;
        if (policyService.isScopedManagerOnly(user)) {
            List<Long> sectorIds = policyService.managedSectorIds(user);
            if (sectorIds.isEmpty()) {
                return Collections.emptyList();
            }
            if (sectorId != null) {
                policyService.requireCanAccessSector(user, sectorId);
            } else {
                String normalizedQuery = normalizeSearchQuery(query);
                List<Employee> list = employeeRepository.findSchedulableEmployees(myCompany.getId(), projectId, null, normalizedQuery);
                return list.stream()
                        .filter(e -> e.getSector() != null && sectorIds.contains(e.getSector().getId()))
                        .map(UsuarioEscalaResponse::from)
                        .toList();
            }
        }

        String normalizedQuery = normalizeSearchQuery(query);
        return employeeRepository.findSchedulableEmployees(myCompany.getId(), projectId, finalSectorId, normalizedQuery).stream()
                .map(UsuarioEscalaResponse::from)
                .toList();
    }

    public UsuarioEscalaResponse usuarioEscalavel(Long id, String userEmail) {
        Company company = resolveCompany(userEmail);
        Employee employee = employeeRepository.findById(id).orElseThrow();
        if (!Objects.equals(employee.getCompany().getId(), company.getId())) {
            throw new org.springframework.security.access.AccessDeniedException("Funcionario nao pertence a sua empresa");
        }
        return UsuarioEscalaResponse.from(employee);
    }

    @Transactional
    public List<WorkShift> generateMonth(GenerateScheduleRequest request, String userEmail) {
        Company company = resolveCompany(userEmail);
        
        // Delegar para o Core Hexagonal (Lógica de Negócio Pura)
        var generated = generateScheduleUseCase.generate(request, company.getId());

        auditLogService.record(
                userEmail,
                "SCHEDULE_MONTH_GENERATED",
                "WorkShift",
                YearMonth.of(request.getYear(), request.getMonth()),
                "Escalas geradas: " + generated.size() + "; modalidade=" + request.getWorkMode()
        );

        return listMonth(request.getYear(), request.getMonth(), userEmail);
    }

    public DashboardSummaryResponse dashboardSummary(int year, int month, String userEmail) {
        Company company = resolveCompany(userEmail);
        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();
        return DashboardSummaryResponse.builder()
                .activeEmployees(employeeRepository.countByActiveTrueAndCompanyId(company.getId()))
                .activeProjects(projectRepository.countByActiveTrueAndCompanyId(company.getId()))
                .shiftsInMonth(workShiftRepository.countByEmployeeCompanyIdAndShiftDateBetween(company.getId(), start, end))
                .pendingSwapRequests(shiftSwapRequestRepository.countByStatusAndRequesterCompanyId(SwapStatus.PENDING, company.getId()))
                .absencesInMonth(absenceRepository.countByEmployeeCompanyIdAndAbsenceDateBetween(company.getId(), start, end))
                .attendanceRate(100) // Placeholder
                .openShifts(0) // Placeholder
                .build();
    }

    public ShiftSwapRequest requestSwap(CreateShiftSwapRequest request, String userEmail) {
        Employee requester = request.getRequesterId() == null
                ? resolveRequester(userEmail)
                : employeeRepository.findById(request.getRequesterId()).orElseThrow();
        
        Company company = resolveCompany(userEmail);
        if (!Objects.equals(requester.getCompany().getId(), company.getId())) {
             throw new org.springframework.security.access.AccessDeniedException("Nao autorizado");
        }
        
        return requestSwap(request, requester);
    }

    private ShiftSwapRequest requestSwap(CreateShiftSwapRequest request, Employee requester) {
        WorkShift originalShift = workShiftRepository.findById(request.getOriginalShiftId()).orElseThrow();

        if (!Objects.equals(originalShift.getEmployee().getCompany().getId(), requester.getCompany().getId())) {
             throw new org.springframework.security.access.AccessDeniedException("Escala nao pertence a sua empresa");
        }

        new SolicitacaoTrocaEscala(
                requester.getId(),
                originalShift.getEmployee().getId(),
                originalShift.getShiftDate(),
                request.getCompensationDate()
        ).validarSolicitacao(LocalDate.now());

        ShiftSwapRequest saved = shiftSwapRequestRepository.save(ShiftSwapRequest.builder()
                .requester(requester)
                .originalShift(originalShift)
                .compensationDate(request.getCompensationDate())
                .comments(request.getComments())
                .status(SwapStatus.PENDING)
                .build());
        auditLogService.record(
                requester.getEmail(),
                "SHIFT_SWAP_REQUESTED",
                "ShiftSwapRequest",
                saved.getId(),
                "Escala original=" + originalShift.getId() + "; compensacao=" + request.getCompensationDate()
        );
        return saved;
    }

    @Transactional
    public ShiftSwapRequest decideSwap(Long id, DecideShiftSwapRequest request, String userEmail) {
        Company company = resolveCompany(userEmail);
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id).orElseThrow();
        
        if (!Objects.equals(swap.getRequester().getCompany().getId(), company.getId())) {
             throw new org.springframework.security.access.AccessDeniedException("Nao autorizado");
        }

        if (swap.getStatus() != SwapStatus.PENDING && swap.getStatus() != SwapStatus.COLLEAGUE_APPROVED) {
            throw new IllegalStateException("Solicitacao ja decidida");
        }

        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(toDomainStatus(swap.getStatus()));
        StatusTroca statusGestor = fluxo.decidirPeloGestor(request.isApproved());
        swap.setStatus(toPersistenceStatus(statusGestor));
        swap.setAdminComments(request.getAdminComments());
        swap.setDecidedAt(OffsetDateTime.now());

        if (request.isApproved() && swap.getCompensationDate() != null) {
            WorkShift originalShift = swap.getOriginalShift();
            if (!workShiftRepository.existsByEmployeeIdAndShiftDate(
                    swap.getRequester().getId(),
                    swap.getCompensationDate()
            )) {
                workShiftRepository.save(WorkShift.builder()
                        .employee(swap.getRequester())
                        .shiftDate(swap.getCompensationDate())
                        .startTime(originalShift.getStartTime())
                        .endTime(originalShift.getEndTime())
                        .status(ShiftStatus.SCHEDULED)
                        .workMode(originalShift.getWorkMode())
                        .notes("Compensacao da troca #" + swap.getId())
                        .build());
            }
            originalShift.setStatus(ShiftStatus.CANCELLED);
            workShiftRepository.save(originalShift);
            if (request.isEffective()) {
                swap.setStatus(toPersistenceStatus(fluxo.efetivar()));
            }
        }

        ShiftSwapRequest saved = shiftSwapRequestRepository.save(swap);
        auditLogService.record(
                userEmail,
                request.isApproved() ? "SHIFT_SWAP_APPROVED" : "SHIFT_SWAP_REJECTED",
                "ShiftSwapRequest",
                saved.getId(),
                "Status=" + saved.getStatus() + "; comentarios=" + request.getAdminComments()
        );
        return saved;
    }

    @Transactional
    public ShiftSwapRequest approveByColleague(Long id, String userEmail) {
        Company company = resolveCompany(userEmail);
        ShiftSwapRequest swap = shiftSwapRequestRepository.findById(id).orElseThrow();
        
        if (!Objects.equals(swap.getRequester().getCompany().getId(), company.getId())) {
             throw new org.springframework.security.access.AccessDeniedException("Nao autorizado");
        }

        FluxoTrocaEscala fluxo = new FluxoTrocaEscala(toDomainStatus(swap.getStatus()));
        swap.setStatus(toPersistenceStatus(fluxo.aprovarPeloColega()));
        ShiftSwapRequest saved = shiftSwapRequestRepository.save(swap);
        auditLogService.record(
                userEmail,
                "SHIFT_SWAP_COLLEAGUE_APPROVED",
                "ShiftSwapRequest",
                saved.getId(),
                "Status=" + saved.getStatus()
        );
        return saved;
    }

    public List<ShiftSwapRequest> swapRequests(String userEmail) {
        Company company = resolveCompany(userEmail);
        return shiftSwapRequestRepository.findByRequesterCompanyIdOrderByCreatedAtDesc(company.getId());
    }

    private Employee resolveRequester(String userEmail) {
        return employeeRepository.findByUserEmail(userEmail)
                .or(() -> employeeRepository.findByEmail(userEmail))
                .orElseThrow();
    }

    private List<Employee> resolveEmployees(GenerateScheduleRequest request, Long companyId) {
        if (request.getEmployeeIds() == null || request.getEmployeeIds().isEmpty()) {
            return employeeRepository.findByActiveTrueAndCompanyIdOrderByFullNameAsc(companyId);
        }
        return employeeRepository.findByIdInAndActiveTrueAndCompanyId(request.getEmployeeIds(), companyId);
    }

    private void validateDailyCapacity(GenerateScheduleRequest request, LocalDate date, Long companyId, Map<LocalDate, Long> preloadedCounts) {
        if (request.getWorkMode() != WorkMode.PRESENCIAL || request.getMaxPresentialPerDay() == null) {
            return;
        }
        long presentialShifts = preloadedCounts != null
                ? preloadedCounts.getOrDefault(date, 0L)
                : workShiftRepository.countByEmployeeCompanyIdAndShiftDateAndWorkMode(companyId, date, WorkMode.PRESENCIAL);
        if (presentialShifts >= request.getMaxPresentialPerDay()) {
            throw new IllegalStateException("Lotacao presencial excedida para " + date);
        }
    }

    private void validateSectorCapacity(Employee employee, EscalaRequest request, LocalDate date, WorkMode workMode, Long ignoredShiftId, Long companyId) {
        if (workMode != WorkMode.PRESENCIAL) {
            return;
        }
        Sector sector = request.getSectorId() == null
                ? employee.getSector()
                : sectorRepository.findById(request.getSectorId()).orElseThrow();
        if (sector == null || sector.getMaxSeats() == null || sector.getMaxSeats() <= 0) {
            return;
        }
        long scheduled = ignoredShiftId == null
                ? workShiftRepository.countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorId(companyId, date, WorkMode.PRESENCIAL, sector.getId())
                : workShiftRepository.countByEmployeeCompanyIdAndShiftDateAndWorkModeAndEmployeeSectorIdAndIdNot(companyId, date, WorkMode.PRESENCIAL, sector.getId(), ignoredShiftId);
        if (scheduled >= sector.getMaxSeats()) {
            throw new IllegalStateException("Lotacao do setor " + sector.getName() + " excedida para " + date);
        }
    }

    private void applyEmployeeAllocation(Employee employee, EscalaRequest request) {
        boolean changed = false;

        if (request.getSectorId() != null
                && (employee.getSector() == null || !Objects.equals(employee.getSector().getId(), request.getSectorId()))) {
            employee.setSector(sectorRepository.findById(request.getSectorId()).orElseThrow());
            changed = true;
        }

        if (request.getProjectId() != null
                && (employee.getProject() == null || !Objects.equals(employee.getProject().getId(), request.getProjectId()))) {
            employee.setProject(projectRepository.findById(request.getProjectId()).orElseThrow());
            changed = true;
        }

        if (changed) {
            employeeRepository.save(employee);
        }
    }

    private void validateEmployeeSelection(Employee employee, EscalaRequest request) {
        if (request.getCompanyId() != null
                && (employee.getCompany() == null || !Objects.equals(employee.getCompany().getId(), request.getCompanyId()))) {
            throw new IllegalStateException("Funcionario nao pertence a empresa selecionada");
        }
        if (request.getSectorId() != null
                && (employee.getSector() == null || !Objects.equals(employee.getSector().getId(), request.getSectorId()))) {
            throw new IllegalStateException("Funcionario nao pertence ao setor selecionado");
        }
        if (request.getProjectId() != null
                && (employee.getProject() == null || !Objects.equals(employee.getProject().getId(), request.getProjectId()))) {
            throw new IllegalStateException("Funcionario nao pertence ao projeto selecionado");
        }
    }

    private String normalizeSearchQuery(String query) {
        if (query == null || query.isBlank()) {
            return null;
        }
        return query.trim().toLowerCase(Locale.ROOT);
    }

    private String employeeDateKey(Long employeeId, LocalDate date) {
        return employeeId + ":" + date;
    }

    private Employee selectEmployee(List<Employee> employees, Map<Long, Integer> allocationCount, Long previousEmployeeId) {
        return employees.stream()
                .filter(employee -> employees.size() == 1 || !Objects.equals(employee.getId(), previousEmployeeId))
                .min(Comparator
                        .comparing((Employee employee) -> allocationCount.getOrDefault(employee.getId(), 0))
                        .thenComparing(Employee::getFullName))
                .orElse(employees.get(0));
    }

    private void validateLaborRules(
            Employee employee,
            LocalDate date,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            PadraoEscala padraoEscala,
            Long ignoredShiftId,
            List<WorkShift> inMemoryShifts,
            Map<Long, List<WorkShift>> preloadedRelacionadasMap
    ) {
        JornadaPlanejada jornada = new JornadaPlanejada(
                employee.getId(),
                date,
                startTime,
                endTime,
                padraoEscala != null ? padraoEscala : PadraoEscala.COMUM
        );
        
        List<WorkShift> relatedFromDb = preloadedRelacionadasMap != null
                ? preloadedRelacionadasMap.getOrDefault(employee.getId(), List.of()).stream()
                    .filter(ws -> !ws.getShiftDate().isBefore(date.minusDays(7)) && !ws.getShiftDate().isAfter(date.plusDays(7)))
                    .filter(ws -> ignoredShiftId == null || !Objects.equals(ws.getId(), ignoredShiftId))
                    .toList()
                : workShiftRepository.findRelatedActiveShiftsForLaborRules(
                        employee.getId(),
                        employee.getCompany().getId(),
                        date.minusDays(7),
                        date.plusDays(7),
                        ignoredShiftId
                );

        List<JornadaPlanejada> relacionadas = new ArrayList<>(relatedFromDb
                .stream()
                .map(this::toJornadaPlanejada)
                .toList());

        relacionadas.addAll(inMemoryShifts.stream()
                .filter(shift -> shift.getEmployee() != null && Objects.equals(shift.getEmployee().getId(), employee.getId()))
                .filter(shift -> shift.getStatus() != ShiftStatus.CANCELLED)
                .map(this::toJornadaPlanejada)
                .toList());

        laborRuleEngine.validar(jornada, relacionadas).exigirAprovacao();
    }

    private JornadaPlanejada toJornadaPlanejada(WorkShift shift) {
        return new JornadaPlanejada(
                shift.getEmployee().getId(),
                shift.getShiftDate(),
                shift.getStartTime(),
                shift.getEndTime(),
                shift.getPadraoEscala() != null ? shift.getPadraoEscala() : PadraoEscala.COMUM
        );
    }

    private StatusTroca toDomainStatus(SwapStatus status) {
        return switch (status) {
            case PENDING -> StatusTroca.SOLICITADO;
            case COLLEAGUE_APPROVED -> StatusTroca.APROVADO_PELO_COLEGA;
            case APPROVED -> StatusTroca.APROVADO_PELO_GESTOR;
            case EFFECTIVE -> StatusTroca.EFETIVADO;
            case REJECTED -> StatusTroca.REJEITADO;
            case CANCELLED -> StatusTroca.CANCELADO;
        };
    }

    private SwapStatus toPersistenceStatus(StatusTroca status) {
        return switch (status) {
            case SOLICITADO, EM_ANALISE -> SwapStatus.PENDING;
            case APROVADO_PELO_COLEGA -> SwapStatus.COLLEAGUE_APPROVED;
            case APROVADO_PELO_GESTOR -> SwapStatus.APPROVED;
            case EFETIVADO -> SwapStatus.EFFECTIVE;
            case REJEITADO -> SwapStatus.REJECTED;
            case CANCELADO -> SwapStatus.CANCELLED;
        };
    }
}
