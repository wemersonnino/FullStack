package com.escala.authservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.URI;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class PublicContentService {
    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public PublicContentService(
            RestClient.Builder restClientBuilder,
            ObjectMapper objectMapper,
            @Value("${application.integrations.strapi.base-url}") String strapiBaseUrl
    ) {
        this.restClient = restClientBuilder.baseUrl(strapiBaseUrl).build();
        this.objectMapper = objectMapper;
    }

    public String getLandingPage(String locale, String pageKey, String slug) {
        JsonNode response = fetch(buildLandingPageUri(locale));
        List<JsonNode> items = extractItems(response);
        if (items.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Landing page nao encontrada");
        }

        JsonNode selected = selectLandingPage(items, pageKey, slug);
        if (selected == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Landing page nao encontrada");
        }
        return toJson(selected);
    }

    public String getPricingPlans(String locale) {
        return fetchRawJson(UriComponentsBuilder.fromPath("/api/pricing-plan-contents")
                .queryParam("filters[active][$eq]", true)
                .queryParam("sort", "order:asc")
                .queryParamIfPresent("locale", optional(locale))
                .build()
                .toUri());
    }

    public String getTestimonials(String locale) {
        return fetchRawJson(UriComponentsBuilder.fromPath("/api/testimonials")
                .queryParam("sort", "updatedAt:desc")
                .queryParamIfPresent("locale", optional(locale))
                .build()
                .toUri());
    }

    private URI buildLandingPageUri(String locale) {
        return UriComponentsBuilder.fromPath("/api/landing-pages")
                .queryParam("sort", "updatedAt:desc")
                .queryParam("populate[heroImage]", true)
                .queryParam("populate[heroBackgroundImage]", true)
                .queryParam("populate[sectionBackgroundImage]", true)
                .queryParam("populate[features][sort]", "order:asc")
                .queryParam("populate[industries][sort]", "order:asc")
                .queryParam("populate[pricingPlans][sort]", "order:asc")
                .queryParam("populate[faqs][sort]", "order:asc")
                .queryParam("populate[ctaButtons][sort]", "order:asc")
                .queryParam("populate[seo]", true)
                .queryParamIfPresent("locale", optional(locale))
                .build()
                .toUri();
    }

    private JsonNode fetch(URI uri) {
        try {
            JsonNode response = restClient.get().uri(uri).retrieve().body(JsonNode.class);
            return response == null ? null : response;
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Conteudo publico indisponivel", exception);
        }
    }

    private String fetchRawJson(URI uri) {
        try {
            String response = restClient.get().uri(uri).retrieve().body(String.class);
            return response == null ? "{}" : response;
        } catch (RestClientException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Conteudo publico indisponivel", exception);
        }
    }

    private List<JsonNode> extractItems(JsonNode response) {
        if (response == null) {
            return List.of();
        }

        JsonNode data = response.path("data");
        if (data.isArray()) {
            List<JsonNode> items = new ArrayList<>();
            data.forEach(items::add);
            return items;
        }
        if (data.isMissingNode() || data.isNull()) {
            return List.of();
        }
        return List.of(data);
    }

    private JsonNode selectLandingPage(List<JsonNode> items, String pageKey, String slug) {
        String normalizedSlug = normalize(slug);
        String normalizedPageKey = normalize(pageKey == null || pageKey.isBlank() ? "home" : pageKey);

        for (JsonNode item : items) {
            JsonNode attrs = attributes(item);
            if (normalizedSlug != null && normalizedSlug.equals(normalize(attrs.path("slug").asText(null)))) {
                return item;
            }
            if (normalizedSlug == null && normalizedPageKey.equals(normalize(attrs.path("pageKey").asText(null)))) {
                return item;
            }
        }

        if (normalizedSlug == null && "home".equals(normalizedPageKey)) {
            for (JsonNode item : items) {
                JsonNode attrs = attributes(item);
                String candidateSlug = normalize(attrs.path("slug").asText(null));
                if ("home".equals(candidateSlug) || "landpage-home".equals(candidateSlug)) {
                    return item;
                }
            }
        }

        return items.getFirst();
    }

    private JsonNode attributes(JsonNode item) {
        JsonNode attributes = item.path("attributes");
        return attributes.isMissingNode() || attributes.isNull() ? item : attributes;
    }

    private java.util.Optional<String> optional(String value) {
        return value == null || value.isBlank()
                ? java.util.Optional.empty()
                : java.util.Optional.of(value.trim());
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toLowerCase(Locale.ROOT);
    }

    private String toJson(JsonNode node) {
        try {
            return objectMapper.writeValueAsString(node);
        } catch (JacksonException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao serializar conteudo publico", exception);
        }
    }
}
