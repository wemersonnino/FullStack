package com.escala.authservice.dto;

import com.escala.authservice.entity.Message;
import com.escala.authservice.entity.MessageStatus;
import com.escala.authservice.entity.MessageType;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class MessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private Long receiverId;
    private String receiverName;
    private String receiverEmail;
    private MessageType type;
    private String title;
    private String content;
    private MessageStatus status;
    private String metadata;
    private LocalDateTime createdAt;
    private LocalDateTime decidedAt;

    public static MessageResponse from(Message msg) {
        if (msg == null) return null;
        return MessageResponse.builder()
                .id(msg.getId())
                .senderId(msg.getSender() != null ? msg.getSender().getId() : null)
                .senderName(msg.getSender() != null ? msg.getSender().getUsername() : null)
                .senderEmail(msg.getSender() != null ? msg.getSender().getEmail() : null)
                .receiverId(msg.getReceiver() != null ? msg.getReceiver().getId() : null)
                .receiverName(msg.getReceiver() != null ? msg.getReceiver().getUsername() : null)
                .receiverEmail(msg.getReceiver() != null ? msg.getReceiver().getEmail() : null)
                .type(msg.getType())
                .title(msg.getTitle())
                .content(msg.getContent())
                .status(msg.getStatus())
                .metadata(msg.getMetadata())
                .createdAt(msg.getCreatedAt())
                .decidedAt(msg.getDecidedAt())
                .build();
    }
}
