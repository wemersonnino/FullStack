package com.escala.authservice.service;

import com.escala.authservice.dto.DashboardSummaryResponse;
import com.escala.authservice.dto.MarketingStatsResponse;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
    private final UserRepository userRepository;

    private Company resolveCompany(String userEmail) {
        return userRepository.findByEmail(userEmail)
                .map(User::getCompany)
                .orElseThrow(() -> new IllegalArgumentException("Usuario ou empresa nao encontrados"));
    }

    public DashboardSummaryResponse getSummary(int year, int month, String userEmail) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        
        boolean isSystemAdmin = user.getRoles().stream().anyMatch(r -> r.getName().equals("SYSTEM_ADMIN"));
        boolean isManagerOrAdmin = isSystemAdmin || user.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER") || r.getName().equals("MANAGER") || r.getName().startsWith("MANAGER_"));
        if (!isManagerOrAdmin) {
            throw new org.springframework.security.access.AccessDeniedException("Acesso negado: Apenas gestores podem acessar as estatisticas do dashboard");
        }
        
        Company company = user.getCompany();
        if (company == null) {
            throw new IllegalArgumentException("Usuario nao esta vinculado a uma empresa");
        }
        
        YearMonth yearMonth = YearMonth.of(year, month);
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
