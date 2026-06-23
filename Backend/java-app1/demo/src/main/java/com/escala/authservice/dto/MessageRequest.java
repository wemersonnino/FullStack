package com.escala.authservice.dto;

import com.escala.authservice.entity.MessageType;
import lombok.Data;

@Data
public class MessageRequest {
    private Long receiverId;
    private MessageType type;
    private String title;
    private String content;
    private String metadata;
}
