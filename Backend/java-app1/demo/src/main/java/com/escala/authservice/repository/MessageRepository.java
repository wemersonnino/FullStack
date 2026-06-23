package com.escala.authservice.repository;

import com.escala.authservice.entity.Message;
import com.escala.authservice.entity.MessageStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByCompanyId(Long companyId);
    List<Message> findByReceiverEmailAndCompanyIdOrderByCreatedAtDesc(String email, Long companyId);
    List<Message> findByReceiverEmailAndStatusAndCompanyIdOrderByCreatedAtDesc(String email, MessageStatus status, Long companyId);
}
