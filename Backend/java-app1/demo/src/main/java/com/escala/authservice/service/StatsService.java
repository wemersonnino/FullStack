package com.escala.authservice.service;

import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.MarketingStatsResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.YearMonth;

@Service
@RequiredArgsConstructor
public class StatsService {
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final WorkShiftRepository workShiftRepository;
    private final ShiftSwapRequestRepository shiftSwapRequestRepository;
    private final AbsenceRepository absenceRepository;
    private final MarketingLeadRepository marketingLeadRepository;
    private final CompanyRepository companyRepository;
    private final AiUsageRepository aiUsageRepository;
    private final CurrentUserService currentUserService;
    private final PolicyService policyService;

    private Company resolveCompany(String userEmail) {
        Company company = currentUserService.requireCurrentUser(userEmail).getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Usuario ou empresa nao encontrados");
        }
        return company;
    }

    public DashboardSummaryResponse getSummary(int year, int month, String userEmail) {
        User user = currentUserService.requireCurrentUser(userEmail);
        boolean isManagerOrAdmin = policyService.canManageSchedules(user);
        if (!isManagerOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Acesso negado: Apenas gestores podem acessar as estatisticas do dashboard");
        }
        
        Company company = user.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Usuario nao esta vinculado a uma empresa");
        }
        
        YearMonth yearMonth;
        try {
            yearMonth = YearMonth.of(year, month);
        } catch (DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Parametros year/month invalidos", exception);
        }
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return DashboardSummaryResponse.builder()
                .activeEmployees(employeeRepository.countByActiveTrueAndCompanyId(company.getId()))
                .activeProjects(projectRepository.countByActiveTrueAndCompanyId(company.getId()))
                .shiftsInMonth(workShiftRepository.countByEmployeeCompanyIdAndShiftDateBetween(company.getId(), start, end))
                .pendingSwapRequests(shiftSwapRequestRepository.countByStatusAndRequesterCompanyId(com.escala.authservice.entity.SwapStatus.PENDING, company.getId()))
                .absencesInMonth(absenceRepository.countByEmployeeCompanyIdAndAbsenceDateBetween(company.getId(), start, end))
                .attendanceRate(95) // Mock
                .openShifts(12) // Mock
                .build();
    }

    public MarketingStatsResponse getMarketingStats() {
        long totalLeads = marketingLeadRepository.count();
        long converted = marketingLeadRepository.countByConvertedTrue();
        long activeTrials = companyRepository.countByPlanType("TRIAL");
        long aiUsage = aiUsageRepository.countByUsedAtAfter(OffsetDateTime.now().withDayOfMonth(1));

        return MarketingStatsResponse.builder()
                .totalLeads(totalLeads)
                .activeTrials(activeTrials)
                .convertedToPaid(converted)
                .aiRequestsThisMonth(aiUsage)
                .conversionRate(totalLeads > 0 ? (double) converted / totalLeads * 100 : 0)
                .build();
    }
}
