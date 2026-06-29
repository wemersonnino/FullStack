package com.escala.authservice.service;

import com.escala.authservice.dto.OperationalCapacityRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.OperationalCapacity;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.OperationalCapacityRepository;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.List;
import java.util.UUID;
import java.util.Objects;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class OperationalCapacityService {
    private static final Set<String> ALLOWED_TARGET_TYPES = Set.of("SECTOR", "WORK_POST");

    private final OperationalCapacityRepository operationalCapacityRepository;
    private final PolicyService policyService;
    private final CurrentUserService currentUserService;

    private User getRequester(String email) {
        return currentUserService.requireCurrentUser(email);
    }

    public List<OperationalCapacity> listCapacities(String email) {
        User requester = getRequester(email);
        policyService.requireCanManageSchedules(requester);
        return operationalCapacityRepository.findByCompanyIdAndActiveTrue(requester.getCompany().getId());
    }

    public List<OperationalCapacity> listByTarget(String email, UUID targetId, String targetType) {
        User requester = getRequester(email);
        policyService.requireCanManageSchedules(requester);
        return operationalCapacityRepository.findByCompanyIdAndTargetIdAndTargetTypeAndActiveTrue(
                requester.getCompany().getId(),
                Objects.requireNonNull(targetId, "targetId obrigatorio"),
                normalizeTargetType(targetType)
        );
    }

    @Transactional
    public OperationalCapacity createCapacity(String email, OperationalCapacityRequest request) {
        User requester = getRequester(email);
        policyService.requireOwnerOrAdmin(requester, "Apenas OWNER ou ADMIN podem definir capacidades operacionais");
        Company company = requester.getCompany();
        validate(request);

        OperationalCapacity capacity = OperationalCapacity.builder()
                .targetId(request.getTargetId())
                .targetType(normalizeTargetType(request.getTargetType()))
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .minEmployeesRequired(request.getMinEmployeesRequired())
                .company(company)
                .build();

        return operationalCapacityRepository.save(capacity);
    }

    @Transactional
    public OperationalCapacity updateCapacity(String email, UUID id, OperationalCapacityRequest request) {
        User requester = getRequester(email);
        policyService.requireOwnerOrAdmin(requester, "Apenas OWNER ou ADMIN podem alterar capacidades operacionais");
        OperationalCapacity capacity = operationalCapacityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Capacidade operacional nao encontrada"));
        validate(request);

        if (!Objects.equals(capacity.getCompany().getId(), requester.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        capacity.setTargetId(request.getTargetId());
        capacity.setTargetType(normalizeTargetType(request.getTargetType()));
        capacity.setDayOfWeek(request.getDayOfWeek());
        capacity.setStartTime(request.getStartTime());
        capacity.setEndTime(request.getEndTime());
        capacity.setMinEmployeesRequired(request.getMinEmployeesRequired());

        return operationalCapacityRepository.save(capacity);
    }

    @Transactional
    public void deleteCapacity(String email, UUID id) {
        User requester = getRequester(email);
        policyService.requireOwnerOrAdmin(requester, "Apenas OWNER ou ADMIN podem excluir capacidades operacionais");
        OperationalCapacity capacity = operationalCapacityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Capacidade operacional nao encontrada"));

        if (!Objects.equals(capacity.getCompany().getId(), requester.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        capacity.setActive(false);
        operationalCapacityRepository.save(capacity);
    }

    private void validate(OperationalCapacityRequest request) {
        Objects.requireNonNull(request, "Dados da capacidade operacional sao obrigatorios");
        Objects.requireNonNull(request.getTargetId(), "targetId obrigatorio");
        normalizeTargetType(request.getTargetType());
        if (request.getDayOfWeek() == null || request.getDayOfWeek() < 1 || request.getDayOfWeek() > 7) {
            throw new IllegalArgumentException("dayOfWeek deve estar entre 1 e 7");
        }
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new IllegalArgumentException("startTime e endTime sao obrigatorios");
        }
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("startTime deve ser anterior a endTime");
        }
        if (request.getMinEmployeesRequired() == null || request.getMinEmployeesRequired() < 1) {
            throw new IllegalArgumentException("minEmployeesRequired deve ser maior que zero");
        }
    }

    private String normalizeTargetType(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("targetType obrigatorio");
        }

        String normalized = value.trim().toUpperCase(Locale.ROOT);
        if (!ALLOWED_TARGET_TYPES.contains(normalized)) {
            throw new IllegalArgumentException("targetType invalido");
        }
        return normalized;
    }
}
