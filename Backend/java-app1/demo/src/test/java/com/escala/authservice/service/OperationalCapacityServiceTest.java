package com.escala.authservice.service;

import com.escala.authservice.dto.OperationalCapacityRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.OperationalCapacity;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.OperationalCapacityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OperationalCapacityServiceTest {

    @Mock
    private OperationalCapacityRepository operationalCapacityRepository;

    @Mock
    private PolicyService policyService;

    @Mock
    private CurrentUserService currentUserService;

    @InjectMocks
    private OperationalCapacityService operationalCapacityService;

    @Test
    void createCapacityNormalizesTargetType() {
        Company company = Company.builder().id(UUID.randomUUID()).build();
        User requester = User.builder().email("owner@example.com").company(company).build();
        OperationalCapacityRequest request = new OperationalCapacityRequest();
        request.setTargetId(UUID.randomUUID());
        request.setTargetType("sector");
        request.setDayOfWeek(1);
        request.setStartTime(LocalTime.of(8, 0));
        request.setEndTime(LocalTime.of(18, 0));
        request.setMinEmployeesRequired(2);

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(requester);
        when(operationalCapacityRepository.save(any(OperationalCapacity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OperationalCapacity saved = operationalCapacityService.createCapacity("owner@example.com", request);

        assertEquals("SECTOR", saved.getTargetType());
    }

    @Test
    void createCapacityRejectsInvalidTimeRange() {
        Company company = Company.builder().id(UUID.randomUUID()).build();
        User requester = User.builder().email("owner@example.com").company(company).build();
        OperationalCapacityRequest request = new OperationalCapacityRequest();
        request.setTargetId(UUID.randomUUID());
        request.setTargetType("SECTOR");
        request.setDayOfWeek(1);
        request.setStartTime(LocalTime.of(18, 0));
        request.setEndTime(LocalTime.of(8, 0));
        request.setMinEmployeesRequired(2);

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(requester);

        assertThrows(IllegalArgumentException.class, () -> operationalCapacityService.createCapacity("owner@example.com", request));
    }

    @Test
    void deleteCapacityPerformsSoftDelete() {
        Company company = Company.builder().id(UUID.randomUUID()).build();
        User requester = User.builder().email("owner@example.com").company(company).build();
        OperationalCapacity capacity = OperationalCapacity.builder()
                .id(UUID.randomUUID())
                .company(company)
                .targetId(UUID.randomUUID())
                .targetType("SECTOR")
                .dayOfWeek(1)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(18, 0))
                .minEmployeesRequired(2)
                .active(true)
                .build();

        when(currentUserService.requireCurrentUser("owner@example.com")).thenReturn(requester);
        when(operationalCapacityRepository.findById(capacity.getId())).thenReturn(Optional.of(capacity));

        operationalCapacityService.deleteCapacity("owner@example.com", capacity.getId());

        assertEquals(false, capacity.isActive());
        verify(operationalCapacityRepository).save(capacity);
    }
}
