package com.escala.authservice.service;

import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final SectorRepository sectorRepository;
    private final WorkShiftRepository workShiftRepository;
    private final AuditLogService auditLogService;
    private final PolicyService policyService;

    private User getRequester(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuario nao encontrado"));
    }

    public org.springframework.data.domain.Page<Message> listMessages(String email, MessageStatus status, org.springframework.data.domain.Pageable pageable) {
        User requester = getRequester(email);
        if (status != null) {
            return messageRepository.findByReceiverEmailAndStatusAndCompanyIdOrderByCreatedAtDesc(
                    email, status, requester.getCompany().getId(), pageable);
        }
        return messageRepository.findByReceiverEmailAndCompanyIdOrderByCreatedAtDesc(
                email, requester.getCompany().getId(), pageable);
    }

    @Transactional
    public Message createMessage(String senderEmail, Message request) {
        User sender = getRequester(senderEmail);
        validateMessageRequest(sender, request);
        
        User receiver = null;
        if (request.getReceiver() != null && request.getReceiver().getId() != null) {
            receiver = userRepository.findById(request.getReceiver().getId()).orElse(null);
            if (receiver != null && (receiver.getCompany() == null || !receiver.getCompany().getId().equals(sender.getCompany().getId()))) {
                throw new org.springframework.security.access.AccessDeniedException("Nao autorizado: Destinatario pertence a outra empresa");
            }
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .type(request.getType())
                .title(request.getTitle())
                .content(request.getContent())
                .status(MessageStatus.PENDING)
                .metadata(request.getMetadata())
                .company(sender.getCompany())
                .createdAt(LocalDateTime.now())
                .build();

        return messageRepository.save(message);
    }

    @Transactional
    public Message decide(UUID id, String decision, String deciderEmail) {
        User decider = getRequester(deciderEmail);
        Message message = messageRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Mensagem nao encontrada"));
        MessageStatus targetStatus = parseDecision(decision);

        if (!Objects.equals(message.getCompany().getId(), decider.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }
        if (message.getStatus() != MessageStatus.PENDING) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Somente mensagens pendentes podem ser decididas");
        }

        boolean isAdminOrOwner = decider.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        
        if (message.getReceiver() != null && !Objects.equals(message.getReceiver().getId(), decider.getId()) && !isAdminOrOwner) {
            throw new AccessDeniedException("Apenas o destinatario ou um administrador pode decidir");
        }

        message.setStatus(targetStatus);
        message.setDecidedAt(LocalDateTime.now());

        if (targetStatus == MessageStatus.APPROVED) {
            if (message.getType() == MessageType.PERMISSION_REQUEST) {
                applyPermissionRequest(deciderEmail, decider, message);
            } else if (message.getType() == MessageType.SHIFT_SWAP) {
                applyShiftSwap(deciderEmail, decider, message);
            }
        }

        auditLogService.record(deciderEmail, "MESSAGE_DECISION", "Message", id, 
                "Decisao: " + targetStatus + " para mensagem tipo " + message.getType());

        return messageRepository.save(message);
    }

    private void validateMessageRequest(User sender, Message request) {
        if (sender.getCompany() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuario sem empresa nao pode enviar mensagens");
        }
        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Mensagem obrigatoria");
        }
        if (request.getType() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo da mensagem obrigatorio");
        }
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Titulo obrigatorio");
        }
        if (request.getContent() == null || request.getContent().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Conteudo obrigatorio");
        }
        if ((request.getType() == MessageType.PERMISSION_REQUEST || request.getType() == MessageType.SHIFT_SWAP)
                && (request.getMetadata() == null || request.getMetadata().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Metadata obrigatoria para este tipo de mensagem");
        }
    }

    private MessageStatus parseDecision(String decision) {
        if ("APPROVED".equalsIgnoreCase(decision)) {
            return MessageStatus.APPROVED;
        }
        if ("REJECTED".equalsIgnoreCase(decision)) {
            return MessageStatus.REJECTED;
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Decisao invalida");
    }

    private void applyPermissionRequest(String deciderEmail, User decider, Message message) {
        UUID employeeId = requireMetadataUuid(message.getMetadata(), "employeeId");
        UUID sectorId = requireMetadataUuid(message.getMetadata(), "sectorId");

        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Funcionario da permissao nao encontrado"));
        Sector sector = sectorRepository.findById(sectorId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Setor da permissao nao encontrado"));

        policyService.requireCanAccessEmployee(decider, employee);
        if (sector.getCompany() == null || !Objects.equals(sector.getCompany().getId(), decider.getCompany().getId())) {
            throw new AccessDeniedException("Setor nao pertence a empresa do decisor");
        }

        employee.setSector(sector);
        employeeRepository.save(employee);
        auditLogService.record(deciderEmail, "EMPLOYEE_SECTOR_REASSIGNED", "Employee", employeeId,
                "Colaborador reatribuido ao setor " + sector.getName());
    }

    private void applyShiftSwap(String deciderEmail, User decider, Message message) {
        UUID shiftId1 = requireMetadataUuid(message.getMetadata(), "shiftId1");
        UUID shiftId2 = requireMetadataUuid(message.getMetadata(), "shiftId2");
        if (Objects.equals(shiftId1, shiftId2)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Troca exige duas escalas diferentes");
        }

        WorkShift shift1 = workShiftRepository.findById(shiftId1)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Primeira escala nao encontrada"));
        WorkShift shift2 = workShiftRepository.findById(shiftId2)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Segunda escala nao encontrada"));

        policyService.requireCanAccessShift(decider, shift1);
        policyService.requireCanAccessShift(decider, shift2);

        Employee emp1 = shift1.getEmployee();
        Employee emp2 = shift2.getEmployee();
        shift1.setEmployee(emp2);
        shift2.setEmployee(emp1);

        workShiftRepository.save(shift1);
        workShiftRepository.save(shift2);

        auditLogService.record(deciderEmail, "SHIFT_SWAP_EXECUTED", "WorkShift", shiftId1,
                "Troca executada entre " + emp1.getFullName() + " e " + emp2.getFullName());
    }

    private UUID requireMetadataUuid(String metadata, String key) {
        UUID parsed = parseUuidFromMetadata(metadata, key);
        if (parsed == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Metadata obrigatoria ausente: " + key);
        }
        return parsed;
    }

    private UUID parseUuidFromMetadata(String metadata, String key) {
        if (metadata == null) return null;
        String pattern = "\"" + key + "\"\\s*:\\s*\"?([0-9a-fA-F-]{36})\"?";
        java.util.regex.Pattern r = java.util.regex.Pattern.compile(pattern);
        java.util.regex.Matcher m = r.matcher(metadata);
        if (m.find()) {
            return UUID.fromString(m.group(1));
        }
        pattern = key + "\\s*:\\s*([0-9a-fA-F-]{36})";
        r = java.util.regex.Pattern.compile(pattern);
        m = r.matcher(metadata);
        if (m.find()) {
            return UUID.fromString(m.group(1));
        }
        return null;
    }
}
