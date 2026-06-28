package com.escala.authservice.controller;

import com.escala.authservice.dto.MessageDecisionRequest;
import com.escala.authservice.dto.MessageRequest;
import com.escala.authservice.dto.MessageResponse;
import com.escala.authservice.entity.Message;
import com.escala.authservice.entity.MessageStatus;
import com.escala.authservice.entity.User;
import com.escala.authservice.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<MessageResponse>> getMessages(
            Authentication authentication,
            @RequestParam(required = false) MessageStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<MessageResponse> response = messageService
                .listMessages(authentication.getName(), status, pageable)
                .map(MessageResponse::from);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<MessageResponse> createMessage(
            Authentication authentication,
            @RequestBody MessageRequest request
    ) {
        User receiver = null;
        if (request.getReceiverId() != null) {
            receiver = User.builder().id(request.getReceiverId()).build();
        }
        Message message = Message.builder()
                .receiver(receiver)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .metadata(request.getMetadata())
                .build();
        Message saved = messageService.createMessage(authentication.getName(), message);
        return ResponseEntity.ok(MessageResponse.from(saved));
    }

    @PatchMapping("/{id}/decision")
    public ResponseEntity<MessageResponse> decideMessage(
            Authentication authentication,
            @PathVariable UUID id,
            @RequestBody MessageDecisionRequest request
    ) {
        Message decided = messageService.decide(id, request.getDecision(), authentication.getName());
        return ResponseEntity.ok(MessageResponse.from(decided));
    }
}
