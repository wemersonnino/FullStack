package com.escala.authservice.controller;

import com.escala.authservice.dto.LeadCaptureRequest;
import com.escala.authservice.dto.LeadCaptureResponse;
import com.escala.authservice.service.MarketingLeadService;
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

    @PostMapping
    public ResponseEntity<LeadCaptureResponse> capture(@RequestBody LeadCaptureRequest request) {
        return ResponseEntity.ok(marketingLeadService.capture(request));
    }
}
