package com.escala.authservice.service;

import com.escala.authservice.dto.CheckInRequest;
import com.escala.authservice.entity.Company;
import com.escala.authservice.entity.User;
import com.escala.authservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class CheckInService {
    private final UserRepository userRepository;

    public void validateAndRegister(String userEmail, CheckInRequest request, String ipAddress) {
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        Company company = user.getCompany();

        if (company == null || company.getLatitude() == null || company.getLongitude() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Configuração de geolocalização da empresa pendente");
        }

        double distance = calculateDistance(
                request.getLatitude(), request.getLongitude(),
                company.getLatitude(), company.getLongitude()
        );

        if (distance > company.getAllowedRadius()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, 
                String.format("Fora do raio permitido. Distância: %.2fm, Máximo: %dm", distance, company.getAllowedRadius()));
        }

        // Aqui salvaríamos na tabela de registros de ponto (AuditLog ou WorkShift)
        System.out.println("Ponto validado para " + userEmail + " via IP " + ipAddress + " em " + OffsetDateTime.now());
    }

    /**
     * Calcula a distância em metros entre dois pontos usando a fórmula de Haversine.
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double longitude2) {
        final int R = 6371; // Raio da terra em KM

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(longitude2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        double distance = R * c * 1000; // converter para metros

        return distance;
    }
}
