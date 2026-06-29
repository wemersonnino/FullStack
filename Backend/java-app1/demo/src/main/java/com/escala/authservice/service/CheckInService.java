package com.escala.authservice.service;

import com.escala.authservice.dto.CheckInRequest;
import com.escala.authservice.entity.*;
import com.escala.authservice.repository.TimeRecordRepository;
import com.escala.authservice.repository.UserRepository;
import com.escala.authservice.core.commercial.usecase.CheckPlanLimitUseCase;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CheckInService {
    private final UserRepository userRepository;
    private final TimeRecordRepository timeRecordRepository;
    private final CheckPlanLimitUseCase checkPlanLimitUseCase;
    private final CurrentUserService currentUserService;

    public void validateAndRegister(String userEmail, CheckInRequest request, String ipAddress) {
        if (request == null || request.getLatitude() == null || request.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordenadas de geolocalização do check-in são obrigatórias");
        }
        if (request.getDeviceFingerprint() == null || request.getDeviceFingerprint().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Device fingerprint e obrigatorio");
        }
        if (ipAddress == null || ipAddress.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Endereco IP nao identificado");
        }
        User user = currentUserService.requireCurrentUser(userEmail);
        Company company = user.getCompany();

        if (company == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário não está vinculado a uma empresa");
        }

        if (company.getPlanType() == null) {
             throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Plano da empresa não definido");
        }

        if (company.getLatitude() == null || company.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Configuração de geolocalização da empresa pendente");
        }
        if (company.getAllowedRadius() == null || company.getAllowedRadius() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Raio permitido da empresa nao configurado");
        }

        checkPlanLimitUseCase.validateFeatureAccess(company.getPlanType(), "GEOLOCATION");

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
                .company(company)
                .recordTime(now)
                .type(nextType)
                .ipAddress(ipAddress)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .deviceFingerprint(request.getDeviceFingerprint().trim())
                .build();
        
        timeRecordRepository.save(record);
        log.info("Ponto {} registrado para {} via IP {} em {}", nextType, userEmail, ipAddress, now);
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
