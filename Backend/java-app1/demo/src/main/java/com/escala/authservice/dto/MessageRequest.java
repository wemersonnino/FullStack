package com.escala.authservice.dto;

import java.util.UUID;

import com.escala.authservice.entity.MessageType;
import lombok.Data;

@Data
public class MessageRequest {
    private UUID receiverId;
    private MessageType type;
    private String title;
    private String content;
    private String metadata;
}
