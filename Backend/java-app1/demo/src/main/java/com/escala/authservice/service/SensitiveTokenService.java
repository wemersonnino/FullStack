package com.escala.authservice.service;

import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;

@Service
public class SensitiveTokenService {
    private static final SecureRandom RANDOM = new SecureRandom();

    public IssuedToken issue() {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String plainToken = toHex(bytes);
        return new IssuedToken(plainToken, sha256Hex(plainToken), plainToken.substring(plainToken.length() - 6));
    }

    public String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return toHex(digest.digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 nao disponivel no runtime", exception);
        }
    }

    private String toHex(byte[] bytes) {
        StringBuilder builder = new StringBuilder(bytes.length * 2);
        for (byte current : bytes) {
            builder.append(String.format("%02x", current));
        }
        return builder.toString();
    }

    public record IssuedToken(String plainText, String hash, String preview) {
    }
}
