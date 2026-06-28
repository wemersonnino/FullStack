package com.escala.authservice.service;

import com.escala.authservice.entity.*;
import com.escala.authservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        if (!Objects.equals(message.getCompany().getId(), decider.getCompany().getId())) {
            throw new AccessDeniedException("Acesso negado");
        }

        boolean isAdminOrOwner = decider.getRoles().stream()
                .anyMatch(r -> r.getName().equals("ADMIN") || r.getName().equals("OWNER"));
        
        if (message.getReceiver() != null && !Objects.equals(message.getReceiver().getId(), decider.getId()) && !isAdminOrOwner) {
            throw new AccessDeniedException("Apenas o destinatario ou um administrador pode decidir");
        }

        MessageStatus targetStatus = "APPROVED".equalsIgnoreCase(decision) ? MessageStatus.APPROVED : MessageStatus.REJECTED;
        message.setStatus(targetStatus);
        message.setDecidedAt(LocalDateTime.now());

        if (targetStatus == MessageStatus.APPROVED) {
            if (message.getType() == MessageType.PERMISSION_REQUEST) {
                try {
                    String meta = message.getMetadata();
                    if (meta != null) {
                        UUID employeeId = parseUuidFromMetadata(meta, "employeeId");
                        UUID sectorId = parseUuidFromMetadata(meta, "sectorId");
                        if (employeeId != null && sectorId != null) {
                            Employee employee = employeeRepository.findById(employeeId).orElseThrow();
                            Sector sector = sectorRepository.findById(sectorId).orElseThrow();
                            employee.setSector(sector);
                            employeeRepository.save(employee);
                            auditLogService.record(deciderEmail, "EMPLOYEE_SECTOR_REASSIGNED", "Employee", employeeId, 
                                    "Colaborador reatribuido ao setor " + sector.getName());
                        }
                    }
                } catch (Exception e) {
                    // Fail silently or handle
                }
            } else if (message.getType() == MessageType.SHIFT_SWAP) {
                try {
                    String meta = message.getMetadata();
                    if (meta != null) {
                        UUID shiftId1 = parseUuidFromMetadata(meta, "shiftId1");
                        UUID shiftId2 = parseUuidFromMetadata(meta, "shiftId2");
                        if (shiftId1 != null && shiftId2 != null) {
                            WorkShift shift1 = workShiftRepository.findById(shiftId1).orElseThrow();
                            WorkShift shift2 = workShiftRepository.findById(shiftId2).orElseThrow();
                            
                            Employee emp1 = shift1.getEmployee();
                            Employee emp2 = shift2.getEmployee();
                            shift1.setEmployee(emp2);
                            shift2.setEmployee(emp1);
                            
                            workShiftRepository.save(shift1);
                            workShiftRepository.save(shift2);
                            
                            auditLogService.record(deciderEmail, "SHIFT_SWAP_EXECUTED", "WorkShift", shiftId1, 
                                    "Troca executada entre " + emp1.getFullName() + " e " + emp2.getFullName());
                        }
                    }
                } catch (Exception e) {
                    // Fail silently or handle
                }
            }
        }

        auditLogService.record(deciderEmail, "MESSAGE_DECISION", "Message", id, 
                "Decisao: " + targetStatus + " para mensagem tipo " + message.getType());

        return messageRepository.save(message);
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
