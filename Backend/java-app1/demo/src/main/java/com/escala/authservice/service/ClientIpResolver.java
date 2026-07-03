package com.escala.authservice.service;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ClientIpResolver {

    private final Set<String> trustedProxies;

    public ClientIpResolver(@Value("${application.security.trusted-proxies:}") String trustedProxies) {
        this.trustedProxies = Arrays.stream(trustedProxies.split(","))
                .map(String::trim)
                .filter(value -> !value.isBlank())
                .collect(Collectors.toUnmodifiableSet());
    }

    public String resolve(HttpServletRequest request) {
        String remoteAddress = normalizeSingleIp(request.getRemoteAddr());
        if (remoteAddress == null) {
            return null;
        }

        if (!trustedProxies.contains(remoteAddress)) {
            return remoteAddress;
        }

        String forwardedFor = normalizeSingleIp(request.getHeader("X-Forwarded-For"));
        if (forwardedFor != null) {
            return forwardedFor;
        }

        String realIp = normalizeSingleIp(request.getHeader("X-Real-IP"));
        if (realIp != null) {
            return realIp;
        }

        return remoteAddress;
    }

    private String normalizeSingleIp(String value) {
        if (value == null) {
            return null;
        }

        String firstValue = value.split(",")[0].trim();
        return firstValue.isBlank() || "unknown".equalsIgnoreCase(firstValue) ? null : firstValue;
    }
}
