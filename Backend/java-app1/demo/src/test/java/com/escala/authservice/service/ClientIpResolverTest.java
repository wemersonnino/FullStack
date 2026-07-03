package com.escala.authservice.service;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ClientIpResolverTest {

    @Test
    void returnsRemoteAddressWhenProxyIsNotTrusted() {
        ClientIpResolver resolver = new ClientIpResolver("");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("172.18.0.8");
        request.addHeader("X-Forwarded-For", "198.51.100.10");

        String resolved = resolver.resolve(request);

        assertEquals("172.18.0.8", resolved);
    }

    @Test
    void returnsForwardedAddressWhenProxyIsTrusted() {
        ClientIpResolver resolver = new ClientIpResolver("10.0.0.10, 127.0.0.1");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("10.0.0.10");
        request.addHeader("X-Forwarded-For", "198.51.100.10, 10.0.0.10");

        String resolved = resolver.resolve(request);

        assertEquals("198.51.100.10", resolved);
    }
}
