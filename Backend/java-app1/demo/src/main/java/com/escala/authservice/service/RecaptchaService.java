package com.escala.authservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

@Service
public class RecaptchaService {
    private final Environment environment;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final String secret;

    public RecaptchaService(
            Environment environment,
            ObjectMapper objectMapper,
            @Value("${application.security.recaptcha.secret:}") String secret
    ) {
        this.environment = environment;
        this.objectMapper = objectMapper;
        this.secret = secret;
    }

    public void verifyIfProduction(String token) {
        boolean production = Arrays.asList(environment.getActiveProfiles()).contains("production");
        if (!production) {
            return;
        }
        if (token == null || token.isBlank() || secret == null || secret.isBlank()) {
            throw new IllegalArgumentException("reCAPTCHA obrigatorio em producao");
        }

        try {
            String body = "secret=" + URLEncoder.encode(secret, StandardCharsets.UTF_8)
                    + "&response=" + URLEncoder.encode(token, StandardCharsets.UTF_8);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://www.google.com/recaptcha/api/siteverify"))
                    .header("Content-Type", "application/x-www-form-urlencoded")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            JsonNode json = objectMapper.readTree(response.body());
            if (!json.path("success").asBoolean(false)) {
                throw new IllegalArgumentException("Falha na verificacao reCAPTCHA");
            }
        } catch (Exception exception) {
            throw new IllegalArgumentException("Falha na verificacao reCAPTCHA", exception);
        }
    }
}
