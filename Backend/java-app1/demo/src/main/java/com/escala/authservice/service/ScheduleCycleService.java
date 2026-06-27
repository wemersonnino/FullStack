package com.escala.authservice.service;

import com.escala.authservice.dto.scheduling.ScheduleCycleRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.ScheduleCycle;
import com.escala.authservice.entity.ScheduleCycleStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.ScheduleCycleRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.YearMonth;
import java.time.ZoneId;

@Service
@RequiredArgsConstructor
public class ScheduleCycleService {
    private static final String DEFAULT_TIMEZONE = "America/Sao_Paulo";

    private final ScheduleCycleRepository scheduleCycleRepository;
    private final UserRepository userRepository;

    @Transactional
    public ScheduleCycle createCycle(String email, ScheduleCycleRequest request) {
        User requester = getRequester(email);
        validate(request);
        String timezone = normalizeTimezone(request.timezone());

        scheduleCycleRepository.findActiveForPeriod(
                requester.getCompany().getId(),
                request.unitId(),
                request.year(),
                request.month(),
                ScheduleCycleStatus.ARQUIVADO
        ).ifPresent(existing -> {
            throw new IllegalStateException("Ja existe um ciclo ativo para a empresa, unidade e mes informados");
        });

        Company company = requester.getCompany();
        ScheduleCycle cycle = ScheduleCycle.builder()
                .company(company)
                .unitId(request.unitId())
                .year(request.year())
                .month(request.month())
                .timezone(timezone)
                .status(ScheduleCycleStatus.RASCUNHO)
                .businessVersion(1)
                .build();

        return scheduleCycleRepository.save(cycle);
    }

    public ScheduleCycle getCycle(String email, Long id) {
        User requester = getRequester(email);
        return scheduleCycleRepository.findByCompanyIdAndId(requester.getCompany().getId(), id)
                .orElseThrow(() -> new IllegalArgumentException("Ciclo de escala nao encontrado"));
    }

    private User getRequester(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
    }

    private void validate(ScheduleCycleRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Ciclo de escala e obrigatorio");
        }
        try {
            YearMonth.of(request.year(), request.month());
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Ano ou mes invalidos para criar ciclo de escala", exception);
        }
    }

    private String normalizeTimezone(String timezone) {
        String value = timezone == null || timezone.isBlank() ? DEFAULT_TIMEZONE : timezone.trim();
        try {
            return ZoneId.of(value).getId();
        } catch (DateTimeException exception) {
            throw new IllegalArgumentException("Timezone invalido para criar ciclo de escala", exception);
        }
    }
}
