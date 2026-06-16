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
        Company company = resolveCompany(userEmail);
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
