package com.escala.authservice.service;

import com.escala.authservice.dto.CheckInRequest;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.TimeRecordRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckInService {
    private final UserRepository userRepository;
    private final TimeRecordRepository timeRecordRepository;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;

    public void validateAndRegister(String userEmail, CheckInRequest request, String ipAddress) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Company company = user.getCompany();

        // 1. Validar plano
        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "GEOLOCATION");

        if (company == null || company.getLatitude() == null || company.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Configuração de geolocalização da empresa pendente");
        }

        // 2. Validar distância
        double distance = calculateDistance(
                request.getLatitude(), request.getLongitude(),
                company.getLatitude(), company.getLongitude()
        );

        if (distance > company.getAllowedRadius()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                String.format("Fora do raio permitido. Distância: %.2fm, Máximo: %dm", distance, company.getAllowedRadius()));
        }

        // 3. Determinar tipo de registro (ENTRY/EXIT)
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime startOfDay = now.with(LocalTime.MIN);
        OffsetDateTime endOfDay = now.with(LocalTime.MAX);
        
        List<TimeRecord> todayRecords = timeRecordRepository.findByUserAndRecordTimeBetweenOrderByRecordTimeAsc(user, startOfDay, endOfDay);
        
        TimeRecordType nextType = todayRecords.isEmpty() ? TimeRecordType.ENTRY : TimeRecordType.EXIT;
        
        // Lógica simples: alterna entre ENTRY e EXIT. Em um sistema real, haveria BREAK_START/END
        if (!todayRecords.isEmpty()) {
            TimeRecordType lastType = todayRecords.get(todayRecords.size() - 1).getType();
            nextType = (lastType == TimeRecordType.ENTRY) ? TimeRecordType.EXIT : TimeRecordType.ENTRY;
        }

        // 4. Salvar registro
        TimeRecord record = TimeRecord.builder()
                .user(user)
                .recordTime(now)
                .type(nextType)
                .ipAddress(ipAddress)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .deviceFingerprint(request.getDeviceFingerprint())
                .build();
        
        timeRecordRepository.save(record);
        System.out.println("Ponto " + nextType + " registrado para " + userEmail + " via IP " + ipAddress + " em " + now);
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double longitude2) {
        final int R = 6371; // Raio da terra em KM
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(longitude2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c * 1000;
    }
}
