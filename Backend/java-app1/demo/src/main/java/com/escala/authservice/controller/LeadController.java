package com.escala.authservice.controller;

import com.escala.authservice.dto.LeadCaptureRequest;
import com.escala.authservice.dto.LeadCaptureResponse;
import com.escala.authservice.service.MarketingLeadService;
import com.escala.authservice.service.PublicEndpointProtectionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final MarketingLeadService marketingLeadService;
    private final PublicEndpointProtectionService publicEndpointProtectionService;

    @PostMapping
    public ResponseEntity<LeadCaptureResponse> capture(@RequestBody LeadCaptureRequest request, HttpServletRequest servletRequest) {
        publicEndpointProtectionService.protectLead(
                servletRequest,
                request.getEmail(),
                request.getCompanyName(),
                request.getCampaignSlug(),
                request.getRecaptchaToken()
        );
        return ResponseEntity.ok(marketingLeadService.capture(request));
    }
}
