package com.escala.authservice.dto;

import lombok.Data;

@Data
public class TeamInvitationRequest {
    private String email;
    private String roleName;
}
