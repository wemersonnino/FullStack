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

import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class OperationalCapacityService {

    private final OperationalCapacityRepository operationalCapacityRepository;
    private final UserRepository userRepository;

    private User getRequester(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
    }

    public List<OperationalCapacity> listCapacities(String email) {
        User requester = getRequester(email);
        return operationalCapacityRepository.findByCompanyId(requester.getCompany().getId());
    }

    public List<OperationalCapacity> listByTarget(String email, Long targetId, String targetType) {
        User requester = getRequester(email);
        List<OperationalCapacity> capacities = operationalCapacityRepository.findByTargetIdAndTargetType(targetId, targetType);
        return capacities.stream()
                .filter(c -> Objects.equals(c.getCompany().getId(), requester.getCompany().getId()))
                .toList();
    }

    @Transactional
    public OperationalCapacity createCapacity(String email, OperationalCapacityRequest request) {
        User requester = getRequester(email);
        Company company = requester.getCompany();

        OperationalCapacity capacity = OperationalCapacity.builder()
                .targetId(request.getTargetId())
                .targetType(request.getTargetType())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .minEmployeesRequired(request.getMinEmployeesRequired())
                .company(company)
                .build();

        return operationalCapacityRepository.save(capacity);
    }

    @Transactional
    public OperationalCapacity updateCapacity(String email, Long id, OperationalCapacityRequest request) {
        User requester = getRequester(email);
        OperationalCapacity capacity = operationalCapacityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Capacidade operacional nao encontrada"));

        if (!Objects.equals(capacity.getCompany().getId(), requester.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        capacity.setTargetId(request.getTargetId());
        capacity.setTargetType(request.getTargetType());
        capacity.setDayOfWeek(request.getDayOfWeek());
        capacity.setStartTime(request.getStartTime());
        capacity.setEndTime(request.getEndTime());
        capacity.setMinEmployeesRequired(request.getMinEmployeesRequired());

        return operationalCapacityRepository.save(capacity);
    }

    @Transactional
    public void deleteCapacity(String email, Long id) {
        User requester = getRequester(email);
        OperationalCapacity capacity = operationalCapacityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Capacidade operacional nao encontrada"));

        if (!Objects.equals(capacity.getCompany().getId(), requester.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        operationalCapacityRepository.delete(capacity);
    }
}
