package com.escala.authservice.repository;

import com.escala.authservice.entity.Message;
import com.escala.authservice.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByCompanyId(UUID companyId);
    List<Message> findByReceiverEmailAndCompanyIdOrderByCreatedAtDesc(String email, UUID companyId);
    List<Message> findByReceiverEmailAndStatusAndCompanyIdOrderByCreatedAtDesc(String email, MessageStatus status, UUID companyId);
}
