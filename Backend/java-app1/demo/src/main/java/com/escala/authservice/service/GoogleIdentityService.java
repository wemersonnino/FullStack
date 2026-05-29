package com.escala.authservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

@Service
public class GoogleIdentityService {
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String clientId;

    public GoogleIdentityService(
            ObjectMapper objectMapper,
            @Value("${application.security.google.client-id:}") String clientId
    ) {
        this.objectMapper = objectMapper;
        this.clientId = clientId;
    }

    public GoogleProfile verify(String idToken) {
        if (clientId == null || clientId.isBlank()) {
            throw new IllegalStateException("GOOGLE_CLIENT_ID nao configurado");
        }
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google idToken obrigatorio");
        }

        try {
            String encodedToken = URLEncoder.encode(idToken, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://oauth2.googleapis.com/tokeninfo?id_token=" + encodedToken))
                    .GET()
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Google idToken invalido");
            }
            JsonNode json = objectMapper.readTree(response.body());
            if (!clientId.equals(json.path("aud").asText())) {
                throw new IllegalArgumentException("Google audience invalida");
            }
            if (!"true".equals(json.path("email_verified").asText())) {
                throw new IllegalArgumentException("Email Google nao verificado");
            }
            return new GoogleProfile(
                    json.path("email").asText(),
                    json.path("name").asText(json.path("email").asText()),
                    json.path("sub").asText()
            );
        } catch (Exception exception) {
            throw new IllegalArgumentException("Falha ao validar Google idToken", exception);
        }
    }

    public record GoogleProfile(String email, String name, String subject) {
    }
}
