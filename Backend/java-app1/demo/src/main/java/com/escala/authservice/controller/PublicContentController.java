package com.escala.authservice.controller;

import com.escala.authservice.service.PublicContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/content")
@RequiredArgsConstructor
public class PublicContentController {
    private final PublicContentService publicContentService;

    @GetMapping("/landing")
    public ResponseEntity<String> getLandingPage(
            @RequestParam(required = false) String locale,
            @RequestParam(defaultValue = "home") String pageKey,
            @RequestParam(required = false) String slug
    ) {
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(publicContentService.getLandingPage(locale, pageKey, slug));
    }

    @GetMapping("/pricing-plans")
    public ResponseEntity<String> getPricingPlans(@RequestParam(required = false) String locale) {
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(publicContentService.getPricingPlans(locale));
    }

    @GetMapping("/testimonials")
    public ResponseEntity<String> getTestimonials(@RequestParam(required = false) String locale) {
        return ResponseEntity
                .ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(publicContentService.getTestimonials(locale));
    }
}
